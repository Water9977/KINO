import { TMDB } from "@/lib/tmdb";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";

export default async function BrowsePage() {
    // Fetch both Movie and TV data in parallel so the homepage becomes a universal discovery hub
    const [
        trendingMovies,
        nowPlayingMovies,
        topRatedMovies,
        popularMovies,
        upcomingMovies,
        popularTv,
        topRatedTv
    ] = await Promise.all([
        TMDB.getTrending(),
        TMDB.getNowPlaying(),
        TMDB.getTopRated(),
        TMDB.getPopular(),
        TMDB.getUpcoming(),
        TMDB.getTvShowsByCategory('popular'),
        TMDB.getTvShowsByCategory('top_rated')
    ]);

    // Use trending movies for the cinematic hero
    const heroMovies = trendingMovies.results?.slice(0, 8) || [];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#2563eb] selection:text-[#0a0a0a] pb-20">
            {/* Hero Carousel */}
            <HeroCarousel movies={heroMovies} />

            <div className="relative z-20 -mt-8 md:-mt-32 pb-20 space-y-8 bg-gradient-to-b from-transparent to-[#0a0a0a]">

                {/* Trending Movies */}
                <MovieRow
                    title="Trending Movies"
                    movies={trendingMovies.results || []}
                    viewAllLink="/category/trending"
                />

                {/* Popular TV Shows (Interleaved for mixed discovery) */}
                <MovieRow
                    title="Popular TV Shows"
                    movies={popularTv.results || []}
                    viewAllLink="/tv"
                />

                {/* Popular Movies */}
                <MovieRow
                    title="Popular Movies"
                    movies={popularMovies.results || []}
                    viewAllLink="/category/popular"
                />

                {/* Top Rated TV Shows */}
                <MovieRow
                    title="Top Rated TV Shows"
                    movies={topRatedTv.results || []}
                    viewAllLink="/tv"
                />

                {/* Top Rated Movies */}
                <MovieRow
                    title="Top Rated Movies"
                    movies={topRatedMovies.results || []}
                    viewAllLink="/category/top_rated"
                />

                {/* Upcoming Movie Releases */}
                <MovieRow
                    title="Upcoming Movie Releases"
                    movies={upcomingMovies.results || []}
                    viewAllLink="/category/upcoming"
                />

                {/* In Theaters */}
                <MovieRow
                    title="In Theaters Now"
                    movies={nowPlayingMovies.results || []}
                    viewAllLink="/category/now_playing"
                />

            </div>
        </main>
    );
}
