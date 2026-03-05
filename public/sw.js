/**
 * Kino Service Worker
 * Caches the app shell for fast repeat loads and basic offline support.
 * Strategy: Cache-first for static assets, network-first for API/pages.
 */

const CACHE_NAME = "kino-v1";
const STATIC_ASSETS = [
    "/",
    "/browse",
    "/icon-192.png",
    "/icon-512.png",
];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first for navigations & API, cache-first for static assets
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin requests (e.g. TMDB image CDN handled by Next/Image)
    if (request.method !== "GET") return;
    if (url.origin !== self.location.origin) return;

    // Static assets (images, fonts, js, css) → cache-first
    if (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/icon-") ||
        url.pathname.endsWith(".png") ||
        url.pathname.endsWith(".svg") ||
        url.pathname.endsWith(".woff2")
    ) {
        event.respondWith(
            caches.match(request).then((cached) => cached || fetch(request))
        );
        return;
    }

    // Everything else (pages, API routes) → network-first with cache fallback
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Cache successful page navigations
                if (response.ok && request.mode === "navigate") {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});
