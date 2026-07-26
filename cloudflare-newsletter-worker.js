import { EmailMessage } from "cloudflare:email";

const textEncoder = new TextEncoder();

function json(status, body) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function encodeBase64(value = "") {
  const bytes = textEncoder.encode(String(value));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/.{1,76}/g, "$&\r\n").trim();
}

function headerLine(name, value) {
  return `${name}: ${String(value || "").replace(/[\r\n]+/g, " ").trim()}`;
}

function buildMime({ from, to, replyTo, subject, html, text, unsubscribeUrl }) {
  const mixedBoundary = `ce_mixed_${crypto.randomUUID()}`;
  const altBoundary = `ce_alt_${crypto.randomUUID()}`;
  const cleanText = `${text || ""}\n\nUnsubscribe: ${unsubscribeUrl}`;
  const cleanHtml = `${html || `<p>${escapeHtml(text || "")}</p>`}
<hr>
<p style="font-size:12px;color:#555">You are receiving this because you subscribed to Censored Expressions. <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a>.</p>`;

  return [
    headerLine("From", from),
    headerLine("To", to),
    headerLine("Reply-To", replyTo || from),
    headerLine("Subject", subject),
    "MIME-Version: 1.0",
    headerLine("List-Unsubscribe", `<${unsubscribeUrl}>`),
    "List-Unsubscribe-Post: List-Unsubscribe=One-Click",
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    "",
    `--${mixedBoundary}`,
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    "",
    `--${altBoundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64(cleanText),
    "",
    `--${altBoundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64(cleanHtml),
    "",
    `--${altBoundary}--`,
    "",
    `--${mixedBoundary}--`,
    ""
  ].join("\r\n");
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return json(405, { ok: false, error: "POST required." });
    }

    const expectedSecret = env.NEWSLETTER_WEBHOOK_SECRET || "";
    if (expectedSecret && request.headers.get("x-newsletter-webhook-secret") !== expectedSecret) {
      return json(403, { ok: false, error: "Newsletter webhook secret did not match." });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(400, { ok: false, error: "Invalid JSON." });
    }

    const to = String(payload.to || "").trim().toLowerCase();
    const subject = String(payload.subject || "").trim();
    const unsubscribeUrl = String(payload.unsubscribeUrl || "").trim();
    if (!isValidEmail(to)) return json(400, { ok: false, error: "Valid recipient email required." });
    if (!subject) return json(400, { ok: false, error: "Subject required." });
    if (!/^https:\/\/censoredexpressions\.com\/api\/newsletter\/unsubscribe\?token=/.test(unsubscribeUrl)) {
      return json(400, { ok: false, error: "Valid Censored Expressions unsubscribe URL required." });
    }

    if (!env.NEWSLETTER_EMAIL) {
      return json(500, { ok: false, error: "Cloudflare email binding NEWSLETTER_EMAIL is not configured." });
    }

    const from = env.NEWSLETTER_FROM || "Censored Expressions <info@censoredexpressionsmedia.com>";
    const replyTo = env.NEWSLETTER_REPLY_TO || from;
    const raw = buildMime({
      from,
      to,
      replyTo,
      subject,
      html: payload.html,
      text: payload.text,
      unsubscribeUrl
    });

    const message = new EmailMessage(from, to, raw);
    await env.NEWSLETTER_EMAIL.send(message);

    return json(200, {
      ok: true,
      provider: "cloudflare-email",
      to,
      subject
    });
  }
};
