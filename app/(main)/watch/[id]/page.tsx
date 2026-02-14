import { TMDB } from "@/lib/tmdb";
import { VideoPlayer } from "@/components/VideoPlayer";
import Image from "next/image";
import { Star, Calendar, Clock, User, Film, Info } from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ type?: string }>;
}

export default async function WatchPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { type } = await searchParams;
    const mediaType = (type as 'movie' | 'tv') || 'movie';

    const movie = await TMDB.getDetails(id, mediaType);

    if (!movie || movie.success === false) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <Info size={48} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">CONTENT NOT FOUND</h1>
                    <p className="text-gray-400">The title you are looking for might be unavailable or removed.</p>
                </div>
            </div>
        );
    }

    const title = movie.title || movie.name;
    const release_date = movie.release_date || movie.first_air_date;
    const runtime = movie.runtime || (movie.episode_run_time ? movie.episode_run_time[0] : 0);

    const { overview, backdrop_path, poster_path, vote_average, genres, credits } = movie;
    const director = credits?.crew?.find((person: any) => person.job === "Director" || person.job === "Executive Producer")?.name;
    const cast = credits?.cast?.slice(0, 8);

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pb-32">

            {/* Immersive Cinematic Backdrop */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/original${backdrop_path}`}
                        alt={title}
                        fill
                        className="object-cover opacity-30 scale-105 blur-[2px]"
                        priority
                    />
                    {/* Atmospheric Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                </div>
            </div>

            <div className="relative z-10 -mt-[40vh] mx-auto max-w-7xl px-6 lg:px-10">
                <div className="flex flex-col gap-12">
                    {/* Main Header Info */}
                    <div className="flex flex-col lg:flex-row gap-10 items-end lg:items-center">
                        {/* Poster with glow */}
                        <div className="hidden lg:block flex-shrink-0">
                            <div className="w-[280px] aspect-[2/3] relative rounded-3xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/10 group">
                                {poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${poster_path}`}
                                        alt={title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                        <Film size={48} className="text-gray-700" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl font-outfit">
                                    {title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-6 text-[11px] font-black tracking-widest uppercase text-gray-400">
                                    <span className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                        <Star size={14} fill="currentColor" />
                                        {vote_average.toFixed(1)} TMDB
                                    </span>
                                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                        <Calendar size={14} />
                                        {release_date?.split("-")[0]}
                                    </span>
                                    {runtime > 0 && (
                                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                            <Clock size={14} />
                                            {runtime} MIN
                                        </span>
                                    )}
                                    {director && (
                                        <span className="text-[#2563eb] font-black font-sans">
                                            DIRECTOR: {director}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {genres?.map((g: any) => (
                                    <span key={g.id} className="rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#2563eb]">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Movie Player - Central Component */}
                    <div className="w-full">
                        <VideoPlayer
                            tmdbId={Number(id)}
                            mediaType={mediaType}
                            seasons={mediaType === 'tv' ? movie.seasons : undefined}
                        />
                    </div>

                    {/* Content Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Synopsis */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-1.5 bg-[#2563eb] rounded-full" />
                                <h2 className="text-2xl font-black tracking-tight">STORYLINE</h2>
                            </div>
                            <p className="text-lg leading-relaxed text-gray-400 font-medium">
                                {overview || "No detailed synopsis available for this title."}
                            </p>
                        </div>

                        {/* High-End Cast List */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-1.5 bg-purple-600 rounded-full" />
                                <h2 className="text-2xl font-black tracking-tight">CAST</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {cast?.map((actor: any) => (
                                    <div key={actor.id} className="flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-all">
                                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-lg transition-transform group-hover:scale-105">
                                            {actor.profile_path ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                    alt={actor.name}
                                                    width={56}
                                                    height={56}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-white/5">
                                                    <User size={20} className="text-gray-700" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-white group-hover:text-[#2563eb] transition-colors truncate uppercase tracking-wide">
                                                {actor.name}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium truncate italic">
                                                {actor.character}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

