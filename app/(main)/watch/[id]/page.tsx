import { TMDB } from "@/lib/tmdb";
import { VideoPlayer } from "@/components/VideoPlayer";
import Image from "next/image";
import { Star, Calendar, Clock, User, Film, Info } from "lucide-react";
import { MovieRow } from "@/components/MovieRow";

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

    const { overview, backdrop_path, poster_path, vote_average, genres, credits, similar, recommendations } = movie;
    const director = credits?.crew?.find((person: any) => person.job === "Director" || person.job === "Executive Producer")?.name;
    const cast = credits?.cast?.slice(0, 12) || [];

    // Prefer recommendations (user-based) over similar (keyword/genre-based) for better relevance
    const similarTitles = recommendations?.results?.length > 0
        ? recommendations.results.slice(0, 10)
        : similar?.results?.slice(0, 10) || [];

    return (
        <main className="min-h-screen bg-[#050505] text-white pb-32 overflow-x-hidden">
            {/* Background Ambilight Glow - CSS Radial Gradients for 60fps Mobile Performance */}
            <div className="absolute top-0 inset-x-0 h-[80vh] pointer-events-none opacity-30 z-0 mt-16 md:mt-20">
                <div className="absolute top-0 left-1/4 w-[70vw] lg:w-[50vw] h-[50vh] animate-pulse-slow"
                    style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(37,99,235,0) 70%)' }} />
                <div className="absolute top-20 right-1/4 w-[60vw] lg:w-[40vw] h-[40vh] animate-pulse-slow"
                    style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(147,51,234,0) 70%)', animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]" />
            </div>

            {/* Video Player Content Area */}
            <div className="relative z-10 w-full pt-24 sm:pt-28 md:pt-32 lg:pt-36">
                <div className="mx-auto w-full max-w-5xl lg:max-w-[1000px] xl:max-w-6xl px-4 md:px-6 lg:px-10">
                    <VideoPlayer
                        tmdbId={Number(id)}
                        mediaType={mediaType}
                        seasons={mediaType === 'tv' ? movie.seasons : undefined}
                        isBollywood={movie.original_language === 'hi' || movie.production_countries?.some((c: any) => c.iso_3166_1 === 'IN')}
                        backdropPath={backdrop_path}
                        title={title}
                    />
                </div>
            </div>

            {/* Movie Details Section */}
            <div className="relative z-10 mx-auto max-w-[1600px] px-4 md:px-6 lg:px-10 mt-8 mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Title, Metadata, Overview */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-outfit drop-shadow-lg">
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs font-bold tracking-widest uppercase text-gray-400">
                                <span className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-lg border border-yellow-400/20">
                                    <Star size={14} fill="currentColor" />
                                    {vote_average ? vote_average.toFixed(1) : 'NR'} TMDB
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white">
                                    <Calendar size={14} className="text-[#2563eb]" />
                                    {release_date?.split("-")[0] || 'TBA'}
                                </span>
                                {runtime > 0 && (
                                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white">
                                        <Clock size={14} className="text-[#2563eb]" />
                                        {formatRuntime(runtime)}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white">
                                    <Film size={14} className="text-[#2563eb]" />
                                    {mediaType === 'tv' ? 'TV SERIES' : 'MOVIE'}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {genres?.map((g: any) => (
                                    <span key={g.id} className="rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-base md:text-lg leading-relaxed text-gray-400 font-medium">
                                {overview || "No detailed synopsis available for this title."}
                            </p>
                        </div>

                        {director && (
                            <div className="flex items-center gap-3 pt-2">
                                <div className="w-10 h-10 rounded-full bg-[#2563eb]/20 flex items-center justify-center text-[#2563eb]">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Director</p>
                                    <p className="text-sm font-black text-white">{director}</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Cast Section - Horizontal Scroll */}
            {cast.length > 0 && (
                <div className="relative z-10 w-full pb-16">
                    <div className="px-4 md:px-6 lg:px-10 max-w-[1600px] mx-auto mb-6 flex items-center gap-3">
                        <div className="h-6 w-1.5 bg-[#2563eb] rounded-full" />
                        <h2 className="text-2xl font-black tracking-tight text-white font-outfit uppercase">The Cast</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto px-4 md:px-6 lg:px-10 pb-8 no-scrollbar scroll-smooth">
                        {cast.map((actor: any) => (
                            <div key={actor.id} className="min-w-[120px] w-[120px] md:min-w-[140px] md:w-[140px] flex-shrink-0 group cursor-pointer">
                                <div className="aspect-[2/3] w-full relative rounded-2xl overflow-hidden bg-[#111] mb-3 border border-white/5 group-hover:border-[#2563eb]/50 transition-colors">
                                    {actor.profile_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`}
                                            alt={actor.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
                                            <User size={32} className="text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <h4 className="text-sm font-bold text-white truncate group-hover:text-[#2563eb] transition-colors">{actor.name}</h4>
                                <p className="text-[11px] text-gray-500 font-medium truncate">{actor.character}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Similar Titles */}
            {similarTitles.length > 0 && (
                <div className="relative z-10">
                    <div className="px-0 md:px-0 lg:px-0 max-w-[1600px] mx-auto">
                        <MovieRow
                            title={`Similar to ${title}`}
                            movies={similarTitles}
                        />
                    </div>
                </div>
            )}

        </main>
    );
}

// Helper block for formatting
function formatRuntime(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h > 0 ? `${h}H ` : ''}${m}M`;
}

