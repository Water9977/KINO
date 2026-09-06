import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Star, Calendar, Clock, User, Film } from "lucide-react";

import { TMDB, tmdbImage } from "@/lib/tmdb";
import type { MediaType, TmdbDetails } from "@/lib/types";
import { VideoPlayer } from "@/components/VideoPlayer";
import { MovieRow } from "@/components/MovieRow";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ type?: string }>;
}

function resolveMediaType(type?: string): MediaType {
    return type === "tv" ? "tv" : "movie";
}

/** A details payload is usable only if TMDB actually returned a title. */
function isFound(movie: TmdbDetails | null): movie is TmdbDetails {
    return Boolean(movie && movie.success !== false && (movie.title || movie.name));
}

// ── Dynamic metadata for every watch page ─────────────────────────────────────
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const { type } = await searchParams;
    const movie = await TMDB.getDetails(id, resolveMediaType(type));

    if (!isFound(movie)) {
        return { title: "Not Found" };
    }

    const title = movie.title || movie.name;
    const year = (movie.release_date || movie.first_air_date)?.split("-")[0];
    const description = movie.overview
        ? `${movie.overview.slice(0, 155)}...`
        : `Watch ${title} online on Kino.`;
    const poster = tmdbImage(movie.poster_path, "w500") ?? undefined;

    return {
        title: `Watch ${title}${year ? ` (${year})` : ""}`,
        description,
        openGraph: {
            title: `${title} — Watch on Kino`,
            description,
            images: poster ? [{ url: poster }] : [],
            type: "video.movie",
        },
        twitter: {
            card: "summary_large_image",
            title: `Watch ${title} | Kino`,
            description,
            images: poster ? [poster] : [],
        },
    };
}

/**
 * JSON.stringify does not escape `<`, so a TMDB overview containing
 * "</script>" would break out of the tag. TMDB data is community-edited,
 * so escape it before it reaches dangerouslySetInnerHTML.
 */
function safeJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function WatchPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { type } = await searchParams;
    const mediaType = resolveMediaType(type);

    const movie = await TMDB.getDetails(id, mediaType);

    if (!isFound(movie)) {
        notFound();
    }

    const title = movie.title || movie.name || "Untitled";
    const releaseDate = movie.release_date || movie.first_air_date;
    const runtime = movie.runtime || movie.episode_run_time?.[0] || 0;

    const { overview, backdrop_path, poster_path, vote_average, genres, credits } = movie;

    const director = credits?.crew?.find(
        (person) => person.job === "Director" || person.job === "Executive Producer"
    )?.name;
    const cast = credits?.cast?.slice(0, 12) ?? [];

    // Prefer recommendations (behaviour-based) over similar (keyword-based).
    const recommended = movie.recommendations?.results ?? [];
    const similarTitles = (recommended.length > 0 ? recommended : movie.similar?.results ?? [])
        .slice(0, 10)
        .map((item) => ({ ...item, media_type: item.media_type ?? mediaType }));

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": mediaType === "tv" ? "TVSeries" : "Movie",
        name: title,
        description: overview || "",
        datePublished: releaseDate?.split("-")[0] || "",
        image: tmdbImage(poster_path, "w500") ?? "",
        ...(director ? { director: { "@type": "Person", name: director } } : {}),
        genre: genres?.map((g) => g.name) ?? [],
        actor: cast.slice(0, 5).map((a) => ({ "@type": "Person", name: a.name })),
        ...(vote_average && vote_average > 0
            ? {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: vote_average.toFixed(1),
                    bestRating: "10",
                    worstRating: "1",
                    ratingCount: movie.vote_count || 1,
                },
            }
            : {}),
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white pb-32 overflow-x-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
            />

            {/* Ambient glow — CSS radial gradients, cheap on mobile */}
            <div
                className="absolute top-0 inset-x-0 h-[80vh] pointer-events-none opacity-30 z-0 mt-16 md:mt-20"
                aria-hidden="true"
            >
                <div
                    className="absolute top-0 left-1/4 w-[70vw] lg:w-[50vw] h-[50vh] animate-pulse-slow"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(37,99,235,0) 70%)",
                    }}
                />
                <div
                    className="absolute top-20 right-1/4 w-[60vw] lg:w-[40vw] h-[40vh] animate-pulse-slow"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(147,51,234,0) 70%)",
                        animationDelay: "2s",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
            </div>

            {/* Player */}
            <div className="relative z-10 w-full pt-24 sm:pt-28 md:pt-32 lg:pt-36">
                <div className="mx-auto w-full max-w-5xl lg:max-w-[1000px] xl:max-w-6xl px-4 md:px-6 lg:px-10">
                    <VideoPlayer
                        /* Remount on title change so all player state resets cleanly. */
                        key={`${mediaType}-${id}`}
                        tmdbId={Number(id)}
                        mediaType={mediaType}
                        seasons={mediaType === "tv" ? movie.seasons : undefined}
                        backdropPath={backdrop_path}
                        title={title}
                    />
                </div>
            </div>

            {/* Details */}
            <div className="relative z-10 mx-auto max-w-[1600px] px-4 md:px-6 lg:px-10 mt-8 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-outfit drop-shadow-lg">
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs font-bold tracking-widest uppercase text-gray-400">
                                <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                                    <Star size={14} fill="currentColor" />
                                    {vote_average ? vote_average.toFixed(1) : "NR"} TMDB
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white">
                                    <Calendar size={14} className="text-[#2563eb]" />
                                    {releaseDate?.split("-")[0] || "TBA"}
                                </span>
                                {runtime > 0 && (
                                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white">
                                        <Clock size={14} className="text-[#2563eb]" />
                                        {formatRuntime(runtime)}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white">
                                    <Film size={14} className="text-[#2563eb]" />
                                    {mediaType === "tv" ? "TV SERIES" : "MOVIE"}
                                </span>
                            </div>

                            {genres && genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {genres.map((g) => (
                                        <span
                                            key={g.id}
                                            className="rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300"
                                        >
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p className="text-base md:text-lg leading-relaxed text-gray-400 font-medium">
                            {overview || "No synopsis is available for this title."}
                        </p>

                        {director && (
                            <div className="flex items-center gap-3 pt-2">
                                <div className="w-10 h-10 rounded-full bg-[#2563eb]/20 flex items-center justify-center text-[#2563eb]">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        Director
                                    </p>
                                    <p className="text-sm font-black text-white">{director}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
                <section className="relative z-10 w-full pb-16">
                    <div className="px-4 md:px-6 lg:px-10 max-w-[1600px] mx-auto mb-6 flex items-center gap-3">
                        <div className="h-6 w-1.5 bg-[#2563eb] rounded-full" />
                        <h2 className="text-2xl font-black tracking-tight text-white font-outfit uppercase">
                            The Cast
                        </h2>
                    </div>
                    <ul className="flex gap-4 overflow-x-auto px-4 md:px-6 lg:px-10 pb-8 no-scrollbar list-none">
                        {cast.map((actor) => {
                            const profileUrl = tmdbImage(actor.profile_path, "w185");
                            return (
                                <li
                                    key={actor.id}
                                    className="min-w-[120px] w-[120px] md:min-w-[140px] md:w-[140px] flex-shrink-0 group"
                                >
                                    <div className="aspect-[2/3] w-full relative rounded-2xl overflow-hidden bg-[#111] mb-3 border border-white/5">
                                        {profileUrl ? (
                                            <Image
                                                src={profileUrl}
                                                alt={actor.name}
                                                fill
                                                sizes="140px"
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                                                <User size={32} className="text-gray-700" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-white truncate">{actor.name}</h3>
                                    {actor.character && (
                                        <p className="text-[11px] text-gray-500 font-medium truncate">
                                            {actor.character}
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}

            {similarTitles.length > 0 && (
                <div className="relative z-10">
                    <div className="max-w-[1600px] mx-auto">
                        <MovieRow title={`Similar to ${title}`} movies={similarTitles} />
                    </div>
                </div>
            )}
        </main>
    );
}

function formatRuntime(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}H ` : ""}${mins}M`;
}
