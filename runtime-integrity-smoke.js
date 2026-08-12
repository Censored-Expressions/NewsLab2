const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const node = process.execPath;
const executableFiles = [
  "server.js",
  "worker.js",
  "news-lab.js",
  "news-lab-story.js",
  "news-lab-viewer.js",
  "owner-desk.js"
].filter(file => fs.existsSync(path.join(root, file)));

const criticalContracts = [
  "startNewsLabCollectorLoop",
  "runNewsLabCollectorCycle",
  "writeNewsLabCollectorStatus",
  "loadFeed",
  "loadFeeds",
  "feedFailureAttribution",
  "sourceErrorKey",
  "feedSourceDomain",
  "feedSourceProvider",
  "feedSourceRuntimeStatus",
  "rankedFeedSourcesForReliability",
  "runFeedSourcesWithAdaptiveConcurrency",
  "learningSummary",
  "newsLabDossierReadinessContract",
  "newsLabDossierReadinessClassFromEvidence",
  "newsLabTodayDateKey",
  "newsLabDossierToWriterHandoff",
  "newsLabBuildWriterReasoningPlan",
  "newsLabCanonicalHeadlineService",
  "newsLabFastPublishedApiPayload",
  "readPreparedNewsLabApiPayload",
  "readNewsLabLastKnownGoodApiPayload",
  "suppressNewsLabPublicReadCacheRefresh",
  "runNewsLabProductionCycle",
  "startNewsLabProductionLoop",
  "runNewsLabApiResponseCycle",
  "startNewsLabApiResponseLoop",
  "runNewsLabImageImprovementPass",
  "runNewsLabStuckRescueCycle",
  "startNewsLabStuckRescueLoop"
];

const smokeRoles = [
  "web",
  "api-worker",
  "production-worker",
  "stuck-rescue-worker",
  "image-worker",
  "scheduled-content-worker",
  "collector-top",
  "collector-world",
  "collector-politics",
  "collector-business",
  "collector-technology",
  "collector-sports",
  "collector-entertainment",
  "collector-local"
];

function run(command, args, options = {}) {
  const result = childProcess.spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...options.env },
    encoding: "utf8"
  });
  return {
    command: [command, ...args].join(" "),
    status: result.status,
    ok: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function syntaxChecks() {
  return executableFiles.map(file => {
    const result = run(node, ["--check", path.join(root, file)]);
    return { file, ok: result.ok, stderr: result.stderr.trim() };
  });
}

function criticalContractAudit() {
  const serverText = fs.readFileSync(path.join(root, "server.js"), "utf8");
  return criticalContracts.map(name => {
    const defined = new RegExp(`(?:function\\s+${name}\\s*\\(|const\\s+${name}\\s*=|let\\s+${name}\\s*=|var\\s+${name}\\s*=)`).test(serverText);
    const referencedIn = executableFiles.filter(file => fs.readFileSync(path.join(root, file), "utf8").includes(name));
    return { name, defined, referencedIn };
  });
}

function roleSmoke(role) {
  const isCollector = role.startsWith("collector-");
  const result = run(node, [path.join(root, "server.js")], {
    env: {
      CE_RUNTIME_SMOKE_TEST: "1",
      CE_RUNTIME_SMOKE_ROLE: role,
      CE_RUNTIME_SMOKE_EXECUTE_CYCLE: isCollector ? "true" : "false",
      CE_NEWS_LAB_COLLECTOR_SOURCE_LIMIT: "2",
      CE_NEWS_LAB_COLLECTOR_STORY_LIMIT: "8",
      CE_FEED_FETCH_TIMEOUT_MS: "1200",
      CE_NEWS_LAB_PUBLIC_GET_REFRESH: "false",
      CE_SERVER_START_WORKERS: "false",
      CE_RENDER_EMBEDDED_WORKER_FALLBACK: "false",
      CE_BACKGROUND_LOOPS: "false"
    }
  });
  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout || result.stderr || "{}");
  } catch {
    parsed = null;
  }
  return {
    role,
    ok: result.ok && parsed?.ok !== false,
    status: result.status,
    heartbeat: parsed?.heartbeat || "",
    modeSmokeOk: parsed?.modeSmoke?.ok,
    collectorStoryCount: parsed?.modeSmoke?.checks?.find(check => check.name === "collector-cycle-executed")?.storyCount,
    stderr: result.stderr.trim().slice(0, 1200)
  };
}

const syntax = syntaxChecks();
const contracts = criticalContractAudit();
const modes = smokeRoles.map(roleSmoke);
const ok = syntax.every(item => item.ok)
  && contracts.every(item => item.defined)
  && modes.every(item => item.ok);

const report = {
  ok,
  generatedAt: new Date().toISOString(),
  syntax,
  contracts,
  modes,
  rule: "Predeployment is invalid unless syntax, critical shared contracts, and every executable mode smoke test pass. Collectors must execute one bounded cycle without throwing."
};

console.log(JSON.stringify(report, null, 2));
process.exit(ok ? 0 : 1);
