const creatorArchive = document.querySelector("[data-creator-archive]");
const refreshCreatorButton = document.querySelector("[data-refresh-creator]");
const creatorHero = document.querySelector("[data-creator-hero]");

const creatorBackgrounds = [
  "./assets/creator-bg-speak-free.png",
  "./assets/creator-bg-unmuted.png",
  "./assets/creator-bg-no-filter.png",
  "./assets/creator-bg-break-silence.png",
  "./assets/creator-bg-truth-out-loud.png"
];

if (creatorHero) {
  const selected = creatorBackgrounds[Math.floor(Math.random() * creatorBackgrounds.length)];
  creatorHero.style.setProperty("--creator-bg", `url("${selected}")`);
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function creatorShareText(title = "") {
  return title ? `${title} via Censored Expressions` : "Censored Expressions";
}

function creatorPostUrl(postId = "") {
  const safeId = String(postId || "").trim();
  const base = `${window.location.origin}${window.location.pathname}`;
  return safeId ? `${base}#${encodeURIComponent(safeId)}` : base;
}

function creatorShareIntentUrl(platform, url, title = "") {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(creatorShareText(title));
  if (platform === "x") return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  if (platform === "facebook") return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  return url;
}

function creatorShareIconMarkup(postId = "", title = "Creator Desk post") {
  const url = creatorPostUrl(postId);
  const encodedTitle = escapeHtml(title || "Creator Desk post");
  return `
    <div class="share-icon-row creator-post-share" aria-label="Share this Creator Desk post">
      <a class="share-icon-button share-icon-x" href="${escapeHtml(creatorShareIntentUrl("x", url, title))}" target="_blank" rel="noopener noreferrer" aria-label="Share ${encodedTitle} on X">X</a>
      <a class="share-icon-button share-icon-facebook" href="${escapeHtml(creatorShareIntentUrl("facebook", url, title))}" target="_blank" rel="noopener noreferrer" aria-label="Share ${encodedTitle} on Facebook">f</a>
      <button class="share-icon-button share-icon-more" type="button" data-share-url="${escapeHtml(url)}" data-share-title="${encodedTitle}" aria-label="Share or copy ${encodedTitle}">
        <span aria-hidden="true"></span>
      </button>
    </div>
  `;
}

function creatorPostBody(post) {
  const preview = post.items?.slice(0, 3) || [];
  const postId = post.id || post.dayId || post.weekId || "";
  return `
    <article class="creator-archive-card compact" id="${escapeHtml(postId)}" data-post-id="${escapeHtml(postId)}">
      <p class="eyebrow">${escapeHtml(post.dateLabel || post.weekLabel || "Creator Desk")}</p>
      <h3>${escapeHtml(post.title || "Creator Desk")}</h3>
      ${creatorShareIconMarkup(postId, post.title || "Creator Desk post")}
      <ul>
        ${preview.map((item, index) => `<li><span>Story ${index + 1}</span>${escapeHtml(item.title)}</li>`).join("")}
      </ul>
      <div class="newsletter-issue-body">${post.html || ""}</div>
      <section class="creator-comments" aria-label="Comments on ${escapeHtml(post.title || "Creator Desk post")}">
        <div class="creator-comments-head">
          <h4>Comments</h4>
          <span data-comment-count>Loading...</span>
        </div>
        <div class="creator-comment-list" data-comment-list>
          <p class="empty-state">Loading comments...</p>
        </div>
        <form class="creator-comment-form" data-comment-form>
          <input type="hidden" name="postId" value="${escapeHtml(postId)}" />
          <label>
            Name
            <input name="name" maxlength="60" placeholder="Reader" autocomplete="name" />
          </label>
          <label>
            Comment
            <textarea name="message" rows="3" maxlength="1200" required placeholder="Join the conversation"></textarea>
          </label>
          <button class="secondary-link" type="submit">Post comment</button>
          <p class="newsletter-status" data-comment-status></p>
        </form>
      </section>
    </article>
  `;
}

function groupPostsByMonth(posts) {
  return posts.reduce((groups, post) => {
    const key = post.monthKey || (post.dayId || post.weekId || "undated").slice(0, 7);
    const label = post.monthLabel || key;
    if (!groups[key]) groups[key] = { label, posts: [] };
    groups[key].posts.push(post);
    return groups;
  }, {});
}

function archiveMarkup(posts) {
  const groups = groupPostsByMonth(posts);
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, group], index) => `
      <details class="creator-month" ${index === 0 ? "open" : ""}>
        <summary>${escapeHtml(group.label)}</summary>
        <div class="creator-date-list">
          ${group.posts
            .sort((a, b) => String(b.dayId || b.weekId).localeCompare(String(a.dayId || a.weekId)))
            .map(post => `
              <details class="creator-date">
                <summary>${escapeHtml(post.dateLabel || post.weekLabel || "Creator Desk post")}</summary>
                ${creatorPostBody(post)}
              </details>
            `).join("")}
        </div>
      </details>
    `).join("");
}

async function loadCreatorArchive() {
  if (!creatorArchive) return;
  creatorArchive.innerHTML = '<p class="empty-state">Loading Creator Desk posts...</p>';
  try {
    const response = await fetch("/api/creator/archive");
    if (!response.ok) throw new Error("Creator Desk archive unavailable");
    const payload = await response.json();
    const posts = payload.posts || [];
    creatorArchive.innerHTML = posts.length ? archiveMarkup(posts) : '<p class="empty-state">Creator Desk posts will appear here.</p>';
    loadVisibleCommentLists();
  } catch {
    creatorArchive.innerHTML = '<p class="empty-state">Creator Desk archive is temporarily unavailable.</p>';
  }
}

function commentsMarkup(comments) {
  if (!comments.length) return '<p class="empty-state">No comments yet.</p>';
  return comments.map(comment => `
    <article class="creator-comment">
      <strong>${escapeHtml(comment.name || "Reader")}</strong>
      <time>${escapeHtml(new Date(comment.createdAt).toLocaleString())}</time>
      <p>${escapeHtml(comment.message || "")}</p>
    </article>
  `).join("");
}

async function loadCommentsForCard(card) {
  if (!card) return;
  const postId = card.dataset.postId || "";
  const list = card.querySelector("[data-comment-list]");
  const count = card.querySelector("[data-comment-count]");
  if (!postId || !list) return;
  try {
    const response = await fetch(`/api/creator/comments?postId=${encodeURIComponent(postId)}`);
    if (!response.ok) throw new Error("Comments unavailable");
    const payload = await response.json();
    const comments = payload.comments || [];
    list.innerHTML = commentsMarkup(comments);
    if (count) count.textContent = `${comments.length} comment${comments.length === 1 ? "" : "s"}`;
  } catch {
    list.innerHTML = '<p class="empty-state">Comments are temporarily unavailable.</p>';
    if (count) count.textContent = "";
  }
}

function loadVisibleCommentLists() {
  document.querySelectorAll("[data-post-id]").forEach(loadCommentsForCard);
}

creatorArchive?.addEventListener("submit", async event => {
  const form = event.target.closest("[data-comment-form]");
  if (!form) return;
  event.preventDefault();
  const status = form.querySelector("[data-comment-status]");
  const card = form.closest("[data-post-id]");
  const body = Object.fromEntries(new FormData(form).entries());
  if (status) {
    status.dataset.tone = "";
    status.textContent = "Posting comment...";
  }
  try {
    const response = await fetch("/api/creator/comments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Comment could not be posted.");
    form.reset();
    if (status) {
      status.dataset.tone = "success";
      status.textContent = "Comment posted.";
    }
    loadCommentsForCard(card);
  } catch (error) {
    if (status) {
      status.dataset.tone = "error";
      status.textContent = error.message || "Comment could not be posted.";
    }
  }
});

document.addEventListener("click", event => {
  const shareButton = event.target.closest("[data-share-url]");
  if (!shareButton) return;
  const url = shareButton.dataset.shareUrl || creatorPostUrl();
  const title = shareButton.dataset.shareTitle || "Creator Desk post";
  if (navigator.share) {
    navigator.share({ title, text: creatorShareText(title), url }).catch(() => {});
    return;
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      shareButton.classList.add("share-copied");
      window.setTimeout(() => { shareButton.classList.remove("share-copied"); }, 1600);
    }).catch(() => window.open(creatorShareIntentUrl("x", url, title), "_blank", "noopener"));
    return;
  }
  window.open(creatorShareIntentUrl("x", url, title), "_blank", "noopener");
});

refreshCreatorButton?.addEventListener("click", loadCreatorArchive);
loadCreatorArchive();
