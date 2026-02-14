import { TMDB } from "@/lib/tmdb";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FilterBar } from "@/components/FilterBar";
import Link from "next/link";
import { ListFilter } from "lucide-react";

export const dynamic = 'force-dynamic';

interface DiscoverPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
    const sp = await searchParams;
    const type = (sp.type as 'movie' | 'tv') || 'movie';
    const sortBy = (sp.sort_by as string) || 'popularity.desc';
    const genreId = sp.genre as string;
    const providerId = sp.provider as string;

    // Fetch data via discover API
    const data = await TMDB.discover(type, sortBy, genreId, 1, providerId);
    const movies = data.results || [];

    // Fetch filters
    const [genreData, providerData] = await Promise.all([
        TMDB.getGenres(type),
        TMDB.getWatchProviders(type)
    ]);

    // Sort providers by priority (usually display_priority) or just filter popular ones
    const allProviders = providerData.results || [];
    const keyProviders = allProviders
        .sort((a: any, b: any) => a.display_priority - b.display_priority)
        .slice(0, 30); // Top 30 providers

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#2563eb] selection:text-[#0a0a0a]">
            {/* Navbar is in layout now */}

            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
                            Discover {type === 'tv' ? 'Series' : 'Movies'}
                        </h1>
                        <p className="text-gray-400 font-medium">
                            Browse filtered content from typical providers and genres.
                        </p>
                    </div>

                    {/* Type Toggle */}
                    <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                        <Link
                            href={`/discover?type=movie`}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${type === 'movie' ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            Movies
                        </Link>
                        <Link
                            href={`/discover?type=tv`}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${type === 'tv' ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            TV Shows
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <FilterBar
                    type={type}
                    genres={genreData.genres || []}
                    providers={keyProviders}
                />

                {/* Grid */}
                <CategoryGrid
                    initialMovies={movies}
                    category="discover"
                    type={type}
                    filters={{ sort_by: sortBy, genre_id: genreId, provider_id: providerId }}
                />

                {movies.length === 0 && (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
                        <div className="bg-white/5 p-6 rounded-full">
                            <ListFilter size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-white">No results found</h3>
                        <p>Try adjusting your filters to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
