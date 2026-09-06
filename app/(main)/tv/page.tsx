import type { Metadata } from "next";
import { TMDB, toCardItems } from "@/lib/tmdb";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MovieRow } from "@/components/MovieRow";

export const metadata: Metadata = {
    title: "TV Shows",
    description: "Popular series, top rated shows, animation, drama and sci-fi on Kino.",
    alternates: { canonical: "/tv" },
};

// Was force-dynamic; see the note in /movies.
export const revalidate = 300;

/** TMDB TV genre ids used for the curated rows. */
const GENRE = { animation: "16", drama: "18", scifiFantasy: "10765" } as const;

export default async function TVShowsPage() {
    const [trending, popular, topRated, animation, drama, scifi] = await Promise.all([
        TMDB.getTvShowsByCategory("trending"),
        TMDB.getTvShowsByCategory("popular"),
        TMDB.getTvShowsByCategory("top_rated"),
        TMDB.discover("tv", "popularity.desc", GENRE.animation),
        TMDB.discover("tv", "popularity.desc", GENRE.drama),
        TMDB.discover("tv", "popularity.desc", GENRE.scifiFantasy),
    ]);

    const rows = [
        { title: "Popular Series", movies: toCardItems(popular.results, "tv"), link: "/discover?type=tv&sort_by=popularity.desc" },
        { title: "Top Rated Shows", movies: toCardItems(topRated.results, "tv"), link: "/discover?type=tv&sort_by=vote_average.desc" },
        { title: "Animation Series", movies: toCardItems(animation.results, "tv"), link: `/discover?type=tv&genre=${GENRE.animation}` },
        { title: "Sci-Fi & Fantasy", movies: toCardItems(scifi.results, "tv"), link: `/discover?type=tv&genre=${GENRE.scifiFantasy}` },
        { title: "Drama Series", movies: toCardItems(drama.results, "tv"), link: `/discover?type=tv&genre=${GENRE.drama}` },
    ];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <h1 className="sr-only">TV shows on Kino</h1>

            <HeroCarousel movies={toCardItems(trending.results?.slice(0, 8), "tv")} />

            <div className="relative z-20 -mt-8 md:-mt-32 pb-20 space-y-8 bg-gradient-to-b from-transparent to-[#0a0a0a]">
                {rows.map((row) => (
                    <MovieRow key={row.title} title={row.title} movies={row.movies} viewAllLink={row.link} />
                ))}
            </div>
        </main>
    );
}
