import { TMDB } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { VideoPlayer } from "@/components/VideoPlayer";
import Image from "next/image";
import { Star, Calendar, Clock, Globe } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ type?: string }>;
}

export default async function WatchPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { type } = await searchParams;
    const mediaType = (type as 'movie' | 'tv') || 'movie';

    console.log("WatchPage id:", id, "type:", mediaType);
    const movie = await TMDB.getDetails(id, mediaType);
    console.log("TMDB Response for ID:", id, movie);

    // Fallback for missing movie
    if (!movie || movie.success === false) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-kino-dark text-white">
                <h1 className="text-2xl font-bold">Content not found</h1>
            </div>
        );
    }

    // Normalize data
    const title = movie.title || movie.name;
    const release_date = movie.release_date || movie.first_air_date;
    const runtime = movie.runtime || (movie.episode_run_time ? movie.episode_run_time[0] : 0);

    const { overview, backdrop_path, poster_path, vote_average, genres, credits } = movie;
    const director = credits?.crew?.find((person: any) => person.job === "Director" || person.job === "Executive Producer")?.name;
    const cast = credits?.cast?.slice(0, 6);

    return (
        <main className="min-h-screen bg-kino-dark text-white pb-20">
            <Navbar />

            {/* Hero Backdrop */}
            <div className="relative h-[60vh] w-full">
                <div className="absolute inset-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/original${backdrop_path}`}
                        alt={title}
                        fill
                        className="object-cover opacity-30"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kino-dark via-kino-dark/60 to-transparent" />
                </div>
            </div>

            <div className="relative z-10 -mt-64 mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[300px_1fr]">
                    {/* Poster Column */}
                    <div className="hidden lg:block">
                        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50 bg-gray-900 aspect-[2/3] relative">
                            {poster_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w500${poster_path}`}
                                    alt={title}
                                    width={300}
                                    height={450}
                                    className="h-auto w-full object-cover"
                                    priority
                                    unoptimized
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                                    <span className="text-4xl mb-2">🎬</span>
                                    <span className="text-xs">No Poster Available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <h1 className="mb-2 text-4xl font-black text-white md:text-6xl drop-shadow-lg">{title}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <Star size={16} fill="currentColor" />
                                    {vote_average.toFixed(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    {release_date?.split("-")[0]}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={16} />
                                    {runtime} min
                                </span>
                                {director && (
                                    <span className="text-[#2563eb]">Dir. {director}</span>
                                )}
                            </div>
                        </div>

                        {/* Player Area */}
                        <VideoPlayer
                            tmdbId={Number(id)}
                            mediaType={mediaType}
                            seasons={mediaType === 'tv' ? movie.seasons : undefined}
                        />

                        {/* Server/Source Selector handled inside VideoPlayer */}

                        {/* Overview */}
                        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Synopsis</h2>
                                <p className="text-lg leading-relaxed text-gray-300">{overview}</p>

                                <div className="flex flex-wrap gap-2 pt-4">
                                    {genres?.map((g: any) => (
                                        <span key={g.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Cast */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Top Cast</h2>
                                <div className="space-y-3">
                                    {cast?.map((actor: any) => (
                                        <div key={actor.id} className="flex items-center gap-3">
                                            <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-800">
                                                {actor.profile_path ? (
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                        alt={actor.name}
                                                        width={40}
                                                        height={40}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">?</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{actor.name}</p>
                                                <p className="text-xs text-gray-400">{actor.character}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
