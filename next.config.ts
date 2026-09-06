import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * `frame-src` is deliberately narrow: only the one embed host we actually use
 * may be framed. `frame-ancestors 'none'` stops anyone framing Kino in turn.
 * 'unsafe-inline'/'unsafe-eval' in script-src are required by Next's inlined
 * bootstrap and by the dev overlay; tightening them further needs a nonce.
 */
const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://image.tmdb.org",
    "font-src 'self' data:",
    "connect-src 'self' https://api.themoviedb.org",
    "worker-src 'self'",
    "frame-src https://vidlink.pro",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
].join("; ");

const baseSecurityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
];

const securityHeaders = [
    { key: "Content-Security-Policy", value: contentSecurityPolicy },
    ...baseSecurityHeaders,
];

const nextConfig: NextConfig = {
    // A package-lock.json in the parent directory made Next infer the wrong
    // workspace root; pin it to this project.
    turbopack: { root: __dirname },

    // Don't advertise the framework version.
    poweredByHeader: false,

    images: {
        // Left unoptimized on purpose. Commit 2021ff4 turned this on to fix
        // broken images in production, most likely a Vercel image-optimization
        // quota limit; flipping it back blind would risk reintroducing that.
        //
        // The actual payload problem was never the optimizer — it was requesting
        // `t/p/original` (frequently 2-5 MB) for every backdrop. All image URLs
        // now go through tmdbImage() in lib/tmdb.ts and ask TMDB for a size that
        // matches the slot (w1280 backdrops, w500 posters, w185 profiles), which
        // is where the bulk of the saving is.
        //
        // To re-enable: drop `unoptimized`, confirm images still load on a
        // preview deploy, and watch the optimization quota.
        unoptimized: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "image.tmdb.org",
                pathname: "/t/p/**",
            },
        ],
    },

    async headers() {
        return [
            // A service worker inherits the CSP delivered with its own script.
            // `upgrade-insecure-requests` in that context breaks registration on
            // plain-http origins (local dev, LAN testing), so the worker script
            // gets the same hardening minus the page CSP.
            { source: "/sw.js", headers: baseSecurityHeaders },
            { source: "/:path((?!sw\\.js$).*)", headers: securityHeaders },
        ];
    },
};

export default nextConfig;
