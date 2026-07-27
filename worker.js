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
const workerCpuGuardEnabled = process.env.CE_WORKER_CPU_GUARD !== "false";
const maxCollectorWorkers = Math.max(1, Number(process.env.CE_WORKER_MAX_COLLECTORS || (workerCpuGuardEnabled ? 4 : 99)));
const minCollectorWorkers = Math.max(1, Number(process.env.CE_WORKER_MIN_COLLECTORS || 1));
const roleStartupStaggerMs = Math.max(0, Number(process.env.CE_WORKER_ROLE_STARTUP_STAGGER_MS || (workerCpuGuardEnabled ? 4500 : 0)));
const maxOneShotConcurrency = Math.max(1, Number(process.env.CE_WORKER_MAX_ONESHOT_CONCURRENCY || 1));
const pressureFailureThreshold = Math.max(1, Number(process.env.CE_WORKER_PRESSURE_FAILURE_THRESHOLD || 2));
const pressureRecoveryThreshold = Math.max(1, Number(process.env.CE_WORKER_PRESSURE_RECOVERY_THRESHOLD || 3));
const pressureDeferMs = Math.max(5 * 60 * 1000, Number(process.env.CE_WORKER_PRESSURE_DEFER_MS || 15 * 60 * 1000));
const pressureHardDeferMs = Math.max(10 * 60 * 1000, Number(process.env.CE_WORKER_PRESSURE_HARD_DEFER_MS || 30 * 60 * 1000));
const collectorRotationMs = Math.max(2 * 60 * 1000, Number(process.env.CE_WORKER_COLLECTOR_ROTATION_MS || 5 * 60 * 1000));
const oneShotChildren = new Map();
const parkedRoles = new Set();
let adaptiveCollectorLimit = maxCollectorWorkers;
let collectorRotationIndex = 0;
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

const categories = String(process.env.CE_NEWS_LAB_WORKER_CATEGORIES || "top,world,politics,business,technology,sports,entertainment,local")
  .split(",")
  .map(value => value.trim().toLowerCase())
  .filter(Boolean);

adaptiveCollectorLimit = Math.min(maxCollectorWorkers, categories.length || maxCollectorWorkers);
runtimePressureState.adaptiveCollectorLimit = adaptiveCollectorLimit;


function readJson(filePath, fallback) {
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
    events: [...(existing.events || []), event].slice(-80),
    rule: "Worker output must be synced to the web service because Render services do not share a local data folder."
  });
}


function workerSyncStateSummary() {
  const ledger = readJson(syncLedgerFile, {});
  return {
    enabled: workerSyncEnabled,
    hasUrl: Boolean(webSyncBaseUrl),
    hasToken: Boolean(ownerAdminToken),
    intervalMs: workerSyncIntervalMs,
    lastStatus: ledger.lastStatus || "never",
    lastReason: ledger.lastReason || "never",
    lastSyncAt: ledger.lastSyncAt || "",
    acceptedKeys: ledger.acceptedKeys || [],
    rejectedKeys: ledger.rejectedKeys || []
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

function collectorWindowCategories() {
  if (!categories.length) return [];
  const limit = Math.max(1, Math.min(adaptiveCollectorLimit, categories.length));
  const window = [];
  for (let index = 0; index < limit; index += 1) {
    window.push(categories[(collectorRotationIndex + index) % categories.length]);
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
  const isPressure = status === "error" || /^http-(429|500|502|503|504)$/.test(status);
  if (isOk) {
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

function oneShotsDeferred(name = "one-shot") {
  if (!workerCpuGuardEnabled) return false;
  if (Date.now() < runtimePressureState.deferOneShotsUntil) {
    console.log(`[worker] skipped one-shot ${name}: deferred by adaptive runtime pressure until ${new Date(runtimePressureState.deferOneShotsUntil).toISOString()}`);
    recordWorkerEvent({ type: "one-shot-skipped", name, reason: "adaptive-runtime-pressure", deferUntil: new Date(runtimePressureState.deferOneShotsUntil).toISOString() });
    return true;
  }
  return false;
}
function collectSyncFiles() {
  const maxBytes = Math.max(1024 * 1024, Number(process.env.CE_WORKER_SYNC_MAX_FILE_BYTES || 8 * 1024 * 1024));
  const files = [];
  const skipped = [];
  for (const spec of syncFileSpecs) {
    try {
      if (!fs.existsSync(spec.file)) {
        skipped.push({ key: spec.key, reason: "missing" });
        continue;
      }
      const stat = fs.statSync(spec.file);
      if (stat.size > maxBytes) {
        skipped.push({ key: spec.key, reason: "too-large", bytes: stat.size });
        continue;
      }
      const payload = readJson(spec.file, null);
      if (!payload || typeof payload !== "object") {
        skipped.push({ key: spec.key, reason: "not-json-object" });
        continue;
      }
      files.push({ key: spec.key, updatedAt: stat.mtime.toISOString(), payload });
    } catch (error) {
      skipped.push({ key: spec.key, reason: error.message || String(error) });
    }
  }
  return { files, skipped };
}

async function syncWorkerOutputs(reason = "scheduled-sync") {
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
  const { files, skipped } = collectSyncFiles();
  if (!files.length) {
    const event = { type: "worker-sync-skipped", reason: "no-files", skipped, at: new Date().toISOString(), status: "skipped" };
    recordWorkerEvent(event);
    writeWorkerSyncLedger(event);
    console.log(`[worker] sync skipped: no eligible files; skipped=${skipped.map(item => item.key + ":" + item.reason).join(",")}`);
    return;
  }
  const endpoint = `${webSyncBaseUrl}/api/news-lab/worker-sync`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-owner-admin-token": ownerAdminToken
      },
      body: JSON.stringify({
        reason,
        source: "background-worker-orchestrator",
        generatedAt: new Date().toISOString(),
        files
      })
    });
    const result = await response.json().catch(() => ({}));
    const event = {
      type: response.ok ? "worker-sync-complete" : "worker-sync-failed",
      reason,
      status: response.ok ? "ok" : `http-${response.status}`,
      at: new Date().toISOString(),
      acceptedCount: Number(result.acceptedCount || 0),
      rejectedCount: Number(result.rejectedCount || 0),
      acceptedKeys: (result.accepted || []).map(item => item.key).filter(Boolean),
      rejectedKeys: (result.rejected || []).map(item => item.key).filter(Boolean),
      skipped
    };
    recordWorkerEvent(event);
    writeWorkerSyncLedger(event);
    tuneRuntimeFromSync(event);
    writeWorkerObservability("worker-sync-complete");
    console.log(`[worker] sync ${event.status}: accepted=${event.acceptedKeys.join(",") || "none"} rejected=${event.rejectedKeys.join(",") || "none"}`);
  } catch (error) {
    const event = { type: "worker-sync-error", reason, status: "error", error: error.message || String(error), at: new Date().toISOString(), skipped };
    recordWorkerEvent(event);
    writeWorkerSyncLedger(event);
    tuneRuntimeFromSync(event);
    writeWorkerObservability("worker-sync-error");
    console.log(`[worker] sync error: ${event.error}`);
  }
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

function spawnOneShot(name, env = {}) {
  if (oneShotsDeferred(name)) return null;
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
console.log(`[worker] sync config enabled=${workerSyncEnabled} hasUrl=${Boolean(webSyncBaseUrl)} hasToken=${Boolean(ownerAdminToken)} intervalMs=${workerSyncIntervalMs}`);
console.log(`[worker] cpu guard enabled=${workerCpuGuardEnabled} maxCollectors=${maxCollectorWorkers} startupStaggerMs=${roleStartupStaggerMs} maxOneShots=${maxOneShotConcurrency}`);

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
  CE_NEWS_LAB_WORKER_REASON: "worker-orchestrator-production"
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
  spawnOneShot("image-improvement", {
    CE_NEWS_LAB_IMAGE_WORKER: "1",
    CE_NEWS_LAB_IMAGE_WORKER_REASON: reason
  });
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
  console.log(`[worker] heartbeat activeRoles=${children.size} activeCollectors=${activeCollectorNames().join(",") || "none"} categories=${categories.join(",")} sync=${syncState.enabled ? syncState.lastStatus : "disabled"} hasUrl=${syncState.hasUrl} hasToken=${syncState.hasToken} accepted=${syncState.acceptedKeys.join(",") || "none"}`);
}, 60 * 1000);




















