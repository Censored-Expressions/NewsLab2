const dashboard = document.querySelector("[data-dashboard]");
const statusEl = document.querySelector("[data-status]");
const tokenForm = document.querySelector("[data-token-form]");
const tokenInput = document.querySelector("#owner-token");
const refreshButton = document.querySelector("[data-refresh]");
const storageKey = "ceOwnerAdminToken";
let ownerToken = localStorage.getItem(storageKey) || "";
if (tokenInput && ownerToken) tokenInput.value = ownerToken;

function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function pill(ok, label) {
  return `<span class="obs-pill ${ok ? "ok" : "warn"}">${esc(label)}</span>`;
}

function number(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toLocaleString() : "0";
}

function workerRows(workers = {}) {
  return Object.entries(workers).map(([name, worker]) => `
    <li class="obs-row"><span>${esc(name)}</span><strong>${esc(worker.status || worker.freshness?.label || "heartbeat")}</strong>${pill(Boolean(worker.active || worker.freshness?.fresh), worker.active ? "active" : (worker.freshness?.fresh ? "fresh" : "stale"))}</li>
  `).join("");
}

function reasonRows(items = []) {
  return (items || []).slice(0, 6).map(item => `
    <li class="obs-row"><span>${esc(item.reason || item.stage || "unknown")}</span><strong>${number(item.count)}</strong></li>
  `).join("") || '<li class="obs-row"><span>No active reasons</span><strong>0</strong></li>';
}

function render(data) {
  const health = data.health || {};
  const queues = data.queues || {};
  const workers = data.workers || {};
  const collectors = data.collectors || {};
  const editorial = data.editorial || {};
  const publishing = data.publishing || {};
  const throughput = data.throughput || {};
  const categoryRows = (collectors.categories || []).map(item => `
    <tr>
      <td>${esc(item.category)}</td>
      <td>${number(item.visibleCount)} / ${number(item.targetCount)}</td>
      <td>${number(item.storyCount)}</td>
      <td>${number(item.sourceCount)}</td>
      <td>${esc(item.status || item.workerHealth || "")}</td>
      <td>${pill(!item.currentNewsPush?.needed, item.currentNewsPush?.needed ? "push" : "filled")}</td>
    </tr>
  `).join("");
  dashboard.innerHTML = `
    <article class="obs-card"><h2>System Health</h2><div class="obs-number">${esc(health.status || "unknown")}</div><p class="obs-muted">${esc((health.findings || ["No findings."]).join(" | "))}</p></article>
    <article class="obs-card"><h2>Visible Articles</h2><div class="obs-number">${number(publishing.visibleStories)}</div><p class="obs-muted">Active board: ${number(publishing.activeBoardStories)}</p></article>
    <article class="obs-card"><h2>Approval Rate</h2><div class="obs-number">${number(editorial.approvalRate)}%</div><p class="obs-muted">${number(editorial.approved)} approved / ${number(editorial.reviews)} reviews</p></article>
    <article class="obs-card"><h2>Headline Queue</h2><div class="obs-number">${number(queues.headlineRepair?.active)}</div><p class="obs-muted">Active repair items</p><ul class="obs-list">${reasonRows(queues.headlineRepair?.topReasons)}</ul></article>
    <article class="obs-card"><h2>Approval Queue</h2><div class="obs-number">${number(queues.approvalRecovery?.active)}</div><p class="obs-muted">Active recovery items</p><ul class="obs-list">${reasonRows(queues.approvalRecovery?.topReasons)}</ul></article>
    <article class="obs-card"><h2>Throughput</h2><div class="obs-number">${number(throughput.publishRateLastHour)}</div><p class="obs-muted">Published last hour. Fetched/min estimate: ${number(throughput.storiesFetchedPerMinuteEstimate)}</p></article>
    <article class="obs-card wide"><h2>Worker Health</h2><ul class="obs-list">${workerRows(workers)}</ul></article>
    <article class="obs-card"><h2>Collectors</h2><div class="obs-number">${number(collectors.activeCount)}</div><p class="obs-muted">Active collectors. Underfilled: ${esc((collectors.underfilledCategories || []).join(", ") || "none")}</p></article>
    <article class="obs-card full"><h2>Tab Worker Coverage</h2><table class="collector-table"><thead><tr><th>Tab</th><th>Visible / Target</th><th>Collected</th><th>Sources</th><th>Status</th><th>Action</th></tr></thead><tbody>${categoryRows}</tbody></table></article>
  `;
  statusEl.textContent = `Updated ${new Date(data.generatedAt || Date.now()).toLocaleString()}`;
}

async function load() {
  try {
    statusEl.textContent = "Loading observability...";
    const response = await fetch("/api/news-lab-observability", {
      cache: "no-store",
      headers: ownerToken ? { "x-owner-admin-token": ownerToken } : {}
    });
    if (!response.ok) throw new Error(response.status === 404 ? "Owner token required." : `Request failed: ${response.status}`);
    render(await response.json());
  } catch (error) {
    statusEl.textContent = error.message || "Observability unavailable.";
  }
}

tokenForm?.addEventListener("submit", event => {
  event.preventDefault();
  ownerToken = tokenInput?.value?.trim() || "";
  if (ownerToken) localStorage.setItem(storageKey, ownerToken);
  load();
});
refreshButton?.addEventListener("click", load);
load();
setInterval(load, 15000);
