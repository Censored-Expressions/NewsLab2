const newsletterForm = document.querySelector("[data-newsletter-form]");
const newsletterStatus = document.querySelector("[data-newsletter-status]");
const archiveGrid = document.querySelector("[data-newsletter-archive]");
const refreshArchiveButton = document.querySelector("[data-refresh-archive]");
const newsletterHero = document.querySelector("[data-newsletter-hero]");

const newsletterBackgrounds = [
  "./assets/creator-bg-speak-free.png",
  "./assets/creator-bg-unmuted.png",
  "./assets/creator-bg-no-filter.png",
  "./assets/creator-bg-break-silence.png",
  "./assets/creator-bg-truth-out-loud.png"
];

if (newsletterHero) {
  const selected = newsletterBackgrounds[Math.floor(Math.random() * newsletterBackgrounds.length)];
  newsletterHero.style.setProperty("--newsletter-bg", `url("${selected}")`);
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

function setStatus(message, tone = "neutral") {
  if (!newsletterStatus) return;
  newsletterStatus.textContent = message;
  newsletterStatus.dataset.tone = tone;
}

function archiveIssueMarkup(issue) {
  const preview = issue.previewBullets?.length
    ? issue.previewBullets.slice(0, 3)
    : (issue.sections || []).flatMap(section => section.paragraphs || []).slice(0, 3);
  const fallbackPreview = issue.sections?.[0]?.items?.slice(0, 3).map(item => item.title) || [];
  const previewLines = preview.length ? preview : fallbackPreview;
  return `
    <article class="newsletter-archive-card">
      <p class="eyebrow">${escapeHtml(issue.weekLabel || "Weekly issue")}</p>
      <h3>${escapeHtml(issue.title || "Censored Expressions Weekly Signal")}</h3>
      <ul>
        ${previewLines.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <details>
        <summary>Read issue</summary>
        <div class="newsletter-issue-body">${issue.html || ""}</div>
      </details>
    </article>
  `;
}

async function loadArchive() {
  if (!archiveGrid) return;
  archiveGrid.innerHTML = '<p class="empty-state">Loading newsletter archive...</p>';
  try {
    const response = await fetch("/api/newsletter/archive");
    if (!response.ok) throw new Error("Archive unavailable");
    const payload = await response.json();
    const issues = payload.newsletters || [];
    archiveGrid.innerHTML = issues.length
      ? issues.map(archiveIssueMarkup).join("")
      : '<p class="empty-state">No archived newsletters yet. The first issue will appear soon.</p>';
  } catch {
    archiveGrid.innerHTML = '<p class="empty-state">Newsletter archive is temporarily unavailable.</p>';
  }
}

newsletterForm?.addEventListener("submit", async event => {
  event.preventDefault();
  const formData = new FormData(newsletterForm);
  const payload = Object.fromEntries(formData.entries());
  setStatus("Saving subscription...");

  try {
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setStatus((result.errors || ["Subscription could not be saved."]).join(" "), "error");
      return;
    }
    newsletterForm.reset();
    setStatus("You're subscribed. Watch for the weekly signal in your inbox.", "success");
  } catch {
    setStatus("Subscription could not be saved right now. Try again shortly.", "error");
  }
});

refreshArchiveButton?.addEventListener("click", loadArchive);
loadArchive();
