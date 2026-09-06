# Kino Web — Complete Code Audit

**Repo:** https://github.com/Water9977/KINO
**Live:** https://kino-web-neon.vercel.app/
**Audited commit:** `0aa5cd0` (local `main`, in sync with `origin/main`)
**Date:** 2026-09-06
**Scope:** every `.ts` / `.tsx` / `.css` / `.js` file in `app/`, `components/`, `lib/`, `public/`, plus all config, plus live-site runtime verification.

**Original audit below.** A remediation pass followed; see the status table immediately after this line.

---

## ⚑ Remediation status — updated 2026-09-06

Everything below was fixed in the follow-up pass. Verified by `npm run check`
(0 lint problems, 0 type errors), a clean `next build`, and runtime testing
against a local production server.

### Fixed

| # | Finding | What changed |
|---|---|---|
| — | **Server 2 removed** (owner request) | `vidsrc.xyz` deleted; `vidlink.pro` is the only provider. The server switcher UI, the `isBollywood` heuristic and the dead "Report Issue" button are gone. Verified: 0 bundle references to `vidsrc`. |
| C2 | Unsandboxed iframe | **Attempted and reverted — see the correction below.** The iframe is unsandboxed as before; the CSP `frame-src` allowlist is what limits which origin can be framed. |
| C3 | ImageTrail leaks | Rewritten with a `destroy()` teardown: frame cancelled, listeners removed, one shared resize handler instead of 20, loop starts on first pointer move and z-index is bounded. |
| C4 | 2.53 MB fonts on every route | Display faces moved to `lib/fonts.ts` with `preload: false`, scoped to the landing page. **Verified: 0 `.otf` requests on `/browse`.** `NeueMetana` deleted (unused). |
| C5 | Oversized images | All image URLs go through `tmdbImage()`. Backdrops `original` → `w1280`, posters `w500`, stills `w400`, profiles `w185`. `unoptimized` left on deliberately — see the comment in `next.config.ts`. |
| H1 | Stale episodes on season change | Episodes clear immediately and an `ignore` flag discards out-of-order responses. Verified live: count drops to 0, then loads the right season. |
| H2 | Service worker serving stale HTML | No longer caches navigations at all. Hashed assets only, plus a new `/offline.html` fallback. Cache version bumped to `kino-v2`. |
| H3 | Soft 404s | `notFound()` + slug validation via `isKnownCategory()`. **Root cause of the 200 status was `app/(main)/loading.tsx`** opening a Suspense boundary that committed the response early; it now lives at `app/(main)/browse/loading.tsx`. Verified: `/category/bogus` → **404**, `/watch/999999999` → **404**. New `app/not-found.tsx`. |
| H4 | EvilEye main-thread block | Noise texture cached at module scope (computed once per page load, not per mount). WebGL failure degrades to nothing instead of crashing. Pointer listener skipped when `pupilFollow === 0`. Loop pauses on tab hide and renders one static frame under reduced motion. |
| H5 | Infinite-scroll termination | `fetchMovies` returns `hasMore` from TMDB's `total_pages`, clamps `page` to 500, and the grid has a real error state with a retry button. |
| H6 | Unprotected endpoints | `/api/search` rate limited (30 req/min per IP), query capped at 100 chars, responses cached. Server action clamps `page`. |
| H7 | No security headers | CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` added; `poweredByHeader: false`. CSP is deliberately **not** applied to `/sw.js` — `upgrade-insecure-requests` there breaks worker registration on http origins. |
| H8 | JSON-LD injection | `safeJsonLd()` escapes `<` before `dangerouslySetInnerHTML`. |
| M1/M2 | FilterBar state duplication | URL is now the single source of truth; no mirrored state, no sync effect. Each filter updates only its own param and preserves the path. |
| M3 | Ref read during render | Ken Burns variant derived from `currentIndex`. Unused imports and the phantom `isUserInteracting` removed. Carousel now genuinely pauses on hover/focus and on tab hide. |
| M4 | setState-in-effect reset | Deleted; the watch page passes `key={mediaType-id}` so the player remounts cleanly. |
| M5 | TV poster alt text | `alt={`${title} poster`}`. Null `poster_path` renders a proper "No poster" placeholder everywhere. |
| M6 | Global backdrop-blur kill | Scoped to `nav.fixed` only. Overlays and dropdowns keep their blur. `font-display` no-op and `text-rendering: optimizeSpeed` removed. |
| M7 | Reduced motion ignored | `useReducedMotion()` now gates the landing animations, the cursor trail, the WebGL eye and the carousel. |
| M8 | GlowCard | `"use client"` added, unused `innerRef` dropped, pointer writes batched into one animation frame. |
| M9 | Inconsistent caching | `/movies` and `/tv` moved from `force-dynamic` to ISR (300s), matching `/browse`. |
| M10 | Duplicated beta copy | Single `BETA_NOTICE` constant. |
| M11 | Double navbar in loading states | Both duplicate `loading.tsx` files deleted. |
| M12 | Dead skeleton branch | `MovieRow` simplified and converted to a server component. |
| — | Lint | **53 problems (37 errors) → 0.** `npm run lint`, `lint:fix`, `typecheck` and `check` scripts added, since `next build` no longer lints. |
| — | Types | `Promise<any>` gone. `lib/types.ts` replaced its dead scraper interfaces with real TMDB response types. |
| — | SEO | `app/robots.ts` and `app/sitemap.ts` added; `metadataBase`, canonicals and a title template set. Fixed doubled titles (`... | Kino | Kino`). |
| — | Navbar | 521 lines split into `components/navbar/*` plus a reusable accessible `Modal` (focus trap, Escape, scroll lock, focus restore). |
| — | A11y | Pinch-zoom re-enabled (`maximumScale`/`userScalable` removed). `CustomSelect` implements the listbox keyboard contract. Carousel dots have 24px targets. `sr-only` `<h1>` on browse/movies/tv. |
| — | Dead code | ~500 lines and 13 MB removed: `Hero`, `HeroSlide`, `StartButton`, `animated-shader-background`, `shimmer-button`, boilerplate SVGs, font `.zip` archives, `three` + `@types/three`, the `__kinoHapticTest` production debug hook, `hapticError`, unused CSS. |
| — | Config/docs | Dead `serverComponentsHmrCache` and the hardcoded LAN IP removed; `turbopack.root` pinned (silences the lockfile warning). Dead `OMDB_*` and `NEXT_PUBLIC_TMDB_IMAGE_URL` env vars removed. README rewritten — it previously told users to set `NEXT_PUBLIC_TMDB_API_KEY`, which would leak the key to browsers. |

### Correction to this audit

**C2’s recommended fix does not work with this provider.** Adding `sandbox`
to the player iframe made vidlink.pro refuse to play, rendering
"Please Disable Sandbox" in place of the video. It was reverted in `c0c5047`;
the iframe is back to `referrerPolicy="origin"` with no sandbox.

The residual risk described in C2 is therefore unmitigated at the iframe level:
the embed can still navigate the top window. What does constrain it now is the
CSP added in H7, whose `frame-src https://vidlink.pro` allowlist means no other
origin can be framed. The owner reports this provider serves no ads in practice.
**Do not re-add `sandbox` here without testing playback first.**

**The "692 KB HTML" figure in §8 and §11 overstated the problem.** That was the
uncompressed body. Measured over the wire the browse document is **~53 KB
gzipped** — the repeated Tailwind class strings compress extremely well. Payload
projection (`toCardItems`) was still added to drop TMDB fields nothing renders,
but this was never the high-priority issue the original framing implied.

### Still open

| Item | Why |
|---|---|
| **C1 — font licensing** | Owner elected to leave as-is. `BlackTheory.otf` remains personal-use-only. |
| **Service worker on HTTPS** | The new `sw.js` could not be verified locally: this browser blocks worker registration on plain-http localhost. The script is syntactically valid, serves 200 with the right content type, and all precached URLs resolve. **Confirm registration on the deploy preview.** |
| **Re-enabling image optimization** | Needs a preview deploy to confirm the original "broken images" cause is gone. See the comment in `next.config.ts`. |
| **Rate limiting across instances** | The limiter is per-instance in memory. A multi-instance deploy needs a shared store. |
| **Tests** | Still zero. |
| **Analytics** | Still none, so none of these perf wins are measurable in production yet. |


---

## Table of contents

1. [What this app actually is](#1-what-this-app-actually-is)
2. [Architecture map](#2-architecture-map)
3. [The "two servers" question](#3-the-two-servers-question)
4. [Feature inventory — what works, what is half-built, what is fake](#4-feature-inventory)
5. [Findings — Critical](#5-findings--critical)
6. [Findings — High](#6-findings--high)
7. [Findings — Medium](#7-findings--medium)
8. [Findings — Low / polish](#8-findings--low--polish)
9. [Dead code inventory (delete list)](#9-dead-code-inventory--delete-list)
10. [Hardcoded values inventory](#10-hardcoded-values-inventory)
11. [Lint & build status](#11-lint--build-status)
12. [What I could not verify — open questions for you](#12-what-i-could-not-verify--open-questions-for-you)
13. [Prioritized fix order](#13-prioritized-fix-order)

---

## 1. What this app actually is

Kino is a **Next.js 16.1.6 App Router** movie/TV browsing front-end. It is a metadata catalogue built on the TMDB API, with playback delegated entirely to two third-party pirate streaming embed sites via `<iframe>`.

There is no database, no auth, no user accounts, no watchlist, no persistence of any kind. Every page is a read-through to TMDB. The "Profile" feature is a static about-card with the author's social links — it is not a user profile.

**Stack as actually used:**

| Layer | Reality |
|---|---|
| Framework | Next.js 16.1.6, App Router, Turbopack, React 19.2.3 |
| Styling | Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config`) |
| Animation | Framer Motion 12 (heavy use), GSAP 3 (landing only), CSS keyframes |
| 3D / GL | `ogl` (landing EvilEye), `three` (**dead — unused**) |
| Data | TMDB v3 REST, server-side only, `api_key` query param |
| Playback | `vidlink.pro` + `vidsrc.xyz` iframes |
| Deploy | Vercel |
| Tests | **None.** Zero test files, zero test runner. |

**README is wrong.** It claims Next.js 14 (it's 16), describes a "Profile Card" as a feature, and instructs users to set `NEXT_PUBLIC_TMDB_API_KEY` — which would ship the API key to the browser. The actual code correctly uses server-only `TMDB_API_KEY`. Following the README as written creates a key-leak vulnerability.

---

## 2. Architecture map

### Route tree

```
app/
├── layout.tsx                       Root layout — 9 fonts, PWA meta, SW registrar
├── page.tsx                    /    Landing (client) — EvilEye + ImageTrail + FlipWords
├── manifest.ts                      PWA manifest (start_url: /browse)
├── actions.ts                       "use server" — fetchMovies, getSeasonDetails
├── api/search/route.ts              GET /api/search?q=  → top-5 autocomplete
└── (main)/                          Route group: Navbar + MobileTabBar chrome
    ├── layout.tsx                   Navbar + <main> + MobileTabBar
    ├── template.tsx                 Framer opacity fade on EVERY navigation
    ├── loading.tsx                  BrowsePageSkeleton
    ├── browse/page.tsx         /browse       ISR 5min — 7 parallel TMDB calls
    ├── movies/page.tsx         /movies       force-dynamic — 7 parallel TMDB calls
    ├── tv/page.tsx             /tv           force-dynamic — 6 parallel TMDB calls
    ├── discover/page.tsx       /discover     force-dynamic — filters + grid
    ├── search/page.tsx         /search?q=    server-rendered results grid
    ├── category/[slug]/page.tsx /category/*  category OR discover mode
    └── watch/[id]/page.tsx     /watch/:id    player + details + cast + similar
```

### Data flow

```
Browser
  │
  ├─ RSC page render ──► lib/tmdb.ts (TMDB singleton)
  │                        └─ tmdbFetch() : 3 retries, 8s timeout,
  │                           429 backoff, next:{revalidate:300}
  │                           └─► api.themoviedb.org/3/*
  │
  ├─ Server Action `fetchMovies` ──► CategoryGrid infinite scroll
  │      (fetches TWO TMDB pages per call, returns 40 items)
  │
  ├─ Server Action `getSeasonDetails` ──► VideoPlayer episode list
  │
  ├─ GET /api/search?q= ──► Navbar autocomplete (300ms debounce)
  │
  └─ <iframe> ──► vidlink.pro / vidsrc.xyz   ◄── the actual "streaming"
```

**Note the inconsistency:** `/browse` is ISR-cached (5 min) but `/movies` and `/tv` are `force-dynamic` — every single request re-fetches 6–7 TMDB endpoints with no caching. Same data, three different caching policies, no reason given.

### Client-side state map

There is no state manager. All state is local `useState` inside components. Nothing is shared, nothing persists across navigation. Consequences:

- Search query resets on every route change.
- Selected season/episode resets on every navigation.
- Filter state lives in the URL (good) *and* duplicated in `FilterBar` `useState` (bad — see §7).
- No "continue watching", no watch history — despite a commit (`2c15ab0`) that explicitly *removed* a broken timestamp-preservation feature.

---

## 3. The "two servers" question

You asked what the two servers are. There are two valid readings; both matter.

### Reading A — the two playback servers (this is what the UI calls "Server")

`components/VideoPlayer.tsx:19-34`

| UI label | Host | URL shape |
|---|---|---|
| ✨ **Quality** (index 0, default) | `vidlink.pro` | `/movie/{id}` or `/tv/{id}/{s}/{e}` + JW player theming params |
| 🚀 **Fast** (index 1) | `vidsrc.xyz` | `/embed/movie/{id}` or `/embed/tv/{id}/{s}/{e}` |

Both are **unlicensed third-party streaming aggregators**. Kino does not host, transcode, or proxy any video. It passes the TMDB id to these sites and renders their player in an iframe.

There is a hardcoded heuristic at `VideoPlayer.tsx:39`:
```ts
useState(isBollywood && mediaType === 'movie' ? 1 : 0)
```
"Bollywood" is derived in `watch/[id]/page.tsx:132` as `original_language === 'hi' || production_countries includes 'IN'`. Indian movies silently default to the vidsrc server. This is undocumented magic with no comment explaining why.

**Risks with this design, all currently unmitigated:**
- The iframe has **no `sandbox` attribute**. These aggregator embeds are notoriously ad-injected and are known to attempt pop-unders and top-level navigation. Without `sandbox`, the embed can call `window.top.location = ...` and hijack your users off your domain.
- `referrerPolicy="origin"` deliberately sends `https://kino-web-neon.vercel.app` to them on every play. That is a direct, traceable association between your domain and these hosts.
- If either host dies, is seized, or changes URL shape, playback silently breaks with no error state — the iframe just shows their error page inside your chrome.
- Legal exposure: hosting the index and the player chrome for unlicensed streams is the part of the pipeline that DMCA notices and host takedowns actually target. Vercel ToS prohibits it.

### Reading B — the Next.js server surfaces

1. **RSC / Server Components** — all pages fetch TMDB server-side. This is the right call; the API key never reaches the browser.
2. **Server Actions** (`app/actions.ts`) — `fetchMovies` and `getSeasonDetails`, called from client components.
3. **Route Handler** (`app/api/search/route.ts`) — the only REST endpoint, used for navbar autocomplete.

`fetchMovies` and `getSeasonDetails` are **unauthenticated, unrate-limited public Server Actions**. Anyone can script them. `fetchMovies` fires 2 TMDB requests per call with an attacker-controlled `page` number. `/api/search` likewise has no rate limit and proxies arbitrary query strings to TMDB. Your TMDB key is the thing that burns.

---

## 4. Feature inventory

### Works correctly
- TMDB browse rows (trending / popular / top-rated / upcoming / now-playing, movies + TV)
- Hero carousel with Ken Burns + auto-advance + dot navigation
- Search page + navbar autocomplete (debounced)
- Discover with sort / genre / provider filters via URL params
- Infinite-scroll category grid with duplicate filtering
- Watch page: metadata, genres, director, cast rail, recommendations
- TV season/episode selector wired to the player
- Dynamic `generateMetadata` + JSON-LD on watch pages
- PWA manifest, icons, service worker registration
- Mobile bottom tab bar with hide-on-scroll
- Haptics on Android Chrome

### Half-built / broken / cosmetic-only

| Feature | Status |
|---|---|
| **"Report Issue" button** | `VideoPlayer.tsx:192` — renders, has **no `onClick`**. Pure decoration. |
| **Notification bell** | Always shows an unread dot. Opens a hardcoded "Beta Version" string. No notification system exists. |
| **Profile card** | Not a profile. Author's LinkedIn/GitHub/Instagram + a 9-tap easter egg. |
| **Carousel pause-on-interaction** | `isUserInteracting` state declared, **never read or set**. The comment claims the feature exists. It does not. |
| **"Play Button Overlay" second state** | `VideoPlayer.tsx:129-146` — **unreachable**. `handleStartStreaming` sets both `hasUserConsent` and `isPlaying` to true in one go, so the `!isPlaying` branch can never render. Dead UI. |
| **Service worker offline mode** | Registers and caches, but has no offline fallback page and a permanently-pinned cache name. See §6. |
| **`lib/types.ts`** | An entire abandoned architecture — `Provider`, `StreamSource`, `MediaItem`, `Episode` interfaces for a self-hosted scraper that was never built. **Zero imports anywhere.** |
| **`TMDB.getImage()`** | Defined in `lib/tmdb.ts:48`, **never called**. All 10 image URLs are hardcoded inline instead. |
| **`components/Hero.tsx` + shader background** | A whole alternate landing page, superseded by `app/page.tsx`. Unreachable. Drags in the entire `three` dependency. |
| **`components/HeroSlide.tsx`** | Superseded by `HeroCarousel`. Zero imports. |
| **OMDB integration** | `OMDB_API_KEY` and `OMDB_BASE_URL` are in `.env.local`. **Zero references in code.** A live secret for a feature that does not exist. |
| **`reshuffle_sans` font** | Downloaded and unzipped into `public/fonts/`, never extracted to `.otf`, never referenced. |
| **`NeueMetana.otf`** | Loaded and **preloaded on every page**, `--font-neuemetana` referenced **nowhere**. 25 KB of pure waste on every request. |

---

## 5. Findings — Critical

### C1. Commercial font used with a personal-use-only licence, redistributed publicly

`public/fonts/BlackTheory.otf` (1.9 MB) ships in the public GitHub repo and is served from your production CDN.

Its own licence file, `public/fonts/black_theory/Agreement.txt`, says verbatim:

> "This font is ONLY for PERSONAL USE. NO COMMERCIAL USE ALLOWED!"
> "You are requires a license for PROMOTIONAL or COMMERCIAL use."

The other five Dirtyline/Creative Market faces (`BlackHeat`, `Sweetline`, `HumblleRoughCaps`, `HoodsonScript`, `Skywalker`) are free *demo* cuts with paid full versions — their readmes link to Creative Market purchase pages. Demo cuts are near-universally personal-use-only too, and **redistributing the binary via a public repo is a separate violation regardless of commercial status.**

This is used to render **one word at a time, for 2.8 seconds, on the landing page only.**

**Impact:** DMCA-able. Committed to a public repo, so it is permanently in git history even after deletion.

**Fix direction:** either buy the commercial licences, or replace all six with Google Fonts / SIL-OFL display faces of similar character. The word-per-genre effect does not depend on these specific files.

### C2. Playback iframes have no `sandbox` — third-party embeds can hijack the top window

`components/VideoPlayer.tsx:149-157`

```tsx
<iframe
  src={src}                        // vidlink.pro or vidsrc.xyz
  allowFullScreen
  referrerPolicy="origin"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
/>
```

No `sandbox` attribute. The embedded document has full ambient authority: it can navigate `window.top`, open pop-unders, and register its own service worker under its origin. Ad-monetised aggregator embeds do exactly this. Your users' first experience of a broken redirect will look like *your* site did it.

**Fix direction:** `sandbox="allow-scripts allow-same-origin allow-presentation allow-fullscreen"` (deliberately omitting `allow-top-navigation` and `allow-popups`), plus `referrerPolicy="no-referrer"`. Note this may break some embeds — test both providers.

### C3. Unbounded `requestAnimationFrame` loop and permanently-leaked listeners in `ImageTrail`

`components/ImageTrail.tsx`

Three separate leaks in one file:

1. **`render()` recurses via `requestAnimationFrame` forever with no cancellation** (line 108). There is no stored frame id, no `cancelAnimationFrame`, and the `useEffect` at line 167 **has no cleanup function at all**.
2. `document.addEventListener('mousemove'|'touchmove', handlePointerMove)` (lines 83-84) — never removed.
3. `new ImageItem()` attaches a `window` resize listener **per image** (line 39) — 20 listeners, never removed.

Consequences:
- React StrictMode in dev runs the effect twice → **two** concurrent rAF loops on the first paint.
- If `items` ever changes identity, a *new* `ImageTrailVariant2` is constructed while the old one keeps running forever. Loops accumulate.
- On the landing page the loop runs at 60fps burning battery even when the tab is idle, and continues after the component would otherwise unmount.
- `zIndexVal` increments without bound.

Also: `activeImagesCount` / `isIdle` are computed but the only thing they gate is a no-op (`if (this.isIdle && this.zIndexVal !== 1) this.zIndexVal = 1`).

**Fix direction:** store the frame id, add a full `useEffect` cleanup that cancels the frame and removes every listener, move the per-image resize handling to a single delegated listener.

### C4. 2.53 MB of unused display fonts preloaded on every single route

`app/layout.tsx:21-63` declares seven `next/font/local` faces and applies all seven CSS variables to `<html>`. `next/font/local` defaults to `preload: true`, so Next emits `<link rel="preload">` for all of them on **every page**.

Verified on the live site — loading `/browse`, which uses none of them, still downloads all seven:

```
BlackTheory-s.p.410abb96.otf       1,942,252 B
HumblleRoughCaps-s.p.b96ce91d.otf    306,608 B
Skywalker-s.p.13bc0fac.otf           186,504 B
HoodsonScript-s.p.2ac055e3.otf        38,664 B
Sweetline-s.p.c3bb87b3.otf            27,000 B
NeueMetana-s.p.a151e409.otf           25,244 B   ← referenced NOWHERE
BlackHeat-s.p.eb9b9970.otf             8,104 B
                              TOTAL  2,534,376 B
```

These fonts are used **only** by `CinemaFlipWords` on the landing page. Every other route pays 2.5 MB for nothing. On a 3G phone that is roughly 30 seconds of wasted bandwidth on a page that shows movie posters.

Compounding it: `display: "block"` (lines 25, 31, 37…) means text using them is **invisible** during the load window, not merely fallback-styled. The comment above them claims "the window is imperceptible" — on mobile it is not.

**Fix direction:** move the seven `localFont` declarations out of the root layout into the landing page only, or convert them to `.woff2` (typically 60–80% smaller than `.otf`) and subset them to the single word each one renders. `BlackTheory` in particular is 1.9 MB to draw the word "thriller".

### C5. `images.unoptimized: true` disables all image optimization site-wide

`next.config.ts:5`

```ts
images: { unoptimized: true, remotePatterns: [...] }
```

Introduced by commit `2021ff4` ("disable Vercel image optimization to resolve broken images"). Every `next/image` in the app now emits a raw `<img>` pointing at TMDB with:

- no resizing — `HeroCarousel.tsx:99` and `VideoPlayer.tsx:108` request `t/p/original` backdrops, which are frequently **2–5 MB JPEGs**, and serve them to phones
- no WebP/AVIF conversion
- no responsive `srcset`
- but you still pay `next/image`'s runtime and layout overhead for zero benefit

The `/browse` HTML response is **692 KB** (measured live) before a single image loads.

**Fix direction:** find and fix the original "broken images" cause (almost certainly the `remotePatterns` entry needing `pathname: "/t/p/**"`, or a Vercel optimization quota hit) rather than disabling the feature. At minimum, stop requesting `t/p/original` for anything that is not a desktop hero — `w1280` is plenty.

---

## 6. Findings — High

### H1. `VideoPlayer` shows stale episodes when switching seasons

`components/VideoPlayer.tsx:50-64`. Changing the season fires an async `getSeasonDetails`, but `episodes` is **never cleared first**. Between the click and the response landing, the grid keeps showing the *previous* season's episodes — clickable, and clicking one sets an episode number that gets sent to the embed for the *new* season. There is also no request-cancellation guard, so out-of-order responses can leave the wrong season's episodes rendered permanently.

**Fix:** `setEpisodes([])` on season change, plus an `ignore` flag in the effect (standard React race guard).

### H2. Service worker will serve stale HTML indefinitely after a deploy

`public/sw.js`

- `CACHE_NAME = "kino-v1"` is hardcoded and never bumped by the build.
- The `activate` handler deletes caches whose key `!== CACHE_NAME` — since the name never changes, **it never deletes anything**.
- Navigations are network-first and cache successful HTML responses (line 61-64).
- `/_next/static/*` is **cache-first** (line 44).

Failure mode: a returning user goes offline (or hits a network blip), gets served last week's cached HTML, which references `/_next/static/chunks/<old-hash>.js` — a file that no longer exists on the server and was never in the cache. Result: **white screen with no recovery path** until they manually clear site data.

Secondary: `.catch(() => caches.match(request))` (line 67) resolves to `undefined` when there is no cache entry, which `respondWith` treats as a network error. There is no `/offline` fallback page.

**Fix:** derive `CACHE_NAME` from the build id, and either stop caching navigations or version-scope them.

### H3. Soft 404s — invalid URLs return HTTP 200

Verified live:

```
GET /watch/999999999          → 200 OK, title "Not Found | Kino"
GET /category/thisdoesnotexist → 200 OK, renders "Movies" + popular movies
```

- `watch/[id]/page.tsx:58` renders a "CONTENT NOT FOUND" component instead of calling `notFound()`.
- `category/[slug]/page.tsx:25` does `titles[slug] || "Movies"` and `getMoviesByCategory` falls back to `/movie/popular` for **any** unknown slug (`lib/tmdb.ts:80`).

Consequence: an infinite space of crawlable, indexable, duplicate-content URLs all returning 200. Google will index `/category/anything`. This actively undermines the SEO work in `generateMetadata` and the JSON-LD block.

Compounded by: **no `robots.txt` and no `sitemap.xml`** (both return 404 on the live site), despite `generateMetadata` + structured data suggesting SEO was a goal.

**Fix:** `notFound()` in both places; validate the slug against the known `endpointMap` keys; add `app/robots.ts` and `app/sitemap.ts`.

### H4. `EvilEye` blocks the main thread on landing-page mount

`components/EvilEye.tsx:29-75`. `generateNoiseTexture(256)` runs **synchronously in the effect body** and performs 256 × 256 × 8 octaves ≈ **524,000 noise evaluations** in pure JS before the first frame. On a mid-range phone this is a visible multi-hundred-millisecond freeze on the very first thing a visitor sees.

Additionally:
- The effect dependency array (line 274) lists **all ten props**. Any prop change tears down the WebGL context, regenerates the noise texture, and rebuilds everything. Currently the landing page passes literals so it is stable — but this is a trap.
- `window.addEventListener('mousemove', ...)` runs globally even though the landing page passes `pupilFollow={0}` — the mouse tracking work is 100% wasted.
- There is **no WebGL-unavailable fallback**. `new Renderer()` throws on a device without WebGL, and since this is the landing page's centrepiece, the whole page errors out.

**Fix:** precompute the noise texture at build time into a PNG, or generate it in a worker; guard the WebGL construction in a try/catch with a static fallback; skip the mousemove listener when `pupilFollow === 0`.

### H5. `hasMore` never respects `total_pages`; the grid can spin forever

`components/CategoryGrid.tsx:23-48`. Termination relies solely on a page returning zero results. TMDB caps `page` at 500 and returns an *error object* (not an empty list) beyond it — which `tmdbFetch` converts to `{ results: [], success: false }`, so it happens to terminate. But:

- `total_pages` is available in every response and is simply ignored.
- Any TMDB outage returns `{ results: [] }` from the retry fallback → `hasMore` flips to `false` permanently, and the user sees "You've reached the end of the list" **after 20 items** with no indication anything failed.
- The `catch` block (line 43) logs to console and silently leaves the spinner visible forever. No user-facing error state anywhere in the app.

`useEffect(() => { if (inView) loadMoreMovies(); }, [inView])` also omits `loadMoreMovies` from deps (ESLint flags it) — it works only because of closure luck.

### H6. Unauthenticated, unrate-limited public data endpoints

- `app/actions.ts` — `fetchMovies(category, page, type, filters)` is a public Server Action. `page` is attacker-controlled and each call fans out to **two** TMDB requests.
- `app/api/search/route.ts` — no rate limit, no length cap on `q`, proxies straight to TMDB (two requests per call: movie + tv).

TMDB's free tier will rate-limit you, at which point `tmdbFetch` starts sleeping on 429s and every page in the app slows to a crawl for everyone. There is no circuit breaker.

**Fix:** rate-limit by IP at the edge, cap `page`, cap query length, and consider caching `/api/search` responses.

### H7. No security headers at all

Live response headers on `/browse`:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload   ← Vercel default
X-Powered-By: Next.js                                                    ← leaked
```

Missing: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options` / `frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`.

Given the app embeds untrusted third-party iframes and injects raw JSON-LD via `dangerouslySetInnerHTML`, a CSP is the single highest-value missing control. Also set `poweredByHeader: false`.

### H8. Raw JSON-LD injection with unescaped TMDB data

`app/(main)/watch/[id]/page.tsx:88-115` builds a JSON-LD blob with `JSON.stringify` inside `dangerouslySetInnerHTML`. `JSON.stringify` does **not** escape `<`, so a TMDB overview or actor name containing `</script>` breaks out of the script tag. TMDB data is user-submitted and community-edited.

**Fix:** escape `<` as `<` in the serialized string, or use the `application/ld+json` script with a sanitizing serializer.

---

## 7. Findings — Medium

### M1. `FilterBar` mirrors URL state into `useState` and syncs it back with an effect

`components/FilterBar.tsx:101-109`. Three `useState` values initialised from `searchParams`, then a `useEffect` that re-`setState`s them whenever `searchParams` changes. ESLint flags this as `react-hooks/set-state-in-effect` (cascading renders). The URL is already the source of truth — reading `searchParams` directly during render removes all three states and the effect.

### M2. `FilterBar` on `/category/[slug]` silently destroys the category

`updateFilters` always calls `params.set("sort_by", newSort)` and `router.push('?'+params)`. On `/category/trending`, touching *any* filter adds `sort_by` to the URL, which flips `category/[slug]/page.tsx:34` into `isDiscoverMode` — and from that point the page ignores the slug entirely and shows generic discover results, while the `<h1>` still says "Trending Now". The heading lies.

Also on that page the `<h1>` logic is `type === 'tv' && title === 'Movies' ? 'TV Shows' : title` — a string comparison against a fallback value, which is fragile and unreadable.

### M3. `HeroCarousel` reads a ref during render

`components/HeroCarousel.tsx:73` — `KEN_BURNS_VARIANTS[kennVariantRef.current]`. ESLint errors on this (`react-hooks/refs`). Refs are not reactive, so React 19's concurrent features can render a stale variant. It works today by accident.

Also in that file:
- `isUserInteracting` / `setIsUserInteracting` declared and never used — the "pause on interaction" comment describes a feature that was never written.
- `useMotionValue`, `useTransform`, `useSpring`, `Info` all imported and unused.
- The carousel does not pause when the tab is hidden — 8s interval + 10s Ken Burns transform keeps running in background tabs.
- `movies.length === 0` is checked at line 66, *after* `advanceSlide` already closed over `movies.length` — a zero-length array would produce `NaN` index if the guard were ever reordered.

### M4. `VideoPlayer` reset effect calls setState synchronously and has missing deps

`components/VideoPlayer.tsx:67-74`. Five `setState` calls directly in an effect body (ESLint error `react-hooks/set-state-in-effect`), deps are `[tmdbId]` only while the body reads `isBollywood` and `mediaType` (ESLint warning `exhaustive-deps`). Since the watch page remounts on navigation anyway, this entire effect is probably unnecessary — a `key` on the component would be cleaner.

### M5. `MovieCard` alt text is wrong for every TV show

`components/MovieCard.tsx:47` — `alt={movie.title || 'Movie Poster'}`. TV shows have `name`, not `title`, so **every TV poster's alt text is the literal string "Movie Poster"**. The correct value (`title`) is already computed three lines above at line 27 and simply not used.

Same file, line 46: no null guard on `poster_path`. Items without a poster produce `https://image.tmdb.org/t/p/w500null` — a broken image. The search page guards this (`search/page.tsx:41`) but `MovieRow` and `CategoryGrid` do not.

### M6. Global mobile CSS hack disables backdrop-blur everywhere

`app/globals.css:158-161`

```css
@media (max-width: 768px) {
  [class*="backdrop-blur"] {
    backdrop-filter: none !important;
  }
}
```

An attribute-substring selector applied to the entire document. It kills blur on the navbar (intended) *and* on the mobile menu, both notification cards, the profile card, the search dropdown, and the filter dropdown — all of which use translucent backgrounds and now render as semi-transparent panels with page content bleeding through. `[class*=]` selectors are also comparatively slow to match.

Related in the same file:
- `* { text-decoration-skip-ink: none; }` — universal selector for no measurable benefit.
- `html { font-display: swap; }` (line 215) — `font-display` is an `@font-face` **descriptor**, not an inheritable property. This is a **no-op**, and it contradicts the `display: "block"` set on all seven local fonts.
- `html { text-rendering: optimizeSpeed; }` — disables kerning and ligatures site-wide, on a site whose whole selling point is typography.

### M7. `prefers-reduced-motion` is not actually honoured

`app/globals.css:205-211` clamps CSS `animation-duration` and `transition-duration`. It does **nothing** to:

- the EvilEye WebGL rAF loop
- the ImageTrail GSAP rAF loop
- the Three.js shader loop (dead code, but still)
- every Framer Motion animation (JS-driven, not CSS)
- the 10-second Ken Burns transform on each hero slide
- the 8-second carousel auto-advance
- the 2.8-second genre word flip

For a user with vestibular sensitivity, the landing page is currently unusable. `useReducedMotion()` from Framer Motion needs to gate the JS animations.

### M8. `GlowCard` injects a global `<style>` block per instance

`components/ui/spotlight-card.tsx:162` renders `<style dangerouslySetInnerHTML>` inside the component. `Navbar` renders two `GlowCard`s, so the same global `[data-glow]` rules are injected twice. The selectors are unscoped and will match any element with a `data-glow` attribute anywhere in the app.

Also: the component uses `useEffect`/`useRef` but has **no `"use client"` directive** — it works only because `Navbar` is a client component and the boundary is inherited. Importing it from a server component would fail at build time.

`innerRef` (line 37) is created and attached but never read. The `pointermove` handler writes four CSS custom properties on every mouse event with no rAF throttle.

### M9. `/movies` and `/tv` are `force-dynamic` for no stated reason

Every request to `/movies` fires 7 TMDB calls; `/tv` fires 6. No ISR, no caching. `/browse` — which fetches nearly identical data — is ISR-cached at 5 minutes. Three routes, two policies, no rationale in code or commits. This is the main driver of TMDB quota burn.

### M10. Duplicated "Beta Version" notification content

The exact same heading, `Sparkles` icon and body copy appear twice in `Navbar.tsx` (desktop popover ~line 240, mobile card ~line 375). Copy changes must be made in two places. The whole thing is a hardcoded string that should be one constant, or removed.

### M11. Duplicate `loading.tsx` files rendering a second Navbar

`app/(main)/category/[slug]/loading.tsx` and `app/(main)/tv/loading.tsx` are **byte-identical** and both render `<Navbar />`. But `app/(main)/layout.tsx` already renders `<Navbar />`, and the layout persists across the loading state — so during navigation there are **two navbars stacked**. Both files should be deleted or reduced to just the loader.

### M12. `MovieRow` skeleton logic is unreachable

`components/MovieRow.tsx:21-23`:

```ts
const showSkeleton = isLoading || (!movies || movies.length === 0);
if (!isLoading && (!movies || movies.length === 0)) return null;
```

After the early return, `showSkeleton` is equivalent to `isLoading`. And no caller anywhere passes `isLoading` — every usage in the app omits it. So the entire skeleton branch (lines 40-59) is dead. `motion` is also imported and unused.

### M13. `template.tsx` adds a 500ms fade to every navigation

`app/(main)/template.tsx` wraps every page in a Framer opacity fade from 0. Combined with server-rendered pages this means every route change starts fully transparent and takes half a second to become readable — it makes the app *feel* slower than it is. This is visible in the live-site screenshots taken during this audit: pages appear near-black mid-navigation.

---

## 8. Findings — Low / polish

### Accessibility
- **No modal is accessible.** The mobile menu, both notification cards, and the profile card have no `role="dialog"`, no `aria-modal`, no focus trap, and no Escape-to-close. Only the search bar handles Escape (`expandable-search-bar.tsx:63-71`).
- `CustomSelect` (`FilterBar.tsx:21`) is a `<button>` + `<div>` masquerading as a select. No `role="combobox"`/`listbox`, no `aria-expanded`, no arrow-key navigation, no type-ahead. Keyboard users cannot operate the filters.
- Search suggestions use `onMouseDown` on a `<div>` (`Navbar.tsx:178`) — not keyboard-reachable, not a button, no `role="option"`.
- `Navbar.tsx:270` — the profile trigger is a `<div onClick>`, not a `<button>`. Not focusable, not keyboard-activatable.
- `Navbar.tsx:298` — the "Siddharth Sharma" easter-egg trigger is a `<span onClick>` with `cursor-default`.
- The cast rail (`watch/[id]/page.tsx:211`) uses `cursor-pointer` on non-interactive divs — implies clickability that does not exist.
- `viewport` sets `maximumScale: 1, userScalable: false` (`layout.tsx:69-70`). This blocks pinch-zoom, a WCAG 1.4.4 failure. Common in "app-like" designs but it locks out low-vision users.
- Slide-indicator buttons are 6px tall (`HeroCarousel.tsx:210`) — well below the 24×24 CSS px minimum target size.

### Code quality
- **`any` is used 30+ times.** `tmdbFetch` returns `Promise<any>`, so there is zero type safety on any TMDB response anywhere in the app. Every `movie.results`, `credits.crew`, `season.episodes` access is unchecked. TypeScript `strict: true` is on and providing almost no value as a result.
- `Movie` interface is defined in `components/MovieCard.tsx` and imported by `MovieRow` and `HeroCarousel`. Domain types living in a UI component is backwards — they belong in `lib/types.ts` (which currently holds only dead interfaces).
- `Navbar.tsx:214` — a fabricated event object to satisfy a handler signature:
  ```ts
  const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
  handleSearchSubmit(fakeEvent);
  ```
  Refactor `handleSearchSubmit` to take a plain query string.
- `Navbar.tsx` is **521 lines** holding: scroll state, resize state, search state, suggestions fetching, easter-egg counter, three overlay modals, and a nav. It should be at least four components.
- `easterEggClicks` is written but never read (ESLint warning) — the counter only matters inside the setter closure. Works, but confusing.
- `app/api/search/route.ts:22` — the error message is `"Search API offset error:"`. There is no offset in this function. Copy-paste residue.
- `app/(main)/movies/page.tsx:27-28` — a two-line comment explaining that no helper is needed. Delete.
- `components/CinemaFlipWords.tsx:18` — the doc comment says `crime — vintage amber (#D97706)`. The code at line 71 says `#00B140` (Joker green). The comment was not updated when commit `93412b0` changed the colour. Directly contradictory documentation.
- `lib/haptics.ts:14-24` — a debug hook that attaches `window.__kinoHapticTest` **in production** on every page load. Ship-blocking leftover.
- `hapticHeavy` is imported into `Navbar` and never called. `hapticError` is exported and never used anywhere.
- `components/ui/kinetic-dots-loader.tsx:3` — `cn` imported, unused.
- `components/ui/skeleton.tsx:69` — `style={{ animationDelay }}` is set on a wrapper `<div>` that has no animation; the shimmer lives on the nested `Skeleton`. The stagger effect described in the comment does not happen.
- `next.config.ts:12` — `allowedDevOrigins: ["192.168.29.217"]` hardcodes a personal LAN IP into a committed, public config file.
- `next.config.ts:15` — `experimental.serverComponentsHmrCache` is **rejected by Next 16.1.6**. The build prints `⨯ serverComponentsHmrCache`. Dead config.
- Two `package-lock.json` files exist (this repo and its parent directory), which makes Next infer the wrong workspace root — printed as a warning on every build.

### SEO
- No `robots.txt`, no `sitemap.xml` (both 404 live).
- No canonical URLs.
- `openGraph.url` and `metadataBase` are unset, so all OG image URLs are relative and will not resolve when scraped.
- No OG image on any page except `/watch/:id`.
- `/browse` HTML weighs **692 KB** — the full RSC payload for ~140 movie objects is serialized inline.
- Soft-404s create unbounded indexable duplicate content (see H3).

### Misc
- `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` — untouched `create-next-app` boilerplate, still committed.
- 13 MB of font `.zip` archives and unzipped folders sit untracked in `public/`. They are currently ignored by git *only because they are untracked* — nothing in `.gitignore` prevents someone running `git add .` and publishing all of them, including `reshuffle_sans` which is not even used.
- `manifest.ts:34` — `screenshots: []`. An empty array means Chrome's richer install prompt is skipped. Either populate or remove.
- `layout.tsx:128` — `<meta name="msapplication-starturl">` is a dead IE/Edge-legacy tag.

---

## 9. Dead code inventory — delete list

**Not deleted. This is the candidate list for your review.**

### Whole files (safe to delete — zero inbound imports)

| File | Lines | Why |
|---|---|---|
| `components/HeroSlide.tsx` | 83 | Superseded by `HeroCarousel`. Zero imports. |
| `components/Hero.tsx` | 32 | Alternate landing page. Zero imports. |
| `components/StartButton.tsx` | 18 | Only used by `Hero.tsx`. |
| `components/ui/animated-shader-background.tsx` | 129 | Only used by `Hero.tsx`. Sole consumer of `three`. |
| `components/ui/shimmer-button.tsx` | 95 | Only used by `StartButton.tsx`. |
| `lib/types.ts` | 36 | Abandoned scraper architecture. Zero imports. |
| `app/(main)/tv/loading.tsx` | 13 | Duplicate of category loading; double-renders Navbar. |
| `app/(main)/category/[slug]/loading.tsx` | 13 | Same. |
| `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg` | — | create-next-app boilerplate. |
| `public/fonts/*.zip` + unzipped folders | 13 MB | Source archives; only the `.otf` files are needed. |
| `public/fonts/NeueMetana.otf` | 25 KB | Loaded, preloaded, referenced nowhere. |
| `public/fonts/reshuffle_sans/` | 303 KB | Downloaded, never even extracted. |

**Deleting the five component files above removes the entire `three` + `@types/three` dependency** (~1 MB in `node_modules`, already tree-shaken from the client bundle but still in install/CI).

### Dead code blocks inside live files

| Location | What |
|---|---|
| `VideoPlayer.tsx:129-146` | The `!isPlaying` "Play Button Overlay" branch. **Unreachable.** |
| `VideoPlayer.tsx:192-194` | "Report Issue" button with no handler. |
| `HeroCarousel.tsx:25` | `isUserInteracting` / `setIsUserInteracting` — never used. |
| `HeroCarousel.tsx:6-7` | `useMotionValue`, `useTransform`, `useSpring`, `Info` imports. |
| `MovieRow.tsx:20-21, 40-59` | Skeleton branch — unreachable after the early return. |
| `MovieRow.tsx:7` | `motion` import. |
| `Navbar.tsx:4` | `Image` import. |
| `Navbar.tsx:12` | `hapticHeavy` import. |
| `lib/tmdb.ts:48-50` | `TMDB.getImage` — never called. |
| `lib/haptics.ts:14-24` | `window.__kinoHapticTest` debug hook. |
| `lib/haptics.ts:51-54` | `hapticError` — never used. |
| `ui/kinetic-dots-loader.tsx:3` | `cn` import. |
| `ui/spotlight-card.tsx:37` | `innerRef`. |
| `globals.css:62-73` | `.glass` and `.glass-dark` — never applied. |
| `globals.css:194-196` | `.movie-row-container` — never applied. |
| `globals.css:215` | `html { font-display: swap }` — no-op. |
| `ImageTrail.css:1-7` | `.content` rules fully overridden by inline styles. |
| `next.config.ts:15-18` | `experimental.serverComponentsHmrCache` — rejected by Next 16. |
| `.env.local` | `OMDB_API_KEY`, `OMDB_BASE_URL` — zero code references. |
| `.env.local` | `NEXT_PUBLIC_TMDB_IMAGE_URL` — only feeds dead `TMDB.getImage`. |

**Total identified dead code: roughly 500 lines + 13 MB of assets + one 1 MB npm dependency.**

---

## 10. Hardcoded values inventory

### Should be constants / config

| Value | Occurrences | Where |
|---|---|---|
| `#2563eb` (Kino blue) | **60+** | Everywhere, despite `--color-kino-blue` existing in `globals.css:6` |
| `#0a0a0a` (background) | **30+** | Everywhere, despite `--color-kino-dark` existing |
| `https://image.tmdb.org/t/p/{size}` | 10 files | 6 different sizes: `original`, `w500`, `w400`, `w300`, `w92`. `TMDB.getImage()` exists to solve this and is never used. |
| `8000` (fetch timeout) | 1 | `lib/tmdb.ts:10` |
| `300` (revalidate seconds) | 1 | `lib/tmdb.ts:9` |
| `3` (retry count) | 1 | `lib/tmdb.ts:5` |
| `1000` (min vote count) | 1 | `lib/tmdb.ts:135` |
| `watch_region=US` | 2 | `lib/tmdb.ts:131, 148` — hardcodes a US-only product |
| `8000` (carousel interval ms) | 1 | `HeroCarousel.tsx:36` |
| `2800` (word flip ms) | 1 | `CinemaFlipWords.tsx:83` |
| `300` (search debounce ms) | 1 | `Navbar.tsx:86` |
| `9` (easter egg tap count) | 1 | `Navbar.tsx:100` |
| `5` (autocomplete result cap) | 1 | `api/search/route.ts:20` |
| `30` (provider list cap) | 1 | `discover/page.tsx:34` |
| `8` (hero slide count) | 3 | browse, movies, tv pages |
| `12` (cast display cap) | 1 | `watch/[id]/page.tsx:78` |
| `10` (similar titles cap) | 1 | `watch/[id]/page.tsx:81-83` |
| `150` (keyboard-open px threshold) | 1 | `HeroCarousel.tsx:52` |
| `80` (scroll-scrub threshold) | 1 | `ImageTrail.tsx:73` |
| Search-bar breakpoints `400/640/768` → `200/250/320/450` | 1 | `Navbar.tsx:36-40` — duplicates Tailwind breakpoints in JS |

### Hardcoded content that should be data

| Value | Where |
|---|---|
| 40 TMDB poster paths (`SET_A`, `SET_B`) with movie names in comments | `app/page.tsx:14-58`. If TMDB rotates these paths, the landing page shows 40 broken images. |
| `Math.random() > 0.5` set selection | `app/page.tsx:61` — non-deterministic; also means two visits look like two different sites. |
| Genre IDs `28`, `35`, `16`, `18`, `10765` | `movies/page.tsx:23-24`, `tv/page.tsx:20-22` — magic numbers, no named constants |
| Six genre words + colours + fonts + emoji | `CinemaFlipWords.tsx:24-77` |
| Author's LinkedIn URL with `lipi` tracking param | `Navbar.tsx:283` — a personal analytics token committed to a public repo |
| Author's Instagram + GitHub URLs | `Navbar.tsx:290, 296` |
| "Beta Version" notification copy | `Navbar.tsx` — **twice** |
| `"Deep into the narrative, this episode unfolds with major twists."` | `VideoPlayer.tsx:277` — **fabricated episode synopsis** shown whenever TMDB has no overview. This presents invented content as real metadata. |
| Category title map | `category/[slug]/page.tsx:17-23` |
| `192.168.29.217` (personal LAN IP) | `next.config.ts:12` |
| `vidlink.pro` / `vidsrc.xyz` URLs | `VideoPlayer.tsx:24, 31` |

The fabricated episode synopsis at `VideoPlayer.tsx:277` deserves special mention — it is the only place in the app that presents generated text as if it were TMDB data. It should be an honest empty state.

---

## 11. Lint & build status

**Build:** ✅ passes. `npx tsc --noEmit` ✅ passes clean.

**ESLint:** ❌ **53 problems — 37 errors, 16 warnings.**

Next 16 no longer runs ESLint during `next build`, so **all 37 errors currently ship to production unnoticed.**

Breakdown:

| Rule | Count | Notes |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 24 | Concentrated in `lib/tmdb.ts`, `watch/[id]/page.tsx`, `CategoryGrid`, `EvilEye` |
| `react/no-unescaped-entities` | 7 | Raw `'` and `"` in JSX |
| `@typescript-eslint/no-unused-vars` | 12 | The dead imports listed in §9 |
| `react-hooks/set-state-in-effect` | 2 | `VideoPlayer.tsx:68`, `FilterBar.tsx:106` |
| `react-hooks/refs` | 1 | `HeroCarousel.tsx:73` — ref read during render |
| `react-hooks/exhaustive-deps` | 2 | `VideoPlayer.tsx:74`, `CategoryGrid.tsx:54` |
| `prefer-const` | 1 | `EvilEye.tsx:217` |
| `@next/next/no-img-element` | 1 | `Navbar.tsx:219` — raw `<img>` in suggestions |

**Build warnings:**
```
⚠ Next.js inferred your workspace root... Detected additional lockfiles
⨯ serverComponentsHmrCache          ← experimental flag rejected
```

**Live response measurements:**
```
GET /browse                    → 200, 692 KB HTML, X-Vercel-Cache: HIT
GET /watch/999999999           → 200  ← should be 404
GET /category/thisdoesnotexist → 200  ← should be 404
GET /robots.txt                → 404
GET /sitemap.xml               → 404
Fonts fetched on /browse       → all 7, 2,534,376 bytes, zero used on that page
```

---

## 12. What I could not verify — open questions for you

These are genuine unknowns. I did not guess at answers.

1. **Why was `images.unoptimized: true` added?** Commit `2021ff4` says "to resolve broken images" but does not say *which* images or *how* they broke. Was it a Vercel image-optimization quota limit, a `remotePatterns` mismatch, or something else? The fix depends entirely on the cause.

2. **Is this project intended to be public/commercial, or a private portfolio piece?** This changes the weight of C1 (font licensing) and the whole vidlink/vidsrc question dramatically. A private demo is a different risk profile than a live indexed site with a custom domain.

3. **Are you aware of the legal exposure of the two embed providers?** I have flagged it factually. Whether to keep it is your call, but it should be a decision, not an accident.

4. **What was the abandoned `lib/types.ts` architecture?** It describes a self-hosted scraper (`Provider.getSources()` returning `StreamSource[]` with `isM3U8`). Was the plan to build your own extractor and drop the iframes? That would change the whole architecture recommendation.

5. **What was OMDB for?** There is a live `OMDB_API_KEY` in `.env.local` with zero code. Was this for IMDb ratings, Rotten Tomatoes scores, something else? If it is abandoned, **rotate that key** — abandoned keys in `.env` files are how keys leak.

6. **Was `/movies` and `/tv` being `force-dynamic` deliberate?** It triples your TMDB request volume versus `/browse`. If there is a reason, it should be a comment; if not, it should be ISR.

7. **`BlackHeat.otf` is only 8 KB.** That is unusually small for an OTF. I did not verify its glyph coverage. Worth checking whether it actually renders the word "action" correctly on all platforms, or falls back silently.

8. **Which Ken Burns / motion effects do you actually want to keep?** Several of the performance findings (C4, H4, M7) trade visual richness against mobile load time. I can recommend, but the aesthetic call is yours.

9. **Is there any analytics?** I found none — no Vercel Analytics, no Plausible, no GA. So there is currently no way to know whether any of the perf problems above are hurting real users. Adding measurement should probably precede optimization.

10. **Do you want a real 404 page?** There is no `app/not-found.tsx`. Fixing H3 requires deciding what that page looks like.

---

## 13. Prioritized fix order

### Tier 1 — do before anything else
1. **C1** Replace or license the six Dirtyline/Creative Market fonts. Legal, not technical.
2. **C2** Add `sandbox` + `referrerPolicy="no-referrer"` to the playback iframe.
3. **C3** Fix the `ImageTrail` rAF loop and listener leaks — add a real `useEffect` cleanup.
4. **C4** Move the seven local fonts out of the root layout; convert to subsetted `.woff2`; delete `NeueMetana`.
5. Rotate the unused `OMDB_API_KEY`.

### Tier 2 — correctness
6. **H1** Clear `episodes` on season change + add a race guard.
7. **H3** Call `notFound()` for invalid watch ids and category slugs; add `app/not-found.tsx`.
8. **H2** Derive the SW cache name from the build id, or drop navigation caching.
9. **H5** Respect `total_pages`; add a real error state to `CategoryGrid`.
10. **M5** Fix TV poster alt text; guard null `poster_path` in `MovieRow`/`CategoryGrid`.
11. Remove the fabricated episode synopsis (`VideoPlayer.tsx:277`).

### Tier 3 — performance
12. **C5** Diagnose and reverse `images.unoptimized`; stop requesting `t/p/original` on mobile.
13. **H4** Precompute the EvilEye noise texture; add a WebGL fallback.
14. **M9** Make `/movies` and `/tv` ISR, consistent with `/browse`.
15. **M13** Remove or shorten the `template.tsx` navigation fade.
16. **M7** Gate all JS animations behind `useReducedMotion()`.

### Tier 4 — hardening & hygiene
17. **H6** Rate-limit the Server Actions and `/api/search`.
18. **H7** Add CSP + the other security headers; set `poweredByHeader: false`.
19. **H8** Escape `<` in the JSON-LD payload.
20. Type the TMDB responses — kill `Promise<any>` in `lib/tmdb.ts`. This alone eliminates ~24 of the 37 lint errors.
21. Delete everything in §9.
22. Fix the remaining lint errors and wire ESLint into CI (it no longer runs on build).
23. Rewrite the README to match reality — especially the `NEXT_PUBLIC_TMDB_API_KEY` instruction, which is actively harmful.
24. Accessibility pass on the four modals and `CustomSelect`.
25. Add `robots.ts` + `sitemap.ts`.
26. Split `Navbar.tsx` (521 lines) into four components.
27. Add any tests at all. There are currently zero.
