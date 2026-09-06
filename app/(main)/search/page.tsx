import type { Metadata } from "next";
import { Search, Film } from "lucide-react";

import { TMDB, toCardItems } from "@/lib/tmdb";
import { MovieCard } from "@/components/MovieCard";

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `Search: ${q}` : "Search",
        description: q
            ? `Movies and TV shows matching "${q}" on Kino.`
            : "Search movies and TV shows on Kino.",
        // Search result pages shouldn't compete with real content in the index.
        robots: { index: false, follow: true },
    };
}

export default async function SearchPage({ searchParams }: PageProps) {
    const { q } = await searchParams;
    const query = q?.trim() ?? "";

    const searchResults = await TMDB.search(query);

    // Drop people and anything we can't render a card for.
    const results = toCardItems(
        (searchResults.results ?? []).filter(
            (item) => item.media_type !== "person" && item.poster_path
        )
    );

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-32">
            <div className="pt-32 max-w-7xl mx-auto px-6 lg:px-10">
                <div className="mb-12 space-y-4">
                    <div className="flex items-center gap-3 text-[#2563eb]">
                        <Search size={20} className="stroke-[3]" aria-hidden="true" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                            Search Discovery
                        </span>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                            {query ? (
                                <>
                                    RESULTS FOR{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-blue-400 break-words">
                                        &ldquo;{query.toUpperCase()}&rdquo;
                                    </span>
                                </>
                            ) : (
                                "SEARCH"
                            )}
                        </h1>
                        <p className="text-gray-500 font-medium tracking-tight">
                            {query
                                ? `We found ${results.length} ${results.length === 1 ? "match" : "matches"} for your query.`
                                : "Use the search bar above to find a movie or series."}
                        </p>
                    </div>
                </div>

                {results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {results.map((item, idx) => (
                            <MovieCard key={`${item.media_type}-${item.id}`} movie={item} index={idx} />
                        ))}
                    </div>
                ) : (
                    query && (
                        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-gray-500">
                                <Film size={32} aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-2 uppercase">
                                No matches found
                            </h2>
                            <p className="text-gray-500 font-medium text-center max-w-xs">
                                We couldn&apos;t find any movies or TV shows matching your search. Try
                                different keywords.
                            </p>
                        </div>
                    )
                )}
            </div>
        </main>
    );
}
