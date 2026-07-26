const CACHE_NAME = "ce-mobile-shell-v20-news-lab-root";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./news-lab.html",
  "./news-lab-story.html",
  "./news-analyzer.html",
  "./creator-desk.html",
  "./newsletter.html",
  "./legal.html",
  "./legal-documents.html",
  "./offline.html",
  "./styles.css",
  "./app.js",
  "./news-lab.js",
  "./news-lab-story.js",
  "./news-analyzer.js",
  "./creator-desk.js",
  "./newsletter.js",
  "./legal-downloads.js",
  "./ads.txt",
  "./manifest.webmanifest",
  "./assets/logo.png",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./assets/apple-touch-icon.png",
  "./assets/newsroom-hero.png",
  "./assets/pexels/newsroom-general.jpg",
  "./assets/pexels/weather-response.jpg",
  "./assets/pexels/legal-justice.jpg",
  "./assets/pexels/global-affairs.jpg",
  "./assets/pexels/family-community.jpg",
  "./assets/pexels/sports-competition.jpg",
  "./assets/pexels/culture-media.jpg",
  "./assets/pexels/business-economy.jpg",
  "./assets/pexels/government-civic.jpg",
  "./assets/pexels/credits.json",
  "./assets/creator-bg-speak-free.png",
  "./assets/creator-bg-unmuted.png",
  "./assets/creator-bg-no-filter.png",
  "./assets/creator-bg-break-silence.png",
  "./assets/creator-bg-truth-out-loud.png",
  "./Privacy_Policy.pdf",
  "./Terms_of_Service.pdf",
  "./AI_Content_Disclosure.pdf"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, fallbackUrl = "./offline.html") {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch {
    return (await cache.match(request)) || cache.match(fallbackUrl);
  }
}

async function networkOnly(request) {
  return fetch(request);
}

function isPrivateApiPath(pathname) {
  return pathname.startsWith("/api/learning")
    || pathname.startsWith("/api/optimization")
    || pathname.startsWith("/api/functionality")
    || pathname.startsWith("/api/revenue-growth")
    || pathname.startsWith("/api/framework-architecture")
    || pathname.startsWith("/api/code-patch-proposals")
    || pathname.startsWith("/api/article-memory")
    || pathname === "/api/integrity"
    || pathname === "/api/connectivity"
    || pathname === "/api/ai-shield"
    || pathname === "/api/ai-model"
    || pathname === "/api/feed-status"
    || pathname === "/api/creator/archive"
    || pathname === "/api/creator/generate"
    || pathname === "/api/creator/rewrite"
    || pathname === "/api/newsletter/generate"
    || pathname === "/api/newsletter/send";
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fresh = fetch(request)
    .then(response => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fresh;
}

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;

  if (url.pathname === "/owner-desk.html" || url.pathname === "/owner-desk.js") {
    event.respondWith(networkOnly(event.request));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    if (isPrivateApiPath(url.pathname) || url.pathname === "/api/search") {
      event.respondWith(networkOnly(event.request));
      return;
    }
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.pathname.endsWith(".pdf")) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  if (event.request.mode === "navigate" || url.pathname.endsWith(".html")) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.origin === self.location.origin && (url.pathname === "/app.js" || url.pathname === "/sw.js")) {
    event.respondWith(networkOnly(event.request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

