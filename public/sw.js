/**
 * Kino service worker.
 *
 * Static assets are cache-first; everything else goes to the network.
 *
 * Deliberately does NOT cache HTML navigations. Next.js ships hashed asset
 * URLs, so a stale cached document references chunk hashes that no longer
 * exist on the server — which renders as a blank page the user cannot recover
 * from without clearing site data. Caching only immutable, hashed assets plus
 * an offline fallback avoids that failure mode entirely.
 *
 * CACHE_VERSION must be bumped whenever the precached set changes.
 */

const CACHE_VERSION = "kino-v2";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [OFFLINE_URL, "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_VERSION)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
            )
            .then(() => self.clients.claim())
    );
});

/** Immutable, content-hashed assets that are safe to serve from cache forever. */
function isHashedAsset(url) {
    return (
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/icon-") ||
        /\.(?:png|svg|webp|avif|woff2?|otf)$/.test(url.pathname)
    );
}

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Never cache RSC payloads, server actions or API routes.
    if (url.pathname.startsWith("/api/") || url.searchParams.has("_rsc")) return;

    if (isHashedAsset(url)) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
                        }
                        return response;
                    })
            )
        );
        return;
    }

    // Navigations: always network. On failure, show the offline page rather
    // than resolving to undefined (which surfaces as a generic network error).
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match(OFFLINE_URL).then((cached) => cached || Response.error())
            )
        );
    }
});
