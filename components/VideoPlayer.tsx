"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Server, MonitorPlay, Info } from "lucide-react";
import { getSeasonDetails } from "@/app/actions";
import Image from "next/image";
import KineticDotsLoader from "@/components/ui/kinetic-dots-loader";

interface VideoPlayerProps {
    tmdbId: number;
    mediaType?: 'movie' | 'tv';
    seasons?: any[];
    isBollywood?: boolean;
    backdropPath?: string;
    title?: string;
}

const videoProviders = [
    {
        name: 'Quality',
        getUrl: (tmdbId: number, mediaType: string, season?: number, episode?: number) => {
            return mediaType === 'tv'
                ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?player=jw&primaryColor=ffffff&secondaryColor=808080&iconColor=ffffff`
                : `https://vidlink.pro/movie/${tmdbId}?player=jw&primaryColor=ffffff&secondaryColor=808080&iconColor=ffffff`;
        },
    },
    {
        name: 'Fast',
        getUrl: (tmdbId: number, mediaType: string, season?: number, episode?: number) => {
            return `https://vidsrc.xyz/embed/${mediaType === 'movie' ? 'movie' : 'tv'}/${tmdbId}${season && episode ? `/${season}/${episode}` : ''}`;
        },
    },
];

export const VideoPlayer = ({ tmdbId, mediaType = 'movie', seasons = [], isBollywood = false, backdropPath, title }: VideoPlayerProps) => {
    const [hasUserConsent, setHasUserConsent] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentServer, setCurrentServer] = useState(isBollywood && mediaType === 'movie' ? 1 : 0);
    const [isLoading, setIsLoading] = useState(true);

    // TV Show State
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [episodes, setEpisodes] = useState<any[]>([]);

    const availableSeasons = seasons?.filter(s => s.season_number > 0) || [];

    // Fetch episodes when selected season changes
    useEffect(() => {
        if (mediaType === 'tv' && seasons?.length) {
            const fetchEpisodes = async () => {
                try {
                    const data = await getSeasonDetails(tmdbId, selectedSeason);
                    if (data?.episodes) {
                        setEpisodes(data.episodes);
                    }
                } catch (error) {
                    console.error("Failed to fetch episodes", error);
                }
            };
            fetchEpisodes();
        }
    }, [tmdbId, mediaType, selectedSeason, seasons]);

    // Reset everything when content changes
    useEffect(() => {
        setHasUserConsent(false);
        setIsPlaying(false);
        setIsLoading(true);
        setCurrentServer(isBollywood && mediaType === 'movie' ? 1 : 0);
        setSelectedSeason(1);
        setSelectedEpisode(1);
    }, [tmdbId]);

    const handleServerChange = useCallback((index: number) => {
        if (index === currentServer) return;
        setCurrentServer(index);
        setIsLoading(true);
    }, [currentServer]);

    const handleStartStreaming = () => {
        setHasUserConsent(true);
        setIsPlaying(true);
    };

    const handleEpisodeSelect = (episodeNumber: number) => {
        setSelectedEpisode(episodeNumber);
        setIsLoading(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const src = videoProviders[currentServer].getUrl(
        tmdbId,
        mediaType,
        mediaType === 'tv' ? selectedSeason : undefined,
        mediaType === 'tv' ? selectedEpisode : undefined,
    );

    return (
        <div className="w-full space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-[#2563eb]/10 border border-white/5 group ring-1 ring-white/10">
                {!hasUserConsent ? (
                    // Initial Consent Screen
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20 overflow-hidden">
                        {backdropPath && (
                            <Image
                                src={`https://image.tmdb.org/t/p/original${backdropPath}`}
                                alt={title || "Backdrop"}
                                fill
                                className="object-cover opacity-40 group-hover:opacity-30 transition-opacity duration-700 blur-[2px]"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        <div className="relative z-10 flex flex-col items-center">
                            <button
                                onClick={handleStartStreaming}
                                className="group/btn relative flex items-center justify-center transition-all duration-500 hover:scale-110"
                            >
                                <div className="absolute inset-0 bg-[#2563eb] rounded-full blur-2xl opacity-0 group-hover/btn:opacity-60 transition-opacity duration-500" />
                                <Play
                                    size={72}
                                    className="text-white fill-white transition-all duration-500 drop-shadow-[0_0_0_rgba(37,99,235,0)] group-hover/btn:drop-shadow-[0_0_30px_rgba(37,99,235,0.8)] relative z-10"
                                />
                            </button>
                            <p className="mt-8 text-gray-400 font-bold text-xs tracking-[0.2em] uppercase animate-pulse">Click to Play</p>
                        </div>
                    </div>
                ) : !isPlaying ? (
                    // Play Button Overlay
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-all z-10 group/player">
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="group relative flex items-center justify-center transition-all duration-500 hover:scale-110"
                        >
                            <Play
                                size={64}
                                className="text-white fill-white transition-all duration-500 drop-shadow-[0_0_0_rgba(37,99,235,0)] group-hover:drop-shadow-[0_0_30px_rgba(37,99,235,0.8)]"
                            />
                        </button>
                        <div className="mt-6 text-center space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {mediaType === 'tv' ? `S${selectedSeason} : E${selectedEpisode}` : 'PLAY MOVIE'}
                            </h3>
                        </div>
                    </div>
                ) : (
                    <>
                        <iframe
                            key={`${tmdbId}-${currentServer}-${mediaType}-${selectedSeason}-${selectedEpisode}`}
                            src={src}
                            className="absolute inset-0 w-full h-full rounded-2xl bg-[#050505]"
                            onLoad={() => setIsLoading(false)}
                            allowFullScreen
                            referrerPolicy="origin"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />

                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
                                <KineticDotsLoader />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Controls & Info Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-2">
                {/* Server Selection */}
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Server size={14} /> Server
                    </span>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                        {videoProviders.map((provider, index) => (
                            <button
                                key={provider.name}
                                onClick={() => handleServerChange(index)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${currentServer === index
                                    ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/40 scale-105"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {provider.name === 'Fast' ? '🚀' : '✨'} {provider.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-all hover:text-white">
                        <Info size={14} /> Report Issue
                    </button>
                </div>
            </div>

            {/* TV Show Episode Selector */}
            {mediaType === 'tv' && (
                <div className="flex flex-col gap-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] shadow-lg shadow-[#2563eb]/20">
                                <MonitorPlay size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">EPISODES</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Season {selectedSeason}</p>
                            </div>
                        </div>

                        {/* Season Selection - With custom scrollbar (slider) for many seasons */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-4 max-w-[60%] lg:max-w-[75%] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2563eb]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#2563eb] [&::-webkit-scrollbar-thumb]:rounded-full transition-all">
                            {availableSeasons.map((season) => (
                                <button
                                    key={season.id}
                                    onClick={() => {
                                        setSelectedSeason(season.season_number);
                                        setSelectedEpisode(1);
                                    }}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black tracking-widest transition-all ${selectedSeason === season.season_number
                                        ? 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20'
                                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    S{season.season_number}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Episodes Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {episodes.map((episode) => (
                            <motion.button
                                key={episode.id}
                                whileHover={{ y: -4 }}
                                onClick={() => handleEpisodeSelect(episode.episode_number)}
                                className={`flex flex-col overflow-hidden rounded-2xl border transition-all text-left group ${selectedEpisode === episode.episode_number
                                    ? 'bg-[#2563eb]/10 border-[#2563eb]/30 ring-1 ring-[#2563eb]/20'
                                    : 'bg-[#151515] border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                                    {episode.still_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w400${episode.still_path}`}
                                            alt={episode.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Play size={32} className="text-gray-800" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <div className="bg-[#2563eb] px-2 py-0.5 rounded text-[10px] font-black text-white">
                                            EP {episode.episode_number}
                                        </div>
                                    </div>

                                    {selectedEpisode === episode.episode_number && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#2563eb] flex items-center justify-center shadow-2xl">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
                                    <h4 className={`text-sm font-black truncate mb-1.5 ${selectedEpisode === episode.episode_number ? 'text-[#2563eb]' : 'text-gray-200 group-hover:text-white'}`}>
                                        {episode.name}
                                    </h4>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
                                        {episode.overview || "Deep into the narrative, this episode unfolds with major twists."}
                                    </p>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
