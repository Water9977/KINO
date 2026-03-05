import { TMDB } from "@/lib/tmdb";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";

export default async function BrowsePage() {
    // Fetch data server-side
    const [trendingData, nowPlayingData, topRatedData, popularData, upcomingData] = await Promise.all([
        TMDB.getTrending(),
        TMDB.getNowPlaying(),
        TMDB.getTopRated(),
        TMDB.getPopular(),
        TMDB.getUpcoming()
    ]);

    const heroMovies = trendingData.results?.slice(0, 8) || [];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#2563eb] selection:text-[#0a0a0a] pb-20">
            {/* Hero Carousel */}
            <HeroCarousel movies={heroMovies} />

            <div className="relative z-20 -mt-8 md:-mt-32 pb-20 space-y-8 bg-gradient-to-b from-transparent to-[#0a0a0a]">

                <MovieRow
                    title="Trending Now"
                    movies={trendingData.results || []}
                    viewAllLink="/category/trending"
                />

                <MovieRow
                    title="Popular on Kino"
                    movies={popularData.results || []}
                    viewAllLink="/category/popular"
                />

                <MovieRow
                    title="Top Rated"
                    movies={topRatedData.results || []}
                    viewAllLink="/category/top_rated"
                />

                <MovieRow
                    title="Upcoming Releases"
                    movies={upcomingData.results || []}
                    viewAllLink="/category/upcoming"
                />

                <MovieRow
                    title="Now Playing"
                    movies={nowPlayingData.results || []}
                    viewAllLink="/category/now_playing"
                />

            </div>
        </main>
    );
}
