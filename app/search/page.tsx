import { TMDB } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";

interface PageProps {
    searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const { q } = await searchParams;
    const searchResults = await TMDB.search(q || "");
    const movies = searchResults.results || [];

    return (
        <main className="min-h-screen bg-kino-dark text-white pb-20">
            <Navbar />

            <div className="pt-24 max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold">Search Results for <span className="text-kino-blue">"{q}"</span></h1>
                    <span className="text-gray-400 text-sm">({movies.length} results)</span>
                </div>

                {movies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {movies.map((item: any, idx: number) => {
                            // Filter out people or items without posters
                            if (!item.poster_path || item.media_type === 'person') return null;

                            // Normalize data for MovieCard
                            const normalizedMovie = {
                                ...item,
                                title: item.title || item.name, // TV shows use 'name'
                                release_date: item.release_date || item.first_air_date, // TV shows use 'first_air_date'
                            };

                            return (
                                <MovieCard key={item.id} movie={normalizedMovie} index={idx} />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <p className="text-lg">No results found for "{q}"</p>
                        <p className="text-sm mt-2">Try searching for something else.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
