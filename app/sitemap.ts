import type { MetadataRoute } from "next";
import { TMDB } from "@/lib/tmdb";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kino-web-neon.vercel.app";

export const revalidate = 86400;

const STATIC_ROUTES = ["", "/browse", "/movies", "/tv", "/discover"];
const CATEGORY_ROUTES = [
    "/category/trending",
    "/category/popular",
    "/category/top_rated",
    "/category/upcoming",
    "/category/now_playing",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticEntries: MetadataRoute.Sitemap = [
        ...STATIC_ROUTES.map((route) => ({
            url: `${siteUrl}${route || "/"}`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: route === "" || route === "/browse" ? 1 : 0.8,
        })),
        ...CATEGORY_ROUTES.map((route) => ({
            url: `${siteUrl}${route}`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.6,
        })),
    ];

    // Include currently trending titles so watch pages are discoverable.
    // The full TMDB catalogue is far too large to enumerate here.
    const [trendingMovies, trendingTv] = await Promise.all([
        TMDB.getTrending(),
        TMDB.getTvShowsByCategory("trending"),
    ]);

    const titleEntries: MetadataRoute.Sitemap = [
        ...(trendingMovies.results ?? []).map((m) => ({
            url: `${siteUrl}/watch/${m.id}`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        })),
        ...(trendingTv.results ?? []).map((t) => ({
            url: `${siteUrl}/watch/${t.id}?type=tv`,
            lastModified: now,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        })),
    ];

    return [...staticEntries, ...titleEntries];
}
