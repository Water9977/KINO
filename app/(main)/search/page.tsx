import { TMDB } from "@/lib/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { Search, Film } from "lucide-react";

interface PageProps {
    searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const { q } = await searchParams;
    const searchResults = await TMDB.search(q || "");
    const movies = searchResults.results || [];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-32">

            <div className="pt-32 max-w-7xl mx-auto px-6 lg:px-10">
                {/* Search Header */}
                <div className="mb-12 space-y-4">
                    <div className="flex items-center gap-3 text-[#2563eb]">
                        <Search size={20} className="stroke-[3]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] font-sans">Search Discovery</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                        <div className="space-y-1">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                                RESULTS FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563eb] to-blue-400">"{q?.toUpperCase()}"</span>
                            </h1>
                            <p className="text-gray-500 font-medium tracking-tight">
                                We found {movies.length} matches for your query.
                            </p>
                        </div>
                    </div>
                </div>

                {movies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {movies.map((item: any, idx: number) => {
                            // Filter out people or items without posters
                            if (!item.poster_path || item.media_type === 'person') return null;

                            // Normalize data for MovieCard
                            const normalizedMovie = {
                                ...item,
                                title: item.title || item.name,
                                release_date: item.release_date || item.first_air_date,
                            };

                            return (
                                <MovieCard key={item.id} movie={normalizedMovie} index={idx} />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.02]">
                        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-gray-500">
                            <Film size={32} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-white mb-2 uppercase">No matches found</h2>
                        <p className="text-gray-500 font-medium text-center max-w-xs">
                            We couldn't find any movies or TV shows matching your search. Try different keywords.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

