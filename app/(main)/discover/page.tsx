import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ListFilter } from "lucide-react";

import { TMDB, toCardItems } from "@/lib/tmdb";
import type { MediaType } from "@/lib/types";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FilterBar } from "@/components/FilterBar";

export const metadata: Metadata = {
    title: "Discover",
    description: "Filter movies and TV shows by genre, rating, release date and streaming provider.",
    alternates: { canonical: "/discover" },
};

export const dynamic = "force-dynamic";

/** How many streaming providers to offer in the filter. */
const PROVIDER_LIMIT = 30;

interface DiscoverPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function readParam(value: string | string[] | undefined): string | undefined {
    return typeof value === "string" && value !== "" ? value : undefined;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
    const sp = await searchParams;

    const type: MediaType = sp.type === "tv" ? "tv" : "movie";
    const sortBy = readParam(sp.sort_by) ?? "popularity.desc";
    const genreId = readParam(sp.genre);
    const providerId = readParam(sp.provider);

    const [data, genreData, providerData] = await Promise.all([
        TMDB.discover(type, sortBy, genreId, 1, providerId),
        TMDB.getGenres(type),
        TMDB.getWatchProviders(type),
    ]);

    const movies = toCardItems(data.results, type);

    const keyProviders = [...(providerData.results ?? [])]
        .sort((a, b) => a.display_priority - b.display_priority)
        .slice(0, PROVIDER_LIMIT);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#2563eb] selection:text-[#0a0a0a]">
            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-white">
                            Discover {type === "tv" ? "Series" : "Movies"}
                        </h1>
                        <p className="text-gray-400 font-medium">
                            Filter by genre, rating, release date and streaming provider.
                        </p>
                    </div>

                    <nav aria-label="Media type" className="flex justify-center w-full md:w-auto">
                        <div className="flex items-center p-1.5 bg-[#16161e] rounded-full border border-white/5 w-full sm:w-[340px] md:w-auto">
                            {(["movie", "tv"] as const).map((value) => (
                                <Link
                                    key={value}
                                    href={`/discover?type=${value}`}
                                    aria-current={type === value ? "page" : undefined}
                                    className={`flex-1 md:flex-none text-center px-6 py-2.5 rounded-full text-sm font-bold transition-all ${type === value
                                        ? "bg-[#2563eb] text-white shadow-md shadow-blue-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {value === "movie" ? "Movies" : "TV Shows"}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>

                <Suspense fallback={<div className="h-[76px] mb-10 rounded-2xl bg-white/5" />}>
                    <FilterBar type={type} genres={genreData.genres ?? []} providers={keyProviders} />
                </Suspense>

                {movies.length > 0 ? (
                    <CategoryGrid
                        initialMovies={movies}
                        category="discover"
                        type={type}
                        filters={{ sort_by: sortBy, genre_id: genreId, provider_id: providerId }}
                    />
                ) : (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                        <div className="bg-white/5 p-6 rounded-full">
                            <ListFilter size={40} aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-bold text-white">No results found</h2>
                        <p>Try adjusting your filters to find what you&apos;re looking for.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
