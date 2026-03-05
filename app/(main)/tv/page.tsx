import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";
import { TMDB } from "@/lib/tmdb";

export const dynamic = 'force-dynamic';

export default async function TVShowsPage() {
    // Fetch data in parallel
    const [
        trending,
        popular,
        topRated,
        animation,
        drama,
        scifi
    ] = await Promise.all([
        TMDB.getTvShowsByCategory('trending'),
        TMDB.getTvShowsByCategory('popular'),
        TMDB.getTvShowsByCategory('top_rated'),
        TMDB.discover('tv', 'popularity.desc', '16'), // Animation
        TMDB.discover('tv', 'popularity.desc', '18'), // Drama
        TMDB.discover('tv', 'popularity.desc', '10765') // Sci-Fi & Fantasy
    ]);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">

            {/* Hero Section */}
            <HeroCarousel movies={trending.results?.slice(0, 8) || []} />

            <div className="relative z-20 -mt-8 md:-mt-32 pb-20 space-y-8 bg-gradient-to-b from-transparent to-[#0a0a0a]">

                <MovieRow
                    title="Popular Series"
                    movies={popular.results || []}
                    viewAllLink="/discover?type=tv&sort_by=popularity.desc"
                />

                <MovieRow
                    title="Top Rated Shows"
                    movies={topRated.results || []}
                    viewAllLink="/discover?type=tv&sort_by=vote_average.desc"
                />

                <MovieRow
                    title="Animation Series"
                    movies={animation.results || []}
                    viewAllLink="/discover?type=tv&genre=16"
                />

                <MovieRow
                    title="Sci-Fi & Fantasy"
                    movies={scifi.results || []}
                    viewAllLink="/discover?type=tv&genre=10765"
                />

                <MovieRow
                    title="Drama Series"
                    movies={drama.results || []}
                    viewAllLink="/discover?type=tv&genre=18"
                />

            </div>
        </main>
    );
}
