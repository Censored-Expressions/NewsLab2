const feedSources = [
  {
    name: "AP",
    category: "major",
    homepage: "https://apnews.com/",
    feed: "https://apnews.com/hub/ap-top-news?output=rss"
  },
  {
    name: "CNN",
    category: "major",
    homepage: "https://www.cnn.com/",
    feed: "http://rss.cnn.com/rss/cnn_topstories.rss"
  },
  {
    name: "Fox",
    category: "major",
    homepage: "https://www.foxnews.com/",
    feed: "https://moxie.foxnews.com/google-publisher/latest.xml"
  },
  {
    name: "CBS",
    category: "major",
    homepage: "https://www.cbsnews.com/",
    feed: "https://www.cbsnews.com/latest/rss/main"
  },
  {
    name: "NBC",
    category: "major",
    homepage: "https://www.nbcnews.com/",
    feed: "https://feeds.nbcnews.com/nbcnews/public/news"
  },
  {
    name: "ABC",
    category: "major",
    homepage: "https://abcnews.go.com/",
    feed: "https://abcnews.go.com/abcnews/topstories"
  },
  {
    name: "Google Sports",
    category: "sports",
    discovery: true,
    homepage: "https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pWVXlnQVAB",
    feed: "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "ESPN",
    category: "sports",
    homepage: "https://www.espn.com/",
    feed: "https://www.espn.com/espn/rss/news"
  },
  {
    name: "ESPN Local Pulse",
    category: "sports",
    discovery: true,
    homepage: "https://www.espn.com/",
    feed: "https://news.google.com/rss/search?q=ESPN%20sports%20when:1d&hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "Fox Sports",
    category: "sports",
    homepage: "https://www.foxsports.com/",
    feed: "https://www.foxsports.com/rss"
  },
  {
    name: "CBS Sports",
    category: "sports",
    homepage: "https://www.cbssports.com/",
    feed: "https://www.cbssports.com/rss/headlines/"
  },
  {
    name: "NBC Sports",
    category: "sports",
    discovery: true,
    homepage: "https://www.nbcsports.com/",
    feed: "https://news.google.com/rss/search?q=site:nbcsports.com%20sports%20when:1d&hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "ABC Sports",
    category: "sports",
    homepage: "https://abcnews.go.com/Sports",
    feed: "https://abcnews.go.com/abcnews/sportsheadlines"
  },
  {
    name: "NFL",
    category: "sports",
    homepage: "https://www.nfl.com/news/",
    feed: "https://www.nfl.com/feeds/rss/news"
  },
  {
    name: "NBA",
    category: "sports",
    homepage: "https://www.nba.com/news",
    feed: "https://www.nba.com/rss/nba_rss.xml"
  },
  {
    name: "MLB",
    category: "sports",
    homepage: "https://www.mlb.com/news",
    feed: "https://www.mlb.com/feeds/news/rss.xml"
  },
  {
    name: "NHL",
    category: "sports",
    homepage: "https://www.nhl.com/news",
    feed: "https://www.nhl.com/rss/news.xml"
  },
  {
    name: "NCAA",
    category: "sports",
    discovery: true,
    homepage: "https://www.ncaa.com/news",
    feed: "https://news.google.com/rss/search?q=NCAA%20sports%20when:1d&hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "Local Sports",
    category: "sports",
    discovery: true,
    homepage: "https://news.google.com/search?q=local%20sports",
    feed: "https://news.google.com/rss/search?q=local%20sports%20high%20school%20college%20pro%20when:1d&hl=en-US&gl=US&ceid=US:en"
  },
  {
    name: "Local",
    category: "local",
    homepage: "https://news.google.com/search?q=local%20news",
    feed: "https://news.google.com/rss/search?q=local%20news%20when:1d&hl=en-US&gl=US&ceid=US:en"
  }
];

const fallbackStories = [
  {
    title: "Latest AP headlines",
    source: "AP",
    category: "world",
    url: "https://apnews.com/",
    image: "./assets/logo.png",
    summary: "Open AP for the latest national and world headlines.",
    published: new Date().toISOString()
  },
  {
    title: "Latest CNN headlines",
    source: "CNN",
    category: "politics",
    url: "https://www.cnn.com/",
    image: "./assets/logo.png",
    summary: "Open CNN for current national and world coverage.",
    published: new Date().toISOString()
  },
  {
    title: "Latest Fox News headlines",
    source: "Fox",
    category: "politics",
    url: "https://www.foxnews.com/",
    image: "./assets/logo.png",
    summary: "Open Fox News for current politics, national news, and opinion.",
    published: new Date().toISOString()
  },
  {
    title: "Latest pop culture, music, and movie headlines",
    source: "Entertainment Desk",
    category: "entertainment",
    url: "https://variety.com/",
    image: "./assets/logo.png",
    summary: "Open current entertainment coverage from film, music, television, and pop culture sources.",
    published: new Date().toISOString()
  },
  {
    title: "Latest national sports headlines",
    source: "Sports Desk",
    category: "sports",
    url: "https://www.espn.com/",
    image: "./assets/logo.png",
    summary: "Open current sports coverage from national leagues, teams, and major sports desks.",
    published: new Date().toISOString()
  }
];

const proxyUrl = "https://api.allorigins.win/raw?url=";
const grid = document.querySelector("[data-story-grid]");
const filters = document.querySelectorAll("[data-filter]");
const refreshButton = document.querySelector("[data-refresh]");
const tickerTrack = document.querySelector(".ticker-track");
const installAppButton = document.querySelector("[data-install-app]");
const searchForm = document.querySelector("[data-site-search-form]");
const searchResults = document.querySelector("[data-search-results]");
const searchMeta = document.querySelector("[data-search-meta]");
const searchPages = document.querySelector("[data-search-pages]");
const counters = {
  sources: document.querySelector("[data-source-count]"),
  stories: document.querySelector("[data-story-count]"),
  images: document.querySelector("[data-image-count]"),
  status: document.querySelector("[data-board-status]"),
  boardStories: document.querySelector("[data-board-story-count]"),
  boardImages: document.querySelector("[data-board-image-count]")
};

let stories = [];
let tickerItems = [];
let saved = new Set(JSON.parse(localStorage.getItem("savedStories") || "[]"));
let activeFilter = "all";
let activeSourceCount = feedSources.length;
let installPromptEvent = null;
let activeSearchQuery = "";
let activeSearchPage = 1;
let feedLoadPromise = null;
let lastTickerRefreshAt = 0;
const tickerRefreshMs = 90 * 1000;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPromptEvent = event;
  if (installAppButton) installAppButton.hidden = false;
});

installAppButton?.addEventListener("click", async () => {
  if (!installPromptEvent) return;
  installPromptEvent.prompt();
  await installPromptEvent.userChoice.catch(() => {});
  installPromptEvent = null;
  installAppButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installPromptEvent = null;
  if (installAppButton) installAppButton.hidden = true;
});

function cleanText(value = "") {
  const template = document.createElement("template");
  template.innerHTML = value;
  return (template.content.textContent || "").replace(/\s+/g, " ").trim();
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
    const parsed = new URL(value, window.location.href);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "#";
  } catch {
    return "#";
  }
}

function stripGoogleRedirect(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const target = parsed.searchParams.get("url");
    return target || url;
  } catch {
    return url;
  }
}

function publisherNameFromUrl(url = "") {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const label = host.split(".").slice(0, -1).join(" ") || host;
    return label
      .split(/[\s-]+/)
      .filter(Boolean)
      .map(word => word.length <= 3 ? word.toUpperCase() : `${word[0].toUpperCase()}${word.slice(1)}`)
      .join(" ");
  } catch {
    return "";
  }
}

function isAggregatorLink(url = "") {
  return /news\.google\.com\/rss\/articles/i.test(url);
}

function isDiscoverySource(source = {}) {
  return Boolean(source.discovery || /news\.google\.com/i.test(source.feed || ""));
}

function isPublishableStory(story) {
  return !story.isDiscovery && !isAggregatorLink(story.url);
}

function classifyStoryCategory(story, source = {}) {
  if (["sports", "local", "entertainment", "market"].includes(source.category)) return source.category;
  const text = `${story.title || ""} ${story.summary || ""} ${story.source || ""}`.toLowerCase();
  const entertainmentWords = ["movie", "film", "music", "album", "song", "celebrity", "actor", "actress", "hollywood", "tv", "television", "streaming", "concert", "box office", "trailer", "entertainment", "artist", "premiere", "award", "grammy", "emmy", "oscars", "fashion", "pop culture", "rapper", "singer", "broadway", "festival"];
  const politicsWords = ["trump", "biden", "white house", "congress", "senate", "election", "campaign", "governor", "mayor", "lawmakers", "supreme court", "administration", "republican", "democrat", "politics", "policy", "voters", "immigration", "border", "tax", "tariff", "president"];
  const worldWords = ["iran", "israel", "gaza", "ukraine", "russia", "china", "europe", "nato", "united nations", "global", "world", "international", "foreign", "war", "ceasefire", "embassy", "prime minister"];
  if (entertainmentWords.some(word => text.includes(word))) return "entertainment";
  if (politicsWords.some(word => text.includes(word))) return "politics";
  if (worldWords.some(word => text.includes(word))) return "world";
  return "world";
}

function assessStory(story) {
  const text = `${story.title} ${story.summary}`.toLowerCase();
  const spamSignals = ["free money", "act now", "guaranteed profit", "miracle cure"];
  let cleared = true;

  try {
    const parsed = new URL(story.url);
    cleared = ["http:", "https:"].includes(parsed.protocol);
  } catch {
    cleared = false;
  }

  if (spamSignals.some(signal => text.includes(signal))) cleared = false;
  return {
    ...story,
    guardStatus: cleared ? "cleared" : "blocked"
  };
}

function getImageFromItem(item) {
  const mediaContent = item.querySelector("media\\:content, content");
  const mediaThumbnail = item.querySelector("media\\:thumbnail, thumbnail");
  const enclosure = item.querySelector("enclosure[type^='image']");
  const description = item.querySelector("description")?.textContent || "";
  const descriptionImage = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return (
    mediaContent?.getAttribute("url") ||
    mediaThumbnail?.getAttribute("url") ||
    enclosure?.getAttribute("url") ||
    descriptionImage?.[1] ||
    "./assets/logo.png"
  );
}

function getSummary(item) {
  const description = item.querySelector("description")?.textContent || "";
  const content = item.querySelector("content\\:encoded, encoded")?.textContent || "";
  const text = cleanText(description || content);
  if (!text) return "Open the full story for the latest reporting from the original publisher.";
  return text.length > 170 ? `${text.slice(0, 167)}...` : text;
}

function parseFeed(xmlText, source) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const items = Array.from(doc.querySelectorAll("item")).slice(0, 5);
  const isDiscovery = isDiscoverySource(source);
  return items.map(item => {
    const image = getImageFromItem(item);
    const url = stripGoogleRedirect(item.querySelector("link")?.textContent || source.homepage);
    const story = {
      title: cleanText(item.querySelector("title")?.textContent || "Untitled story"),
      source: isDiscovery ? cleanText(item.querySelector("source")?.textContent || "") || publisherNameFromUrl(item.querySelector("source")?.getAttribute("url") || "") || source.name : source.name,
      category: source.category,
      url,
      sourceHomepage: item.querySelector("source")?.getAttribute("url") || source.homepage,
      image: isDiscovery || isAggregatorLink(url) ? "./assets/logo.png" : image,
      hasFeedImage: !isDiscovery && !isAggregatorLink(url) && Boolean(image && !image.endsWith("logo.png")),
      isDiscovery: isDiscovery || isAggregatorLink(url),
      summary: getSummary(item),
      published: item.querySelector("pubDate")?.textContent || new Date().toISOString()
    };
    return { ...story, category: classifyStoryCategory(story, source) };
  });
}

async function loadFeed(source) {
  const response = await fetch(`${proxyUrl}${encodeURIComponent(source.feed)}`);
  if (!response.ok) throw new Error(`${source.name} feed unavailable`);
  return parseFeed(await response.text(), source);
}

function storyDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function hasPublisherImage(story) {
  return Boolean(!isFlawedImage(story.image) && (story.hasFeedImage || (story.image && !story.image.endsWith("logo.png"))));
}

function isFlawedImage(image = "") {
  return /googleusercontent\.com\/J6_coFbogxhRI9iM864NL_liGXvsQp2AupsKei7z0cNNfDvGUmWUy20nuUhkREQyrpY4bEeIBuc/i.test(image);
}

function displayImage(story) {
  return hasPublisherImage(story) ? story.image : "./assets/logo.png";
}

function handleImageError(event) {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  image.src = "./assets/logo.png";
  image.closest(".story-image")?.classList.add("story-image-fallback");
}

function storyRank(story) {
  const dateRank = storyDate(story.published) / 100000000000;
  const relevance = Number(story.engagementScore || 0);
  const imageBoost = hasPublisherImage(story) ? 6 : 0;
  return relevance + imageBoost + dateRank;
}

function storyKeywords(story) {
  return story.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 4 && !["local", "news", "latest", "after", "before", "about", "with", "from", "reports", "report", "watch", "video", "update", "updates"].includes(word))
    .slice(0, 5);
}

function storyFingerprint(story) {
  const words = storyKeywords(story);
  return words.length ? words.sort().join("-") : (story.url || story.title).toLowerCase();
}

function dedupeVisibleStories(nextStories) {
  const seenUrls = new Set();
  const seenClusters = new Set();
  return nextStories.filter(story => {
    const clusterKey = `${story.category}:${storyFingerprint(story)}`;
    if (seenUrls.has(story.url) || seenClusters.has(clusterKey)) return false;
    seenUrls.add(story.url);
    seenClusters.add(clusterKey);
    return true;
  });
}

function allSourcesStories() {
  const ranked = [...stories].sort((a, b) => storyRank(b) - storyRank(a));
  const frontPage = ranked.filter(story => hasPublisherImage(story) || Number(story.engagementScore || 0) >= 55);
  return (frontPage.length >= 10 ? frontPage : ranked).slice(0, 10);
}

function ensureCategoryCoverage(nextStories) {
  const covered = [...nextStories];
  ["world", "politics", "entertainment", "sports", "local"].forEach(category => {
    if (!covered.some(story => story.category === category)) {
      covered.push(...fallbackStories.filter(story => story.category === category));
    }
  });
  return covered
    .map(assessStory)
    .filter(story => story.guardStatus === "cleared")
    .filter((story, index, all) => all.findIndex(match => match.url === story.url) === index)
    .sort((a, b) => storyRank(b) - storyRank(a));
}

async function recoverSportsStories() {
  if (stories.some(story => story.category === "sports")) return;
  const sportsOnly = await Promise.allSettled(feedSources.filter(source => source.category === "sports").map(loadFeed));
  const recovered = sportsOnly.flatMap(result => (result.status === "fulfilled" ? result.value : []));
  if (!recovered.length) return;
  stories = ensureCategoryCoverage([...stories, ...recovered]);
  refreshTicker().catch(() => {});
  renderStories();
}

function visibleStories() {
  if (activeFilter === "all") return allSourcesStories();
  return dedupeVisibleStories(stories
    .filter(story => story.category === activeFilter)
    .sort((a, b) => storyRank(b) - storyRank(a)));
}

function renderCounters(statusText = "Live") {
  const visible = visibleStories();
  const imageCount = stories.filter(hasPublisherImage).length;
  if (counters.sources) counters.sources.textContent = activeSourceCount;
  if (counters.stories) counters.stories.textContent = stories.length;
  if (counters.images) counters.images.textContent = imageCount;
  if (counters.status) counters.status.textContent = statusText;
  if (counters.boardStories) counters.boardStories.textContent = visible.length;
  if (counters.boardImages) counters.boardImages.textContent = visible.filter(hasPublisherImage).length;
}

function renderTicker() {
  const items = tickerItems.length ? tickerItems : allSourcesStories().slice(0, 8);
  tickerTrack.innerHTML = items
    .map(item => `<a href="${escapeHtml(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>`)
    .join("");
}

async function refreshTicker({ force = false } = {}) {
  const now = Date.now();
  if (!force && lastTickerRefreshAt && now - lastTickerRefreshAt < tickerRefreshMs) return false;
  try {
    const response = await fetch("/api/news");
    if (!response.ok) throw new Error("Ticker payload unavailable");
    const payload = await response.json();
    tickerItems = payload.ticker || [];
    lastTickerRefreshAt = Date.now();
    renderTicker();
    return true;
  } catch {
    lastTickerRefreshAt = Date.now();
    renderTicker();
    return false;
  }
}

function storyShareText(title = "") {
  return title ? `${title} via Censored Expressions` : "Censored Expressions";
}

function storyShareUrl(storyUrl = "") {
  const url = safeUrl(storyUrl);
  return url === "#" ? window.location.href : url;
}

function shareIntentUrl(platform, storyUrl, title = "") {
  const url = encodeURIComponent(storyShareUrl(storyUrl));
  const text = encodeURIComponent(storyShareText(title));
  if (platform === "x") return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  return storyShareUrl(storyUrl);
}

function shareIconMarkup(storyUrl, title = "", label = "story") {
  const url = storyShareUrl(storyUrl);
  const encodedTitle = escapeHtml(title || "Censored Expressions");
  return `
    <div class="share-icon-row" aria-label="Share ${escapeHtml(label)}">
      <a class="share-icon-button share-icon-x" href="${escapeHtml(shareIntentUrl("x", url, title))}" target="_blank" rel="noopener noreferrer" aria-label="Share ${encodedTitle} on X">X</a>
      <a class="share-icon-button share-icon-facebook" href="${escapeHtml(shareIntentUrl("facebook", url, title))}" target="_blank" rel="noopener noreferrer" aria-label="Share ${encodedTitle} on Facebook">f</a>
      <button class="share-icon-button share-icon-more" type="button" data-share-url="${escapeHtml(url)}" data-share-title="${encodedTitle}" aria-label="Share or copy ${encodedTitle}">
        <span aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function renderStories() {
  const visible = visibleStories();
  if (!visible.length) {
    grid.innerHTML = '<p class="empty-state">No stories loaded for this filter yet. Try another source group or refresh the board.</p>';
    renderCounters(stories.length ? "Filtered" : "Loading");
    return;
  }

  grid.innerHTML = visible
    .map((story, index) => {
      const storyUrl = safeUrl(story.url);
      const imageUrl = safeUrl(displayImage(story));
      const isSaved = saved.has(story.url) || saved.has(storyUrl);
      const dateLabel = storyDate(story.published)
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(story.published))
        : "Latest";
      return `
        <article class="story-card ${index === 0 && activeFilter === "all" ? "featured" : ""}">
          <a class="story-image" href="${escapeHtml(storyUrl)}" target="_blank" rel="noopener noreferrer">
            <img src="${escapeHtml(imageUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />
            ${hasPublisherImage(story) ? "" : '<span class="image-fallback-label">Source link</span>'}
          </a>
          <div class="story-topline">
            <span class="category-pill">${escapeHtml(story.source)}</span>
            <span>${escapeHtml(story.engagementLabel || dateLabel)}</span>
          </div>
          ${story.market ? `<p class="market-line">${escapeHtml(story.market)}</p>` : ""}
          <h3>${escapeHtml(story.title)}</h3>
          <p>${escapeHtml(story.summary)}</p>
          <div class="story-actions">
            <a class="story-button" href="${escapeHtml(storyUrl)}" target="_blank" rel="noopener noreferrer">Read story</a>
            ${shareIconMarkup(storyUrl, story.title, "story")}
            <button class="${isSaved ? "saved" : ""}" type="button" data-save="${escapeHtml(storyUrl)}">
              ${isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
  renderCounters();
}

function searchResultMarkup(result) {
  const url = safeUrl(result.url);
  const sourceLabel = /ce generated article/i.test(result.type || "") ? "CE Media" : (result.source || "Media source");
  const dateLabel = result.published && storyDate(result.published)
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(result.published))
    : "";
  return `
    <article class="site-search-result">
      <div class="story-topline">
        <span class="category-pill">${escapeHtml(sourceLabel)}</span>
        <span>${escapeHtml([result.type, dateLabel].filter(Boolean).join(" - "))}</span>
      </div>
      <h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" data-search-interest data-result-title="${escapeHtml(result.title)}" data-result-source="${escapeHtml(result.source || "")}" data-result-type="${escapeHtml(result.type || "")}">${escapeHtml(result.title)}</a></h3>
      <p>${escapeHtml(result.summary || "Open result for more.")}</p>
      <a class="story-button" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" data-search-interest data-result-title="${escapeHtml(result.title)}" data-result-source="${escapeHtml(result.source || "")}" data-result-type="${escapeHtml(result.type || "")}">Open result</a>
    </article>
  `;
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

function pageWindow(page, totalPages) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function clientSearchTerms(query = "") {
  return String(query || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map(term => term.trim())
    .filter(term => term.length >= 2)
    .filter(term => !["the", "and", "for", "with", "from", "that", "this", "are", "was", "were"].includes(term))
    .slice(0, 12);
}

function clientSearchIntentTerms(terms = []) {
  const genericTerms = new Set(["news", "local", "latest", "current", "coverage", "story", "stories", "article", "articles", "update", "updates", "live", "today"]);
  const specificTerms = terms.filter(term => !genericTerms.has(term));
  return specificTerms.length ? specificTerms : terms;
}

function clientSearchScore(item = {}, terms = []) {
  const title = String(item.title || "").toLowerCase();
  const summary = String(item.summary || "").toLowerCase();
  const source = String(item.source || "").toLowerCase();
  return terms.reduce((score, term) => {
    if (title.includes(term)) score += 8;
    if (summary.includes(term)) score += 3;
    if (source.includes(term)) score += 1;
    return score;
  }, 0);
}

function clientSearchMatchMeta(item = {}, terms = []) {
  const intentTerms = clientSearchIntentTerms(terms);
  const title = String(item.title || "").toLowerCase();
  const summary = String(item.summary || "").toLowerCase();
  const source = String(item.source || "").toLowerCase();
  const searchable = `${title} ${summary} ${source}`;
  const matchedTerms = terms.filter(term => searchable.includes(term));
  const matchedIntentTerms = intentTerms.filter(term => searchable.includes(term));
  const titleMatches = terms.filter(term => title.includes(term)).length;
  const summaryMatches = terms.filter(term => summary.includes(term)).length;
  const sourceMatches = terms.filter(term => source.includes(term)).length;
  const coverage = terms.length ? matchedTerms.length / terms.length : 0;
  const intentCoverage = intentTerms.length ? matchedIntentTerms.length / intentTerms.length : 0;
  return {
    matchedTerms,
    matchedIntentTerms,
    matchCount: matchedTerms.length,
    intentMatchCount: matchedIntentTerms.length,
    matchCoverage: Number(coverage.toFixed(2)),
    intentCoverage: Number(intentCoverage.toFixed(2)),
    relevanceScore: Math.round((coverage * 35) + (intentCoverage * 35) + (titleMatches * 20) + (summaryMatches * 8) + (sourceMatches * 3))
  };
}

function clientPassesSearchIntent(result = {}, terms = []) {
  if (!Number(result.matchCount || 0)) return false;
  const intentTerms = clientSearchIntentTerms(terms);
  if (intentTerms.length > 1) return Number(result.intentCoverage || 0) >= 0.5;
  if (terms.length > 1 && intentTerms.length === 1) return Number(result.intentMatchCount || 0) >= 1;
  return Number(result.intentMatchCount || result.matchCount || 0) >= 1;
}

function clientDirectWebSearchFallback(query = "", terms = []) {
  if (!query || !terms.length) return [];
  const intentTerms = clientSearchIntentTerms(terms);
  return [
    ["Google News", `https://news.google.com/search?q=${encodeURIComponent(query)}`, 80],
    ["Google Search", `https://www.google.com/search?q=${encodeURIComponent(query)}`, 78],
    ["Bing News", `https://www.bing.com/news/search?q=${encodeURIComponent(query)}`, 76]
  ].map(([source, url, relevanceScore]) => ({
    title: `Search ${source} for "${query}"`,
    source,
    url,
    summary: `Open an exact ${source} search for ${query}.`,
    type: "Web search",
    matchedTerms: terms,
    matchedIntentTerms: intentTerms,
    matchCount: terms.length,
    intentMatchCount: intentTerms.length,
    matchCoverage: 1,
    intentCoverage: 1,
    relevanceScore,
    score: relevanceScore
  }));
}

function clientIsArticleSearchResult(result = {}) {
  return /live news|web news/i.test(String(result.type || ""));
}

function clientDedupeSearchResults(results = []) {
  const seen = new Set();
  const seenTitleSource = new Set();
  return results.filter(result => {
    const urlKey = String(result.url || "").toLowerCase();
    const titleKey = `${String(result.title || "").trim().toLowerCase()}::${String(result.source || "").trim().toLowerCase()}`;
    if (seen.has(urlKey) || seenTitleSource.has(titleKey)) return false;
    if (urlKey) seen.add(urlKey);
    if (titleKey !== "::") seenTitleSource.add(titleKey);
    return true;
  });
}

function clientSearchResults(query = "", page = 1) {
  const terms = clientSearchTerms(query);
  const pageSize = 10;
  if (!terms.length) return { query, page: 1, pageSize, totalResults: 0, totalPages: 0, results: [] };
  const localResults = [
    ...stories.map(story => {
      const match = clientSearchMatchMeta(story, terms);
      return {
        title: story.title,
        source: story.source,
        url: story.url,
        summary: story.summary,
        published: story.published,
        type: "Live news",
        matchedTerms: match.matchedTerms,
        matchCount: match.matchCount,
        matchCoverage: match.matchCoverage,
        relevanceScore: match.relevanceScore,
        score: match.relevanceScore + clientSearchScore(story, terms) + Number(story.engagementScore || 0) / 10
      };
    }),
    {
      title: "Creator Desk editorials",
      source: "Creator Desk",
      url: "./creator-desk.html",
      summary: "Open the Creator Desk archive for editorials and commentary related to current coverage.",
      type: "Editorial archive",
      ...clientSearchMatchMeta({
        title: "Creator Desk editorials",
        source: "Creator Desk",
        summary: "editorial commentary blog opinion creator desk archive"
      }, terms)
    },
    {
      title: "Censored Expressions newsletter",
      source: "Newsletter",
      url: "./newsletter.html",
      summary: "Open newsletter updates, archives, and reader signup.",
      type: "Newsletter archive",
      ...clientSearchMatchMeta({
        title: "Censored Expressions newsletter",
        source: "Newsletter",
        summary: "newsletter email signup archive reader updates"
      }, terms)
    }
  ]
    .map(result => ({ ...result, score: Number(result.score || 0) || Number(result.relevanceScore || 0) }))
    .filter(result => result.title && result.url && clientPassesSearchIntent(result, terms) && result.score > 0)
    .sort((a, b) => b.intentCoverage - a.intentCoverage || b.matchCoverage - a.matchCoverage || b.relevanceScore - a.relevanceScore || b.score - a.score || storyDate(b.published) - storyDate(a.published));
  const exactFallback = clientDirectWebSearchFallback(query, terms);
  const articleResults = localResults.filter(clientIsArticleSearchResult);
  const archiveResults = localResults.filter(result => !clientIsArticleSearchResult(result));
  const finalResults = clientDedupeSearchResults(articleResults.length
    ? (localResults.length < pageSize ? [...localResults, ...exactFallback] : localResults)
    : archiveResults.length ? [...exactFallback, ...archiveResults]
      : exactFallback);
  const totalResults = finalResults.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const safePage = totalPages ? Math.min(Math.max(1, Number(page) || 1), totalPages) : 1;
  return {
    query,
    page: safePage,
    pageSize,
    totalResults,
    totalPages,
    results: finalResults.slice((safePage - 1) * pageSize, safePage * pageSize)
  };
}

function renderSearchPages(payload) {
  if (!searchPages) return;
  if (!payload.totalPages || payload.totalPages <= 1) {
    searchPages.hidden = true;
    searchPages.innerHTML = "";
    return;
  }
  const pages = pageWindow(payload.page, payload.totalPages);
  searchPages.hidden = false;
  searchPages.innerHTML = `
    <button type="button" data-search-page="${Math.max(1, payload.page - 1)}" ${payload.page <= 1 ? "disabled" : ""}>Previous</button>
    ${pages.map(page => `<button type="button" data-search-page="${page}" class="${page === payload.page ? "active" : ""}">${page}</button>`).join("")}
    <button type="button" data-search-page="${Math.min(payload.totalPages, payload.page + 1)}" ${payload.page >= payload.totalPages ? "disabled" : ""}>Next</button>
  `;
}

async function runSiteSearch(page = 1) {
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
    if (!stories.length && feedLoadPromise) await feedLoadPromise.catch(() => {});
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=${encodeURIComponent(page)}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Search unavailable");
    const fallbackPayload = !payload.results?.length ? clientSearchResults(query, page) : null;
    const displayPayload = fallbackPayload?.results?.length ? fallbackPayload : payload;
    activeSearchPage = displayPayload.page || page;
    searchMeta.textContent = displayPayload.totalResults
      ? `${displayPayload.totalResults} result${displayPayload.totalResults === 1 ? "" : "s"} for "${displayPayload.query}"`
      : `No results found for "${displayPayload.query}"`;
    searchResults.innerHTML = displayPayload.results?.length
      ? displayPayload.results.map(searchResultMarkup).join("")
      : '<p class="empty-state">No matching results yet. Try another term.</p>';
    renderSearchPages(displayPayload);
  } catch {
    const fallbackPayload = clientSearchResults(query, page);
    activeSearchPage = fallbackPayload.page || page;
    searchMeta.textContent = fallbackPayload.totalResults
      ? `${fallbackPayload.totalResults} local result${fallbackPayload.totalResults === 1 ? "" : "s"} for "${fallbackPayload.query}"`
      : "Search is temporarily unavailable.";
    searchResults.innerHTML = fallbackPayload.results?.length
      ? fallbackPayload.results.map(searchResultMarkup).join("")
      : '<p class="empty-state">Try another term or refresh stories.</p>';
    renderSearchPages(fallbackPayload);
  }
}

function saveStories() {
  localStorage.setItem("savedStories", JSON.stringify([...saved]));
}

async function refreshFeeds() {
  refreshButton.textContent = "Refreshing...";
  if (counters.status) counters.status.textContent = "Loading";
  try {
    const response = await fetch("/api/news?refresh=1");
    if (!response.ok) throw new Error("News endpoint unavailable");
    const payload = await response.json();
    stories = ensureCategoryCoverage(payload.stories || []);
    activeSourceCount = payload.sources?.length || feedSources.length;
    if (!lastTickerRefreshAt || Date.now() - lastTickerRefreshAt >= tickerRefreshMs) {
      tickerItems = payload.ticker || [];
      lastTickerRefreshAt = Date.now();
      renderTicker();
    }
    renderStories();
    renderCounters(payload.status === "fallback" ? "Fallback" : "Live");
    recoverSportsStories();
    refreshButton.textContent = "Refresh stories";
    return;
  } catch {
    const results = await Promise.allSettled(feedSources.map(loadFeed));
  const loaded = results.flatMap(result => (result.status === "fulfilled" ? result.value : []));
  stories = ensureCategoryCoverage(loaded.length ? loaded : fallbackStories);
  }
  refreshTicker().catch(() => {});
  renderStories();
  refreshButton.textContent = "Refresh stories";
}

filters.forEach(button => {
  button.addEventListener("click", () => {
    filters.forEach(filter => filter.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderStories();
  });
});

document.addEventListener("click", event => {
  const shareButton = event.target.closest("[data-share-url]");
  if (shareButton) {
    const url = storyShareUrl(shareButton.dataset.shareUrl || "");
    const title = shareButton.dataset.shareTitle || "Censored Expressions";
    if (navigator.share) {
      navigator.share({ title, text: storyShareText(title), url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        shareButton.classList.add("share-copied");
        window.setTimeout(() => { shareButton.classList.remove("share-copied"); }, 1600);
      }).catch(() => window.open(shareIntentUrl("x", url, title), "_blank", "noopener"));
    } else {
      window.open(shareIntentUrl("x", url, title), "_blank", "noopener");
    }
    return;
  }
  const saveUrl = event.target.dataset.save;
  if (!saveUrl) return;
  if (saved.has(saveUrl)) saved.delete(saveUrl);
  else saved.add(saveUrl);
  saveStories();
  renderStories();
});

grid.addEventListener("error", handleImageError, true);

refreshButton.addEventListener("click", refreshFeeds);
searchForm?.addEventListener("submit", event => {
  event.preventDefault();
  runSiteSearch(1);
});
searchPages?.addEventListener("click", event => {
  const button = event.target.closest("[data-search-page]");
  if (!button || button.disabled) return;
  runSiteSearch(Number(button.dataset.searchPage || activeSearchPage));
});
searchResults?.addEventListener("click", event => {
  const link = event.target.closest("[data-search-interest]");
  if (link) recordSearchInterest(link);
});

let seconds = 30;
window.setInterval(() => {
  seconds = seconds <= 1 ? 30 : seconds - 1;
  const countdown = document.querySelector("[data-countdown]");
  if (countdown) countdown.textContent = seconds;
}, 1000);

feedLoadPromise = refreshFeeds();
window.setInterval(() => {
  refreshTicker().catch(() => {});
}, tickerRefreshMs);
