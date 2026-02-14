import { TMDB } from "@/lib/tmdb";
import { CategoryGrid } from "@/components/CategoryGrid";
import { FilterBar } from "@/components/FilterBar";

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const sp = await searchParams;

    // Normalize category title
    const titles: Record<string, string> = {
        trending: "Trending Now",
        popular: "Popular Movies",
        top_rated: "Top Rated",
        upcoming: "Upcoming Releases",
        now_playing: "Now Playing"
    };

    const title = titles[slug] || "Movies";
    const sortBy = sp.sort_by as string;
    const genreId = sp.genre as string;
    const type = (sp.type as 'movie' | 'tv') || 'movie';

    let movies = [];
    let isDiscoverMode = false;

    // If sorting or filtering is active
    if (sortBy || genreId) {
        isDiscoverMode = true;
        const data = await TMDB.discover(type, sortBy, genreId);
        movies = data.results || [];
    } else {
        // Standard category fetching
        if (type === 'tv') {
            const data = await TMDB.getTvShowsByCategory(slug);
            movies = data.results || [];
        } else {
            const data = await TMDB.getMoviesByCategory(slug);
            movies = data.results || [];
        }
    }

    const genreData = await TMDB.getGenres(type);
    const genres = genreData.genres || [];

    return (
        <main className="min-h-screen bg-kino-dark text-white selection:bg-[#2563eb] selection:text-[#0a0a0a]">

            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-1.5 h-8 bg-[#2563eb] rounded-full" />
                    <h1 className="text-4xl font-black tracking-tight">{type === 'tv' && title === 'Movies' ? 'TV Shows' : title}</h1>
                </div>

                <FilterBar type={type} genres={genres} />

                <CategoryGrid
                    initialMovies={movies}
                    category={isDiscoverMode ? 'discover' : slug}
                    type={type}
                    filters={isDiscoverMode ? { sort_by: sortBy, genre_id: genreId } : undefined}
                />

                {movies.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No movies found for this category.
                    </div>
                )}
            </div>
        </main>
    );
}
