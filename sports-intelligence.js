const statsEl = document.getElementById("sportsStats");
const listEl = document.getElementById("predictionList");
const form = document.getElementById("predictionForm");
const searchForm = document.getElementById("sportsSearchForm");
const searchInput = document.getElementById("sportsSearchInput");
const dossierPanel = document.getElementById("sportsDossierPanel");

const pct = value => Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : "N/A";
const prob = value => Number.isFinite(Number(value)) ? `${(Number(value) * 100).toFixed(1)}%` : "N/A";
const edge = value => Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)} pts` : "N/A";
const odds = value => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "N/A";
  return n > 0 ? `+${n}` : `${n}`;
};
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
})[char]);

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

function renderDossierList(title, items = []) {
  const safeItems = Array.isArray(items) && items.length ? items : ["No evidence recorded yet."];
  return `
    <div class="dossier-box">
      <h3>${escapeHtml(title)}</h3>
      <ul>${safeItems.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
  `;
}

function renderDossier(dossier = {}) {
  const model = dossier.probabilityModel || {};
  const oddsInfo = dossier.currentOdds || {};
  const market = dossier.marketIdentity || {};
  const offers = oddsInfo.offers || [];
  const evidence = dossier.evidenceBuckets || {};
  const reasoning = dossier.sportsReasoning || {};
  return `
    <article class="prediction-card">
      <div class="prediction-head">
        <div>
          <h3>${escapeHtml(dossier.visitorAnalysis?.headline || "Sports market dossier")}</h3>
          <p class="sports-muted">${escapeHtml(market.league || "Unknown")} / ${escapeHtml(market.marketType || "market")} / ${escapeHtml(dossier.dataMode || "")}</p>
        </div>
        <span class="pill ${String(model.classification || "").includes("NEGATIVE") || String(model.classification || "").includes("UNCERTAINTY") ? "warn" : "good"}">${escapeHtml(model.classification || "UNRATED")}</span>
      </div>
      <div class="prediction-measures">
        <div class="measure"><span>CE Probability</span><strong>${prob(model.modeledProbability)}</strong></div>
        <div class="measure"><span>Consensus</span><strong>${prob(model.marketPriorProbability)}</strong></div>
        <div class="measure"><span>Edge</span><strong>${edge(model.edgeVsBestOfferPoints)}</strong></div>
        <div class="measure"><span>Confidence</span><strong>${escapeHtml(model.confidence || "N/A")}</strong></div>
        <div class="measure"><span>Books Compared</span><strong>${offers.length}</strong></div>
      </div>
      <p class="sports-muted">${escapeHtml(dossier.visitorAnalysis?.summary || "")}</p>
      <table class="dossier-table">
        <thead><tr><th>Sportsbook</th><th>Odds</th><th>No-vig</th><th>Status</th></tr></thead>
        <tbody>
          ${offers.map(offer => `
            <tr>
              <td>${escapeHtml(offer.sportsbook)}</td>
              <td>${odds(offer.americanOdds)}</td>
              <td>${prob(offer.fairMarketProbability)}</td>
              <td>${escapeHtml(offer.status)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="dossier-columns">
        ${renderDossierList("Supports Bet", evidence.supportsBet)}
        ${renderDossierList("Opposes Bet", evidence.opposesBet)}
        ${renderDossierList("Unknown / Needed", evidence.unknown)}
      </div>
      <div class="dossier-columns">
        ${renderDossierList("Reasoning Adjustments", (reasoning.adjustments || []).map(item => `${item.factor}: ${item.relevance}`))}
        ${renderDossierList("Stale Data", evidence.staleData)}
        ${renderDossierList("Conflicting Data", evidence.conflictingData)}
      </div>
      <p class="sports-muted">${escapeHtml(dossier.visitorAnalysis?.nextBestStep || "")}</p>
    </article>
  `;
}

function renderStats(performance = {}) {
  const items = [
    ["Predictions", performance.predictionCount ?? 0, "frozen probability records"],
    ["Settled", performance.settledCount ?? 0, "outcomes scored"],
    ["Accuracy", performance.accuracy == null ? "N/A" : pct(performance.accuracy), "directional hit rate"],
    ["Brier", performance.averageBrierScore == null ? "N/A" : performance.averageBrierScore, "lower is better"]
  ];
  statsEl.innerHTML = items.map(([label, value, note]) => `
    <article class="sports-card">
      <div class="sports-stat">
        <span class="sports-label">${label}</span>
        <strong>${value}</strong>
        <span class="sports-muted">${note}</span>
      </div>
    </article>
  `).join("");
}

function renderFactors(title, factors = []) {
  const items = factors.length ? factors : ["No factor recorded yet."];
  return `
    <div>
      <strong>${title}</strong>
      <ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>
    </div>
  `;
}

function renderPrediction(prediction) {
  const positive = Number(prediction.edgePoints || 0) > 0;
  const settled = prediction.status === "settled";
  return `
    <article class="prediction-card">
      <div class="prediction-head">
        <div>
          <h3>${prediction.event} - ${prediction.selection} ${prediction.marketType}</h3>
          <p class="sports-muted">${prediction.sport} / ${prediction.sportsbook} / frozen ${new Date(prediction.frozenAt).toLocaleString()}</p>
        </div>
        <span class="pill ${positive ? "good" : "warn"}">${prediction.classification}</span>
      </div>
      <div class="prediction-measures">
        <div class="measure"><span>Best Odds</span><strong>${odds(prediction.americanOdds)}</strong></div>
        <div class="measure"><span>Market Implied</span><strong>${prob(prediction.rawMarketImpliedProbability)}</strong></div>
        <div class="measure"><span>Fair Market</span><strong>${prob(prediction.fairMarketProbability)}</strong></div>
        <div class="measure"><span>Framework</span><strong>${prob(prediction.modelProbability)}</strong></div>
        <div class="measure"><span>Edge</span><strong>${edge(prediction.edgePoints)}</strong></div>
      </div>
      <div class="prediction-measures">
        <div class="measure"><span>Confidence</span><strong>${prediction.confidence}</strong></div>
        <div class="measure"><span>Data Quality</span><strong>${pct(prediction.dataQualityPercent)}</strong></div>
        <div class="measure"><span>Status</span><strong>${prediction.status}</strong></div>
        <div class="measure"><span>Outcome</span><strong>${settled ? (prediction.outcome ? "Win" : "Loss") : "Open"}</strong></div>
        <div class="measure"><span>Brier</span><strong>${prediction.brierScore ?? "N/A"}</strong></div>
      </div>
      <div class="factor-grid">
        ${renderFactors("Supporting factors", prediction.supportingFactors)}
        ${renderFactors("Factors against", prediction.opposingFactors)}
      </div>
      ${settled ? "" : `
        <div class="settle-row">
          <button class="sports-button" data-settle="${prediction.id}" data-outcome="1">Settle Win</button>
          <button class="sports-button secondary" data-settle="${prediction.id}" data-outcome="0">Settle Loss</button>
        </div>
      `}
    </article>
  `;
}

function render(store) {
  renderStats(store.performance || {});
  const predictions = store.predictions || [];
  listEl.innerHTML = predictions.length
    ? predictions.map(renderPrediction).join("")
    : `<p class="sports-muted">No forecasts saved yet. Add one above or use the sample values from the planning notes.</p>`;
}

async function runSportsSearch(query) {
  if (!dossierPanel) return;
  dossierPanel.innerHTML = `<p class="sports-muted">Building market dossier...</p>`;
  try {
    const result = await api(`/api/sports-intelligence/search?q=${encodeURIComponent(query)}`);
    const dossiers = result.results || [];
    dossierPanel.innerHTML = dossiers.length
      ? dossiers.map(renderDossier).join("")
      : `<p class="sports-muted">No dossier could be built for that search.</p>`;
  } catch (error) {
    dossierPanel.innerHTML = `<p class="sports-muted">${escapeHtml(error.message || "Unable to build sports dossier.")}</p>`;
  }
}

async function load() {
  try {
    const store = await api("/api/sports-intelligence");
    render(store);
  } catch (error) {
    listEl.innerHTML = `<p class="sports-muted">Sports Intelligence data is not available yet.</p>`;
  }
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.americanOdds = Number(data.americanOdds);
  data.opposingAmericanOdds = Number(data.opposingAmericanOdds);
  data.modelProbability = Number(data.modelProbability);
  data.dataQuality = Number(data.dataQuality);
  try {
    await api("/api/sports-intelligence/predictions", {
      method: "POST",
      body: JSON.stringify(data)
    });
    form.reset();
    form.sport.value = "MLB";
    form.league.value = "MLB";
    form.confidence.value = "Moderate";
    await load();
  } catch (error) {
    alert(error.message || "Unable to save forecast.");
  }
});

searchForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const query = searchInput?.value?.trim();
  if (!query) return;
  await runSportsSearch(query);
});

document.addEventListener("click", async event => {
  const button = event.target.closest("[data-settle]");
  if (!button) return;
  try {
    await api("/api/sports-intelligence/settle", {
      method: "POST",
      body: JSON.stringify({
        id: button.dataset.settle,
        outcome: Number(button.dataset.outcome)
      })
    });
    await load();
  } catch (error) {
    alert(error.message || "Unable to settle forecast.");
  }
});

load();

if (searchInput && !searchInput.value) {
  searchInput.value = "Yankees moneyline";
}
if (searchInput?.value) {
  runSportsSearch(searchInput.value);
}
