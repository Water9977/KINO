import type { Metadata } from "next";
import { TMDB, toCardItems } from "@/lib/tmdb";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";

export const metadata: Metadata = {
    title: "Movies",
    description: "Popular, top rated, upcoming and now-playing movies on Kino.",
    alternates: { canonical: "/movies" },
};

// Was force-dynamic, which re-fetched seven TMDB endpoints on every single
// request. This data changes daily at most, so cache it like /browse.
export const revalidate = 300;

/** TMDB genre ids used for the curated rows. */
const GENRE = { action: "28", comedy: "35" } as const;

export default async function MoviesPage() {
    const [trending, topRated, popular, upcoming, nowPlaying, action, comedy] = await Promise.all([
        TMDB.getMoviesByCategory("trending"),
        TMDB.getMoviesByCategory("top_rated"),
        TMDB.getMoviesByCategory("popular"),
        TMDB.getMoviesByCategory("upcoming"),
        TMDB.getMoviesByCategory("now_playing"),
        TMDB.discover("movie", "popularity.desc", GENRE.action),
        TMDB.discover("movie", "popularity.desc", GENRE.comedy),
    ]);

    const rows = [
        { title: "Popular Right Now", movies: toCardItems(popular.results, "movie"), link: "/discover?type=movie&sort_by=popularity.desc" },
        { title: "Top Rated Movies", movies: toCardItems(topRated.results, "movie"), link: "/discover?type=movie&sort_by=vote_average.desc" },
        { title: "Upcoming Releases", movies: toCardItems(upcoming.results, "movie"), link: "/discover?type=movie&sort_by=primary_release_date.desc" },
        { title: "Now Playing", movies: toCardItems(nowPlaying.results, "movie"), link: "/category/now_playing" },
        { title: "Action Hits", movies: toCardItems(action.results, "movie"), link: `/discover?type=movie&genre=${GENRE.action}` },
        { title: "Comedy Favorites", movies: toCardItems(comedy.results, "movie"), link: `/discover?type=movie&genre=${GENRE.comedy}` },
    ];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <h1 className="sr-only">Movies on Kino</h1>

            <HeroCarousel movies={toCardItems(trending.results?.slice(0, 8), "movie")} />

            <div className="relative z-20 -mt-8 md:-mt-32 pb-20 space-y-8 bg-gradient-to-b from-transparent to-[#0a0a0a]">
                {rows.map((row) => (
                    <MovieRow key={row.title} title={row.title} movies={row.movies} viewAllLink={row.link} />
                ))}
            </div>
        </main>
    );
}
