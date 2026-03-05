import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";
import { TMDB } from "@/lib/tmdb";

export const dynamic = 'force-dynamic';

export default async function MoviesPage() {
    // Fetch data in parallel
    const [
        trending,
        topRated,
        popular,
        upcoming,
        nowPlaying,
        action,
        comedy
    ] = await Promise.all([
        TMDB.getMoviesByCategory('trending'),
        TMDB.getMoviesByCategory('top_rated'),
        TMDB.getMoviesByCategory('popular'),
        TMDB.getMoviesByCategory('upcoming'),
        TMDB.getMoviesByCategory('now_playing'),
        TMDB.discover('movie', 'popularity.desc', '28'), // Action
        TMDB.discover('movie', 'popularity.desc', '35')  // Comedy
    ]);

    // Helper to add mock fields for HeroCarousel if needed (e.g. detailed info not in list)
    // The Movie interface has optional fields, so list results are fine.

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">


            {/* Hero Section */}
            <HeroCarousel movies={trending.results?.slice(0, 8) || []} />

            <div className="relative z-20 -mt-8 md:-mt-32 pb-20 space-y-8 bg-gradient-to-b from-transparent to-[#0a0a0a]">

                <MovieRow
                    title="Popular Right Now"
                    movies={popular.results || []}
                    viewAllLink="/discover?type=movie&sort_by=popularity.desc"
                />

                <MovieRow
                    title="Top Rated Movies"
                    movies={topRated.results || []}
                    viewAllLink="/discover?type=movie&sort_by=vote_average.desc"
                />

                <MovieRow
                    title="Upcoming Releases"
                    movies={upcoming.results || []}
                    viewAllLink="/discover?type=movie&sort_by=primary_release_date.desc"
                />

                <MovieRow
                    title="Now Playing"
                    movies={nowPlaying.results || []}
                    viewAllLink="/discover?type=movie&sort_by=primary_release_date.desc"
                />

                <MovieRow
                    title="Action Hits"
                    movies={action.results || []}
                    viewAllLink="/discover?type=movie&genre=28"
                />

                <MovieRow
                    title="Comedy Favorites"
                    movies={comedy.results || []}
                    viewAllLink="/discover?type=movie&genre=35"
                />

            </div>
        </main>
    );
}
