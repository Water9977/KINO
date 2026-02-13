import { TMDB } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { HeroSlide } from "@/components/HeroSlide";
import { MovieCard } from "@/components/MovieCard";
import Link from "next/link";

export default async function BrowsePage() {
    // Fetch data server-side
    const [trendingData, nowPlayingData, topRatedData, popularData, upcomingData] = await Promise.all([
        TMDB.getTrending(),
        TMDB.getNowPlaying(),
        TMDB.getTopRated(),
        TMDB.getPopular(),
        TMDB.getUpcoming()
    ]);

    const featuredMovie = trendingData.results?.[0]; // Pick first trending movie as featured

    // Show more items (12) per section for better density
    const trendingMovies = trendingData.results?.slice(1, 13);
    const topRatedMovies = topRatedData.results?.slice(0, 12);
    const popularMovies = popularData.results?.slice(0, 12);
    const upcomingMovies = upcomingData.results?.slice(0, 12);

    return (
        <main className="min-h-screen bg-kino-dark text-white selection:bg-[#2563eb] selection:text-[#0a0a0a] pb-20">
            <Navbar />

            {/* Featured Hero */}
            <HeroSlide movie={featuredMovie} />

            <div className="relative z-20 -mt-32 max-w-7xl mx-auto px-6 space-y-16">

                {/* Trending Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#2563eb] rounded-full" />
                            Trending Now
                        </h2>
                        <Link href="/category/trending" className="text-sm font-medium text-[#2563eb] hover:text-white transition-colors">View all</Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {trendingMovies?.map((movie: any, idx: number) => (
                            <MovieCard key={movie.id} movie={movie} index={idx} />
                        ))}
                    </div>
                </section>

                {/* Popular Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#2563eb] rounded-full" />
                            Popular
                        </h2>
                        <Link href="/category/popular" className="text-sm font-medium text-[#2563eb] hover:text-white transition-colors">View all</Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {popularMovies?.map((movie: any, idx: number) => (
                            <MovieCard key={movie.id} movie={movie} index={idx} />
                        ))}
                    </div>
                </section>

                {/* Top Rated Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full" />
                            Top Rated
                        </h2>
                        <Link href="/category/top_rated" className="text-sm font-medium text-[#2563eb] hover:text-white transition-colors">View all</Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {topRatedMovies?.map((movie: any, idx: number) => (
                            <MovieCard key={movie.id} movie={movie} index={idx} />
                        ))}
                    </div>
                </section>

                {/* Upcoming Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="w-1 h-6 bg-green-500 rounded-full" />
                            Upcoming
                        </h2>
                        <Link href="/category/upcoming" className="text-sm font-medium text-[#2563eb] hover:text-white transition-colors">View all</Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {upcomingMovies?.map((movie: any, idx: number) => (
                            <MovieCard key={movie.id} movie={movie} index={idx} />
                        ))}
                    </div>
                </section>

            </div>
        </main>
    );
}
