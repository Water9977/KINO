"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Server, AlertTriangle, Shield, ChevronDown, MonitorPlay, Info } from "lucide-react";
import { TMDB } from "@/lib/tmdb";
import Image from "next/image";
import KineticDotsLoader from "@/components/ui/kinetic-dots-loader";

interface VideoPlayerProps {
    tmdbId: number;
    mediaType?: 'movie' | 'tv';
    seasons?: any[];
}

const videoProviders = [
    {
        name: 'Quality',
        getUrl: (tmdbId: number, mediaType: string, season?: number, episode?: number) => {
            if (mediaType === 'tv') {
                return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?player=jw&primaryColor=ffffff&secondaryColor=808080&iconColor=ffffff`;
            }
            return `https://vidlink.pro/movie/${tmdbId}?player=jw&primaryColor=ffffff&secondaryColor=808080&iconColor=ffffff`;
        },
    },
    {
        name: 'Fast',
        getUrl: (tmdbId: number, mediaType: string, season?: number, episode?: number) => `https://vidsrc.xyz/embed/${mediaType === 'movie' ? 'movie' : 'tv'}/${tmdbId}${season && episode ? `/${season}/${episode}` : ''}`,
    },
];

export const VideoPlayer = ({ tmdbId, mediaType = 'movie', seasons = [] }: VideoPlayerProps) => {
    const [hasUserConsent, setHasUserConsent] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentServer, setCurrentServer] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // TV Show State
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [episodes, setEpisodes] = useState<any[]>([]);
    const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

    // Filter out Season 0 (Specials) if preferred, or keep it. usually S1 is default.
    const availableSeasons = seasons?.filter(s => s.season_number > 0) || [];

    // Fetch episodes when selected season changes
    useEffect(() => {
        if (mediaType === 'tv' && seasons?.length) {
            const fetchEpisodes = async () => {
                try {
                    const data = await TMDB.getSeasonDetails(tmdbId, selectedSeason);
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

    // Reset when Movie ID changes
    useEffect(() => {
        setHasUserConsent(false);
        setIsPlaying(false);
        setIsLoading(true);
        setCurrentServer(0);
        setSelectedSeason(1);
        setSelectedEpisode(1);
    }, [tmdbId]);

    const handleServerChange = (index: number) => {
        setCurrentServer(index);
        setIsLoading(true);
    };

    const handleStartStreaming = () => {
        setHasUserConsent(true);
        setIsPlaying(true);
    };

    const handleEpisodeSelect = (episodeNumber: number) => {
        setSelectedEpisode(episodeNumber);
        setIsLoading(true); // Re-trigger loading for new source
        // Scroll to top of player to see it change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Construct src based on type
    const src = videoProviders[currentServer].getUrl(
        tmdbId,
        mediaType,
        mediaType === 'tv' ? selectedSeason : undefined,
        mediaType === 'tv' ? selectedEpisode : undefined
    );

    return (
        <div className="w-full space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-[#2563eb]/10 border border-white/5 group ring-1 ring-white/10">
                {!hasUserConsent ? (
                    // Initial Warning / Consent Screen - Premium Redesign
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] p-8 text-center z-20 overflow-hidden"
                    >
                        {/* Animated background elements */}
                        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#2563eb]/20 rounded-full blur-[120px] animate-pulse-slow" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow" />

                        <div className="relative z-10 max-w-lg">
                            <div className="mx-auto w-20 h-20 mb-8 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] p-[2px] shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                                <div className="w-full h-full bg-[#0a0a0a] rounded-[14px] flex items-center justify-center">
                                    <Shield size={40} className="text-[#2563eb]" />
                                </div>
                            </div>

                            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">ENHANCED STREAMING</h3>
                            <p className="text-gray-400 text-lg mb-8 font-medium">
                                To ensure a premium, interrupt-free experience, we recommend using a security-focused browser or extension.
                            </p>

                            <div className="flex flex-wrap justify-center gap-4 mb-10">
                                <a
                                    href="https://brave.com/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 px-6 py-3 bg-[#ff5500]/10 hover:bg-[#ff5500] border border-[#ff5500]/20 rounded-xl font-bold text-sm transition-all hover:scale-105"
                                >
                                    <Shield size={18} className="text-[#ff5500] group-hover:text-white" />
                                    <span className="text-[#ff5500] group-hover:text-white">Brave Browser</span>
                                </a>
                                <a
                                    href="https://chromewebstore.google.com/detail/adblock-%E2%80%94-block-ads-acros/gighmmpiobklfepjocnamgkkbiglidom"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 px-6 py-3 bg-[#800000]/10 hover:bg-[#800000] border border-[#800000]/20 rounded-xl font-bold text-sm transition-all hover:scale-105"
                                >
                                    <Shield size={18} className="text-[#800000] group-hover:text-white" />
                                    <span className="text-[#800000] group-hover:text-white">AdBlock Guard</span>
                                </a>
                            </div>

                            <button
                                onClick={handleStartStreaming}
                                className="group relative w-full flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-[#2563eb] text-white font-black text-xl transition-all hover:scale-[1.02] hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.5)] active:scale-95"
                            >
                                <Play size={28} fill="currentColor" className="transition-transform group-hover:scale-110" />
                                <span>I UNDERSTAND, START PLAYING</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-150%] transition-transform duration-700 group-hover:translate-x-[150%]" />
                            </button>
                        </div>
                    </motion.div>
                ) : !isPlaying ? (
                    // Play Button Overlay - Premium Look
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-md transition-all z-10 group/player">
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="group/play-btn relative mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-all hover:scale-110 active:scale-90"
                        >
                            <Play size={44} fill="currentColor" className="ml-1.5" />
                            <div className="absolute -inset-4 rounded-full border border-[#2563eb]/50 animate-ping opacity-20" />
                        </button>

                        <div className="text-center space-y-2">
                            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-2xl">
                                {mediaType === 'tv' ? `S${selectedSeason} EPISODE ${selectedEpisode}` : 'PLAY MOVIE'}
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-gray-400 font-bold text-sm tracking-widest uppercase">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Stream source: {videoProviders[currentServer].name}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Server Switcher - Sleek Floating UI */}
                        <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex flex-col gap-1.5">
                                {videoProviders.map((provider, index) => (
                                    <button
                                        key={provider.name}
                                        onClick={() => handleServerChange(index)}
                                        className={`px-4 py-2 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${currentServer === index
                                            ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {provider.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <iframe
                            key={`${tmdbId}-${currentServer}-${mediaType}-${selectedSeason}-${selectedEpisode}`}
                            src={src}
                            className="absolute inset-0 w-full h-full rounded-2xl bg-[#050505]"
                            onLoad={() => setIsLoading(false)}
                            allowFullScreen
                            referrerPolicy="origin"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />

                        {/* Premium Loading Spinner */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
                                <div className="flex flex-col items-center gap-6">
                                    <KineticDotsLoader />
                                    <div className="text-center relative -top-10">
                                        <p className="text-white font-black tracking-widest uppercase text-xs">Initializing Source</p>
                                        <p className="text-gray-500 text-[10px] mt-1">{videoProviders[currentServer].name} Protocol</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* TV Show Episode Selector - Modern Sidebar Style */}
            {mediaType === 'tv' && (
                <div className="flex flex-col gap-6">
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

                        {/* Season Selection - Sleek Horizontal List */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar max-w-[50%]">
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

                    {/* Episodes Grid - Premium Cards */}
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

                    {episodes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <div className="animate-pulse flex flex-col items-center gap-4">
                                <MonitorPlay size={40} className="text-gray-700" />
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Searching Archives...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Streaming Info */}
            <div className="rounded-2xl border border-white/5 bg-gradient-to-r from-white/5 to-transparent p-6 backdrop-blur-xl flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <Server size={18} className="text-[#2563eb]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Source Connection</p>
                        <p className="text-sm font-bold text-gray-200">
                            {hasUserConsent ? `Verified: ${videoProviders[currentServer].name}` : 'Awaiting Authorization'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Optimal browsing</span>
                        <div className="flex items-center gap-2">
                            <a href="https://brave.com/" target="_blank" className="hover:scale-110 transition-transform"><Shield size={16} className="text-[#ff5500]" /></a>
                            <a href="#" className="hover:scale-110 transition-transform"><Shield size={16} className="text-purple-500" /></a>
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-300 transition-all hover:text-white">
                        <Info size={14} /> Report Link
                    </button>
                </div>
            </div>
        </div>
    );
};

