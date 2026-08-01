const storyRoot = document.querySelector("[data-news-lab-story]");
const params = new URLSearchParams(window.location.search);
const requestedId = params.get("id") || "";
const storyCacheKey = "ceNewsLabOwnedStories";

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

function shareUrl(story = {}) {
  return window.location.href;
}

function shareMarkup(story = {}) {
  const title = encodeURIComponent(`${story.title || "Censored Expressions story"} via Censored Expressions`);
  const url = encodeURIComponent(shareUrl(story));
  return `
    <div class="share-icon-row" aria-label="Share story">
      <a class="share-icon-button share-icon-x" href="https://twitter.com/intent/tweet?url=${url}&text=${title}" target="_blank" rel="noopener noreferrer" aria-label="Share on X">X</a>
      <a class="share-icon-button share-icon-facebook" href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">f</a>
      <button class="share-icon-button share-icon-more" type="button" data-share-url="${escapeHtml(shareUrl(story))}" data-share-title="${escapeHtml(story.title || "Censored Expressions story")}" aria-label="Share or copy story">
        <span aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function categoryFromStoryId(id = "") {
  const value = String(id || "");
  const instantMatch = value.match(/^news_lab_instant_([^_]+)_/);
  const match = instantMatch || value.match(/^news_lab_([^:]+):/);
  const category = match?.[1] || "";
  return ["top", "world", "politics", "business", "technology", "sports", "entertainment", "local"].includes(category)
    ? category
    : "top";
}

function formatStoryTime(value = "") {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Latest update";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function renderStoryDateLine(story = {}) {
  const originalDate = story.originalPublishedAt || story.generatedAt || "";
  const updateDate = story.boardVisibility?.latestUpdateAt || story.lastUpdatedAt || "";
  const published = originalDate ? `Published ${formatStoryTime(originalDate)}` : "Published date unavailable";
  const updated = updateDate && updateDate !== originalDate ? `Updated ${formatStoryTime(updateDate)}` : "";
  return `
    <p class="news-lab-story-date-line">
      <span>${escapeHtml(published)}</span>
      ${updated ? `<span>${escapeHtml(updated)}</span>` : ""}
    </p>
  `;
}

function renderStoryUpdates(story = {}) {
  const updates = Array.isArray(story.storyUpdates) ? story.storyUpdates : [];
  if (!updates.length) return "";
  return `
    <section class="news-lab-update-log" aria-labelledby="story-updates-title">
      <h2 id="story-updates-title">Story Updates</h2>
      <p class="news-lab-update-note">The original CE Media article remains above. Updates are added here as the story changes.</p>
      <ol>
        ${updates.slice().reverse().map(update => `
          <li>
            <time datetime="${escapeHtml(update.updatedAt || "")}">${escapeHtml(formatStoryTime(update.updatedAt || update.latestUpdateAt))}</time>
            <strong>${escapeHtml(update.title || "Update")}</strong>
            <p>${escapeHtml(update.summary || "New information was added to this developing story.")}</p>
            <span>${escapeHtml([update.sourceCount ? `${update.sourceCount} source signals` : "", update.confidence ? `${Math.round(update.confidence)}% confidence` : ""].filter(Boolean).join(" • "))}</span>
          </li>
        `).join("")}
      </ol>
    </section>
  `;
}

function renderStory(story = {}) {
  const image = story.image || {};
  const imageCredit = publicImageCredit(image.credit || "");
  const paragraphs = (story.body || [story.summary]).filter(Boolean);
  document.title = `${story.title || "Censored Expressions Story"} | Censored Expressions`;
  storyRoot.innerHTML = `
    <div class="news-lab-article-hero">
      <p class="eyebrow">${escapeHtml(story.categoryLabel || story.category || "Top News")}</p>
      <h1>${escapeHtml(story.title || "Censored Expressions Story")}</h1>
      ${renderStoryDateLine(story)}
      ${shareMarkup(story)}
    </div>
    <figure class="news-lab-article-image">
      <img src="${escapeHtml(safeUrl(image.primary || image.fallback || "/assets/newsroom-hero.png"))}" data-fallback-src="${escapeHtml(safeUrl(image.fallback || "/assets/newsroom-hero.png"))}" alt="${escapeHtml(image.alt || "")}" />
      ${imageCredit ? `<figcaption>${escapeHtml(imageCredit)}</figcaption>` : ""}
    </figure>
    <section class="news-lab-article-body">
      ${paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </section>
    ${renderStoryUpdates(story)}
  `;
  storyRoot.querySelectorAll("img[data-fallback-src]").forEach(imageEl => {
    imageEl.addEventListener("error", () => {
      const fallback = imageEl.getAttribute("data-fallback-src");
      if (fallback && imageEl.src !== fallback) imageEl.src = fallback;
    }, { once: true });
  });
}

async function loadStory() {
  try {
    let cached = null;
    try {
      cached = JSON.parse(sessionStorage.getItem(storyCacheKey) || "null");
    } catch {
      cached = null;
    }
    const cachedStories = Array.isArray(cached?.stories) ? cached.stories : [];
    const cachedStory = cachedStories.find(item => item.id === requestedId) || null;
    if (cachedStory) {
      renderStory(cachedStory);
      return;
    }
    if (requestedId) {
      const storyResponse = await fetch(`/api/news-lab/story?id=${encodeURIComponent(requestedId)}`, { cache: "no-store" });
      if (storyResponse.ok) {
        const storyPayload = await storyResponse.json();
        if (storyPayload.story) {
          renderStory(storyPayload.story);
          return;
        }
      }
    }
    const category = categoryFromStoryId(requestedId);
    const response = await fetch(`/api/news-lab?category=${encodeURIComponent(category)}`, { cache: "no-store" });
    const payload = await response.json();
    const stories = payload.ownedStories || [];
    let story = requestedId ? stories.find(item => item.id === requestedId) : stories[0];
    if (!story && requestedId) {
      const allResponse = await fetch("/api/news-lab?category=all", { cache: "no-store" });
      const allPayload = await allResponse.json();
      story = (allPayload.ownedStories || []).find(item => item.id === requestedId) || null;
    }
    if (!story && !requestedId) story = stories[0];
    if (story) {
      renderStory(story);
      return;
    }
    if (!story) {
      storyRoot.innerHTML = '<p class="empty-state">No Censored Expressions story is ready yet.</p>';
      return;
    }
  } catch {
    storyRoot.innerHTML = '<p class="empty-state">The Censored Expressions story could not load right now.</p>';
  }
}

document.addEventListener("click", async event => {
  const shareButton = event.target.closest("[data-share-url]");
  if (!shareButton) return;
  try {
    if (navigator.share) {
      await navigator.share({ title: shareButton.dataset.shareTitle, url: shareButton.dataset.shareUrl });
    } else {
      await navigator.clipboard.writeText(shareButton.dataset.shareUrl);
    }
    shareButton.classList.add("copied");
    setTimeout(() => shareButton.classList.remove("copied"), 1200);
  } catch {
    shareButton.classList.remove("copied");
  }
});

loadStory();
