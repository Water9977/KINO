import { TMDB } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { CategoryGrid } from "@/components/CategoryGrid";

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;

    // Normalize category title
    const titles: Record<string, string> = {
        trending: "Trending Now",
        popular: "Popular Movies",
        top_rated: "Top Rated",
        upcoming: "Upcoming Releases",
        now_playing: "Now Playing"
    };

    const title = titles[slug] || "Movies";
    const data = await TMDB.getMoviesByCategory(slug);
    const movies = data.results || [];

    return (
        <main className="min-h-screen bg-kino-dark text-white selection:bg-[#2563eb] selection:text-[#0a0a0a]">
            <Navbar />

            <div className="pt-32 px-6 max-w-7xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-8 bg-[#2563eb] rounded-full" />
                    <h1 className="text-4xl font-black tracking-tight">{title}</h1>
                </div>

                <CategoryGrid initialMovies={movies} category={slug} />

                {movies.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No movies found for this category.
                    </div>
                )}
            </div>
        </main>
    );
}
