const ownerLogin = document.querySelector("[data-owner-login]");
const ownerConsole = document.querySelector("[data-owner-console]");
const ownerLoginForm = document.querySelector("[data-owner-login-form]");
const ownerLoginStatus = document.querySelector("[data-owner-login-status]");
const ownerSummary = document.querySelector("[data-owner-summary]");
const ownerOutput = document.querySelector("[data-owner-output]");
const ownerRefresh = document.querySelector("[data-owner-refresh]");
const ownerLock = document.querySelector("[data-owner-lock]");
const ownerMetricPanel = document.querySelector("[data-owner-metric-panel]");
const ownerMetricTitle = document.querySelector("[data-owner-metric-title]");
const ownerMetricTimeframe = document.querySelector("[data-owner-metric-timeframe]");
const ownerMetricStats = document.querySelector("[data-owner-metric-stats]");
const ownerMetricChart = document.querySelector("[data-owner-metric-chart]");
const ownerBrainState = document.querySelector("[data-owner-brain-state]");
const ownerSubsystemTabs = document.querySelector("[data-owner-subsystem-tabs]");
const ownerSubsystemDetail = document.querySelector("[data-owner-subsystem-detail]");
const ownerSubsystemTitle = document.querySelector("[data-owner-subsystem-title]");
const ownerSubsystemOverall = document.querySelector("[data-owner-subsystem-overall]");
const ownerProductionRate = document.querySelector("[data-owner-production-rate]");
const ownerProductionSummary = document.querySelector("[data-owner-production-summary]");
const ownerProductionGrid = document.querySelector("[data-owner-production-grid]");
const ownerRoadmap = document.querySelector("[data-owner-roadmap]");
const ownerMaturityOverall = document.querySelector("[data-owner-maturity-overall]");
const ownerMaturitySummary = document.querySelector("[data-owner-maturity-summary]");
const ownerMaturityGrid = document.querySelector("[data-owner-maturity-grid]");
const ownerCapabilityOverall = document.querySelector("[data-owner-capability-overall]");
const ownerCapabilitySummary = document.querySelector("[data-owner-capability-summary]");
const ownerCapabilityGrid = document.querySelector("[data-owner-capability-grid]");
const ownerOrchestrationOverall = document.querySelector("[data-owner-orchestration-overall]");
const ownerOrchestrationSummary = document.querySelector("[data-owner-orchestration-summary]");
const ownerOrchestrationGrid = document.querySelector("[data-owner-orchestration-grid]");
const ownerWritingOverall = document.querySelector("[data-owner-writing-overall]");
const ownerWritingSummary = document.querySelector("[data-owner-writing-summary]");
const ownerWritingGrid = document.querySelector("[data-owner-writing-grid]");
const ownerEvolutionOverall = document.querySelector("[data-owner-evolution-overall]");
const ownerEvolutionSummary = document.querySelector("[data-owner-evolution-summary]");
const ownerEvolutionGrid = document.querySelector("[data-owner-evolution-grid]");
const ownerImpactOverall = document.querySelector("[data-owner-impact-overall]");
const ownerImpactSummary = document.querySelector("[data-owner-impact-summary]");
const ownerImpactGrid = document.querySelector("[data-owner-impact-grid]");
const feedbackForm = document.querySelector("[data-owner-feedback-form]");
const commandForm = document.querySelector("[data-owner-command-form]");
const codingForm = document.querySelector("[data-owner-coding-form]");
const patchRefresh = document.querySelector("[data-patch-refresh]");
const patchList = document.querySelector("[data-patch-list]");
const patchStatus = document.querySelector("[data-patch-status]");
const codingStatus = document.querySelector("[data-owner-coding-status]");
const merchForm = document.querySelector("[data-merch-form]");
const merchStatus = document.querySelector("[data-merch-status]");
const merchAdminList = document.querySelector("[data-merch-admin-list]");
const merchRefresh = document.querySelector("[data-merch-refresh]");
const merchClear = document.querySelector("[data-merch-clear]");
const merchSalesRefresh = document.querySelector("[data-merch-sales-refresh]");
const merchSalesReport = document.querySelector("[data-merch-sales-report]");
const merchOrdersRefresh = document.querySelector("[data-merch-orders-refresh]");
const merchOrdersReport = document.querySelector("[data-merch-orders-report]");
const merchSaleForm = document.querySelector("[data-merch-sale-form]");
const merchSaleStatus = document.querySelector("[data-merch-sale-status]");
const merchDeskVisible = Boolean(document.querySelector('[data-owner-feature="merch-desk"]:not(.is-hidden)'));

const tokenKey = "ceOwnerAdminToken";
let ownerToken = localStorage.getItem(tokenKey) || "";
let selectedOwnerMetric = "health";
let selectedOwnerTimeframe = "7d";
let ownerMetricOptionsLoaded = false;
let ownerBrainStatePayload = null;
let selectedSubsystemKey = "";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setStatus(node, message = "", tone = "") {
  if (!node) return;
  node.dataset.tone = tone;
  node.textContent = message;
}

function ownerHeaders(extra = {}) {
  return {
    "content-type": "application/json",
    ...(ownerToken ? { "x-owner-admin-token": ownerToken, "x-newsletter-admin-token": ownerToken } : {}),
    ...extra
  };
}

function showJson(payload) {
  if (!ownerOutput) return;
  ownerOutput.textContent = JSON.stringify(payload, null, 2);
}

async function ownerApi(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  const requestPath = method === "GET"
    ? `${path}${path.includes("?") ? "&" : "?"}_=${Date.now()}`
    : path;
  const response = await fetch(requestPath, {
    ...options,
    cache: "no-store",
    headers: ownerHeaders(options.headers || {})
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.detail || "Owner request failed.");
  return payload;
}

function summaryCard(metricKey, label, value, detail = "") {
  return `
    <button class="owner-card owner-card-button" type="button" data-owner-metric="${escapeHtml(metricKey)}" aria-label="Open ${escapeHtml(label)} graph">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${detail ? `<p>${escapeHtml(detail)}</p>` : ""}
    </button>
  `;
}

function renderSummary({ learning, health, revenue, metrics }) {
  if (!ownerSummary) return;
  const learningData = learning?.learning || {};
  const todayValues = metrics?.currentDay?.values || {};
  ownerSummary.innerHTML = [
    summaryCard("health", "Health", health?.health || "Unknown", `Today: ${todayValues.health ?? health?.activeFindings ?? "n/a"} findings`),
    summaryCard("functionality", "Functionality", health?.functionality?.ok ? "Healthy" : "Check", `Today: ${todayValues.functionality ?? health?.functionality?.findingCount ?? 0} findings`),
    summaryCard("revenueGrowth", "Revenue Growth", revenue?.revenueGrowth?.ok ? "Ready" : "Needs Review", `Today: ${todayValues.revenueGrowth ?? revenue?.revenueGrowth?.findingCount ?? 0} findings`),
    summaryCard("searchLearning", "Search Learning", String(todayValues.searchLearning ?? learningData.searchLearning?.queryCount ?? 0), "visitor searches recorded today"),
    summaryCard("articleMemory", "Article Memory", String(todayValues.articleMemory ?? learningData.dailyArticleMemory?.articleCount ?? 0), "articles absorbed today"),
    summaryCard("impactEngine", "Impact Engine", String(todayValues.impactEngine ?? learningData.impactDecisionCount ?? 0), "cross-role decisions logged today"),
    summaryCard("selfImprovement", "Self Improvement", String(todayValues.selfImprovement ?? learningData.selfImprovementCycleCount ?? 0), "framework cycles logged today"),
    summaryCard("proactiveChecks", "Proactive Checks", String(todayValues.proactiveChecks ?? learningData.proactiveCycleCount ?? 0), "timed cycles logged today"),
    summaryCard("proofLog", "Proof Log", String(todayValues.proofLog ?? learningData.frameworkLearningProof?.recentEntries?.length ?? 0), "recent learning proof entries today"),
    summaryCard("lessons", "Lessons", String(todayValues.lessons ?? learningData.changeLessonCount ?? 0), "Codex-taught changes today")
  ].join("");
}

function renderOwnerMetricOptions(metrics = {}) {
  if (!ownerMetricTimeframe || ownerMetricOptionsLoaded) return;
  const options = metrics.timeframes || [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "7d", label: "Past 7 days" },
    { key: "14w", label: "Past 14 weeks" },
    { key: "1m", label: "Past month" },
    { key: "1y", label: "Past year" },
    { key: "all", label: "All-time" }
  ];
  ownerMetricTimeframe.innerHTML = options
    .map(option => `<option value="${escapeHtml(option.key)}">${escapeHtml(option.label)}</option>`)
    .join("");
  ownerMetricTimeframe.value = selectedOwnerTimeframe;
  ownerMetricOptionsLoaded = true;
}

function renderOwnerMetricGraph(metrics = {}) {
  if (!ownerMetricPanel || !ownerMetricChart || !ownerMetricStats || !ownerMetricTitle) return;
  const selected = metrics.selected || {};
  const metric = selected.metric || {};
  const summary = selected.summary || {};
  const points = selected.points || [];
  const max = Math.max(1, ...points.map(point => Number(point.value || 0)));
  ownerMetricPanel.hidden = false;
  ownerMetricTitle.textContent = `${metric.label || "Owner Metric"} Graph`;
  ownerMetricStats.innerHTML = [
    ["Latest", summary.latest ?? 0],
    ["High", summary.high ?? 0],
    ["Low", summary.low ?? 0],
    ["Average", summary.average ?? 0],
    ["Days", summary.pointCount ?? 0]
  ].map(([label, value]) => `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");
  ownerMetricChart.innerHTML = points.length
    ? points.map(point => {
      const height = Math.max(8, Math.round((Number(point.value || 0) / max) * 100));
      return `
        <div class="owner-metric-bar" title="${escapeHtml(point.dayId)}: ${escapeHtml(point.value)}">
          <span style="height:${height}%"></span>
          <strong>${escapeHtml(point.value)}</strong>
          <em>${escapeHtml(String(point.dayId || "").slice(5))}</em>
        </div>
      `;
    }).join("")
    : '<p class="empty-state">No recorded snapshots for this timeframe yet. The Owner Desk will add a daily snapshot each time it refreshes.</p>';
}

async function loadOwnerMetric(metricKey = selectedOwnerMetric, timeframe = selectedOwnerTimeframe) {
  selectedOwnerMetric = metricKey;
  selectedOwnerTimeframe = timeframe;
  const payload = await ownerApi(`/api/owner-metrics?metric=${encodeURIComponent(metricKey)}&timeframe=${encodeURIComponent(timeframe)}`);
  renderOwnerMetricOptions(payload);
  if (ownerMetricTimeframe) ownerMetricTimeframe.value = selectedOwnerTimeframe;
  renderOwnerMetricGraph(payload);
  return payload;
}

function ownerBrainItem(label, value, detail = "") {
  return `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${detail ? `<p>${escapeHtml(detail)}</p>` : ""}
    </article>
  `;
}

function renderBrainState(payload = {}) {
  ownerBrainStatePayload = payload;
  const brain = payload.brainState || {};
  if (ownerBrainState) {
    ownerBrainState.innerHTML = [
      ownerBrainItem("Framework Confidence", `${brain.frameworkConfidence ?? 0}%`),
      ownerBrainItem("Most Active Subsystem", brain.mostActiveSubsystem || "Unknown"),
      ownerBrainItem("Most Improved Subsystem", brain.mostImprovedSubsystem || "Unknown"),
      ownerBrainItem("Weakest Subsystem", brain.weakestSubsystem || "Unknown"),
      ownerBrainItem("Most Valuable Opportunity", brain.mostValuableOpportunity || "No opportunity measured yet"),
      ownerBrainItem("Teaching Needed", `${brain.teachingNeeded ?? 0} items`),
      ownerBrainItem("Awaiting Owner Approval", `${brain.awaitingOwnerApproval ?? 0} proposals`)
    ].join("");
  }
  renderFrameworkMaturity(payload);
  renderContentOrchestration(payload);
  renderWritingIntelligence(payload);
  renderFrameworkEvolution(payload);
  renderHighImpactCapabilities(payload);
  renderFrameworkCapabilities(payload);
  renderSubsystemReadiness(payload);
  renderRoadmap(payload.roadmap || {});
}

function renderProductionIntelligence(payload = {}) {
  if (!ownerProductionRate || !ownerProductionSummary || !ownerProductionGrid) return;
  const current = payload.current || {};
  const waste = payload.unnecessaryWork || {};
  const proposal = payload.boundedImprovementProposal || {};
  const routing = Array.isArray(payload.targetedRepairRouting) ? payload.targetedRepairRouting : [];
  const observability = payload.observability || {};
  const publishing = observability.publishing || {};
  const editorial = observability.editorial || {};
  const actionQueue = observability.queues?.publicationIntelligenceAction || observability.queues?.approvalActionPlan || {};
  const funnel = publishing.publicationFunnelDashboard || payload.publicationFunnelDashboard || {};
  const stageRows = Array.isArray(funnel.stageRows) ? funnel.stageRows : [];
  const topRejections = Array.isArray(editorial.topRejectionReasons) ? editorial.topRejectionReasons : (Array.isArray(funnel.topRejectionReasons) ? funnel.topRejectionReasons : []);
  const firstPassRate = Math.round(Number(current.firstPassPublicationRate || 0) * 100);
  const finalRate = Math.round(Number(current.finalApprovalRate || 0) * 100);
  ownerProductionRate.textContent = `${firstPassRate}%`;
  ownerProductionSummary.innerHTML = `
    <p>${escapeHtml(payload.primaryGoal || "Increase First-Pass Publication Rate.")}</p>
    <p><strong>${escapeHtml(proposal.subsystem || proposal.target || "Production Intelligence")}</strong>: ${escapeHtml(proposal.action || "No bounded improvement selected yet.")}</p>
    <p>${escapeHtml(proposal.expectedOutcome || proposal.measurement || "Measure the next production window before promoting changes.")}</p>
    <p>${escapeHtml(`Visible: ${publishing.activeBoardStories ?? publishing.visibleStories ?? 0}; cache: ${publishing.publicCache?.freshness?.label || "unknown"}; action tasks: ${actionQueue.active ?? 0}.`)}</p>
  `;
  const cards = [
    ["First-Pass", `${firstPassRate}%`, `${escapeHtml(current.publishedFirstPass ?? current.firstPassApproved ?? 0)} first-pass approvals`],
    ["Final Approval", `${finalRate}%`, `${escapeHtml(current.finalApproved ?? 0)} final approvals`],
    ["Repairs", escapeHtml(waste.repairFrequency ?? 0), "repair attempts this window"],
    ["Headline Pressure", escapeHtml(waste.headlineRewritePressure ?? 0), "headline/title blockers"],
    ["Dossier Pressure", escapeHtml(waste.evidenceOrDossierPressure ?? 0), "evidence/body/context blockers"],
    ["Avg Repair Passes", escapeHtml(current.averageRepairPasses ?? 0), "target below 1.5"],
    ["Visible Tiles", escapeHtml(publishing.activeBoardStories ?? publishing.visibleStories ?? 0), "currently public after tile rules"],
    ["Cache Age", escapeHtml(publishing.publicCache?.freshness?.label || "unknown"), publishing.publicCache?.stale ? "public cache is stale" : "public cache freshness"],
    ["Action Tasks", escapeHtml(actionQueue.active ?? 0), "repair/publication tasks waiting"],
    ["Lifecycle", escapeHtml(lifecycle.latestStatus || "not-recorded"), `${escapeHtml(lifecycle.storyCount ?? 0)} traced stories`],
    ["Stop Point", escapeHtml(lifecycleStop.stage || "unknown"), escapeHtml(lifecycleStop.reason || "waiting for trace")]
  ];
  const routeHtml = routing.slice(0, 4).map(item => `
    <article>
      <span>${escapeHtml(item.code || "REPAIR")}</span>
      <strong>${escapeHtml(item.repairScope || "targeted")}</strong>
      <p>${escapeHtml(item.count ?? 0)} recent blockers</p>
    </article>
  `).join("");
  const funnelHtml = stageRows.slice(0, 8).map(item => `
    <article>
      <span>${escapeHtml(item.stage || "Stage")}</span>
      <strong>${escapeHtml(item.count ?? 0)}</strong>
      <p>${escapeHtml(`${item.percentRemaining ?? 0}% remaining`)}</p>
    </article>
  `).join("");
  const rejectionHtml = topRejections.slice(0, 6).map(item => `
    <article>
      <span>${escapeHtml(item.failureCode || "REJECTION")}</span>
      <strong>${escapeHtml(item.count ?? 0)}</strong>
      <p>top rejection reason</p>
    </article>
  `).join("");
  ownerProductionGrid.innerHTML = cards.map(([label, value, detail]) => `
    <article>
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
      <p>${detail}</p>
    </article>
  `).join("") + routeHtml + funnelHtml + rejectionHtml;
}
function renderHighImpactCapabilities(payload = {}) {
  const plan = payload.highImpactCapabilityPlan || {};
  const lanes = Array.isArray(plan.lanes) ? plan.lanes : [];
  if (ownerImpactOverall) ownerImpactOverall.textContent = String(plan.overall ?? 0);
  if (ownerImpactSummary) {
    ownerImpactSummary.innerHTML = plan.overall ? `
      <div>
        <span>Top Priority</span>
        <strong>${escapeHtml(plan.topPriority?.label || "Unknown")}</strong>
        <p>${escapeHtml(plan.topPriority?.nextAction || plan.purpose || "")}</p>
      </div>
      <div>
        <span>Execution Order</span>
        <strong>${escapeHtml((plan.executionOrder || []).slice(0, 3).join(" -> ") || "Not measured")}</strong>
        <p>${escapeHtml(plan.sharedVerificationRule || "Every improvement needs a metric.")}</p>
      </div>
      <div>
        <span>Rollback Rule</span>
        <strong>Protected</strong>
        <p>${escapeHtml(plan.rollbackRule || "Revert changes that reduce quality or output.")}</p>
      </div>
    ` : '<p class="empty-state">High-impact capability plan will appear after the Brain runs the report.</p>';
  }
  if (ownerImpactGrid) {
    ownerImpactGrid.innerHTML = lanes.length ? lanes.map(lane => `
      <article class="owner-maturity-card" data-status="${escapeHtml(lane.status || "")}">
        <div>
          <span>${escapeHtml(lane.label || lane.key || "Capability")}</span>
          <strong>${escapeHtml(lane.score ?? 0)}</strong>
        </div>
        <p>${escapeHtml(`Priority ${lane.priority ?? 0}: ${lane.operatingRule || ""}`)}</p>
        <p>${escapeHtml(lane.correctionRule || "")}</p>
      </article>
    `).join("") : '<p class="empty-state">No high-impact capability lanes loaded yet.</p>';
  }
}

function renderFrameworkEvolution(payload = {}) {
  const evolution = payload.frameworkEvolutionSpiral || {};
  const loops = Array.isArray(evolution.loops) ? evolution.loops : [];
  const engine = payload.evolutionEngine || evolution.evolutionEngine || {};
  if (ownerEvolutionOverall) ownerEvolutionOverall.textContent = String(evolution.overall ?? 0);
  if (ownerEvolutionSummary) {
    ownerEvolutionSummary.innerHTML = evolution.overall ? `
      <div>
        <span>Evolution Model</span>
        <strong>${escapeHtml(evolution.overall)}</strong>
        <p>${escapeHtml(evolution.model || "spiral-with-controlled-feedback-loops")}</p>
      </div>
      <div>
        <span>Meta-Learner</span>
        <strong>${escapeHtml(evolution.metaLearner?.score ?? 0)}</strong>
        <p>${escapeHtml(`Weakest loop: ${evolution.metaLearner?.weakestLoop || "Unknown"}`)}</p>
      </div>
      <div>
        <span>Promotion Gate</span>
        <strong>${escapeHtml((evolution.promotionGate || []).join(" -> ") || "Observed -> Capability")}</strong>
        <p>${escapeHtml(evolution.nextImprovement || "Continue promoting verified capabilities.")}</p>
      </div>
      <div>
        <span>Evolution Engine</span>
        <strong>${escapeHtml(engine.measurements?.publicStoryCount ?? "0")} public</strong>
        <p>${escapeHtml(engine.highestImpactNextImprovement?.target || engine.answer || "Run Evolution Engine report.")}</p>
      </div>
    ` : '<p class="empty-state">Framework Evolution will appear after the Brain runs the promotion-gate report.</p>';
  }
  if (ownerEvolutionGrid) {
    const engineCards = engine.measurements ? `
      <article class="owner-maturity-card" data-status="evolution-engine">
        <div>
          <span>Highest Impact</span>
          <strong>${escapeHtml(engine.highestImpactNextImprovement?.target || "Unknown")}</strong>
        </div>
        <p>${escapeHtml(engine.highestImpactNextImprovement?.reason || "")}</p>
        <p>${escapeHtml(engine.highestImpactNextImprovement?.action || "")}</p>
      </article>
      <article class="owner-maturity-card" data-status="evolution-engine">
        <div>
          <span>Measured Change</span>
          <strong>${escapeHtml((engine.measurableImprovements || []).length)} / ${escapeHtml((engine.regressions || []).length)}</strong>
        </div>
        <p>${escapeHtml(`Improvements / regressions. Public stories: ${engine.measurements.publicStoryCount ?? 0}; duplicates: ${engine.measurements.duplicatePublicTitleGroups ?? 0}`)}</p>
        <p>${escapeHtml(engine.answer || "")}</p>
      </article>
    ` : "";
    const loopCards = loops.length ? loops.map(loop => `
      <article class="owner-maturity-card" data-status="${escapeHtml(loop.currentLevel || "")}">
        <div>
          <span>${escapeHtml(loop.label || loop.key || "Learning Loop")}</span>
          <strong>${escapeHtml(loop.score ?? 0)}</strong>
        </div>
        <p>${escapeHtml(`Level: ${loop.currentLevel || "observed"} | Experience: ${loop.experienceCount ?? 0} | Verified: ${loop.verificationCount ?? 0}`)}</p>
        <p>${escapeHtml(loop.nextRequirement || "")}</p>
      </article>
    `).join("") : "";
    ownerEvolutionGrid.innerHTML = engineCards || loopCards ? `${engineCards}${loopCards}` : '<p class="empty-state">No evolution loops loaded yet.</p>';
  }
}


function renderWritingIntelligence(payload = {}) {
  const intelligence = payload.writingIntelligence || {};
  const patterns = Array.isArray(intelligence.patterns) ? intelligence.patterns : [];
  if (ownerWritingOverall) ownerWritingOverall.textContent = String(intelligence.overall ?? 0);
  if (ownerWritingSummary) {
    ownerWritingSummary.innerHTML = intelligence.overall ? `
      <div>
        <span>Craft Score</span>
        <strong>${escapeHtml(intelligence.overall)}</strong>
        <p>${escapeHtml(intelligence.writerDirective || "Use patterns for craft, dossiers for facts.")}</p>
      </div>
      <div>
        <span>Weakest Pattern</span>
        <strong>${escapeHtml(intelligence.weakestPattern?.key || "Unknown")}</strong>
        <p>${escapeHtml(intelligence.weakestPattern ? `${intelligence.weakestPattern.successRate || 0}% success` : "No pattern score yet")}</p>
      </div>
      <div>
        <span>Boundary</span>
        <strong>Technique Only</strong>
        <p>${escapeHtml((intelligence.boundaries || [])[0] || "Do not store article wording as a style template.")}</p>
      </div>
    ` : '<p class="empty-state">Writing Intelligence will appear after editor decisions are processed.</p>';
  }
  if (ownerWritingGrid) {
    ownerWritingGrid.innerHTML = patterns.length ? patterns.map(pattern => `
      <article class="owner-maturity-card" data-status="${escapeHtml((pattern.successRate || 0) >= 80 ? "ready" : (pattern.successRate || 0) >= 55 ? "developing" : "needs-work")}">
        <div>
          <span>${escapeHtml(pattern.key || "pattern")}</span>
          <strong>${escapeHtml(pattern.successRate ?? 0)}%</strong>
        </div>
        <p>${escapeHtml(pattern.principle || "")}</p>
        <p>${escapeHtml(pattern.teachWriter || "")}</p>
      </article>
    `).join("") : '<p class="empty-state">No writing patterns loaded yet.</p>';
  }
}

function renderContentOrchestration(payload = {}) {
  const orchestration = payload.contentOrchestration || {};
  const stages = Array.isArray(orchestration.stages) ? orchestration.stages : [];
  const lanes = Array.isArray(orchestration.contentLanes) ? orchestration.contentLanes : [];
  if (ownerOrchestrationOverall) ownerOrchestrationOverall.textContent = String(orchestration.overall ?? 0);
  if (ownerOrchestrationSummary) {
    ownerOrchestrationSummary.innerHTML = orchestration.overall ? `
      <div>
        <span>Pipeline</span>
        <strong>${escapeHtml(orchestration.overall)}</strong>
        <p>${escapeHtml((orchestration.flow || []).join(" -> "))}</p>
      </div>
      <div>
        <span>Weakest Stage</span>
        <strong>${escapeHtml(orchestration.weakest?.label || "Unknown")}</strong>
        <p>${escapeHtml(orchestration.weakest ? `${orchestration.weakest.score} / 100` : "No score yet")}</p>
      </div>
      <div>
        <span>Execution Lanes</span>
        <strong>${escapeHtml((orchestration.outputs || []).join(", ") || "Unknown")}</strong>
        <p>${escapeHtml(orchestration.nextImprovement || "Continue measuring orchestration health.")}</p>
      </div>
    ` : '<p class="empty-state">Content orchestration will appear after Brain State refreshes.</p>';
  }
  if (ownerOrchestrationGrid) {
    const stageCards = stages.map(stage => `
      <article class="owner-maturity-card" data-status="${escapeHtml(stage.status || "")}">
        <div>
          <span>${escapeHtml(stage.label)}</span>
          <strong>${escapeHtml(stage.score)}</strong>
        </div>
        <p>${escapeHtml(stage.nextAction || "")}</p>
      </article>
    `).join("");
    const laneCards = lanes.map(lane => `
      <article class="owner-maturity-card" data-status="${escapeHtml(lane.status || "")}">
        <div>
          <span>${escapeHtml(lane.label)}</span>
          <strong>${escapeHtml(lane.currentOutput ?? 0)}</strong>
        </div>
        <p>${escapeHtml(lane.role || "")}</p>
        <p>${escapeHtml(lane.nextAction || "")}</p>
      </article>
    `).join("");
    ownerOrchestrationGrid.innerHTML = stageCards || laneCards ? `${stageCards}${laneCards}` : '<p class="empty-state">No orchestration stages loaded yet.</p>';
  }
}
function renderFrameworkCapabilities(payload = {}) {
  const analysis = payload.frameworkCapabilityAnalysis || {};
  const center = analysis.capabilityCenter || {};
  const decision = center.strategicDecision || {};
  const capabilities = Array.isArray(analysis.capabilities) ? analysis.capabilities : [];
  if (ownerCapabilityOverall) ownerCapabilityOverall.textContent = String(analysis.overall ?? 0);
  if (ownerCapabilitySummary) {
    ownerCapabilitySummary.innerHTML = analysis.overall ? `
      <div>
        <span>Capability Center</span>
        <strong>${escapeHtml(analysis.overall)}</strong>
        <p>${escapeHtml(center.centralQuestion || analysis.purpose || "Capability analysis measured.")}</p>
      </div>
      <div>
        <span>Highest-Value Improvement</span>
        <strong>${escapeHtml(decision.targetCapability || analysis.weakest?.label || "Unknown")}</strong>
        <p>${escapeHtml(decision.highestValueImprovement || analysis.weakest?.nextImprovement || "No improvement selected yet.")}</p>
      </div>
      <div>
        <span>Verification</span>
        <strong>${escapeHtml(decision.targetSubsystem || analysis.weakest?.subsystem || "Unknown")}</strong>
        <p>${escapeHtml((decision.verificationPlan || [])[0] || "Measure before and after every capability improvement.")}</p>
      </div>
    ` : '<p class="empty-state">Framework capability analysis will appear after Brain State refreshes.</p>';
  }
  if (ownerCapabilityGrid) {
    const centerCards = center.strategicDecision ? `
      <article class="owner-maturity-card" data-status="priority">
        <div>
          <span>Strategic Decision</span>
          <strong>${escapeHtml(decision.expectedLift ?? 0)}</strong>
        </div>
        <p>${escapeHtml(decision.whyThisNow || "")}</p>
        <p>${escapeHtml(decision.rollbackPlan || "")}</p>
      </article>
      <article class="owner-maturity-card" data-status="${escapeHtml(center.causalReasoning?.status || "")}">
        <div>
          <span>Causal Reasoning</span>
          <strong>${escapeHtml(center.causalReasoning?.status || "unknown")}</strong>
        </div>
        <p>${escapeHtml((center.causalReasoning?.questions || [])[0] || "Connect causes across subsystem outputs.")}</p>
      </article>
      <article class="owner-maturity-card" data-status="pattern">
        <div>
          <span>Pattern Generalization</span>
          <strong>${escapeHtml(center.patternGeneralization?.weakestPattern || "unknown")}</strong>
        </div>
        <p>${escapeHtml(center.patternGeneralization?.rule || "")}</p>
      </article>
    ` : "";
    const capabilityCards = capabilities.length ? capabilities.map(item => `
      <article class="owner-maturity-card" data-status="${escapeHtml(item.status || "")}">
        <div>
          <span>${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.score)}</strong>
        </div>
        <p>${escapeHtml(item.current || "")}</p>
        <p><strong>${escapeHtml(item.subsystem || "Next ability")}</strong>: ${escapeHtml(item.nextImprovement || "")}</p>
      </article>
    `).join("") : "";
    ownerCapabilityGrid.innerHTML = centerCards || capabilityCards ? `${centerCards}${capabilityCards}` : '<p class="empty-state">No capability lanes loaded yet.</p>';
  }
}
function renderFrameworkMaturity(payload = {}) {
  const maturity = payload.frameworkMaturity || {};
  const items = Array.isArray(maturity.items) ? maturity.items : [];
  if (ownerMaturityOverall) ownerMaturityOverall.textContent = String(maturity.overall ?? 0);
  if (ownerMaturitySummary) {
    ownerMaturitySummary.innerHTML = maturity.overall ? `
      <article>
        <span>Overall Framework</span>
        <strong>${escapeHtml(maturity.overall)}</strong>
        <p>${escapeHtml(maturity.label || "measured")}</p>
      </article>
      <article>
        <span>Weakest Lane</span>
        <strong>${escapeHtml(maturity.weakest?.label || "Unknown")}</strong>
        <p>${escapeHtml(maturity.weakest ? `${maturity.weakest.score} / 100` : "No score yet")}</p>
      </article>
      <article>
        <span>Next Action</span>
        <strong>${escapeHtml(maturity.weakest?.status || "monitor")}</strong>
        <p>${escapeHtml(maturity.nextAction || "Continue measuring each maturity lane.")}</p>
      </article>
    ` : '<p class="empty-state">Framework maturity scores will appear after the Brain State refreshes.</p>';
  }
  if (ownerMaturityGrid) {
    ownerMaturityGrid.innerHTML = items.length ? items.map(item => `
      <article class="owner-maturity-card" data-status="${escapeHtml(item.status || "")}">
        <span>${escapeHtml(item.label || item.key || "Maturity Lane")}</span>
        <strong>${escapeHtml(item.score ?? 0)}</strong>
        <p>${escapeHtml(item.why || item.status || "Measured from Framework behavior.")}</p>
      </article>
    `).join("") : '<p class="empty-state">No maturity score lanes loaded yet.</p>';
  }
}
function renderSubsystemDetail(subsystem = {}) {
  if (!ownerSubsystemDetail || !ownerSubsystemTitle) return;
  ownerSubsystemTitle.textContent = subsystem.name ? `${subsystem.name} Metrics` : "Subsystem Metrics";
  ownerSubsystemDetail.innerHTML = subsystem.key ? `
    <div class="owner-subsystem-score">
      <span>${escapeHtml(subsystem.name)} Readiness</span>
      <strong>${escapeHtml(subsystem.readiness ?? 0)}</strong>
    </div>
    <div class="owner-subsystem-facts">
      <section>
        <h3>Reason</h3>
        ${patchListItems(subsystem.reason || [])}
      </section>
      <section>
        <h3>Confidence</h3>
        <p>${escapeHtml(subsystem.confidence ?? 0)}%</p>
      </section>
      <section>
        <h3>Status</h3>
        <p>${escapeHtml(subsystem.status || "unknown")}</p>
      </section>
      <section>
        <h3>Brain Decision</h3>
        <p>${escapeHtml(subsystem.brainDecision || "No decision recorded yet.")}</p>
      </section>
      <section>
        <h3>Required Capabilities</h3>
        ${patchListItems(subsystem.requiredCapabilities || [])}
      </section>
      <section>
        <h3>Missing Capabilities</h3>
        ${patchListItems(subsystem.missingCapabilities || [])}
      </section>
    </div>
  ` : '<p class="empty-state">No subsystem readiness data loaded yet.</p>';
}

function renderSubsystemReadiness(payload = {}) {
  const readiness = payload.subsystemReadiness || {};
  const tabs = readiness.tabs || [];
  if (ownerSubsystemOverall) ownerSubsystemOverall.textContent = String(readiness.overallScore ?? 0);
  if (!selectedSubsystemKey && tabs.length) selectedSubsystemKey = tabs[0].key;
  if (ownerSubsystemTabs) {
    ownerSubsystemTabs.innerHTML = tabs.map(tab => `
      <button type="button" data-subsystem-key="${escapeHtml(tab.key)}" class="${tab.key === selectedSubsystemKey ? "is-active" : ""}">
        <span>${escapeHtml(tab.name)}</span>
        <strong>${escapeHtml(tab.readiness)}</strong>
      </button>
    `).join("");
  }
  renderSubsystemDetail(tabs.find(tab => tab.key === selectedSubsystemKey) || tabs[0] || {});
}

function renderRoadmap(roadmap = {}) {
  if (!ownerRoadmap) return;
  ownerRoadmap.innerHTML = [
    ownerBrainItem("Current Goal", roadmap.currentGoal || "No goal selected"),
    ownerBrainItem("Current Readiness", roadmap.currentReadiness ?? 0),
    ownerBrainItem("Target Readiness", roadmap.targetReadiness ?? 80),
    ownerBrainItem("Next Planned Action", roadmap.nextPlannedAction || "No action selected"),
    ownerBrainItem("Expected Benefit", roadmap.expectedBenefit || "No benefit estimated"),
    ownerBrainItem("Status", roadmap.status || "Unknown")
  ].join("");
}

function patchLaymanDescription(proposal = {}) {
  if (proposal.laymanDescription) return proposal.laymanDescription;
  const root = proposal.rootCause || "The Framework detected a code-level issue.";
  const fix = proposal.proposedFix || "It recommends a controlled patch before the issue repeats.";
  return `${root} ${fix} The Framework is asking for owner permission before any code is changed.`;
}

function patchStatusLabel(status = "") {
  return String(status || "unknown")
    .replace(/-/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function patchListItems(items = []) {
  return items.length
    ? `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : '<p class="empty-state compact">No items listed.</p>';
}

function patchApplyEvidence(proposal = {}) {
  const result = proposal.applyResult || {};
  const verification = result.verification || {};
  const deployment = result.deployment || {};
  if (!result.ok && !verification.verifiedAt && !deployment.status) return "No apply evidence yet.";
  const changed = Array.isArray(result.changedFiles) ? result.changedFiles.length : 0;
  return [
    result.ok ? `Changed files: ${changed}` : "",
    verification.verifiedAt ? `Verification: ${verification.ok ? "passed" : "failed"}` : "",
    deployment.status ? `Deployment: ${deployment.status}` : ""
  ].filter(Boolean).join(" | ") || "Apply evidence was recorded.";
}

function patchCodexDirection(proposal = {}) {
  if (proposal.codexDirection) return proposal.codexDirection;
  const list = items => Array.isArray(items) && items.length
    ? items.map(item => `- ${String(item || "").trim()}`).join("\n")
    : "- Not provided";
  return [
    "# Codex Teaching Direction",
    "",
    `Patch ID: ${proposal.id || "unknown"}`,
    `Status: ${proposal.status || "unknown"}`,
    `Risk: ${proposal.riskLevel || "medium"}`,
    "",
    "## Owner Intent",
    "The AI Framework/Brain could not complete this safely on its own, or needs Codex teaching before it can execute this pattern independently in the future. Teach the Framework the missing method, then make the smallest safe code change needed.",
    "",
    "## Title",
    proposal.title || "Framework patch request",
    "",
    "## Plain-English Summary",
    patchLaymanDescription(proposal),
    "",
    "## Root Cause",
    proposal.rootCause || "No root cause supplied.",
    "",
    "## Requested Fix",
    proposal.proposedFix || proposal.proposedPatch || "No proposed fix supplied.",
    "",
    "## Affected Files",
    list(proposal.affectedFiles || []),
    "",
    "## Verification Required",
    list(proposal.verificationPlan || []),
    "",
    "## Rollback",
    proposal.rollbackPlan || "Revert only the files changed for this patch.",
    "",
    "## Framework Learning Requirement",
    proposal.codexInstruction || "After the fix, save a reusable lesson explaining the exact file path, exact patch operation, verification, and when the Brain should use this pattern again."
  ].join("\n");
}

function patchDecisionTime(proposal = {}) {
  return proposal.appliedAt || proposal.ownerDecisionAt || proposal.updatedAt || proposal.at || "";
}

function patchDecisionDate(proposal = {}) {
  const raw = patchDecisionTime(proposal);
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return "Undated";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function patchArchiveSortValue(proposal = {}) {
  const raw = patchDecisionTime(proposal);
  const time = raw ? Date.parse(raw) : 0;
  return Number.isFinite(time) ? time : 0;
}

function renderPatchCard(proposal = {}, archived = false) {
  const pending = proposal.status === "pending-owner-approval";
  const approved = proposal.status === "approved-for-framework" || proposal.status === "approved-for-codex";
  const canApply = approved && Array.isArray(proposal.filePatches) && proposal.filePatches.length > 0;
  const canMarkApplied = approved && !canApply;
  const noteValue = proposal.ownerNote ? escapeHtml(proposal.ownerNote) : "";
  const codexDirection = patchCodexDirection(proposal);
  return `
    <article class="owner-patch-card${archived ? " is-archived" : ""}" data-patch-id="${escapeHtml(proposal.id)}">
      <div class="owner-patch-head">
        <div>
          <span>${escapeHtml(patchStatusLabel(proposal.status))}</span>
          <h3>${escapeHtml(proposal.title || "Framework patch request")}</h3>
        </div>
        <strong>${escapeHtml(proposal.riskLevel || "medium")} risk</strong>
      </div>
      <p class="owner-patch-layman">${escapeHtml(patchLaymanDescription(proposal))}</p>
      <div class="owner-patch-grid">
        <section>
          <h4>Why</h4>
          <p>${escapeHtml(proposal.rootCause || "No root cause supplied.")}</p>
        </section>
        <section>
          <h4>What Changes</h4>
          <p>${escapeHtml(proposal.proposedFix || proposal.proposedPatch || "No proposed change supplied.")}</p>
        </section>
        <section>
          <h4>Affected Files</h4>
          ${patchListItems(proposal.affectedFiles || [])}
        </section>
        <section>
          <h4>Verification</h4>
          ${patchListItems(proposal.verificationPlan || [])}
        </section>
        <section>
          <h4>Rollback</h4>
          <p>${escapeHtml(proposal.rollbackPlan || "Do not apply the patch; keep the current files.")}</p>
        </section>
        <section>
          <h4>Next Step</h4>
          <p>${escapeHtml(proposal.nextStep || proposal.codexInstruction || "Waiting for owner decision.")}</p>
        </section>
        <section>
          <h4>Framework Apply</h4>
          <p>${escapeHtml(canApply ? "Structured file changes are attached. The Brain can apply this approved patch directly and create backups." : approved ? "Approved, but no structured filePatches are attached. The Brain needs a structured fix before it can apply; use Codex/GitHub only as a teaching fallback." : proposal.status === "applied-by-framework" ? "Applied by the Brain/AI Framework after owner approval." : proposal.status === "applied-manually-after-owner-approval" ? "Recorded as completed after owner approval." : "Waiting for owner approval before any apply action can appear.")}</p>
        </section>
        <section>
          <h4>Apply Evidence</h4>
          <p>${escapeHtml(patchApplyEvidence(proposal))}</p>
        </section>
        <section>
          <h4>Decision Record</h4>
          <p>${escapeHtml(proposal.decisionRecordPath || "Decision folder record will appear after approval or denial.")}</p>
        </section>
      </div>
      <section class="owner-patch-copy">
        <div>
          <h4>Copy For Codex</h4>
          <p>${escapeHtml(proposal.codexDirectionFile ? `Saved file: data/${proposal.codexDirectionFile}` : "Copy-ready Codex direction generated from this patch request.")}</p>
        </div>
        <button class="secondary-link" type="button" data-patch-copy>Copy Codex Direction</button>
        <textarea readonly data-patch-direction>${escapeHtml(codexDirection)}</textarea>
      </section>
      <label class="owner-patch-note">
        Owner note
        <textarea rows="2" data-patch-note placeholder="Optional reason for approving, denying, or marking complete.">${noteValue}</textarea>
      </label>
      ${pending ? `
        <div class="owner-patch-actions">
          <button class="primary-link" type="button" data-patch-decision="approve">Approve Patch</button>
          <button class="secondary-link" type="button" data-patch-decision="deny">Deny Request</button>
        </div>
      ` : ""}
      ${canApply ? `
        <div class="owner-patch-actions">
          <button class="primary-link" type="button" data-patch-apply>Apply Approved Patch</button>
        </div>
      ` : ""}
      ${canMarkApplied ? `
        <div class="owner-patch-actions">
          <button class="secondary-link" type="button" data-patch-mark-applied>Mark Applied Manually</button>
        </div>
      ` : ""}
    </article>
  `;
}

function renderPatchRequests(payload = {}) {
  if (!patchList) return;
  const proposals = payload.proposals?.recentProposals || payload.recentProposals || [];
  const activeSource = payload.proposals?.activeRequests || payload.activeRequests || null;
  const historySource = payload.proposals?.history || payload.history || null;
  if (!proposals.length && !activeSource?.length && !historySource?.length) {
    patchList.innerHTML = '<p class="empty-state">No patch requests yet. When the Framework proposes a code change, it will appear here for owner approval.</p>';
    return;
  }
  const active = (Array.isArray(activeSource) ? activeSource : proposals.filter(proposal => proposal.status === "pending-owner-approval"))
    .sort((a, b) => patchArchiveSortValue(b) - patchArchiveSortValue(a));
  const archived = (Array.isArray(historySource) ? historySource : proposals.filter(proposal => proposal.status !== "pending-owner-approval"))
    .sort((a, b) => patchArchiveSortValue(b) - patchArchiveSortValue(a));
  const archiveGroups = archived.reduce((groups, proposal) => {
    const date = patchDecisionDate(proposal);
    groups[date] ||= [];
    groups[date].push(proposal);
    return groups;
  }, {});
  const archiveHtml = Object.entries(archiveGroups)
    .map(([date, items]) => `
      <details class="owner-patch-date-group">
        <summary>${escapeHtml(date)} <span>${items.length} request${items.length === 1 ? "" : "s"}</span></summary>
        <div class="owner-patch-date-list">
          ${items.map(item => renderPatchCard(item, true)).join("")}
        </div>
      </details>
    `)
    .join("");

  patchList.innerHTML = `
    <section class="owner-patch-current">
      <h3>Current Requests</h3>
      ${active.length ? active.map(item => renderPatchCard(item)).join("") : '<p class="empty-state">No current patch requests are waiting for owner approval.</p>'}
    </section>
    <section class="owner-patch-history">
      <h3>Patch History By Date</h3>
      ${archiveHtml || '<p class="empty-state">No approved, denied, or completed patch records yet.</p>'}
    </section>
  `;
}

async function loadPatchRequests() {
  if (!patchList) return null;
  const payload = await ownerApi("/api/code-patch-proposals?limit=250");
  renderPatchRequests(payload.proposals || {});
  return payload;
}

async function loadOwnerDashboard() {
  const [learning, health, revenue, metrics, brainState, productionIntelligence, observability, patches] = await Promise.all([
    ownerApi("/api/learning"),
    ownerApi("/api/health"),
    ownerApi("/api/revenue-growth"),
    ownerApi(`/api/owner-metrics?metric=${encodeURIComponent(selectedOwnerMetric)}&timeframe=${encodeURIComponent(selectedOwnerTimeframe)}`),
    ownerApi("/api/owner-brain-state"),
    ownerApi("/api/production-intelligence").catch(() => ({})),
    ownerApi("/api/news-lab-observability").catch(() => ({})),
    ownerApi("/api/code-patch-proposals?limit=250").catch(() => null)
  ]);
  renderSummary({ learning, health, revenue, metrics });
  renderOwnerMetricOptions(metrics);
  renderOwnerMetricGraph(metrics);
  renderBrainState(brainState);
  renderProductionIntelligence({ ...(productionIntelligence || {}), observability });
  if (patches) renderPatchRequests(patches.proposals || {});
  const dashboard = {
    learning: learning.learning,
    health,
    revenueGrowth: revenue.revenueGrowth,
    ownerMetrics: metrics.selected,
    brainState,
    productionIntelligence,
    observability,
    patchRequests: patches?.proposals
  };
  showJson(dashboard);
  return dashboard;
}

function merchValueList(value = []) {
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function merchFormPayload() {
  const form = new FormData(merchForm);
  return {
    id: form.get("id"),
    sku: form.get("sku"),
    title: form.get("title"),
    category: form.get("category"),
    price: form.get("price"),
    image: form.get("image"),
    description: form.get("description"),
    colors: form.get("colors"),
    sizes: form.get("sizes"),
    status: form.get("status"),
    sortOrder: Number(form.get("sortOrder") || 999),
    featured: Boolean(form.get("featured"))
  };
}

function fillMerchForm(product = {}) {
  if (!merchForm) return;
  merchForm.elements.id.value = product.id || "";
  merchForm.elements.sku.value = product.sku || "";
  merchForm.elements.title.value = product.title || "";
  merchForm.elements.category.value = product.category || "";
  merchForm.elements.price.value = product.price || "";
  merchForm.elements.image.value = product.image || "";
  merchForm.elements.description.value = product.description || "";
  merchForm.elements.colors.value = merchValueList(product.colors);
  merchForm.elements.sizes.value = merchValueList(product.sizes);
  merchForm.elements.status.value = product.status || "active";
  merchForm.elements.sortOrder.value = product.sortOrder ?? 100;
  merchForm.elements.featured.checked = Boolean(product.featured);
}

function renderMerchAdminList(products = []) {
  if (!merchAdminList) return;
  if (!products.length) {
    merchAdminList.innerHTML = '<p class="empty-state">No merchandise products saved yet.</p>';
    return;
  }
  merchAdminList.innerHTML = products.map(product => `
    <article class="owner-merch-item" data-product-id="${escapeHtml(product.id)}">
      <img src="${escapeHtml(product.image || "./assets/logo.png")}" alt="${escapeHtml(product.title)}" />
      <div>
        <strong>${escapeHtml(product.title)}</strong>
        <span>${escapeHtml(product.sku)} | ${escapeHtml(product.price)} | ${escapeHtml(product.status)}</span>
        <small>${escapeHtml((product.colors || []).join(", "))}</small>
      </div>
      <button type="button" data-merch-edit="${escapeHtml(product.id)}">Edit</button>
      <button type="button" data-merch-remove="${escapeHtml(product.id)}">Hide</button>
    </article>
  `).join("");
}

async function loadMerchAdmin() {
  if (!merchAdminList) return;
  const payload = await ownerApi("/api/merch/admin/products");
  renderMerchAdminList(payload.products || []);
  return payload.products || [];
}

function reportRows(items = [], label = "No data") {
  return items.length
    ? items.slice(0, 6).map(item => `<li><strong>${escapeHtml(item.key)}</strong><span>${item.units} units | ${item.orderRequests} requests | ${item.confirmedSales} sales | ${item.views} views</span></li>`).join("")
    : `<li><strong>${escapeHtml(label)}</strong><span>Waiting for merch activity.</span></li>`;
}

function renderMerchSalesReport(report) {
  if (!merchSalesReport || !report) return;
  merchSalesReport.innerHTML = `
    <section class="owner-merch-report-grid">
      <article><span>Weekly units</span><strong>${report.currentWeek.totalUnits}</strong></article>
      <article><span>Order requests</span><strong>${report.currentWeek.totalOrderRequests}</strong></article>
      <article><span>Confirmed sales</span><strong>${report.currentWeek.totalConfirmedSales}</strong></article>
      <article><span>Revenue</span><strong>$${Number(report.currentWeek.totalRevenue || 0).toFixed(2)}</strong></article>
    </section>
    <section class="owner-merch-report-lists">
      <div><h3>Products</h3><ul>${reportRows(report.currentWeek.byProduct, "No product sales yet")}</ul></div>
      <div><h3>Sizes</h3><ul>${reportRows(report.currentWeek.bySize, "No size data yet")}</ul></div>
      <div><h3>Colors</h3><ul>${reportRows(report.currentWeek.byColor, "No color data yet")}</ul></div>
      <div><h3>Regions</h3><ul>${reportRows(report.currentWeek.byRegion, "No region data yet")}</ul></div>
    </section>
    <section class="owner-merch-recommendations">
      <h3>Framework Recommendations</h3>
      <ul>${(report.recommendations || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
  `;
}

async function loadMerchSalesReport() {
  const payload = await ownerApi("/api/merch/admin/sales-report");
  renderMerchSalesReport(payload.report);
  return payload.report;
}

function renderMerchOrders(payload = {}) {
  if (!merchOrdersReport) return;
  const pos = payload.pos || {};
  const orders = payload.orders || [];
  merchOrdersReport.innerHTML = `
    <section class="owner-merch-pos">
      <article><span>Checkout</span><strong>${pos.checkoutConfigured ? "Configured" : "Missing key"}</strong></article>
      <article><span>Webhook</span><strong>${pos.webhookConfigured ? "Configured" : "Missing secret"}</strong></article>
      <article><span>Provider</span><strong>${escapeHtml(pos.provider || "stripe")}</strong></article>
      <article><span>Currency</span><strong>${escapeHtml(pos.currency || "usd")}</strong></article>
    </section>
    <p class="owner-pos-note">${escapeHtml(pos.safetyModel || "")}</p>
    <div class="owner-merch-order-list">
      ${orders.length ? orders.slice(0, 12).map(order => `
        <article>
          <strong>${escapeHtml(order.product || order.sku || order.id)}</strong>
          <span>${escapeHtml(order.status || "unknown")} | ${escapeHtml(order.paymentStatus || "unpaid")} | $${Number(order.amount || 0).toFixed(2)}</span>
          <small>${escapeHtml(order.size || "")} ${escapeHtml(order.color || "")} | ${escapeHtml(order.region || order.location || "")}</small>
        </article>
      `).join("") : '<p class="empty-state">No POS orders recorded yet.</p>'}
    </div>
  `;
}

async function loadMerchOrders() {
  const payload = await ownerApi("/api/merch/admin/orders");
  renderMerchOrders(payload);
  return payload;
}

async function unlockOwnerDesk(token = ownerToken) {
  ownerToken = String(token || "").trim();
  setStatus(ownerLoginStatus, "Checking access...");
  try {
    await ownerApi("/api/learning");
    localStorage.setItem(tokenKey, ownerToken);
    ownerLogin.hidden = true;
    ownerConsole.hidden = false;
    setStatus(ownerLoginStatus, "");
    await loadOwnerDashboard();
    if (merchDeskVisible) {
      loadMerchAdmin().catch(() => {});
      loadMerchSalesReport().catch(() => {});
      loadMerchOrders().catch(() => {});
    }
  } catch (error) {
    ownerConsole.hidden = true;
    ownerLogin.hidden = false;
    setStatus(ownerLoginStatus, error.message || "Access denied.", "error");
  }
}

ownerLoginForm?.addEventListener("submit", event => {
  event.preventDefault();
  const token = new FormData(ownerLoginForm).get("token");
  unlockOwnerDesk(token);
});

ownerRefresh?.addEventListener("click", () => {
  showJson({ status: "Refreshing Owner Desk" });
  loadOwnerDashboard()
    .then(payload => showJson({ status: "Owner Desk refreshed", ...payload }))
    .catch(error => showJson({ error: error.message || "Refresh failed." }));
  if (merchDeskVisible) {
    loadMerchAdmin().catch(() => {});
    loadMerchSalesReport().catch(() => {});
    loadMerchOrders().catch(() => {});
  }
});

patchRefresh?.addEventListener("click", () => {
  setStatus(patchStatus, "Loading patch requests...");
  loadPatchRequests()
    .then(payload => {
      setStatus(patchStatus, "Patch requests refreshed.", "success");
      showJson(payload);
    })
    .catch(error => setStatus(patchStatus, error.message || "Patch request refresh failed.", "error"));
});

patchList?.addEventListener("click", async event => {
  const button = event.target.closest("[data-patch-decision]");
  const applyButton = event.target.closest("[data-patch-apply]");
  const markAppliedButton = event.target.closest("[data-patch-mark-applied]");
  const copyButton = event.target.closest("[data-patch-copy]");
  if (!button && !applyButton && !markAppliedButton && !copyButton) return;
  if (copyButton) {
    const copyCard = copyButton.closest("[data-patch-id]");
    const text = copyCard?.querySelector("[data-patch-direction]")?.value || "";
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = copyCard?.querySelector("[data-patch-direction]");
        textarea?.focus();
        textarea?.select();
        document.execCommand("copy");
      }
      setStatus(patchStatus, "Codex direction copied.", "success");
    } catch (error) {
      setStatus(patchStatus, "Copy failed. Select the direction text and copy it manually.", "error");
    }
    return;
  }
  const card = button?.closest("[data-patch-id]");
  const applyCard = applyButton?.closest("[data-patch-id]");
  const markAppliedCard = markAppliedButton?.closest("[data-patch-id]");
  const id = card?.dataset.patchId || applyCard?.dataset.patchId || markAppliedCard?.dataset.patchId || "";
  const decision = button?.dataset.patchDecision;
  const noteCard = card || applyCard || markAppliedCard;
  const ownerNote = noteCard?.querySelector("[data-patch-note]")?.value || "";
  if (!id) return;
  if (markAppliedButton) {
    setStatus(patchStatus, "Recording manual patch application...");
    try {
      const payload = await ownerApi("/api/code-patch-proposals/mark-applied", {
        method: "POST",
        body: JSON.stringify({ id, ownerNote })
      });
      renderPatchRequests(payload.proposals || {});
      setStatus(patchStatus, "Manual application recorded. The patch request is now proof memory.", "success");
      showJson(payload);
      loadOwnerDashboard().catch(() => {});
    } catch (error) {
      setStatus(patchStatus, error.message || "Manual application record failed.", "error");
    }
    return;
  }
  if (applyButton) {
    setStatus(patchStatus, "Applying approved patch...");
    try {
      const payload = await ownerApi("/api/code-patch-proposals/apply", {
        method: "POST",
        body: JSON.stringify({ id })
      });
      renderPatchRequests(payload.proposals || {});
      setStatus(patchStatus, "Approved patch applied by the Framework. Run verification and redeploy/restart if required.", "success");
      showJson(payload);
      loadOwnerDashboard().catch(() => {});
    } catch (error) {
      setStatus(patchStatus, error.message || "Patch apply failed.", "error");
    }
    return;
  }
  if (!decision) return;
  setStatus(patchStatus, `${decision === "approve" ? "Approving" : "Denying"} patch request...`);
  try {
    const payload = await ownerApi("/api/code-patch-proposals/decision", {
      method: "POST",
      body: JSON.stringify({ id, decision, ownerNote })
    });
    renderPatchRequests(payload.proposals || {});
    setStatus(
      patchStatus,
      decision === "approve"
        ? payload.autoApplied
          ? "Patch approved, written by the Brain, verified, and logged. Check deployment status in the patch record."
          : payload.autoApplyError
            ? `Patch approved, but execution needs Patch Structuring/teaching: ${payload.autoApplyError}`
            : "Patch approved. The Brain will structure and apply it when it has safe file operations; teaching is needed only when structuring fails."
        : "Patch denied and saved to Framework memory.",
      "success"
    );
    showJson(payload);
    loadOwnerDashboard().catch(() => {});
  } catch (error) {
    setStatus(patchStatus, error.message || "Patch decision failed.", "error");
  }
});

ownerLock?.addEventListener("click", () => {
  localStorage.removeItem(tokenKey);
  ownerToken = "";
  ownerConsole.hidden = true;
  ownerLogin.hidden = false;
  if (ownerLoginForm) ownerLoginForm.reset();
  setStatus(ownerLoginStatus, "Locked.", "success");
});

ownerSummary?.addEventListener("click", async event => {
  const button = event.target.closest("[data-owner-metric]");
  if (!button) return;
  const metric = button.dataset.ownerMetric || "health";
  try {
    await loadOwnerMetric(metric, selectedOwnerTimeframe);
  } catch (error) {
    showJson({ ok: false, error: error.message || "Metric graph could not be loaded." });
  }
});

ownerMetricTimeframe?.addEventListener("change", async event => {
  selectedOwnerTimeframe = event.target.value || "7d";
  try {
    await loadOwnerMetric(selectedOwnerMetric, selectedOwnerTimeframe);
  } catch (error) {
    showJson({ ok: false, error: error.message || "Metric timeframe could not be loaded." });
  }
});

ownerSubsystemTabs?.addEventListener("click", event => {
  const button = event.target.closest("[data-subsystem-key]");
  if (!button) return;
  selectedSubsystemKey = button.dataset.subsystemKey || "";
  renderSubsystemReadiness(ownerBrainStatePayload || {});
});

document.addEventListener("click", async event => {
  const getButton = event.target.closest("[data-owner-endpoint]");
  const postButton = event.target.closest("[data-owner-post]");
  if (!getButton && !postButton) return;
  const endpoint = getButton?.dataset.ownerEndpoint || postButton?.dataset.ownerPost;
  showJson({ status: "Loading", endpoint });
  try {
    const payload = await ownerApi(endpoint, postButton ? { method: "POST", body: "{}" } : {});
    if (endpoint.startsWith("/api/code-patch-proposals")) {
      renderPatchRequests(payload.proposals || {});
      setStatus(patchStatus, "Patch requests refreshed.", "success");
    }
    showJson(payload);
    loadOwnerDashboard().catch(() => {});
  } catch (error) {
    showJson({ endpoint, error: error.message || "Request failed." });
  }
});

feedbackForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const status = feedbackForm.querySelector("[data-owner-feedback-status]");
  const form = new FormData(feedbackForm);
  const body = {
    rating: "up",
    note: form.get("note"),
    target: form.get("target") || "creator-desk",
    dayId: form.get("dayId") || ""
  };
  setStatus(status, "Saving feedback...");
  try {
    const payload = await ownerApi("/api/learning/feedback", {
      method: "POST",
      body: JSON.stringify(body)
    });
    const actionCount = (payload.actions || []).length;
    setStatus(status, actionCount ? `Feedback saved. Brain executed ${actionCount} content action${actionCount === 1 ? "" : "s"}.` : "Feedback saved.", "success");
    showJson(payload);
    feedbackForm.reset();
    loadOwnerDashboard().catch(() => {});
  } catch (error) {
    setStatus(status, error.message || "Feedback failed.", "error");
  }
});

commandForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const status = commandForm.querySelector("[data-owner-command-status]");
  const form = new FormData(commandForm);
  const body = {
    command: form.get("command"),
    intent: "framework-first-task",
    facet: form.get("facet") || "AI Framework",
    expectedOutcome: form.get("expectedOutcome") || "Framework applies the command and saves a reusable lesson.",
    rationale: "Owner command submitted through the private Owner Desk. The Framework should attempt the task first; if it cannot, Codex should teach the missing method and resubmit the task for Framework-guided execution.",
    appliesTo: [form.get("facet") || "AI Framework"],
    tags: ["owner-desk", "framework-command", "framework-first-execution"]
  };
  setStatus(status, "Sending command...");
  try {
    const payload = await ownerApi("/api/learning/framework-command", {
      method: "POST",
      body: JSON.stringify(body)
    });
    setStatus(status, "Command saved.", "success");
    showJson(payload);
    commandForm.reset();
    loadOwnerDashboard().catch(() => {});
  } catch (error) {
    setStatus(status, error.message || "Command failed.", "error");
  }
});

codingForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(codingForm);
  const direction = String(form.get("direction") || "").trim();
  if (!direction) return;
  setStatus(codingStatus, "Sending direction through the Brain...");
  try {
    const payload = await ownerApi("/api/learning/brain-coding-direction", {
      method: "POST",
      body: JSON.stringify({
        direction,
        target: form.get("target") || "AI Framework",
        expectedOutcome: form.get("expectedOutcome") || "Brain creates an owner-reviewable patch request and saves the learning path.",
        tags: ["owner-desk", "brain-coding-direction"]
      })
    });
    renderPatchRequests(payload.proposals || {});
    setStatus(
      codingStatus,
      payload.pipeline?.parsedStructuredOperationCount
        ? "Brain created a structured Patch Request. Review it in Approval Gate."
        : "Brain created a Patch Request and teaching path. Review it in Approval Gate.",
      "success"
    );
    showJson(payload);
    codingForm.reset();
    loadOwnerDashboard().catch(() => {});
  } catch (error) {
    setStatus(codingStatus, error.message || "Brain coding direction failed.", "error");
  }
});

merchRefresh?.addEventListener("click", () => {
  setStatus(merchStatus, "Refreshing catalog...");
  loadMerchAdmin()
    .then(() => setStatus(merchStatus, "Catalog refreshed.", "success"))
    .catch(error => setStatus(merchStatus, error.message || "Catalog refresh failed.", "error"));
});

merchClear?.addEventListener("click", () => {
  merchForm?.reset();
  if (merchForm?.elements.id) merchForm.elements.id.value = "";
  setStatus(merchStatus, "Ready for a new product.", "success");
});

merchForm?.addEventListener("submit", async event => {
  event.preventDefault();
  setStatus(merchStatus, "Saving product...");
  try {
    const payload = await ownerApi("/api/merch/admin/products", {
      method: "POST",
      body: JSON.stringify(merchFormPayload())
    });
    setStatus(merchStatus, "Product saved.", "success");
    renderMerchAdminList(payload.products || []);
    showJson(payload);
  } catch (error) {
    setStatus(merchStatus, error.message || "Product save failed.", "error");
  }
});

merchAdminList?.addEventListener("click", async event => {
  const editId = event.target.closest("[data-merch-edit]")?.dataset.merchEdit;
  const removeId = event.target.closest("[data-merch-remove]")?.dataset.merchRemove;
  if (!editId && !removeId) return;
  try {
    const products = await loadMerchAdmin();
    if (editId) {
      const product = products.find(item => item.id === editId);
      fillMerchForm(product || {});
      setStatus(merchStatus, `Editing ${product?.title || editId}.`, "success");
    }
    if (removeId) {
      const payload = await ownerApi("/api/merch/admin/remove", {
        method: "POST",
        body: JSON.stringify({ id: removeId })
      });
      renderMerchAdminList(payload.products || []);
      setStatus(merchStatus, "Product hidden from public marketplace.", "success");
      showJson(payload);
    }
  } catch (error) {
    setStatus(merchStatus, error.message || "Merch action failed.", "error");
  }
});

merchSalesRefresh?.addEventListener("click", () => {
  setStatus(merchSaleStatus, "Loading sales report...");
  loadMerchSalesReport()
    .then(report => {
      setStatus(merchSaleStatus, "Sales report refreshed.", "success");
      showJson({ merchSalesReport: report });
    })
    .catch(error => setStatus(merchSaleStatus, error.message || "Sales report failed.", "error"));
});

merchOrdersRefresh?.addEventListener("click", () => {
  setStatus(merchSaleStatus, "Loading POS orders...");
  loadMerchOrders()
    .then(payload => {
      setStatus(merchSaleStatus, "POS orders refreshed.", "success");
      showJson({ merchPos: payload });
    })
    .catch(error => setStatus(merchSaleStatus, error.message || "POS orders failed.", "error"));
});

merchSaleForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = new FormData(merchSaleForm);
  setStatus(merchSaleStatus, "Recording confirmed sale...");
  try {
    const payload = await ownerApi("/api/merch/admin/record-sale", {
      method: "POST",
      body: JSON.stringify({
        product: form.get("product"),
        amount: Number(form.get("amount") || 0),
        size: form.get("size"),
        color: form.get("color"),
        quantity: Number(form.get("quantity") || 1),
        location: form.get("location")
      })
    });
    setStatus(merchSaleStatus, "Confirmed sale recorded.", "success");
    renderMerchSalesReport(payload.report);
    loadMerchAdmin().catch(() => {});
    showJson(payload);
    merchSaleForm.reset();
  } catch (error) {
    setStatus(merchSaleStatus, error.message || "Sale record failed.", "error");
  }
});

if (ownerToken) unlockOwnerDesk(ownerToken).catch(() => {});








