# 🎬 Kino Web

A movie and TV discovery front-end built with **Next.js 16** (App Router) and the TMDB API. Browse trending titles, filter by genre and streaming provider, and open a title's detail page with cast, synopsis and recommendations.

---

## Architecture

Kino is a read-only client over TMDB. There is no database, no authentication and no user accounts — every page renders from a live TMDB response, cached server-side.

```
Browser
  │
  ├─ Server Components ──► lib/tmdb.ts ──► api.themoviedb.org
  │                        (retry + backoff, 5 min revalidate)
  │
  ├─ Server Actions (app/actions.ts)
  │     fetchMovies       → infinite-scroll grid
  │     getSeasonDetails  → episode list
  │
  ├─ Route handler (app/api/search) → navbar autocomplete (rate limited)
  │
  └─ <iframe> ──► vidlink.pro   (playback, sandboxed)
```

The TMDB API key is **server-only**. It is never exposed to the browser.

### Routes

| Route | Rendering | Purpose |
|---|---|---|
| `/` | Static | Landing page (WebGL eye, cursor trail, genre flip-word) |
| `/browse` | ISR, 5 min | Home — hero carousel plus seven curated rows |
| `/movies` | ISR, 5 min | Movie rows |
| `/tv` | ISR, 5 min | TV rows |
| `/discover` | Dynamic | Filter by sort, genre and watch provider |
| `/category/[slug]` | Dynamic | A single category grid with infinite scroll |
| `/search?q=` | Dynamic | Search results |
| `/watch/[id]` | Dynamic | Player, metadata, cast, recommendations |

Unknown category slugs and unknown title ids return a real **404**.

### Project layout

```
app/            routes, layouts, server actions, robots.ts, sitemap.ts
components/     UI components
  navbar/       navbar subcomponents (drawer, suggestions, cards)
  ui/           reusable primitives (modal, skeleton, loader, glow card)
lib/
  tmdb.ts       TMDB client, image URL helper, category maps
  types.ts      TMDB response types
  fonts.ts      font loading (UI fonts vs landing-only display faces)
  haptics.ts    Android vibration helpers
public/         icons, fonts, service worker, offline page
docs/           code audit
```

---

## Getting started

**Prerequisites:** Node.js 18.18+ and a free [TMDB API key](https://www.themoviedb.org/settings/api).

```bash
git clone https://github.com/Water9977/KINO.git
cd KINO
npm install
cp .env.local.example .env.local   # then add your TMDB key
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `TMDB_API_KEY` | Yes | **Server-only.** Never prefix with `NEXT_PUBLIC_` — that ships the key to every visitor. |
| `TMDB_BASE_URL` | No | Defaults to `https://api.themoviedb.org/3`. |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute origin for canonical URLs, `sitemap.xml` and Open Graph tags. |

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | Typecheck, then lint |

> ESLint no longer runs as part of `next build`, so run `npm run check` before pushing.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack, React 19)
- **TypeScript** in strict mode
- **Tailwind CSS v4** (CSS-first `@theme`, no `tailwind.config`)
- **Framer Motion** for UI animation
- **ogl** (landing WebGL eye) and **GSAP** (cursor trail)
- **TMDB** for all metadata

---

## Notes and caveats

**Playback.** Video is not hosted by Kino. The player embeds a third-party provider in a sandboxed iframe that omits `allow-top-navigation` and `allow-popups`. Availability depends entirely on that provider.

**Fonts.** The six display faces in `public/fonts/` are used only on the landing page and are loaded with `preload: false` so other routes don't pay for them. They are third-party commercial faces — check their licences before deploying commercially.

**Images.** `images.unoptimized` is on; see the comment in `next.config.ts` for the reasoning and how to re-enable optimization safely.

**Testing.** There is no test suite yet.

See [`docs/CODE_AUDIT.md`](docs/CODE_AUDIT.md) for the full audit and the remaining backlog.

---

## License

MIT.
