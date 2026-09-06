import type { Metadata } from "next";
import { TMDB, toCardItems } from "@/lib/tmdb";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";

export const metadata: Metadata = {
    title: "Browse",
    description: "Trending movies, popular series, top rated titles and new releases on Kino.",
    alternates: { canonical: "/browse" },
};

/** Matches the TMDB cache lifetime in lib/tmdb.ts. */
export const revalidate = 300;

const HERO_SLIDE_COUNT = 8;

export default async function BrowsePage() {
    const [
        trendingMovies,
        nowPlayingMovies,
        topRatedMovies,
        popularMovies,
        upcomingMovies,
        popularTv,
        topRatedTv,
    ] = await Promise.all([
        TMDB.getTrending(),
        TMDB.getNowPlaying(),
        TMDB.getTopRated(),
        TMDB.getPopular(),
        TMDB.getUpcoming(),
        TMDB.getTvShowsByCategory("popular"),
        TMDB.getTvShowsByCategory("top_rated"),
    ]);

    const heroMovies = toCardItems(trendingMovies.results?.slice(0, HERO_SLIDE_COUNT), "movie");

    const rows = [
        { title: "Trending Movies", movies: toCardItems(trendingMovies.results, "movie"), link: "/category/trending" },
        { title: "Popular TV Shows", movies: toCardItems(popularTv.results, "tv"), link: "/tv" },
        { title: "Popular Movies", movies: toCardItems(popularMovies.results, "movie"), link: "/category/popular" },
        { title: "Top Rated TV Shows", movies: toCardItems(topRatedTv.results, "tv"), link: "/tv" },
        { title: "Top Rated Movies", movies: toCardItems(topRatedMovies.results, "movie"), link: "/category/top_rated" },
        { title: "Upcoming Movie Releases", movies: toCardItems(upcomingMovies.results, "movie"), link: "/category/upcoming" },
        { title: "In Theaters Now", movies: toCardItems(nowPlayingMovies.results, "movie"), link: "/category/now_playing" },
    ];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#2563eb] selection:text-[#0a0a0a] pb-20">
            {/* The hero is visual; the page still needs one real heading for
                screen readers and document outline. */}
            <h1 className="sr-only">Browse movies and TV shows on Kino</h1>

            <HeroCarousel movies={heroMovies} />

            <div className="relative z-20 -mt-8 md:-mt-32 pb-20 space-y-8 bg-gradient-to-b from-transparent to-[#0a0a0a]">
                {rows.map((row) => (
                    <MovieRow
                        key={row.title}
                        title={row.title}
                        movies={row.movies}
                        viewAllLink={row.link}
                    />
                ))}
            </div>
        </main>
    );
}
