const analyzerStatus = document.querySelector("[data-analyzer-status]");
const refreshAnalyzer = document.querySelector("[data-refresh-analyzer]");
const sourceIntelligence = document.querySelector("[data-source-intelligence]");
const contradictionEngine = document.querySelector("[data-contradiction-engine]");
const storyEvolution = document.querySelector("[data-story-evolution]");
const sourceReliability = document.querySelector("[data-source-reliability]");
const brainExplanation = document.querySelector("[data-brain-explanation]");
const investigationControls = document.querySelector("[data-investigation-controls]");
const investigationOutput = document.querySelector("[data-investigation-output]");
const visualIntelligence = document.querySelector("[data-visual-intelligence]");
const predictiveIntelligence = document.querySelector("[data-predictive-intelligence]");
const communityIntelligence = document.querySelector("[data-community-intelligence]");
const coverageComparison = document.querySelector("[data-coverage-comparison]");

const newsAnalyzerCategories = ["top", "world", "politics", "business", "technology", "sports", "entertainment", "local"];

const sourceReachContext = {
  AP: { reach: 96, lane: "wire service" },
  Reuters: { reach: 95, lane: "wire service" },
  CNN: { reach: 92, lane: "national cable" },
  Fox: { reach: 92, lane: "national cable" },
  "Fox News": { reach: 92, lane: "national cable" },
  NBC: { reach: 91, lane: "broadcast network" },
  ABC: { reach: 91, lane: "broadcast network" },
  CBS: { reach: 90, lane: "broadcast network" },
  BBC: { reach: 89, lane: "international public broadcaster" },
  CNBC: { reach: 84, lane: "business network" },
  ESPN: { reach: 86, lane: "sports network" },
  "CBS Sports": { reach: 80, lane: "sports desk" },
  "ABC Sports": { reach: 79, lane: "sports desk" }
};

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function average(values = []) {
  const clean = values.map(Number).filter(value => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function sourceName(value = "") {
  return String(value || "Unknown source").replace(/\s+/g, " ").trim();
}

function uniqueBy(items = [], keyFn) {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchCategory(category) {
  const response = await fetch(`/api/news-lab?category=${encodeURIComponent(category)}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`News Lab category failed: ${category}`);
  return response.json();
}

async function loadAnalyzerData() {
  const results = await Promise.allSettled(newsAnalyzerCategories.map(fetchCategory));
  const payloads = results.filter(result => result.status === "fulfilled").map(result => result.value);
  const stories = uniqueBy(payloads.flatMap(payload => payload.ownedStories || []), story => story.id || story.topicKey || story.title);
  return { payloads, stories };
}

function storySources(story = {}) {
  const direct = Array.isArray(story.sources) ? story.sources : [];
  const agreementClaims = story.sourceAgreement?.sourceSpecificClaims || [];
  const claimSources = agreementClaims.flatMap(claim => (claim.sources || []).map(name => ({
    source: name,
    title: claim.claim,
    url: (claim.urls || [])[0] || ""
  })));
  return uniqueBy([...direct, ...claimSources].map(source => ({
    source: sourceName(source.source || source.name),
    title: source.title || story.title || "",
    url: source.url || ""
  })), source => `${source.source}:${source.url || source.title}`);
}

function sourceStats(stories = []) {
  const stats = new Map();
  stories.forEach(story => {
    const sources = storySources(story);
    sources.forEach(source => {
      const name = sourceName(source.source);
      if (!stats.has(name)) {
        const context = sourceReachContext[name] || { reach: 62, lane: "source" };
        stats.set(name, {
          name,
          lane: context.lane,
          reachScore: context.reach,
          storyCount: 0,
          agreementScores: [],
          disagreementScores: [],
          confidenceScores: [],
          correctionSignals: 0,
          originalReportingSignals: 0,
          opinionSignals: 0
        });
      }
      const item = stats.get(name);
      item.storyCount += 1;
      item.agreementScores.push(Number(story.sourceAgreement?.agreement || 0));
      item.disagreementScores.push(Number(story.sourceAgreement?.disagreement || 0));
      item.confidenceScores.push(Number(story.brainConfidence?.score || 0));
      const text = `${story.title || ""} ${(story.body || []).join(" ")} ${source.title || ""}`.toLowerCase();
      if (/correction|retraction|corrected|updated to clarify/.test(text)) item.correctionSignals += 1;
      if (/exclusive|investigation|obtained|original reporting/.test(text)) item.originalReportingSignals += 1;
      if (/opinion|editorial|analysis|commentary/.test(text)) item.opinionSignals += 1;
    });
  });
  return [...stats.values()]
    .map(item => ({
      ...item,
      consistencyScore: clamp(average(item.agreementScores) - average(item.disagreementScores) * 0.35 + 18),
      popularityScore: clamp(item.storyCount * 12),
      correctionFrequency: item.storyCount ? Number((item.correctionSignals / item.storyCount).toFixed(2)) : 0,
      updateScore: clamp(70 + item.originalReportingSignals * 5 - item.correctionSignals * 4),
      storyCompletionRate: clamp(average(item.confidenceScores)),
      opinionRatio: item.storyCount ? Number((item.opinionSignals / item.storyCount).toFixed(2)) : 0
    }))
    .sort((a, b) => b.storyCount - a.storyCount || b.consistencyScore - a.consistencyScore);
}

function strongestStory(stories = []) {
  return [...stories].sort((a, b) => {
    const aScore = Number(a.brainConfidence?.score || 0) + Number(a.popularity?.uniqueSourceCount || 0) * 4;
    const bScore = Number(b.brainConfidence?.score || 0) + Number(b.popularity?.uniqueSourceCount || 0) * 4;
    return bScore - aScore;
  })[0] || stories[0] || {};
}

function renderMetricCard(label, value, note) {
  return `
    <div class="analyzer-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </div>
  `;
}

function renderSourceIntelligence(story = {}) {
  const sources = storySources(story);
  const confidence = Number(story.brainConfidence?.score || 0);
  const independentSources = new Set(sources.map(source => source.source)).size;
  const officialStatements = (story.sourceAgreement?.sharedClaims || []).filter(claim => /official|statement|agency|police|court|filing|department/i.test(String(claim))).length;
  const eyewitnessReports = (story.sourceAgreement?.sharedClaims || []).filter(claim => /witness|eyewitness|resident|neighbor|video|saw|heard/i.test(String(claim))).length;
  const disagreement = Number(story.sourceAgreement?.disagreement || 0);
  const agreement = Number(story.sourceAgreement?.agreement || 0);
  const biasSpread = sources.length >= 4 ? "Mixed source spread" : sources.length >= 2 ? "Limited but varied" : "Too early to rate";
  const consensus = agreement >= 75 && disagreement < 20 ? "High" : agreement >= 50 ? "Developing" : "Low";
  sourceIntelligence.innerHTML = [
    renderMetricCard("Story Confidence", `${Math.round(confidence)}%`, story.brainConfidence?.reason || "Confidence is based on source count, full reads, shared claims, and contradictions."),
    renderMetricCard("Sources Reviewed", `${sources.length}`, "Source records available to the Analyzer for this story."),
    renderMetricCard("Independent Sources", `${independentSources}`, "Unique outlets or source names attached to this story cluster."),
    renderMetricCard("Official Statements", `${officialStatements}`, "Detected official-source signals in shared claims."),
    renderMetricCard("Eyewitness Reports", `${eyewitnessReports}`, "Detected eyewitness or on-scene reporting signals."),
    renderMetricCard("Political Bias Spread", biasSpread, "A cautious source-mix signal, not a claim that any outlet is fair or unfair."),
    renderMetricCard("Consensus", consensus, `Agreement ${Math.round(agreement)}%, disagreement ${Math.round(disagreement)}%.`)
  ].join("");
}

function renderContradictions(stories = []) {
  const ranked = [...stories].sort((a, b) => Number(b.sourceAgreement?.disagreement || 0) - Number(a.sourceAgreement?.disagreement || 0)).slice(0, 4);
  contradictionEngine.innerHTML = ranked.length ? ranked.map(story => {
    const claims = story.sourceAgreement?.sourceSpecificClaims || [];
    return `
      <section class="analyzer-story-block">
        <h3>${escapeHtml(story.title || "Story under review")}</h3>
        <div class="analyzer-split">
          <span>Agreement <strong>${Math.round(Number(story.sourceAgreement?.agreement || 0))}%</strong></span>
          <span>Disagreement <strong>${Math.round(Number(story.sourceAgreement?.disagreement || 0))}%</strong></span>
        </div>
        <p><strong>Main difference:</strong> ${escapeHtml((story.contradictionDetection?.possibleContradictions || [])[0] || "No major contradiction has been isolated yet.")}</p>
        <ul>
          ${claims.slice(0, 3).map(claim => `<li><strong>${escapeHtml((claim.sources || ["Source"])[0])}:</strong> ${escapeHtml(claim.claim || "")}</li>`).join("") || "<li>Contradiction details will appear when source-specific claims differ.</li>"}
        </ul>
      </section>
    `;
  }).join("") : "<p>No contradiction data is ready yet.</p>";
}

function renderEvolution(stories = []) {
  const story = stories.find(item => (item.storyEvolution?.timeline || []).length) || strongestStory(stories);
  const timeline = (story.storyEvolution?.timeline || []).slice(-6);
  storyEvolution.innerHTML = `
    <section class="analyzer-story-block">
      <h3>${escapeHtml(story.title || "Story evolution")}</h3>
      <ol class="analyzer-timeline">
        ${timeline.length ? timeline.map(item => `
          <li>
            <time>${escapeHtml(item.at ? new Date(item.at).toLocaleString() : "Latest")}</time>
            <span>${escapeHtml(item.title || item.summary || "Update recorded")}</span>
          </li>
        `).join("") : "<li><time>Pending</time><span>Timeline will build as the story changes.</span></li>"}
      </ol>
    </section>
  `;
}

function renderReliability(stats = []) {
  sourceReliability.innerHTML = `
    <div class="source-score-row source-score-head">
      <span>Outlet</span>
      <span>Consistency</span>
      <span>Tracked Corrections</span>
      <span>Popularity</span>
      <span>Reach</span>
      <span>Context</span>
    </div>
    ${stats.slice(0, 12).map(item => `
      <div class="source-score-row">
        <span><strong>${escapeHtml(item.name)}</strong></span>
        <span>${Math.round(item.consistencyScore)}%</span>
        <span>${item.correctionSignals}</span>
        <span>${Math.round(item.popularityScore)}%</span>
        <span>${Math.round(item.reachScore)}%</span>
        <span>${escapeHtml(item.lane || "source")}</span>
      </div>
    `).join("") || "<p>No source reliability data is available yet.</p>"}
  `;
}

function renderBrainExplanation(story = {}) {
  const claims = story.sourceAgreement?.sharedClaims || [];
  const contradictions = story.contradictionDetection?.possibleContradictions || [];
  brainExplanation.innerHTML = `
    <section class="analyzer-story-block">
      <h3>${escapeHtml(story.title || "Selected story")}</h3>
      <p><strong>Why the Brain wrote this:</strong> ${escapeHtml(story.summary || "The story was selected because it had enough source signal or category importance to review.")}</p>
      <p><strong>Primary evidence:</strong> ${escapeHtml(claims[0] || (story.body || [])[0] || "Primary evidence is still being gathered.")}</p>
      <p><strong>Conflicting reports:</strong> ${escapeHtml(contradictions[0] || "No major conflict is isolated yet.")}</p>
      <p><strong>Reason for wording:</strong> CE Media wording should summarize confirmed facts, avoid copying publisher phrasing, and separate consensus facts from outlet-specific claims.</p>
    </section>
  `;
}

function investigationText(mode, story = {}) {
  const title = story.title || "this story";
  const facts = (story.sourceAgreement?.sharedClaims || []).slice(0, 3);
  const contradictions = (story.contradictionDetection?.possibleContradictions || []).slice(0, 2);
  const baseFact = facts[0] || story.summary || `${title} is still being verified.`;
  const options = {
    facts: `Facts only: ${baseFact}`,
    opposing: `Opposing viewpoints: ${contradictions[0] || "No clear opposing account has been separated yet."}`,
    official: `Official sources: look for court filings, agency statements, police updates, public records, or direct statements tied to ${title}.`,
    local: `Local coverage: prioritize residents, local officials, public safety effects, schools, roads, businesses, and service disruptions.`,
    simple: `${title} means something happened that may affect people, policy, safety, money, or public trust. The next question is what is confirmed and what still needs proof.`,
    economic: `Economic impact: watch costs, public spending, business disruption, jobs, prices, insurance, travel, energy, or market reaction.`,
    history: `Historical comparison: compare the timeline, official response, public consequence, and correction record with similar prior stories.`
  };
  return options[mode] || options.facts;
}

function renderInvestigation(story = {}, mode = "facts") {
  investigationOutput.innerHTML = `<p>${escapeHtml(investigationText(mode, story))}</p>`;
}

function renderVisuals(stories = []) {
  const images = stories.map(story => story.imageProvenance || story.image?.provenance || null).filter(Boolean);
  const licensed = images.filter(image => /pexels|pixabay|local/i.test(String(image.source || image.license || ""))).length;
  visualIntelligence.innerHTML = `
    ${renderMetricCard("Licensed/Controlled Images", `${licensed}/${images.length}`, "Pexels, Pixabay, or local-controlled image provenance detected.")}
    ${renderMetricCard("Maps / Timelines / Charts", "Planned", "The Analyzer page reserves this layer for original diagrams, timeline graphics, and map-based story context.")}
    ${renderMetricCard("Image Audit", images[0]?.source || "Pending", images[0]?.photographer ? `Example photographer: ${images[0].photographer}` : "Image provenance will appear as stories attach licensed visuals.")}
  `;
}

function renderPredictions(story = {}) {
  predictiveIntelligence.innerHTML = `
    <ul class="analyzer-list">
      <li><strong>Likely next developments:</strong> ${escapeHtml(story.contradictionDetection?.nextAction || "Watch for official updates, filings, corrections, or additional local reporting.")}</li>
      <li><strong>Potential impacts:</strong> policy response, public trust, public safety, market movement, legal action, or community disruption depending on the story category.</li>
      <li><strong>Things to watch:</strong> deadlines, official statements, court action, agency decisions, source corrections, and whether independent reporting confirms early claims.</li>
      <li><strong>Confidence:</strong> forecasts are scenarios, not facts, and should update as new evidence arrives.</li>
    </ul>
  `;
}

async function fetchCoverageComparison() {
  const response = await fetch(`/api/news-coverage-comparison`, { cache: "no-store" });
  if (!response.ok) throw new Error("Coverage comparison failed");
  return response.json();
}

function renderCoverageComparison(report = {}) {
  if (!coverageComparison) return;
  const summary = report.summary || {};
  const targets = report.biggestImprovementTargets || [];
  const strengths = report.topCeStrengths || [];
  coverageComparison.innerHTML = `
    <div class="analyzer-metric-grid">
      ${renderMetricCard("Average CE Score", `${summary.averageCeScore || 0}%`, "Measures depth, source diversity, originality, confidence, image provenance, and source reliability context.")}
      ${renderMetricCard("Outside Benchmark", `${summary.averageOutsideBenchmark || 0}%`, "Benchmark from the absorbed source trail: reliability, original reporting, and source reach.")}
      ${renderMetricCard("Coverage Gap", `${summary.averageGap || 0}`, "Positive means CE coverage is stronger than the current source benchmark; negative means improvement is needed.")}
      ${renderMetricCard("Needs Work", `${summary.needsImprovement || 0}`, "Stories where CE execution trails the source benchmark.")}
    </div>
    <div class="analyzer-two-col">
      <section class="analyzer-story-block">
        <h3>Strongest CE Coverage</h3>
        <ul class="analyzer-list">
          ${strengths.slice(0, 5).map(item => `<li><strong>${escapeHtml(item.title)}</strong><br><span>CE ${item.ceScore}% vs benchmark ${item.outsideBenchmark}% — ${escapeHtml(item.verdict)}</span></li>`).join("") || "<li>No CE comparison data yet.</li>"}
        </ul>
      </section>
      <section class="analyzer-story-block">
        <h3>Improvement Targets</h3>
        <ul class="analyzer-list">
          ${targets.slice(0, 5).map(item => `<li><strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml((item.recommendations || [])[0] || "Review source depth and originality.")}</span></li>`).join("") || "<li>No improvement targets yet.</li>"}
        </ul>
      </section>
    </div>
  `;
}

function renderCommunity() {
  communityIntelligence.innerHTML = `
    <div class="community-flow">
      <span>Verified local eyewitnesses</span>
      <span>Experts</span>
      <span>Journalists</span>
      <span>Readers</span>
      <span>Brain moderation</span>
      <span>Consensus summary</span>
    </div>
    <p>Community Intelligence is designed to summarize useful public signal instead of turning comments into an unstructured argument thread.</p>
  `;
}

function updateBrainStatus(stories = [], stats = [], payloads = []) {
  const confidence = Math.round(average(stories.map(story => story.brainConfidence?.score || 0)));
  const correctionSignals = stats.reduce((sum, item) => sum + item.correctionSignals, 0);
  const sourceRecords = stories.reduce((sum, story) => sum + storySources(story).length, 0);
  const subsystems = new Set(payloads.flatMap(payload => (payload.brainInfrastructure?.activeSubsystems || []).map(item => item.name || item.key))).size;
  document.querySelector("[data-brain-watching]").textContent = String(stories.length);
  document.querySelector("[data-brain-learning]").textContent = String(stats.length);
  document.querySelector("[data-brain-verifying]").textContent = String(stories.filter(story => story.sourceAgreement || story.contradictionDetection).length);
  document.querySelector("[data-brain-confidence]").textContent = `${confidence}%`;
  document.querySelector("[data-brain-corrections]").textContent = String(correctionSignals);
  document.querySelector("[data-brain-sources]").textContent = String(sourceRecords);
  document.querySelector("[data-brain-subsystems]").textContent = String(subsystems || 0);
}

async function renderAnalyzer() {
  analyzerStatus.textContent = "Refreshing News Analyzer intelligence...";
  refreshAnalyzer.disabled = true;
  try {
    const { payloads, stories } = await loadAnalyzerData();
    const selectedStory = strongestStory(stories);
    const stats = sourceStats(stories);
    const comparisonReport = await fetchCoverageComparison();
    updateBrainStatus(stories, stats, payloads);
    renderSourceIntelligence(selectedStory);
    renderContradictions(stories);
    renderEvolution(stories);
    renderReliability(stats);
    renderBrainExplanation(selectedStory);
    renderInvestigation(selectedStory, "facts");
    renderVisuals(stories);
    renderPredictions(selectedStory);
    renderCommunity();
    renderCoverageComparison(comparisonReport);
    analyzerStatus.textContent = `Analyzer ready. Reviewed ${stories.length} CE Media stories, ${stats.length} source groups, and ${comparisonReport.summary?.comparedStories || 0} coverage comparisons.`;
    investigationControls.dataset.selectedStory = selectedStory.id || "";
    window.newsAnalyzerSelectedStory = selectedStory;
  } catch (error) {
    analyzerStatus.textContent = "News Analyzer could not load intelligence right now.";
  } finally {
    refreshAnalyzer.disabled = false;
  }
}

investigationControls.addEventListener("click", event => {
  const button = event.target.closest("[data-investigation-mode]");
  if (!button) return;
  investigationControls.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
  renderInvestigation(window.newsAnalyzerSelectedStory || {}, button.dataset.investigationMode);
});

refreshAnalyzer.addEventListener("click", renderAnalyzer);
renderAnalyzer();
