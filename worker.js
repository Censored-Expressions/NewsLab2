const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const serverPath = path.join(__dirname, "server.js");
const nodePath = process.execPath;
const children = new Map();
const dataDir = process.env.CE_DATA_DIR ? path.resolve(process.env.CE_DATA_DIR) : path.join(__dirname, "data");
const observabilityFile = path.join(dataDir, "news-lab-observability.json");
const syncLedgerFile = path.join(dataDir, "news-lab-worker-sync-ledger.json");
const workerEvents = [];
const webSyncBaseUrl = String(process.env.CE_WEB_SYNC_URL || process.env.CE_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "").replace(/\/+$/, "");
const workerSyncEnabled = process.env.CE_WORKER_SYNC_ENABLED !== "false" && Boolean(webSyncBaseUrl);
const workerSyncIntervalMs = Math.max(30000, Number(process.env.CE_WORKER_SYNC_INTERVAL_MS || 60000));
const workerSyncTimeoutMs = Math.max(15000, Number(process.env.CE_WORKER_SYNC_TIMEOUT_MS || 45000));
const workerSyncRetryCount = Math.max(1, Number(process.env.CE_WORKER_SYNC_RETRY_COUNT || 3));
const workerSyncScheduledRetryCount = Math.max(1, Number(process.env.CE_WORKER_SYNC_SCHEDULED_RETRY_COUNT || 1));
const workerSyncRetryDelayMs = Math.max(1000, Number(process.env.CE_WORKER_SYNC_RETRY_DELAY_MS || 3000));
const workerSyncDeltaEnabled = process.env.CE_WORKER_SYNC_DELTA_ENABLED !== "false";
const workerSyncMaxFilesPerRun = Math.max(1, Number(process.env.CE_WORKER_SYNC_MAX_FILES_PER_RUN || 4));
const workerSyncThrottlesProduction = process.env.CE_WORKER_SYNC_THROTTLES_PRODUCTION === "true";
const workerCpuGuardEnabled = process.env.CE_WORKER_CPU_GUARD !== "false";
const maxCollectorWorkers = Math.max(1, Number(process.env.CE_WORKER_MAX_COLLECTORS || (workerCpuGuardEnabled ? 4 : 99)));
const minCollectorWorkers = Math.max(1, Number(process.env.CE_WORKER_MIN_COLLECTORS || 1));
const roleStartupStaggerMs = Math.max(0, Number(process.env.CE_WORKER_ROLE_STARTUP_STAGGER_MS || (workerCpuGuardEnabled ? 4500 : 0)));
const maxOneShotConcurrency = Math.max(1, Number(process.env.CE_WORKER_MAX_ONESHOT_CONCURRENCY || 1));
const productionSourceLimit = Math.max(12, Number(process.env.CE_WORKER_PRODUCTION_SOURCE_LIMIT || process.env.CE_NEWS_LAB_MICRO_SOURCE_LIMIT || Math.min(72, maxCollectorWorkers * 10)));
const productionClusterLimit = Math.max(3, Number(process.env.CE_WORKER_PRODUCTION_CLUSTER_LIMIT || process.env.CE_NEWS_LAB_MICRO_CLUSTER_LIMIT || Math.min(14, maxCollectorWorkers * 2)));
const productionBuildConcurrency = Math.max(1, Number(process.env.CE_WORKER_PRODUCTION_BUILD_CONCURRENCY || process.env.CE_NEWS_LAB_BUILD_CONCURRENCY || Math.min(3, Math.ceil(maxCollectorWorkers / 2))));
const productionEditorWorkers = Math.max(1, Number(process.env.CE_WORKER_PRODUCTION_EDITOR_WORKERS || process.env.CE_NEWS_LAB_EDITOR_WORKERS || Math.min(3, Math.ceil(maxCollectorWorkers / 2))));
const productionReadConcurrency = Math.max(1, Number(process.env.CE_WORKER_PRODUCTION_READ_CONCURRENCY || process.env.CE_ARTICLE_READ_CONCURRENCY || Math.min(3, Math.ceil(maxCollectorWorkers / 3))));
const productionBudgetMs = Math.max(30000, Number(process.env.CE_WORKER_PRODUCTION_BUDGET_MS || process.env.CE_NEWS_LAB_PRODUCTION_BUDGET_MS || Math.min(90000, 30000 + maxCollectorWorkers * 7500)));
const productionCycleMs = Math.max(30000, Number(process.env.CE_WORKER_PRODUCTION_CYCLE_MS || process.env.CE_NEWS_LAB_PRODUCTION_CYCLE_MS || (workerCpuGuardEnabled ? 75000 : 30000)));
const syncPressureElapsedMs = Math.max(10000, Number(process.env.CE_WORKER_SYNC_PRESSURE_ELAPSED_MS || 20000));
const syncPressurePayloadBytes = Math.max(512 * 1024, Number(process.env.CE_WORKER_SYNC_PRESSURE_PAYLOAD_BYTES || 2500000));
const pressureFailureThreshold = Math.max(1, Number(process.env.CE_WORKER_PRESSURE_FAILURE_THRESHOLD || 2));
const pressureRecoveryThreshold = Math.max(1, Number(process.env.CE_WORKER_PRESSURE_RECOVERY_THRESHOLD || 3));
const pressureDeferMs = Math.max(5 * 60 * 1000, Number(process.env.CE_WORKER_PRESSURE_DEFER_MS || 15 * 60 * 1000));
const pressureHardDeferMs = Math.max(10 * 60 * 1000, Number(process.env.CE_WORKER_PRESSURE_HARD_DEFER_MS || 30 * 60 * 1000));
const collectorRotationMs = Math.max(2 * 60 * 1000, Number(process.env.CE_WORKER_COLLECTOR_ROTATION_MS || 5 * 60 * 1000));
const oneShotChildren = new Map();
const parkedRoles = new Set();
let adaptiveCollectorLimit = maxCollectorWorkers;
let collectorRotationIndex = 0;
let syncInProgress = false;
const runtimePressureState = {
  consecutiveSyncFailures: 0,
  consecutiveSyncOk: 0,
  adaptiveCollectorLimit,
  deferOneShotsUntil: 0,
  lastAction: "startup",
  lastActionAt: ""
};
const ownerAdminToken = process.env.OWNER_ADMIN_TOKEN || process.env.NEWSLETTER_ADMIN_TOKEN || "";
const syncFileSpecs = [
  { key: "news-lab-published-payload", file: path.join(dataDir, "news-lab-published-payload.json") },
  { key: "news-lab-api-response-cache", file: path.join(dataDir, "news-lab-api-response-cache.json") },
  { key: "news-lab-worker-status", file: path.join(dataDir, "news-lab-worker-status.json") },
  { key: "news-lab-api-worker-status", file: path.join(dataDir, "news-lab-api-worker-status.json") },
  { key: "news-lab-observability", file: observabilityFile },
  { key: "news-lab-productivity", file: path.join(dataDir, "news-lab-productivity.json") },
  { key: "news-lab-throughput-diagnostics", file: path.join(dataDir, "news-lab-throughput-diagnostics.json") },
  { key: "article-approval-intelligence", file: path.join(dataDir, "article-approval-intelligence.json") },
  { key: "news-lab-image-worker-status", file: path.join(dataDir, "news-lab-image-worker-status.json") },
  { key: "news-lab-stuck-rescue-worker-status", file: path.join(dataDir, "news-lab-stuck-rescue-worker-status.json") },
  { key: "creator-posts", file: path.join(dataDir, "creator-posts.json") },
  { key: "newsletters", file: path.join(dataDir, "newsletters.json") },
  { key: "scheduled-content-worker-status", file: path.join(dataDir, "scheduled-content-worker-status.json") }
];
const syncPriority = {
  "news-lab-published-payload": 1,
  "news-lab-api-response-cache": 2,
  "news-lab-worker-status": 3,
  "news-lab-api-worker-status": 4,
  "news-lab-observability": 5,
  "news-lab-image-worker-status": 6,
  "scheduled-content-worker-status": 7,
  "news-lab-productivity": 8,
  "news-lab-throughput-diagnostics": 9,
  "article-approval-intelligence": 10,
  "news-lab-stuck-rescue-worker-status": 11,
  "creator-posts": 12,
  "newsletters": 13
};

const categories = String(process.env.CE_NEWS_LAB_WORKER_CATEGORIES || "top,world,politics,business,technology,sports,entertainment,local")
  .split(",")
  .map(value => value.trim().toLowerCase())
  .filter(Boolean);

adaptiveCollectorLimit = Math.min(maxCollectorWorkers, categories.length || maxCollectorWorkers);
runtimePressureState.adaptiveCollectorLimit = adaptiveCollectorLimit;

let workerDataSeededFromRoot = false;

function rawJsonStoryCount(filePath = "") {
  try {
    const value = JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
    if (Array.isArray(value?.ownedStories)) return value.ownedStories.length;
    if (Array.isArray(value?.responses?.all?.ownedStories)) return value.responses.all.ownedStories.length;
    if (Array.isArray(value)) return value.length;
  } catch {}
  return -1;
}

function seedWorkerDataFileFromRootIfStronger(targetPath = "") {
  try {
    const rootPath = path.join(__dirname, path.basename(targetPath));
    if (!fs.existsSync(rootPath)) return;
    const targetCount = fs.existsSync(targetPath) ? rawJsonStoryCount(targetPath) : -1;
    const rootCount = rawJsonStoryCount(rootPath);
    if (!fs.existsSync(targetPath) || rootCount > targetCount) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(rootPath, targetPath);
    }
  } catch {}
}

function seedWorkerDataFilesFromRoot() {
  if (workerDataSeededFromRoot) return;
  workerDataSeededFromRoot = true;
  syncFileSpecs
    .filter(spec => ["news-lab-published-payload", "news-lab-api-response-cache", "creator-posts", "newsletters"].includes(spec.key))
    .forEach(spec => seedWorkerDataFileFromRootIfStronger(spec.file));
}

function readJson(filePath, fallback) {
  seedWorkerDataFilesFromRoot();
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`);
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    console.error(`[worker] observability write failed: ${error.message || error}`);
  }
}

function recordWorkerEvent(event = {}) {
  workerEvents.push({ ...event, at: new Date().toISOString() });
  while (workerEvents.length > 80) workerEvents.shift();
}

function writeWorkerObservability(reason = "heartbeat") {
  const existing = readJson(observabilityFile, {});
  const roles = [...children.entries()].map(([name, child]) => ({
    name,
    pid: child.pid,
    active: child.exitCode === null && !child.killed,
    exitCode: child.exitCode,
    killed: Boolean(child.killed)
  }));
  writeJson(observabilityFile, {
    ...existing,
    version: existing.version || "20260724-news-lab-observability-v1",
    generatedAt: new Date().toISOString(),
    source: "worker-orchestrator",
    orchestrator: {
      active: true,
      pid: process.pid,
      heartbeatAt: new Date().toISOString(),
      reason,
      uptimeSeconds: Math.round(process.uptime()),
      activeRoles: roles.filter(role => role.active).length,
      configuredCategories: categories,
      roles
    },
    sync: workerSyncStateSummary(),
    articlePipeline: workerArticlePipelineSummary(),
    adaptiveRuntime: {
      cpuGuardEnabled: workerCpuGuardEnabled,
      maxCollectorWorkers,
      minCollectorWorkers,
      activeCollectors: activeCollectorNames(),
      parkedRoles: [...parkedRoles],
      ...runtimePressureState,
      deferOneShotsUntilIso: runtimePressureState.deferOneShotsUntil ? new Date(runtimePressureState.deferOneShotsUntil).toISOString() : ""
    },
    workerEvents: [...(existing.workerEvents || []), ...workerEvents].slice(-80),
    rule: "The web service reads this heartbeat to know whether background article production, collectors, rescue, learning, and image workers are alive."
  });
}

function writeWorkerSyncLedger(event = {}) {
  const existing = readJson(syncLedgerFile, {});
  writeJson(syncLedgerFile, {
    ...existing,
    version: "20260724-news-lab-worker-sync-v1",
    updatedAt: new Date().toISOString(),
    lastSyncAt: event.at || new Date().toISOString(),
    lastReason: event.reason || "worker-sync",
    lastStatus: event.status || "unknown",
    acceptedCount: Number(event.acceptedCount || 0),
    rejectedCount: Number(event.rejectedCount || 0),
    acceptedKeys: event.acceptedKeys || [],
    rejectedKeys: event.rejectedKeys || [],
    fileMtimes: event.fileMtimes || existing.fileMtimes || {},
    lastPayloadBytes: Number(event.payloadBytes || 0),
    lastElapsedMs: Number(event.elapsedMs || 0),
    lastServerSyncDiagnostics: event.serverSyncDiagnostics || existing.lastServerSyncDiagnostics || null,
    events: [...(existing.events || []), event].slice(-80),
    rule: "Worker output must be synced to the web service because Render services do not share a local data folder. Scheduled syncs use mtimes so unchanged files do not create avoidable web-service pressure."
  });
}

function workerSyncStateSummary() {
  const ledger = readJson(syncLedgerFile, {});
  return {
    enabled: workerSyncEnabled,
    hasUrl: Boolean(webSyncBaseUrl),
    hasToken: Boolean(ownerAdminToken),
    intervalMs: workerSyncIntervalMs,
    timeoutMs: workerSyncTimeoutMs,
    lastStatus: ledger.lastStatus || "never",
    lastReason: ledger.lastReason || "never",
    lastSyncAt: ledger.lastSyncAt || "",
    acceptedKeys: ledger.acceptedKeys || [],
    rejectedKeys: ledger.rejectedKeys || [],
    deltaEnabled: workerSyncDeltaEnabled,
    maxFilesPerRun: workerSyncMaxFilesPerRun,
    throttlesProduction: workerSyncThrottlesProduction,
    lastPayloadBytes: Number(ledger.lastPayloadBytes || 0),
    lastElapsedMs: Number(ledger.lastElapsedMs || 0)
  };
}
function summarizeTabCountsFromPayload(payload = {}) {
  const stories = Array.isArray(payload.ownedStories) ? payload.ownedStories : [];
  const counts = Object.fromEntries(categories.map(category => [category, 0]));
  for (const story of stories) {
    const category = String(story?.category || "top").toLowerCase();
    if (Object.prototype.hasOwnProperty.call(counts, category)) counts[category] += 1;
  }
  counts.top = stories.length;
  return counts;
}

function workerArticlePipelineSummary() {
  const published = readJson(path.join(dataDir, "news-lab-published-payload.json"), { ownedStories: [] });
  const workerStatus = readJson(path.join(dataDir, "news-lab-worker-status.json"), {});
  const productivity = readJson(path.join(dataDir, "news-lab-productivity.json"), {});
  const approval = readJson(path.join(dataDir, "article-approval-intelligence.json"), {});
  const imageStatus = readJson(path.join(dataDir, "news-lab-image-worker-status.json"), {});
  const stories = Array.isArray(published.ownedStories) ? published.ownedStories : [];
  const currentCycle = approval.currentCycle || {};
  const recovery = approval.recoveryOutput || {};
  const topBlockers = Array.isArray(approval.topBlockers) ? approval.topBlockers : [];
  const lastMetrics = workerStatus.lastMetrics || {};
  const updatedAt = workerStatus.generatedAt || workerStatus.updatedAt || productivity.updatedAt || published.generatedAt || "";
  const staleMs = updatedAt ? Math.max(0, Date.now() - Date.parse(updatedAt)) : null;
  return {
    updatedAt,
    staleMs,
    productionStatus: workerStatus.lastStatus || "unknown",
    productionReason: workerStatus.lastReason || "unknown",
    buildMs: Number(lastMetrics.buildMs || 0),
    publicStoryCount: stories.length,
    tabCounts: summarizeTabCountsFromPayload(published),
    sourceStoryCount: Number(lastMetrics.sourceStoryCount || published.sourceStoryCount || 0),
    attempted: Number(lastMetrics.attemptedCount || currentCycle.generatedCandidates || 0),
    reviewed: Number(lastMetrics.reviewedCount || currentCycle.editorialReviewed || 0),
    firstPassApproved: Number(currentCycle.firstPassApproved || productivity.lastHour?.approvedArticles || 0),
    finalApproved: Number(currentCycle.finalApproved || lastMetrics.approvedCount || 0),
    finalBlocked: Number(currentCycle.finalBlocked || lastMetrics.rejectedCount || 0),
    repairAttempted: Number(recovery.repairAttempted || currentCycle.approvalRecoveryAttempted || 0),
    repairPassed: Number(recovery.repairPassed || currentCycle.approvalRecoveryResolved || 0),
    publishedAfterRepair: Number(recovery.publishedAfterRepair || 0),
    topBlockers: topBlockers.slice(0, 5).map(item => ({
      reason: item.reason || item.issue || "unknown",
      count: Number(item.count || 0),
      repairOwner: item.repairOwner || "unknown",
      requiredAction: item.requiredAction || item.nextAction || "Route to responsible repair subsystem and resubmit."
    })),
    repairHealth: Number(recovery.repairAttempted || currentCycle.approvalRecoveryAttempted || 0) > 0 && Number(recovery.repairPassed || currentCycle.approvalRecoveryResolved || 0) <= 0
      ? "repair-loop-not-closing"
      : "repair-loop-measured",
    lastHour: productivity.lastHour || {},
    imageStatus: {
      status: imageStatus.status || imageStatus.lastStatus || "missing-or-not-run",
      updatedAt: imageStatus.generatedAt || imageStatus.updatedAt || imageStatus.finishedAt || imageStatus.startedAt || "",
      liveImageSearch: Boolean(imageStatus.config?.liveImageSearch) || process.env.CE_NEWS_LAB_LIVE_IMAGES === "true",
      hasPexelsKey: Boolean(imageStatus.config?.hasPexelsKey) || Boolean(process.env.PEXELS_API_KEY),
      hasUnsplashKey: Boolean(imageStatus.config?.hasUnsplashKey) || Boolean(process.env.UNSPLASH_ACCESS_KEY),
      hasPixabayKey: Boolean(imageStatus.config?.hasPixabayKey) || Boolean(process.env.PIXABAY_API_KEY),
      totalStories: Number(imageStatus.summary?.totalStories || imageStatus.totalStories || 0),
      reviewed: Number(imageStatus.summary?.reviewed || imageStatus.reviewed || 0),
      upgraded: Number(imageStatus.summary?.upgraded || imageStatus.upgraded || 0),
      held: Number(imageStatus.summary?.held || imageStatus.held || 0),
      unchanged: Number(imageStatus.summary?.unchanged || imageStatus.unchanged || 0),
      queuedGeneratedBriefs: Number(imageStatus.summary?.generatedImageBriefsQueued || 0),
      addedGeneratedBriefs: Number(imageStatus.summary?.generatedImageBriefsAdded || 0),
      generatedFallbackAssets: Number(imageStatus.summary?.generatedFallbackAssets || 0),
      publicStoriesNeedingImage: workerImageCatchupNeedCount(),
      protectedCatchupEnabled: process.env.CE_IMAGE_WORKER_PROTECTED_CATCHUP !== "false",
      needsAttention: !(imageStatus.generatedAt || imageStatus.updatedAt || imageStatus.finishedAt || imageStatus.startedAt) || Number(imageStatus.summary?.upgraded || imageStatus.upgraded || 0) <= 0 || workerImageCatchupNeedCount() > 0
    },
    diagnosis: stories.length < 20 || Number(currentCycle.finalBlocked || 0) > Number(currentCycle.finalApproved || 0)
      ? "article-output-attention"
      : "article-output-stable",
    rule: "Heartbeat must prove article production, approval, repair, and visible publication, not only worker liveness."
  };
}
function collectorRoleName(category) {
  return `collector-${category}`;
}

function activeCollectorNames() {
  return categories
    .map(category => collectorRoleName(category))
    .filter(name => children.has(name));
}

function stopRole(name, reason = "runtime-pressure") {
  const child = children.get(name);
  parkedRoles.add(name);
  recordWorkerEvent({ type: "role-parked", name, reason });
  if (!child) return false;
  try {
    console.log(`[worker] parking ${name}: ${reason}`);
    child.kill("SIGTERM");
    return true;
  } catch (error) {
    console.log(`[worker] failed to park ${name}: ${error.message || error}`);
    return false;
  }
}

function workerPublicTabCounts() {
  const counts = Object.fromEntries(categories.map(category => [category, 0]));
  try {
    const cache = readJson(path.join(dataDir, "news-lab-api-response-cache.json"), null);
    const cachedStories = Array.isArray(cache?.responses?.all?.ownedStories) ? cache.responses.all.ownedStories : [];
    const payload = readJson(path.join(dataDir, "news-lab-published-payload.json"), null);
    const payloadStories = Array.isArray(payload?.ownedStories) ? payload.ownedStories : [];
    const stories = cachedStories.length ? cachedStories : payloadStories;
    stories.forEach(story => {
      const category = String(story?.category || "").toLowerCase().trim();
      if (Object.prototype.hasOwnProperty.call(counts, category)) counts[category] += 1;
    });
  } catch (error) {
    recordWorkerEvent({ type: "collector-priority-count-error", error: error.message || String(error) });
  }
  return counts;
}

function workerPublishedStories() {
  const cache = readJson(path.join(dataDir, "news-lab-api-response-cache.json"), null);
  const cachedStories = Array.isArray(cache?.responses?.all?.ownedStories) ? cache.responses.all.ownedStories : [];
  const payload = readJson(path.join(dataDir, "news-lab-published-payload.json"), null);
  const payloadStories = Array.isArray(payload?.ownedStories) ? payload.ownedStories : [];
  return cachedStories.length ? cachedStories : payloadStories;
}

function workerStoryNeedsImage(story = {}) {
  const image = story.image || {};
  const evidence = [
    image.primary,
    image.fallback,
    image.url,
    image.source,
    image.license,
    image.provenance?.source,
    image.provenance?.license,
    story.imageProvenance?.source,
    story.imageProvenance?.license
  ].filter(Boolean).join(" ").toLowerCase();
  return !evidence
    || /assets\/logo|logo\.png|ce image|local fallback|placeholder|generic newsroom|fallback ce|censored expressions/i.test(evidence);
}

function workerImageCatchupNeedCount() {
  return workerPublishedStories().filter(workerStoryNeedsImage).length;
}

function workerUnderfilledCollectorCategories(target = 7) {
  const counts = workerPublicTabCounts();
  return categories
    .filter(category => category !== "top")
    .map(category => ({ category, count: Number(counts[category] || 0), needed: Math.max(0, target - Number(counts[category] || 0)) }))
    .filter(item => item.needed > 0)
    .sort((a, b) => b.needed - a.needed || a.count - b.count || a.category.localeCompare(b.category))
    .map(item => item.category);
}

function collectorPriorityOrder() {
  const target = Math.max(1, Number(process.env.CE_NEWS_LAB_TAB_TARGET || 7));
  const underfilled = workerUnderfilledCollectorCategories(target);
  const order = [...underfilled, ...categories.filter(category => !underfilled.includes(category))];
  runtimePressureState.underfilledCollectorPriority = underfilled;
  return order.length ? order : categories;
}

function collectorWindowCategories() {
  if (!categories.length) return [];
  const orderedCategories = collectorPriorityOrder();
  const limit = Math.max(1, Math.min(adaptiveCollectorLimit, orderedCategories.length));
  const window = [];
  for (let index = 0; index < limit; index += 1) {
    window.push(orderedCategories[(collectorRotationIndex + index) % orderedCategories.length]);
  }
  return window;
}

function rebalanceCollectorWorkers(reason = "adaptive-runtime-optimization", options = {}) {
  if (!workerCpuGuardEnabled) return;
  if (options.rotate && categories.length > Math.max(1, adaptiveCollectorLimit)) {
    collectorRotationIndex = (collectorRotationIndex + Math.max(1, adaptiveCollectorLimit)) % categories.length;
  }
  const activeWindow = collectorWindowCategories();
  const wanted = new Set(activeWindow.map(collectorRoleName));
  for (const category of categories) {
    const roleName = collectorRoleName(category);
    if (!wanted.has(roleName)) {
      stopRole(roleName, reason);
      continue;
    }
    parkedRoles.delete(roleName);
    if (!children.has(roleName) && !shuttingDown) {
      spawnRole(roleName, { CE_NEWS_LAB_COLLECTOR_WORKER: category }, { restartDelayMs: 30000 });
    }
  }
  runtimePressureState.adaptiveCollectorLimit = adaptiveCollectorLimit;
  runtimePressureState.collectorRotationIndex = collectorRotationIndex;
  runtimePressureState.activeCollectorWindow = activeWindow;
  runtimePressureState.nextCollectorRotationAt = new Date(Date.now() + collectorRotationMs).toISOString();
  runtimePressureState.lastActionAt = new Date().toISOString();
  recordWorkerEvent({ type: "collector-window-rebalanced", reason, activeWindow, adaptiveCollectorLimit, collectorRotationIndex });
}

function tuneRuntimeFromSync(event = {}) {
  if (!workerCpuGuardEnabled) return;
  const status = String(event.status || "");
  const isOk = status === "ok";
  const slowOkPressure = isOk && (
    Number(event.elapsedMs || 0) >= syncPressureElapsedMs
    || Number(event.payloadBytes || 0) >= syncPressurePayloadBytes
    || Number(event.serverSyncDiagnostics?.totalMs || 0) >= syncPressureElapsedMs
  );
  const isPressure = slowOkPressure || status === "error" || /^http-(429|500|502|503|504)$/.test(status);
  if (isOk && !slowOkPressure) {
    runtimePressureState.consecutiveSyncFailures = 0;
    runtimePressureState.consecutiveSyncOk += 1;
    if (runtimePressureState.consecutiveSyncOk >= pressureRecoveryThreshold && adaptiveCollectorLimit < Math.min(maxCollectorWorkers, categories.length)) {
      adaptiveCollectorLimit += 1;
      runtimePressureState.consecutiveSyncOk = 0;
      runtimePressureState.lastAction = "increase-collector-limit-after-stable-sync";
      recordWorkerEvent({ type: "adaptive-runtime-optimization", action: runtimePressureState.lastAction, adaptiveCollectorLimit, status });
      console.log(`[worker] adaptive runtime: sync stable, raising collector limit to ${adaptiveCollectorLimit}`);
      rebalanceCollectorWorkers(runtimePressureState.lastAction);
    }
    return;
  }
  if (!isPressure) return;
  if (slowOkPressure) {
    runtimePressureState.lastPressureReason = `slow-sync elapsed=${Number(event.elapsedMs || 0)}ms payload=${Number(event.payloadBytes || 0)} bytes server=${Number(event.serverSyncDiagnostics?.totalMs || 0)}ms`;
  }
  runtimePressureState.consecutiveSyncFailures += 1;
  runtimePressureState.consecutiveSyncOk = 0;
  const hardPressure = runtimePressureState.consecutiveSyncFailures >= pressureFailureThreshold * 2;
  runtimePressureState.deferOneShotsUntil = Date.now() + (hardPressure ? pressureHardDeferMs : pressureDeferMs);
  if (runtimePressureState.consecutiveSyncFailures >= pressureFailureThreshold && adaptiveCollectorLimit > minCollectorWorkers) {
    adaptiveCollectorLimit = Math.max(minCollectorWorkers, adaptiveCollectorLimit - (hardPressure ? 2 : 1));
    runtimePressureState.lastAction = hardPressure ? "hard-reduce-collector-limit-after-sync-pressure" : "reduce-collector-limit-after-sync-pressure";
    recordWorkerEvent({ type: "adaptive-runtime-optimization", action: runtimePressureState.lastAction, adaptiveCollectorLimit, status, consecutiveSyncFailures: runtimePressureState.consecutiveSyncFailures });
    console.log(`[worker] adaptive runtime: ${status} pressure, lowering collector limit to ${adaptiveCollectorLimit} and deferring one-shots`);
    rebalanceCollectorWorkers(runtimePressureState.lastAction);
  } else {
    runtimePressureState.lastAction = "defer-one-shots-after-sync-pressure";
    runtimePressureState.lastActionAt = new Date().toISOString();
    recordWorkerEvent({ type: "adaptive-runtime-optimization", action: runtimePressureState.lastAction, adaptiveCollectorLimit, status, consecutiveSyncFailures: runtimePressureState.consecutiveSyncFailures });
    console.log(`[worker] adaptive runtime: ${status} pressure, deferring one-shots until ${new Date(runtimePressureState.deferOneShotsUntil).toISOString()}`);
  }
}

function observeSyncWithoutProductionThrottle(event = {}) {
  const status = String(event.status || "");
  const isOk = status === "ok";
  const slowOkPressure = isOk && (
    Number(event.elapsedMs || 0) >= syncPressureElapsedMs
    || Number(event.payloadBytes || 0) >= syncPressurePayloadBytes
    || Number(event.serverSyncDiagnostics?.totalMs || 0) >= syncPressureElapsedMs
  );
  const isPressure = slowOkPressure || status === "error" || /^http-(429|500|502|503|504)$/.test(status);
  if (isOk && !slowOkPressure) {
    runtimePressureState.consecutiveSyncOk += 1;
    runtimePressureState.lastAction = "sync-stable-production-decoupled";
    runtimePressureState.lastActionAt = new Date().toISOString();
    return;
  }
  if (!isPressure) return;
  runtimePressureState.lastPressureReason = slowOkPressure
    ? `slow-sync observed without production throttle elapsed=${Number(event.elapsedMs || 0)}ms payload=${Number(event.payloadBytes || 0)} bytes server=${Number(event.serverSyncDiagnostics?.totalMs || 0)}ms`
    : `sync ${status} observed without production throttle`;
  runtimePressureState.lastAction = "sync-pressure-observed-production-decoupled";
  runtimePressureState.lastActionAt = new Date().toISOString();
  recordWorkerEvent({
    type: "worker-sync-pressure-observed",
    action: runtimePressureState.lastAction,
    status,
    elapsedMs: Number(event.elapsedMs || 0),
    payloadBytes: Number(event.payloadBytes || 0),
    rule: "Remote synchronization pressure is observed and logged, but it does not throttle article production unless CE_WORKER_SYNC_THROTTLES_PRODUCTION=true."
  });
}

function applyWorkerSyncRuntimePolicy(event = {}) {
  if (workerSyncThrottlesProduction) {
    tuneRuntimeFromSync(event);
    return;
  }
  observeSyncWithoutProductionThrottle(event);
}

function oneShotsDeferred(name = "one-shot") {
  if (!workerCpuGuardEnabled) return false;
  if (Date.now() < runtimePressureState.deferOneShotsUntil) {
    console.log(`[worker] skipped one-shot ${name}: deferred by adaptive runtime pressure until ${new Date(runtimePressureState.deferOneShotsUntil).toISOString()}`);
    recordWorkerEvent({ type: "one-shot-skipped", name, reason: "adaptive-runtime-pressure", deferUntil: new Date(runtimePressureState.deferOneShotsUntil).toISOString() });
    return true;
  }
  return false;
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function transientWorkerSyncError(error = {}) {
  const message = `${error.name || ""} ${error.message || ""}`.toLowerCase();
  return /abort|timeout|fetch failed|socket|econnreset|eai_again|network/.test(message);
}

function workerStoryPreserveKey(story = {}) {
  return String(story.id || story.storyId || story.eventId || story.topicKey || story.slug || story.title || "").toLowerCase().trim();
}

function workerMergePublicStories(stories = []) {
  const merged = new Map();
  for (const raw of stories) {
    if (!raw || typeof raw !== "object") continue;
    const key = workerStoryPreserveKey(raw);
    if (!key) continue;
    const existing = merged.get(key) || {};
    const originalPublishedAt = raw.originalPublishedAt || existing.originalPublishedAt || raw.publishedAt || existing.publishedAt || raw.generatedAt || existing.generatedAt || "";
    merged.set(key, {
      ...existing,
      ...raw,
      originalPublishedAt,
      publishedAt: originalPublishedAt || raw.publishedAt || existing.publishedAt || "",
      boardVisibility: {
        ...(existing.boardVisibility || {}),
        ...(raw.boardVisibility || {}),
        visible: raw.boardVisibility?.visible !== false,
        reason: raw.boardVisibility?.reason || existing.boardVisibility?.reason || "approved-story-within-seven-day-board-window"
      }
    });
  }
  return [...merged.values()];
}

function preservePublishedPayloadBeforeSync(payload = {}) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.ownedStories)) return payload;
  const cache = readJson(path.join(dataDir, "news-lab-api-response-cache.json"), {});
  const cacheStories = Array.isArray(cache.responses?.all?.ownedStories) ? cache.responses.all.ownedStories : [];
  const payloadStories = Array.isArray(payload.ownedStories) ? payload.ownedStories : [];
  if (cacheStories.length <= payloadStories.length) return payload;
  const mergedStories = workerMergePublicStories([...cacheStories, ...payloadStories]);
  if (mergedStories.length <= payloadStories.length) return payload;
  return {
    ...payload,
    ownedStories: mergedStories,
    workerSyncShelfPreservation: {
      applied: true,
      appliedAt: new Date().toISOString(),
      payloadCount: payloadStories.length,
      cacheCount: cacheStories.length,
      mergedCount: mergedStories.length,
      rule: "Background Worker sync must not send a smaller public payload when its prepared API cache still has active seven-day stories. New cycles add or update; they do not collapse the visitor shelf."
    }
  };
}

function collectSyncFiles(options = {}) {
  const maxBytes = Math.max(1024 * 1024, Number(process.env.CE_WORKER_SYNC_MAX_FILE_BYTES || 8 * 1024 * 1024));
  const fullSync = Boolean(options.fullSync) || !workerSyncDeltaEnabled;
  const previousMtimes = fullSync ? {} : (readJson(syncLedgerFile, {}).fileMtimes || {});
  const files = [];
  const skipped = [];
  for (const spec of syncFileSpecs) {
    try {
      if (!fs.existsSync(spec.file)) {
        skipped.push({ key: spec.key, reason: "missing" });
        continue;
      }
      const stat = fs.statSync(spec.file);
      const mtimeMs = Math.trunc(stat.mtimeMs);
      if (!fullSync && Number(previousMtimes[spec.key] || 0) === mtimeMs) {
        skipped.push({ key: spec.key, reason: "unchanged", bytes: stat.size, mtimeMs });
        continue;
      }
      if (stat.size > maxBytes) {
        skipped.push({ key: spec.key, reason: "too-large", bytes: stat.size, mtimeMs });
        continue;
      }
      let payload = readJson(spec.file, null);
      if (!payload || typeof payload !== "object") {
        skipped.push({ key: spec.key, reason: "not-json-object", bytes: stat.size, mtimeMs });
        continue;
      }
      if (spec.key === "news-lab-published-payload") {
        payload = preservePublishedPayloadBeforeSync(payload);
        const payloadCount = Array.isArray(payload.ownedStories) ? payload.ownedStories.length : 0;
        const cache = readJson(path.join(dataDir, "news-lab-api-response-cache.json"), {});
        const cacheCount = Array.isArray(cache.responses?.all?.ownedStories) ? cache.responses.all.ownedStories.length : 0;
        const minimumSafeSync = Math.max(2, Number(process.env.CE_WORKER_SYNC_MIN_PUBLIC_STORIES || 2));
        if (payloadCount < minimumSafeSync && cacheCount < minimumSafeSync) {
          skipped.push({
            key: spec.key,
            reason: "public-payload-too-small-for-safe-sync",
            payloadCount,
            cacheCount,
            bytes: stat.size,
            mtimeMs,
            rule: "Fresh worker boot must not sync an empty/tiny public payload before article/cache state is available."
          });
          continue;
        }
      }
      files.push({ key: spec.key, updatedAt: stat.mtime.toISOString(), mtimeMs, bytes: Buffer.byteLength(JSON.stringify(payload), "utf8"), payload });
    } catch (error) {
      skipped.push({ key: spec.key, reason: error.message || String(error) });
    }
  }
  files.sort((a, b) => Number(syncPriority[a.key] || 99) - Number(syncPriority[b.key] || 99));
  if (!fullSync && files.length > workerSyncMaxFilesPerRun) {
    const deferred = files.splice(workerSyncMaxFilesPerRun);
    for (const file of deferred) {
      skipped.push({
        key: file.key,
        reason: "deferred-by-incremental-sync-batch-limit",
        bytes: file.bytes,
        mtimeMs: file.mtimeMs,
        rule: "Incremental sync sends the highest-priority changed files first so public article payloads are not delayed behind lower-priority large state files."
      });
    }
  }
  return { files, skipped, fullSync };
}

function syncWorkerOutputs(reason = "scheduled-sync") {
  setImmediate(() => {
    performWorkerSync(reason).catch(error => {
      const event = {
        type: "worker-sync-error",
        reason,
        status: "error",
        error: error?.message || String(error || "sync failed"),
        at: new Date().toISOString()
      };
      syncInProgress = false;
      recordWorkerEvent(event);
      writeWorkerSyncLedger(event);
      applyWorkerSyncRuntimePolicy(event);
      console.log(`[worker] sync error: ${event.error}`);
    });
  });
  return Promise.resolve({ queued: true, reason });
}

async function performWorkerSync(reason = "scheduled-sync") {
  if (syncInProgress) {
    const event = { type: "worker-sync-skipped", reason, status: "skipped", at: new Date().toISOString(), skipReason: "sync-already-in-progress" };
    recordWorkerEvent(event);
    console.log(`[worker] sync skipped: already in progress reason=${reason}`);
    return;
  }
  if (!workerSyncEnabled) {
    console.log("[worker] sync disabled: set CE_WEB_SYNC_URL and CE_WORKER_SYNC_ENABLED=true to push generated payloads to the web service");
    return;
  }
  if (!ownerAdminToken) {
    const event = { type: "worker-sync-skipped", reason: "missing-owner-token", at: new Date().toISOString(), status: "skipped" };
    recordWorkerEvent(event);
    writeWorkerSyncLedger(event);
    console.log("[worker] sync skipped: missing OWNER_ADMIN_TOKEN/NEWSLETTER_ADMIN_TOKEN");
    return;
  }
  const fullSync = /startup|manual|full/i.test(String(reason || ""));
  const { files, skipped } = collectSyncFiles({ fullSync });
  if (!files.length) {
    const event = { type: "worker-sync-skipped", reason: "no-files", skipped, at: new Date().toISOString(), status: "skipped" };
    recordWorkerEvent(event);
    writeWorkerSyncLedger(event);
    console.log(`[worker] sync skipped: no eligible files; skipped=${skipped.map(item => item.key + ":" + item.reason).join(",")}`);
    return;
  }
  const endpoint = `${webSyncBaseUrl}/api/news-lab/worker-sync`;
  syncInProgress = true;
  const syncFileMtimes = Object.fromEntries(files.map(file => [file.key, file.mtimeMs || 0]));
  let lastError = null;
  const retryLimit = /scheduled|after-one-shot/i.test(String(reason || ""))
    ? Math.min(workerSyncRetryCount, workerSyncScheduledRetryCount)
    : workerSyncRetryCount;
  for (let attempt = 1; attempt <= retryLimit; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), workerSyncTimeoutMs);
    const syncStarted = Date.now();
    const requestBody = JSON.stringify({
      reason,
      source: "background-worker-orchestrator",
      generatedAt: new Date().toISOString(),
      deltaSync: workerSyncDeltaEnabled && !fullSync,
      files
    });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-owner-admin-token": ownerAdminToken
        },
        signal: controller.signal,
        body: requestBody
      });
      clearTimeout(timeout);
      const result = await response.json().catch(() => ({}));
      const event = {
        type: response.ok ? "worker-sync-complete" : "worker-sync-failed",
        reason,
        status: response.ok ? "ok" : `http-${response.status}`,
        at: new Date().toISOString(),
        attempt,
        retryCount: retryLimit,
        acceptedCount: Number(result.acceptedCount || 0),
        rejectedCount: Number(result.rejectedCount || 0),
        acceptedKeys: (result.accepted || []).map(item => item.key).filter(Boolean),
        rejectedKeys: (result.rejected || []).map(item => item.key).filter(Boolean),
        skipped,
        elapsedMs: Date.now() - syncStarted,
        payloadBytes: Buffer.byteLength(requestBody, "utf8"),
        fileMtimes: response.ok ? { ...(readJson(syncLedgerFile, {}).fileMtimes || {}), ...syncFileMtimes } : (readJson(syncLedgerFile, {}).fileMtimes || {}),
        serverSyncDiagnostics: result.syncDiagnostics || null
      };
      recordWorkerEvent(event);
      writeWorkerSyncLedger(event);
      applyWorkerSyncRuntimePolicy(event);
      syncInProgress = false;
      writeWorkerObservability("worker-sync-complete");
      const skippedSummary = skipped.map(item => `${item.key}:${item.reason}`).join(",") || "none";
      const serverMs = Number(event.serverSyncDiagnostics?.totalMs || 0);
      console.log(`[worker] sync ${event.status}: attempt=${attempt}/${retryLimit} elapsedMs=${event.elapsedMs} serverMs=${serverMs} payloadBytes=${event.payloadBytes} accepted=${event.acceptedKeys.join(",") || "none"} rejected=${event.rejectedKeys.join(",") || "none"} skipped=${skippedSummary}`);
      return;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < retryLimit && transientWorkerSyncError(error)) {
        console.log(`[worker] sync retry ${attempt}/${retryLimit}: ${error.name === "AbortError" ? `sync-timeout-${workerSyncTimeoutMs}ms` : error.message || String(error)}`);
        await sleep(workerSyncRetryDelayMs * attempt);
        continue;
      }
      break;
    }
  }
  const event = {
    type: "worker-sync-error",
    reason,
    status: "error",
    error: lastError?.name === "AbortError" ? `sync-timeout-${workerSyncTimeoutMs}ms` : lastError?.message || String(lastError || "sync failed"),
    at: new Date().toISOString(),
    retryCount: retryLimit,
    skipped,
    elapsedMs: 0,
    payloadBytes: 0,
    fileMtimes: readJson(syncLedgerFile, {}).fileMtimes || {}
  };
  syncInProgress = false;
  recordWorkerEvent(event);
  writeWorkerSyncLedger(event);
  applyWorkerSyncRuntimePolicy(event);
  writeWorkerObservability("worker-sync-error");
  console.log(`[worker] sync error: ${event.error}`);
}
function spawnRole(name, env = {}, options = {}) {
  if (children.has(name)) return children.get(name);
  parkedRoles.delete(name);
  const child = childProcess.spawn(nodePath, [serverPath], {
    cwd: __dirname,
    env: {
      ...process.env,
      CE_BACKGROUND_LOOPS: process.env.CE_BACKGROUND_LOOPS || "true",
      CE_SERVER_START_WORKERS: "false",
      ...env
    },
    stdio: ["ignore", "inherit", "inherit"]
  });
  children.set(name, child);
  recordWorkerEvent({ type: "role-started", name, pid: child.pid });
  writeWorkerObservability(`started-${name}`);
  child.on("exit", (code, signal) => {
    children.delete(name);
    console.log(`[worker] ${name} exited code=${code} signal=${signal || ""}`);
    if (!options.once && !shuttingDown && !parkedRoles.has(name)) {
      const delayMs = Math.max(5000, Number(options.restartDelayMs || 15000));
      setTimeout(() => spawnRole(name, env, options), delayMs);
    }
  });
  child.on("error", error => {
    children.delete(name);
    console.error(`[worker] ${name} failed to start: ${error.message || error}`);
  });
  console.log(`[worker] started ${name} pid=${child.pid}`);
  return child;
}

function spawnOneShot(name, env = {}, options = {}) {
  if (!options.protectedFromPressure && oneShotsDeferred(name)) return null;
  const activeOneShots = [...oneShotChildren.values()].filter(child => child.exitCode === null && !child.killed).length;
  if (oneShotChildren.has(name)) {
    console.log(`[worker] skipped one-shot ${name}: already running`);
    recordWorkerEvent({ type: "one-shot-skipped", name, reason: "already-running" });
    return null;
  }
  if (activeOneShots >= maxOneShotConcurrency) {
    console.log(`[worker] skipped one-shot ${name}: one-shot concurrency limit ${maxOneShotConcurrency}`);
    recordWorkerEvent({ type: "one-shot-skipped", name, reason: "concurrency-limit", activeOneShots, maxOneShotConcurrency });
    return null;
  }
  const child = childProcess.spawn(nodePath, [serverPath], {
    cwd: __dirname,
    env: {
      ...process.env,
      CE_BACKGROUND_LOOPS: "false",
      CE_SERVER_START_WORKERS: "false",
      ...env
    },
    stdio: ["ignore", "inherit", "inherit"]
  });
  oneShotChildren.set(name, child);
  child.on("exit", (code, signal) => {
    oneShotChildren.delete(name);
    recordWorkerEvent({ type: "one-shot-exited", name, code, signal: signal || "" });
    writeWorkerObservability(`one-shot-exited-${name}`);
    syncWorkerOutputs(`after-one-shot-${name}`).catch(() => {});
    console.log(`[worker] one-shot ${name} exited code=${code} signal=${signal || ""}`);
  });
  child.on("error", error => {
    oneShotChildren.delete(name);
    recordWorkerEvent({ type: "one-shot-error", name, error: error.message || String(error) });
    writeWorkerObservability(`one-shot-error-${name}`);
    console.error(`[worker] one-shot ${name} failed: ${error.message || error}`);
  });
  console.log(`[worker] started one-shot ${name} pid=${child.pid}`);
  return child;
}

let shuttingDown = false;
function shutdown() {
  shuttingDown = true;
  for (const [name, child] of children.entries()) {
    try {
      console.log(`[worker] stopping ${name} pid=${child.pid}`);
      child.kill("SIGTERM");
    } catch {
      // Child may already be gone.
    }
  }
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Censored Expressions background worker orchestrator starting");
recordWorkerEvent({ type: "orchestrator-started", pid: process.pid });
writeWorkerObservability("orchestrator-started");
console.log(`[worker] sync config enabled=${workerSyncEnabled} hasUrl=${Boolean(webSyncBaseUrl)} hasToken=${Boolean(ownerAdminToken)} intervalMs=${workerSyncIntervalMs} delta=${workerSyncDeltaEnabled} maxFilesPerRun=${workerSyncMaxFilesPerRun} retryCount=${workerSyncRetryCount} scheduledRetryCount=${workerSyncScheduledRetryCount} throttlesProduction=${workerSyncThrottlesProduction}`);
console.log(`[worker] cpu guard enabled=${workerCpuGuardEnabled} maxCollectors=${maxCollectorWorkers} startupStaggerMs=${roleStartupStaggerMs} maxOneShots=${maxOneShotConcurrency} productionSourceLimit=${productionSourceLimit} productionClusterLimit=${productionClusterLimit} productionBudgetMs=${productionBudgetMs} productionCycleMs=${productionCycleMs} syncPressureElapsedMs=${syncPressureElapsedMs} syncPressurePayloadBytes=${syncPressurePayloadBytes}`);

const enabledCollectorCategories = collectorWindowCategories();
const parkedCollectorCategories = categories.filter(category => !enabledCollectorCategories.includes(category));
if (parkedCollectorCategories.length) {
  recordWorkerEvent({ type: "collector-workers-parked", categories: parkedCollectorCategories, maxCollectorWorkers });
  console.log(`[worker] parked collectors for CPU guard: ${parkedCollectorCategories.join(",")}`);
}

let startupSlot = 0;
function scheduleSpawnRole(name, env = {}, options = {}) {
  const delayMs = startupSlot * roleStartupStaggerMs;
  startupSlot += 1;
  setTimeout(() => spawnRole(name, env, options), delayMs);
}

scheduleSpawnRole("scheduled-site-content", {
  CE_SITE_SCHEDULED_CONTENT_WORKER: "1",
  CE_NEWS_LAB_PRODUCTION_LOOP: "false",
  CE_NEWS_LAB_WORKER_PROCESS: "false",
  CE_NEWS_LAB_API_WORKER_PROCESS: "false",
  CE_NEWS_LAB_COLLECTOR_WORKER_PROCESS: "false",
  CE_NEWS_LAB_STUCK_RESCUE_WORKER_PROCESS: "false",
  CE_RENDER_EMBEDDED_WORKER_FALLBACK: "false"
}, { restartDelayMs: 30000 });
scheduleSpawnRole("news-lab-production", {
  CE_NEWS_LAB_WORKER: "1",
  CE_NEWS_LAB_WORKER_REASON: "worker-orchestrator-production",
  CE_NEWS_LAB_MICRO_SOURCE_LIMIT: String(productionSourceLimit),
  CE_NEWS_LAB_MICRO_CLUSTER_LIMIT: String(productionClusterLimit),
  CE_NEWS_LAB_CATCHUP_SOURCE_LIMIT: String(Math.max(productionSourceLimit, Math.min(160, productionSourceLimit * 2))),
  CE_NEWS_LAB_CATCHUP_CLUSTER_LIMIT: String(Math.max(productionClusterLimit, Math.min(28, productionClusterLimit * 2))),
  CE_NEWS_LAB_BUILD_CONCURRENCY: String(productionBuildConcurrency),
  CE_NEWS_LAB_EDITOR_WORKERS: String(productionEditorWorkers),
  CE_ARTICLE_READ_CONCURRENCY: String(productionReadConcurrency),
  CE_NEWS_LAB_PRODUCTION_BUDGET_MS: String(productionBudgetMs),
  CE_NEWS_LAB_PRODUCTION_CYCLE_MS: String(productionCycleMs),
  CE_NEWS_LAB_PRODUCTION_CATCHUP_MAX: process.env.CE_NEWS_LAB_PRODUCTION_CATCHUP_MAX || "2",
  CE_NEWS_LAB_WORKER_ONCE_LIVE_IMAGES: process.env.CE_NEWS_LAB_WORKER_ONCE_LIVE_IMAGES || "false"
}, { restartDelayMs: 20000 });

scheduleSpawnRole("news-lab-api-response", {
  CE_NEWS_LAB_API_WORKER: "1"
}, { restartDelayMs: 20000 });

scheduleSpawnRole("news-lab-stuck-rescue", {
  CE_NEWS_LAB_STUCK_RESCUE_WORKER: "1",
  CE_NEWS_LAB_STUCK_RESCUE_WORKER_PROCESS: "true"
}, { restartDelayMs: 30000 });

for (const category of enabledCollectorCategories) {
  scheduleSpawnRole(`collector-${category}`, {
    CE_NEWS_LAB_COLLECTOR_WORKER: category
  }, { restartDelayMs: 30000 });
}

if (workerCpuGuardEnabled && categories.length > Math.max(1, adaptiveCollectorLimit)) {
  setInterval(() => {
    rebalanceCollectorWorkers("scheduled-collector-rotation", { rotate: true });
    writeWorkerObservability("scheduled-collector-rotation");
  }, collectorRotationMs);
}

function runDistillation(reason = "worker-orchestrator-scheduled-distillation") {
  spawnOneShot("knowledge-distillation", {
    CE_KNOWLEDGE_DISTILLATION_WORKER: "1",
    CE_KNOWLEDGE_DISTILLATION_REASON: reason
  });
}

function runEvolution(reason = "worker-orchestrator-scheduled-evolution") {
  spawnOneShot("evolution-engine", {
    CE_EVOLUTION_ENGINE_WORKER: "1",
    CE_EVOLUTION_ENGINE_REASON: reason
  });
}

function runImagePass(reason = "worker-orchestrator-scheduled-image-pass") {
  const needCount = workerImageCatchupNeedCount();
  const protectedFromPressure = needCount > 0 && process.env.CE_IMAGE_WORKER_PROTECTED_CATCHUP !== "false";
  if (protectedFromPressure) {
    recordWorkerEvent({
      type: "protected-image-catchup",
      reason,
      needCount,
      rule: "Published articles with fallback images keep an image-improvement attachment alive so image repair cannot be postponed indefinitely by runtime pressure."
    });
  }
  spawnOneShot("image-improvement", {
    CE_NEWS_LAB_IMAGE_WORKER: "1",
    CE_NEWS_LAB_IMAGE_WORKER_REASON: protectedFromPressure ? `${reason}:protected-fallback-image-catchup` : reason
  }, { protectedFromPressure });
}

setTimeout(() => runDistillation("worker-orchestrator-startup-distillation"), Math.max(10 * 60 * 1000, Number(process.env.CE_KNOWLEDGE_DISTILLATION_STARTUP_DELAY_MS || 30 * 60 * 1000)));
setInterval(runDistillation, Math.max(60 * 60 * 1000, Number(process.env.CE_KNOWLEDGE_DISTILLATION_INTERVAL_MS || 6 * 60 * 60 * 1000)));

setTimeout(() => runEvolution("worker-orchestrator-startup-evolution"), Math.max(20 * 60 * 1000, Number(process.env.CE_EVOLUTION_ENGINE_STARTUP_DELAY_MS || 45 * 60 * 1000)));
setInterval(runEvolution, Math.max(60 * 60 * 1000, Number(process.env.CE_EVOLUTION_ENGINE_INTERVAL_MS || 4 * 60 * 60 * 1000)));

setTimeout(() => runImagePass("worker-orchestrator-startup-image-pass"), Math.max(5 * 60 * 1000, Number(process.env.CE_IMAGE_WORKER_STARTUP_DELAY_MS || 15 * 60 * 1000)));
setInterval(runImagePass, Math.max(30 * 60 * 1000, Number(process.env.CE_IMAGE_WORKER_INTERVAL_MS || 60 * 60 * 1000)));

setTimeout(() => syncWorkerOutputs("startup-sync"), 15000);
setInterval(() => syncWorkerOutputs("scheduled-sync"), workerSyncIntervalMs);

setInterval(() => {
  writeWorkerObservability("scheduled-heartbeat");
  const syncState = workerSyncStateSummary();
  const articlePipeline = workerArticlePipelineSummary();
  const blockerSummary = (articlePipeline.topBlockers || []).slice(0, 3).map(item => `${item.reason}:${item.count}`).join("|") || "none";
  const tabSummary = Object.entries(articlePipeline.tabCounts || {}).map(([key, value]) => `${key}:${value}`).join("|") || "none";
  console.log(`[worker] heartbeat activeRoles=${children.size} activeCollectors=${activeCollectorNames().join(",") || "none"} categories=${categories.join(",")} sync=${syncState.enabled ? syncState.lastStatus : "disabled"} hasUrl=${syncState.hasUrl} hasToken=${syncState.hasToken} accepted=${syncState.acceptedKeys.join(",") || "none"} public=${articlePipeline.publicStoryCount} tabs=${tabSummary} firstPass=${articlePipeline.firstPassApproved} finalApproved=${articlePipeline.finalApproved} blocked=${articlePipeline.finalBlocked} blockers=${blockerSummary} repairPassed=${articlePipeline.repairPassed} repairHealth=${articlePipeline.repairHealth} image=${articlePipeline.imageStatus.status}/live:${articlePipeline.imageStatus.liveImageSearch}/pexels:${articlePipeline.imageStatus.hasPexelsKey}/unsplash:${articlePipeline.imageStatus.hasUnsplashKey}/pixabay:${articlePipeline.imageStatus.hasPixabayKey}/upgraded:${articlePipeline.imageStatus.upgraded}/generated:${articlePipeline.imageStatus.generatedFallbackAssets}/queued:${articlePipeline.imageStatus.queuedGeneratedBriefs}/needs:${articlePipeline.imageStatus.publicStoriesNeedingImage} buildMs=${articlePipeline.buildMs} status=${articlePipeline.productionStatus}`);
}, 60 * 1000);








































