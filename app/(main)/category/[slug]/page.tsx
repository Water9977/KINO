import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { TMDB, isKnownCategory, toCardItems } from "@/lib/tmdb";
import { hasOwnKey } from "@/lib/validate";
import type { MediaType } from "@/lib/types";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FilterBar } from "@/components/FilterBar";

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const CATEGORY_TITLES: Record<string, string> = {
    trending: "Trending Now",
    popular: "Popular",
    top_rated: "Top Rated",
    upcoming: "Upcoming Releases",
    now_playing: "Now Playing",
    on_the_air: "On The Air",
    airing_today: "Airing Today",
};

/** Own-property lookup so a slug like "constructor" can't return a function from the object. */
function categoryTitle(slug: string): string {
    return hasOwnKey(CATEGORY_TITLES, slug) ? CATEGORY_TITLES[slug] : "Browse";
}

function readType(value: string | string[] | undefined): MediaType {
    return value === "tv" ? "tv" : "movie";
}

function readParam(value: string | string[] | undefined): string | undefined {
    return typeof value === "string" && value !== "" ? value : undefined;
}

export async function generateMetadata({
    params,
    searchParams,
}: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const type = readType((await searchParams).type);

    if (!isKnownCategory(slug, type)) return { title: "Not Found" };

    const label = categoryTitle(slug);
    const suffix = type === "tv" ? "TV Shows" : "Movies";
    return {
        title: `${label} ${suffix}`,
        description: `Browse ${label.toLowerCase()} ${suffix.toLowerCase()} on Kino.`,
        alternates: { canonical: `/category/${slug}${type === "tv" ? "?type=tv" : ""}` },
    };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const sp = await searchParams;

    const type = readType(sp.type);

    // Unknown slugs previously fell back to "popular" and returned HTTP 200,
    // creating an unbounded space of indexable duplicate pages.
    if (!isKnownCategory(slug, type)) {
        notFound();
    }

    const sortBy = readParam(sp.sort_by);
    const genreId = readParam(sp.genre);

    // Any active sort/genre switches this page to the discover endpoint.
    const isDiscoverMode = Boolean(sortBy || genreId);

    const [listData, genreData] = await Promise.all([
        isDiscoverMode
            ? TMDB.discover(type, sortBy ?? "popularity.desc", genreId)
            : type === "tv"
                ? TMDB.getTvShowsByCategory(slug)
                : TMDB.getMoviesByCategory(slug),
        TMDB.getGenres(type),
    ]);

    const movies = toCardItems(listData.results, type);
    const baseTitle = categoryTitle(slug);
    const heading = isDiscoverMode
        ? `${baseTitle} · Filtered`
        : `${baseTitle} ${type === "tv" ? "TV Shows" : "Movies"}`;

    return (
        <main className="min-h-screen bg-kino-dark text-white selection:bg-[#2563eb] selection:text-[#0a0a0a]">
            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-1.5 h-8 bg-[#2563eb] rounded-full" aria-hidden="true" />
                    <h1 className="text-4xl font-black tracking-tight">{heading}</h1>
                </div>

                <Suspense fallback={<div className="h-[76px] mb-10 rounded-2xl bg-white/5" />}>
                    <FilterBar type={type} genres={genreData.genres ?? []} />
                </Suspense>

                {movies.length > 0 ? (
                    <CategoryGrid
                        initialMovies={movies}
                        category={isDiscoverMode ? "discover" : slug}
                        type={type}
                        filters={
                            isDiscoverMode
                                ? { sort_by: sortBy ?? "popularity.desc", genre_id: genreId }
                                : undefined
                        }
                    />
                ) : (
                    <p className="py-20 text-center text-gray-500">
                        No titles found for this selection.
                    </p>
                )}
            </div>
        </main>
    );
}
