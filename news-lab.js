const grid = document.querySelector("[data-news-lab-grid]");
const statusEl = document.querySelector("[data-news-lab-status]");
const refreshButtons = document.querySelectorAll("[data-refresh-news-lab]");
const sourceStoryCount = document.querySelector("[data-source-story-count]");
const clusterCount = document.querySelector("[data-cluster-count]");
const ownedCount = document.querySelector("[data-owned-count]");
const brainActiveCount = document.querySelector("[data-news-lab-brain-active]");
const brainActionCount = document.querySelector("[data-news-lab-brain-actions]");
const brainCurrentTask = document.querySelector("[data-news-lab-brain-task]");
const tickerTrack = document.querySelector("[data-news-lab-ticker]");
const filters = document.querySelectorAll("[data-filter]");
const searchForm = document.querySelector("[data-news-lab-search-form]");
const searchResults = document.querySelector("[data-news-lab-search-results]");
const searchMeta = document.querySelector("[data-news-lab-search-meta]");
const searchPages = document.querySelector("[data-news-lab-search-pages]");
const storyPages = document.querySelector("[data-news-lab-story-pages]");
const marketSnapshotEl = document.querySelector("[data-market-snapshot]");
const marketSnapshotTime = document.querySelector("[data-market-snapshot-time]");
const marketSearchForm = document.querySelector("[data-market-search-form]");
const marketSearchResult = document.querySelector("[data-market-search-result]");
const marketSymbolDetail = document.querySelector("[data-market-symbol-detail]");

const autoRefreshMs = 6 * 60 * 1000;
const marketRefreshMs = 60 * 1000;
const storyCacheKey = "ceNewsLabOwnedStories";
const tabCacheMs = 90 * 1000;
const tabPrefetchDelayMs = 1200;
const newsLabFetchTimeoutMs = 9000;
const storyPageSize = 10;
let ownedStories = [];
let activeFilter = "all";
let activeSearchQuery = "";
let activeSearchPage = 1;
let activeStoryPage = 1;
let backgroundRefreshTimer = null;
let topTickerItems = [];
let topTickerLoadedAt = 0;
let topTickerRequest = null;
let newsLabRequestController = null;
let newsLabPrefetchStarted = false;
const newsLabTabCache = new Map();

function formatMarketNumber(value, options = {}) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: options.decimals ?? 2,
    maximumFractionDigits: options.decimals ?? 2
  }).format(number);
}

function marketChangeClass(value) {
  const number = Number(value || 0);
  if (number > 0) return "positive";
  if (number < 0) return "negative";
  return "flat";
}

function marketNewsMarkup(item = {}) {
  const title = item.title || "Market update";
  return `
    <a class="market-news-item" href="${escapeHtml(safeUrl(item.url || "#"))}" target="_blank" rel="noopener noreferrer">
      <span>${escapeHtml(item.source || "Market news")}</span>
      <strong>${escapeHtml(title)}</strong>
    </a>
  `;
}

function marketQuoteMarkup(item = {}) {
  const hasPrice = Number.isFinite(Number(item.price));
  const changeClass = hasPrice ? marketChangeClass(item.changePercent) : "warming";
  const percentLabel = Number.isFinite(Number(item.changePercent)) ? `${Number(item.changePercent).toFixed(2)}%` : (item.dataMessage || "Warming");
  const dollarLabel = Number.isFinite(Number(item.change)) ? `${Number(item.change) >= 0 ? "+" : ""}${formatMarketNumber(item.change)}` : percentLabel;
  const changeLabel = percentLabel;
  const marketCap = item.marketCap ? `<small>${escapeHtml(item.marketCap)} market cap</small>` : "";
  const exchangeText = item.exchange ? ` / ${item.exchange}` : "";
  const state = item.marketState ? `<small>${escapeHtml(item.marketState + exchangeText)}</small>` : (item.symbol ? `<small>${escapeHtml(item.symbol)}</small>` : "");
  const displayLabel = item.label || item.symbol || "Market";
  const directionLabel = changeClass === "positive" ? "up" : changeClass === "negative" ? "down" : "flat";
  return `
    <article class="market-quote ${changeClass}">
      <span class="market-quote-icon" aria-hidden="true"></span>
      <span class="market-quote-label">${escapeHtml(displayLabel)}</span>
      <span class="market-quote-values">
        <strong>${hasPrice ? formatMarketNumber(item.price) : "Live data warming"}</strong>
        <button class="market-change-toggle" type="button" data-market-percent="${escapeHtml(percentLabel)}" data-market-dollar="${escapeHtml(dollarLabel)}" aria-label="Toggle dollar or percent change">${escapeHtml(changeLabel)}</button>
        <small class="market-direction-label">${escapeHtml(directionLabel)}</small>
        <button class="market-detail-button" type="button" data-market-detail-symbol="${escapeHtml(item.symbol || displayLabel)}" aria-label="Open ${escapeHtml(displayLabel)} market detail">Details</button>
        ${marketCap || state}
      </span>
    </article>
  `;
}

function toggleMarketChangeDisplay(button) {
  const nextMode = button.dataset.marketMode === "dollar" ? "percent" : "dollar";
  button.dataset.marketMode = nextMode;
  button.textContent = nextMode === "dollar" ? (button.dataset.marketDollar || button.textContent) : (button.dataset.marketPercent || button.textContent);
}

function renderMarketSnapshot(payload = {}) {
  if (!marketSnapshotEl) return;
  const indexes = payload.indexes || [];
  const futures = payload.futures || [];
  const commodities = payload.commodities || [];
  const companies = payload.topCompanies || [];
  const marketNews = payload.marketNews || [];
  marketSnapshotEl.innerHTML = `
    <div class="market-snapshot-column">
      <h3>Major indexes</h3>
      <div class="market-quote-list">${indexes.map(marketQuoteMarkup).join("") || '<p class="empty-state">Index data unavailable.</p>'}</div>
    </div>
    <div class="market-snapshot-column">
      <h3>Futures</h3>
      <div class="market-quote-list">${futures.map(marketQuoteMarkup).join("") || '<p class="empty-state">Futures data unavailable.</p>'}</div>
    </div>
    <div class="market-snapshot-column">
      <h3>Gold & oil futures</h3>
      <div class="market-quote-list">${commodities.map(marketQuoteMarkup).join("") || '<p class="empty-state">Commodity futures data unavailable.</p>'}</div>
    </div>
    <div class="market-snapshot-column market-snapshot-wide">
      <h3>Top market-cap companies</h3>
      <div class="market-quote-list market-company-list">${companies.map(marketQuoteMarkup).join("") || '<p class="empty-state">Company data unavailable.</p>'}</div>
    </div>
    <div class="market-snapshot-column market-snapshot-news">
      <h3>Market news watch</h3>
      <div class="market-news-list">${marketNews.map(marketNewsMarkup).join("") || '<p class="empty-state">Market news is updating.</p>'}</div>
    </div>
  `;
  marketSnapshotEl.querySelectorAll("[data-market-percent]").forEach(button => {
    button.addEventListener("click", () => toggleMarketChangeDisplay(button));
  });
  if (marketSnapshotTime) {
    const generated = payload.generatedAt ? new Date(payload.generatedAt) : null;
    marketSnapshotTime.textContent = generated && !Number.isNaN(generated.getTime())
      ? `Updated ${generated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
      : "Market data";
    const loop = payload.refreshLoop || {};
    marketSnapshotTime.title = `${payload.sourceNote || payload.source || "Market data may be delayed."} Refresh: ${loop.lastStatus || "warming"}${loop.lastError ? ` (${loop.lastError})` : ""}`;
  }
}


function renderMarketLookupResult(payload = {}) {
  if (!marketSearchResult) return;
  const quote = payload.quote || null;
  if (!quote) {
    marketSearchResult.hidden = false;
    marketSearchResult.innerHTML = '<p class="empty-state">No matching quote found.</p>';
    return;
  }
  marketSearchResult.hidden = false;
  marketSearchResult.innerHTML = `
    <article class="market-quote market-lookup-card ${marketChangeClass(quote.changePercent)}">
      <span>${escapeHtml(quote.name || quote.label || quote.symbol || "Quote")}</span>
      <strong>${Number.isFinite(Number(quote.price)) ? formatMarketNumber(quote.price) : "Quote warming"}</strong>
      <button class="market-change-toggle" type="button" data-market-percent="${escapeHtml(Number.isFinite(Number(quote.changePercent)) ? `${Number(quote.changePercent).toFixed(2)}%` : "--")}" data-market-dollar="${escapeHtml(Number.isFinite(Number(quote.change)) ? `${Number(quote.change) >= 0 ? "+" : ""}${formatMarketNumber(quote.change)}` : "--")}" aria-label="Toggle dollar or percent change">${escapeHtml(Number.isFinite(Number(quote.changePercent)) ? `${Number(quote.changePercent).toFixed(2)}%` : "--")}</button>
      <small>${escapeHtml([quote.symbol, quote.exchange, quote.marketState].filter(Boolean).join(" / "))}</small>
      <button class="market-detail-button" type="button" data-market-detail-symbol="${escapeHtml(quote.symbol || quote.name || "")}">Open detail</button>
    </article>
  `;
  marketSearchResult.querySelectorAll("[data-market-percent]").forEach(button => {
    button.addEventListener("click", () => toggleMarketChangeDisplay(button));
  });
}

function marketSignedNumber(value, decimals = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "--";
  return `${number >= 0 ? "+" : ""}${formatMarketNumber(number, { decimals })}`;
}

function marketPerformanceCardMarkup(item = {}) {
  const className = marketChangeClass(item.changePercent);
  const percent = Number.isFinite(Number(item.changePercent)) ? `${Number(item.changePercent).toFixed(2)}%` : "--";
  const previous = Number.isFinite(Number(item.previousChangePercent)) ? `${Number(item.previousChangePercent).toFixed(2)}%` : "--";
  const versus = Number.isFinite(Number(item.versusPrevious)) ? `${Number(item.versusPrevious) >= 0 ? "+" : ""}${Number(item.versusPrevious).toFixed(2)} pts` : "--";
  return `
    <article class="market-performance-card ${className}">
      <span>${escapeHtml(item.label || "Period")}</span>
      <strong>${escapeHtml(percent)}</strong>
      <p>${escapeHtml(marketSignedNumber(item.change))} vs previous ${escapeHtml(previous)} (${escapeHtml(versus)})</p>
      <small>${escapeHtml([item.startDate, item.endDate].filter(Boolean).join(" to ") || "Historical range warming")}</small>
    </article>
  `;
}

function renderMarketSymbolDetail(payload = {}) {
  if (!marketSymbolDetail) return;
  const quote = payload.quote || {};
  const performance = payload.historical?.performance || [];
  const news = payload.news || [];
  const currentCard = {
    label: "Current trading",
    change: quote.change,
    changePercent: quote.changePercent,
    previousChangePercent: null,
    versusPrevious: null,
    startDate: quote.marketState || "Live/delayed",
    endDate: payload.generatedAt ? new Date(payload.generatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""
  };
  marketSymbolDetail.hidden = false;
  marketSymbolDetail.innerHTML = `
    <div class="market-detail-head">
      <div>
        <span>${escapeHtml(quote.symbol || payload.symbol || "Symbol")}</span>
        <strong>${escapeHtml(quote.name || quote.symbol || "Market detail")}</strong>
        <p>${escapeHtml([quote.exchange, quote.marketState, quote.marketCap ? `${quote.marketCap} market cap` : ""].filter(Boolean).join(" / "))}</p>
      </div>
      <button class="market-detail-close" type="button" data-market-detail-close aria-label="Close market detail">Close</button>
    </div>
    <div class="market-detail-current ${marketChangeClass(quote.changePercent)}">
      <span>Current</span>
      <strong>${Number.isFinite(Number(quote.price)) ? formatMarketNumber(quote.price) : "Quote warming"}</strong>
      <em>${escapeHtml(Number.isFinite(Number(quote.changePercent)) ? `${Number(quote.changePercent).toFixed(2)}%` : "--")}</em>
    </div>
    <div class="market-performance-grid">
      ${[currentCard, ...performance].map(marketPerformanceCardMarkup).join("")}
    </div>
    <div class="market-detail-news">
      <h3>Latest news</h3>
      <div class="market-news-list">${news.map(marketNewsMarkup).join("") || '<p class="empty-state">Company news is warming up.</p>'}</div>
    </div>
  `;
}

async function loadMarketSymbolDetail(symbol = "") {
  if (!marketSymbolDetail || !symbol) return;
  marketSymbolDetail.hidden = false;
  marketSymbolDetail.innerHTML = '<p class="empty-state">Loading market history and company news...</p>';
  try {
    const response = await fetch(`/api/market-symbol-detail?q=${encodeURIComponent(symbol)}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Market detail unavailable");
    renderMarketSymbolDetail(payload);
  } catch {
    marketSymbolDetail.innerHTML = '<p class="empty-state">Market detail is temporarily unavailable.</p>';
  }
}
async function handleMarketSearch(event) {
  event.preventDefault();
  if (!marketSearchForm || !marketSearchResult) return;
  const formData = new FormData(marketSearchForm);
  const query = String(formData.get("q") || "").trim();
  if (!query) {
    marketSearchResult.hidden = true;
    marketSearchResult.innerHTML = "";
    return;
  }
  marketSearchResult.hidden = false;
  marketSearchResult.innerHTML = '<p class="empty-state">Looking up quote...</p>';
  try {
    const response = await fetch(`/api/market-quote?q=${encodeURIComponent(query)}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Quote unavailable");
    renderMarketLookupResult(payload);
  } catch {
    marketSearchResult.innerHTML = '<p class="empty-state">Quote lookup is temporarily unavailable.</p>';
  }
}
async function loadMarketSnapshot(force = false) {
  if (!marketSnapshotEl) return;
  try {
    const response = await fetch(`/api/market-snapshot${force ? "?refresh=1" : ""}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Market snapshot unavailable");
    renderMarketSnapshot(payload);
  } catch {
    marketSnapshotEl.innerHTML = '<p class="empty-state">Market snapshot is temporarily unavailable.</p>';
    if (marketSnapshotTime) marketSnapshotTime.textContent = "Market data unavailable";
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value = "") {
  try {
    const url = new URL(value, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function publicImageCredit(value = "") {
  const credit = String(value || "").trim();
  if (!credit) return "";
  if (/temporary\s+local\s+image|add\s+a\s+matching|placeholder|before\s+publishing/i.test(credit)) {
    return "";
  }
  return credit;
}

function formatStoryDate(value = "") {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function storyShareText(title = "") {
  return title ? `${title} via Censored Expressions` : "Censored Expressions";
}

function storyShareUrl(story = {}) {
  return storyArticleUrl(story);
}

function storyArticleUrl(story = {}) {
  return `./news-lab-story.html?id=${encodeURIComponent(story.id || story.title || "story")}`;
}

function shareIntentUrl(platform, story = {}) {
  const url = encodeURIComponent(storyShareUrl(story));
  const text = encodeURIComponent(storyShareText(story.title));
  if (platform === "x") return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  return storyShareUrl(story);
}

function shareIconMarkup(story = {}) {
  const encodedTitle = escapeHtml(story.title || "Censored Expressions story");
  return `
    <div class="share-icon-row" aria-label="Share ${encodedTitle}">
      <a class="share-icon-button share-icon-x" href="${escapeHtml(shareIntentUrl("x", story))}" target="_blank" rel="noopener noreferrer" aria-label="Share ${encodedTitle} on X">X</a>
      <a class="share-icon-button share-icon-facebook" href="${escapeHtml(shareIntentUrl("facebook", story))}" target="_blank" rel="noopener noreferrer" aria-label="Share ${encodedTitle} on Facebook">f</a>
      <button class="share-icon-button share-icon-more" type="button" data-share-url="${escapeHtml(storyShareUrl(story))}" data-share-title="${encodedTitle}" aria-label="Share or copy ${encodedTitle}">
        <span aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function visibleStories() {
  const stories = activeFilter === "all"
    ? ownedStories
    : ownedStories.filter(story => story.category === activeFilter);
  const pageSize = activeFilter === "all" ? Math.max(10, storyPageSize) : storyPageSize;
  const start = (activeStoryPage - 1) * pageSize;
  return stories.slice(start, start + pageSize);
}

function storyCard(story, index) {
  const image = story.image || {};
  const imageUrl = safeUrl(image.primary || image.fallback || "/assets/newsroom-hero.png");
  const fallback = safeUrl(image.fallback || "/assets/newsroom-hero.png");
  const imageCredit = publicImageCredit(image.credit || "");
  const summary = story.summary || (story.body || [])[0] || "Original Censored Expressions reporting is being prepared.";
  const originalDate = story.originalPublishedAt || story.generatedAt;
  const updateDate = story.boardVisibility?.latestUpdateAt || story.lastUpdatedAt || "";
  const originalLabel = originalDate ? `Published ${formatStoryDate(originalDate)}` : "Latest";
  const updateLabel = updateDate && updateDate !== originalDate ? `Updated ${formatStoryDate(updateDate)}` : "";
  return `
    <article class="story-card news-lab-story-card ${index === 0 && activeFilter === "all" ? "featured" : ""}" id="${escapeHtml(story.id || "")}">
      <a class="story-image" href="${escapeHtml(storyArticleUrl(story))}" aria-label="${escapeHtml(story.title || "Open story")}">
        <img src="${escapeHtml(imageUrl)}" data-fallback-src="${escapeHtml(fallback)}" alt="${escapeHtml(image.alt || "")}" loading="lazy" referrerpolicy="no-referrer" />
      </a>
      ${imageCredit ? `<p class="news-lab-image-credit">${escapeHtml(imageCredit)}</p>` : ""}
      <div class="story-topline">
        <span class="category-pill">${escapeHtml(story.categoryLabel || story.category || "news")}</span>
        <span>${escapeHtml(originalLabel)}</span>
        ${updateLabel ? `<span>${escapeHtml(updateLabel)}</span>` : ""}
      </div>
      <h3>${escapeHtml(story.title || "Original CE Story")}</h3>
      <p>${escapeHtml(summary)}</p>
      ${Array.isArray(story.storyUpdates) && story.storyUpdates.length ? `<p class="news-lab-update-count">${story.storyUpdates.length} update${story.storyUpdates.length === 1 ? "" : "s"} added to original story</p>` : ""}
      <div class="story-actions">
        <a class="story-button" href="${escapeHtml(storyArticleUrl(story))}">Read story</a>
        ${shareIconMarkup(story)}
      </div>
    </article>
  `;
}

function renderStories() {
  const stories = activeFilter === "all"
    ? ownedStories
    : ownedStories.filter(story => story.category === activeFilter);
  const pageSize = activeFilter === "all" ? Math.max(10, storyPageSize) : storyPageSize;
  const totalPages = Math.max(1, Math.ceil(stories.length / pageSize));
  if (activeStoryPage > totalPages) activeStoryPage = totalPages;
  const visible = visibleStories();
  grid.innerHTML = visible.length
    ? visible.map(storyCard).join("")
    : '<p class="empty-state">No original Censored Expressions stories are ready for this tab yet. The feed will keep checking for more.</p>';
  renderStoryPages(totalPages, stories.length);
  wireImageFallbacks();
}

function renderStoryPages(totalPages = 1, totalStories = 0) {
  if (!storyPages) return;
  if (totalPages <= 1) {
    storyPages.hidden = true;
    storyPages.innerHTML = "";
    return;
  }
  const pages = pageWindow(activeStoryPage, totalPages);
  storyPages.hidden = false;
  storyPages.innerHTML = `
    <button type="button" data-news-lab-story-page="${Math.max(1, activeStoryPage - 1)}" ${activeStoryPage <= 1 ? "disabled" : ""}>Previous</button>
    ${pages.map(page => `<button type="button" data-news-lab-story-page="${page}" class="${page === activeStoryPage ? "active" : ""}">${page}</button>`).join("")}
    <button type="button" data-news-lab-story-page="${Math.min(totalPages, activeStoryPage + 1)}" ${activeStoryPage >= totalPages ? "disabled" : ""}>Next</button>
    <span>${totalStories} article${totalStories === 1 ? "" : "s"}</span>
  `;
}

function renderTicker(stories = []) {
  if (!tickerTrack) return;
  const tickerStories = stories.slice(0, 14);
  if (!tickerStories.length) return;
  tickerTrack.innerHTML = tickerStories
    .map(story => {
      const url = story.url ? safeUrl(story.url) : storyArticleUrl(story);
      const external = /^https?:\/\//i.test(url);
      return `<a href="${escapeHtml(url)}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(story.title || "Original CE story")}</a>`;
    })
    .join("");
}

async function loadTopNewsTicker(force = false) {
  if (!tickerTrack) return;
  if (!force && topTickerItems.length && Date.now() - topTickerLoadedAt < autoRefreshMs) {
    renderTicker(topTickerItems);
    return;
  }
  if (topTickerRequest) {
    await topTickerRequest.catch(() => {});
    return;
  }
  topTickerRequest = fetch("/api/news-lab?category=top", { cache: "no-store" })
    .then(response => response.json())
    .then(payload => {
      const topStories = Array.isArray(payload.ownedStories) ? payload.ownedStories : [];
      topTickerItems = Array.isArray(payload.ticker) && payload.ticker.length
        ? payload.ticker
        : topStories;
      topTickerLoadedAt = Date.now();
      renderTicker(topTickerItems);
    })
    .catch(() => {
      if (topTickerItems.length) renderTicker(topTickerItems);
    })
    .finally(() => {
      topTickerRequest = null;
    });
  await topTickerRequest;
}

function renderBrainInfrastructure(infrastructure = {}) {
  const active = infrastructure.activeSubsystems || [];
  const actions = infrastructure.actions || [];
  if (brainActiveCount) brainActiveCount.textContent = active.length;
  if (brainActionCount) brainActionCount.textContent = actions.length;
  if (brainCurrentTask) {
    const task = actions[0]?.task || active[0]?.task || "Monitoring";
    brainCurrentTask.textContent = task.length > 24 ? `${task.slice(0, 24).trim()}...` : task;
    brainCurrentTask.title = task;
  }
}

function pageWindow(page, totalPages) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function searchResultSourceLabel(result = {}) {
  if (/ce generated article/i.test(result.type || "")) return "CE Media";
  return result.source || "Media source";
}

function searchResultMarkup(result = {}) {
  const url = safeUrl(result.url);
  const sourceLabel = searchResultSourceLabel(result);
  const dateValue = result.published ? new Date(result.published) : null;
  const dateLabel = dateValue && !Number.isNaN(dateValue.getTime())
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(dateValue)
    : "";
  return `
    <article class="site-search-result">
      <div class="story-topline">
        <span class="category-pill">${escapeHtml(sourceLabel)}</span>
        <span>${escapeHtml([result.type, dateLabel].filter(Boolean).join(" - "))}</span>
      </div>
      <h3><a href="${escapeHtml(url)}" ${url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""} data-search-interest data-result-title="${escapeHtml(result.title || "")}" data-result-source="${escapeHtml(result.source || "")}" data-result-type="${escapeHtml(result.type || "")}">${escapeHtml(result.title || "Search result")}</a></h3>
      <p>${escapeHtml(result.summary || "Open result for more.")}</p>
      <a class="story-button" href="${escapeHtml(url)}" ${url.startsWith("http") ? 'target="_blank" rel="noopener noreferrer"' : ""} data-search-interest data-result-title="${escapeHtml(result.title || "")}" data-result-source="${escapeHtml(result.source || "")}" data-result-type="${escapeHtml(result.type || "")}">Open result</a>
    </article>
  `;
}

function renderSearchPages(payload = {}) {
  if (!searchPages) return;
  if (!payload.totalPages || payload.totalPages <= 1) {
    searchPages.hidden = true;
    searchPages.innerHTML = "";
    return;
  }
  const pages = pageWindow(payload.page, payload.totalPages);
  searchPages.hidden = false;
  searchPages.innerHTML = `
    <button type="button" data-news-lab-search-page="${Math.max(1, payload.page - 1)}" ${payload.page <= 1 ? "disabled" : ""}>Previous</button>
    ${pages.map(page => `<button type="button" data-news-lab-search-page="${page}" class="${page === payload.page ? "active" : ""}">${page}</button>`).join("")}
    <button type="button" data-news-lab-search-page="${Math.min(payload.totalPages, payload.page + 1)}" ${payload.page >= payload.totalPages ? "disabled" : ""}>Next</button>
  `;
}

function searchTerms(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .map(term => term.trim())
    .filter(term => term.length > 1);
}

function localNewsLabSearchResults(query = "") {
  const terms = searchTerms(query);
  if (!terms.length || !ownedStories.length) return [];
  return ownedStories
    .map(story => {
      const text = [story.title, story.summary, ...(story.body || []), story.categoryLabel, story.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matched = terms.filter(term => text.includes(term));
      if (!matched.length) return null;
      if (terms.length === 2 && matched.length < 2) return null;
      if (terms.length > 2 && matched.length / terms.length < 0.67) return null;
      return {
        title: story.title,
        source: "CE Media",
        type: "CE generated article",
        url: storyArticleUrl(story),
        summary: story.summary || (story.body || [])[0] || "Open the CE Media article.",
        published: story.originalPublishedAt || story.generatedAt,
        matchCoverage: Number((matched.length / terms.length).toFixed(2)),
        intentCoverage: Number((matched.length / terms.length).toFixed(2)),
        score: 1000 + matched.length
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchCoverage - a.matchCoverage || b.score - a.score);
}

function mergeSearchResults(ceResults = [], serverResults = []) {
  const seen = new Set();
  return [...ceResults, ...(serverResults || [])].filter(result => {
    const key = String(result.url || `${result.title}:${result.source}`).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function recordSearchInterest(link) {
  if (!link || !activeSearchQuery) return;
  const payload = {
    query: activeSearchQuery,
    url: link.href,
    title: link.dataset.resultTitle || link.textContent || "",
    source: link.dataset.resultSource || "",
    type: link.dataset.resultType || ""
  };
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/search/interest", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/search/interest", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}

async function runNewsLabSearch(page = 1) {
  if (!searchForm || !searchResults || !searchMeta) return;
  const form = new FormData(searchForm);
  const query = String(form.get("q") || activeSearchQuery || "").trim();
  if (!query) {
    searchResults.hidden = true;
    if (searchPages) searchPages.hidden = true;
    searchMeta.textContent = "";
    return;
  }
  activeSearchQuery = query;
  activeSearchPage = page;
  searchResults.hidden = false;
  searchResults.innerHTML = '<p class="empty-state">Searching...</p>';
  searchMeta.textContent = "";
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Search unavailable");
    const ceResults = localNewsLabSearchResults(query);
    const mergedResults = mergeSearchResults(ceResults, payload.results || []);
    activeSearchPage = payload.page || page;
    const visibleTotal = Math.max(Number(payload.totalResults || 0), mergedResults.length);
    searchMeta.textContent = visibleTotal
      ? `${visibleTotal} result${visibleTotal === 1 ? "" : "s"} for "${payload.query}"`
      : `No results found for "${payload.query}"`;
    searchResults.innerHTML = mergedResults.length
      ? mergedResults.map(searchResultMarkup).join("")
      : '<p class="empty-state">No matching CE articles or absorbed source articles yet.</p>';
    renderSearchPages(payload);
  } catch {
    searchMeta.textContent = "Search is temporarily unavailable.";
    searchResults.innerHTML = '<p class="empty-state">Try another term or refresh stories.</p>';
    if (searchPages) searchPages.hidden = true;
  }
}

function wireImageFallbacks() {
  document.querySelectorAll(".news-lab-story-card img").forEach(image => {
    image.addEventListener("error", () => {
      const fallback = image.getAttribute("data-fallback-src");
      if (fallback && image.src !== fallback) image.src = fallback;
    }, { once: true });
  });
}

function setRefreshDisabled(disabled) {
  refreshButtons.forEach(button => {
    button.disabled = disabled;
  });
}

async function copyOrShare(url, title) {
  if (navigator.share) {
    await navigator.share({ title, url });
    return;
  }
  await navigator.clipboard.writeText(url);
}

function newsLabApiCategory() {
  return activeFilter === "all" ? "top" : activeFilter;
}

function newsLabCacheKey(category = newsLabApiCategory()) {
  return String(category || "top").toLowerCase();
}

function newsLabCachedPayload(category = newsLabApiCategory()) {
  const cached = newsLabTabCache.get(newsLabCacheKey(category));
  if (!cached || !cached.payload) return null;
  if (Date.now() - Number(cached.storedAt || 0) > tabCacheMs) return null;
  return cached.payload;
}

function storeNewsLabPayload(category = newsLabApiCategory(), payload = {}) {
  if (!payload || typeof payload !== "object") return;
  newsLabTabCache.set(newsLabCacheKey(category), { storedAt: Date.now(), payload });
}

function applyNewsLabPayload(payload = {}, category = newsLabApiCategory()) {
  ownedStories = payload.ownedStories || [];
  try {
    sessionStorage.setItem(storyCacheKey, JSON.stringify({
      storedAt: Date.now(),
      stories: ownedStories,
      category
    }));
  } catch {
    // Cache is an acceleration path only; rendering should continue if storage is blocked.
  }
  if (sourceStoryCount) sourceStoryCount.textContent = payload.sourceStoryCount || 0;
  const intelligence = payload.articleReadIntelligence || {};
  if (clusterCount) clusterCount.textContent = intelligence.uniquePublisherReads
    ? `${payload.clusteredStoryCount || 0} / ${intelligence.uniquePublisherReads} reads`
    : payload.clusteredStoryCount || 0;
  if (ownedCount) ownedCount.textContent = ownedStories.length;
  renderStories();
  if (category === "top") {
    topTickerItems = Array.isArray(payload.ticker) && payload.ticker.length
      ? payload.ticker
      : ownedStories;
    topTickerLoadedAt = Date.now();
    renderTicker(topTickerItems);
  } else {
    loadTopNewsTicker(false);
  }
  renderBrainInfrastructure(payload.brainInfrastructure || {});
  statusEl.textContent = `${payload.status || "unknown"} feed state. Updated ${new Date(payload.generatedAt || Date.now()).toLocaleString()}.`;
}

function restoreNewsLabSessionCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(storyCacheKey) || "null");
    if (!cached || !Array.isArray(cached.stories) || Date.now() - Number(cached.storedAt || 0) > tabCacheMs) return false;
    const category = cached.category || "top";
    storeNewsLabPayload(category, {
      status: "cached",
      generatedAt: cached.storedAt,
      ownedStories: cached.stories,
      sourceStoryCount: cached.stories.length,
      clusteredStoryCount: cached.stories.length,
      articleReadIntelligence: {}
    });
    if (newsLabApiCategory() === category) {
      applyNewsLabPayload(newsLabCachedPayload(category), category);
      return true;
    }
  } catch {
    // Ignore corrupt local cache.
  }
  return false;
}

function fetchNewsLabPayload(category = newsLabApiCategory(), force = false, signal = null) {
  const params = new URLSearchParams({ category });
  if (force) params.set("refresh", "1");
  return fetch(`/api/news-lab?${params.toString()}`, { cache: "no-store", signal })
    .then(response => response.json().then(payload => {
      if (!response.ok) throw new Error(payload.error || "News Lab unavailable");
      return payload;
    }));
}

async function prefetchNewsLabTabs() {
  if (newsLabPrefetchStarted) return;
  newsLabPrefetchStarted = true;
  const categories = ["top", "world", "politics", "business", "technology", "sports", "entertainment", "local"];
  for (const category of categories) {
    if (category === newsLabApiCategory() || newsLabCachedPayload(category)) continue;
    await fetchNewsLabPayload(category, false)
      .then(payload => storeNewsLabPayload(category, payload))
      .catch(() => {});
  }
}

async function loadNewsLab(force = false) {
  const category = newsLabApiCategory();
  const cached = !force ? newsLabCachedPayload(category) : null;
  if (cached) {
    applyNewsLabPayload(cached, category);
    statusEl.textContent = "Showing cached stories while the Brain checks for updates...";
  } else {
    statusEl.textContent = force ? "Refreshing original Censored Expressions stories..." : "Loading original Censored Expressions stories...";
  }
  setRefreshDisabled(true);
  if (newsLabRequestController) newsLabRequestController.abort();
  const controller = new AbortController();
  newsLabRequestController = controller;
  const timeoutId = setTimeout(() => controller.abort(), newsLabFetchTimeoutMs);
  try {
    const payload = await fetchNewsLabPayload(category, force, controller.signal);
    storeNewsLabPayload(category, payload);
    if (category === newsLabApiCategory()) applyNewsLabPayload(payload, category);
    if (payload.backgroundRebuild?.active && !backgroundRefreshTimer) {
      backgroundRefreshTimer = setTimeout(() => {
        backgroundRefreshTimer = null;
        loadNewsLab(false);
      }, 9000);
    }
    setTimeout(prefetchNewsLabTabs, tabPrefetchDelayMs);
  } catch (error) {
    if (error?.name === "AbortError" && cached) return;
    statusEl.textContent = cached ? "Showing cached stories; live refresh is still catching up." : "News Lab could not load original stories.";
    if (!cached) grid.innerHTML = '<p class="empty-state">CE Media News is unavailable right now.</p>';
  } finally {
    clearTimeout(timeoutId);
    if (newsLabRequestController === controller) {
      newsLabRequestController = null;
    }
    setRefreshDisabled(false);
  }
}

filters.forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter || "all";
    activeStoryPage = 1;
    filters.forEach(item => item.classList.toggle("active", item === button));
    loadNewsLab(false);
  });
});

refreshButtons.forEach(button => {
  button.addEventListener("click", () => loadNewsLab(true));
});

document.addEventListener("click", async event => {
  const shareButton = event.target.closest("[data-share-url]");
  if (!shareButton) {
    const resultLink = event.target.closest("[data-search-interest]");
    if (resultLink) recordSearchInterest(resultLink);
    return;
  }
  try {
    await copyOrShare(shareButton.dataset.shareUrl, shareButton.dataset.shareTitle || "Censored Expressions");
    shareButton.classList.add("copied");
    setTimeout(() => shareButton.classList.remove("copied"), 1200);
  } catch {
    shareButton.classList.remove("copied");
  }
});

searchForm?.addEventListener("submit", event => {
  event.preventDefault();
  runNewsLabSearch(1);
});

searchPages?.addEventListener("click", event => {
  const button = event.target.closest("[data-news-lab-search-page]");
  if (!button) return;
  runNewsLabSearch(Number(button.dataset.newsLabSearchPage || activeSearchPage));
});

storyPages?.addEventListener("click", event => {
  const button = event.target.closest("[data-news-lab-story-page]");
  if (!button || button.disabled) return;
  activeStoryPage = Number(button.dataset.newsLabStoryPage || 1);
  renderStories();
  grid?.scrollIntoView({ behavior: "smooth", block: "start" });
});

restoreNewsLabSessionCache();
loadNewsLab(false);
loadMarketSnapshot(false);
marketSnapshotEl?.addEventListener("click", event => {
  const toggle = event.target.closest("[data-market-percent]");
  if (toggle) return;
  const button = event.target.closest("[data-market-detail-symbol]");
  if (!button) return;
  loadMarketSymbolDetail(button.dataset.marketDetailSymbol || "");
});

marketSearchResult?.addEventListener("click", event => {
  const button = event.target.closest("[data-market-detail-symbol]");
  if (!button) return;
  loadMarketSymbolDetail(button.dataset.marketDetailSymbol || "");
});

marketSymbolDetail?.addEventListener("click", event => {
  if (!event.target.closest("[data-market-detail-close]")) return;
  marketSymbolDetail.hidden = true;
  marketSymbolDetail.innerHTML = "";
});

if (marketSearchForm) marketSearchForm.addEventListener("submit", handleMarketSearch);
setInterval(() => loadNewsLab(true), autoRefreshMs);
setInterval(() => loadMarketSnapshot(true), marketRefreshMs);






