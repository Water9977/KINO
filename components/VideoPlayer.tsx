"use client";

import { useState, useEffect } from "react";
import { Play, Server, AlertTriangle, Shield, ChevronDown, MonitorPlay } from "lucide-react";
import { TMDB } from "@/lib/tmdb";
import Image from "next/image";

interface VideoPlayerProps {
    tmdbId: number;
    mediaType?: 'movie' | 'tv';
    seasons?: any[];
}

const videoProviders = [
    {
        name: 'Server 1',
        getUrl: (tmdbId: number, mediaType: string, season?: number, episode?: number) => `https://vidsrc.xyz/embed/${mediaType === 'movie' ? 'movie' : 'tv'}/${tmdbId}${season && episode ? `/${season}/${episode}` : ''}`,
    },
    {
        name: 'Server 2',
        getUrl: (tmdbId: number, mediaType: string, season?: number, episode?: number) => {
            if (mediaType === 'tv') {
                return `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`;
            }
            return `https://player.smashy.stream/movie/${tmdbId}`;
        },
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
                    // Initial Warning / Consent Screen
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 text-center z-20">
                        <Shield size={64} className="mb-4 text-[#2563eb] opacity-80" />
                        <h3 className="text-2xl font-bold text-white mb-3">Ready to Stream</h3>
                        <div className="flex flex-col items-center gap-4 mb-8">
                            <p className="text-gray-400 text-sm">For the best ad-free experience:</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <a
                                    href="https://brave.com/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#ff5500] hover:bg-[#ff5500]/90 text-white rounded-lg font-bold text-xs transition-transform hover:scale-105 shadow-lg shadow-orange-500/20"
                                >
                                    <Shield size={14} className="fill-current" /> Get Brave Browser
                                </a>
                                <a
                                    href="https://chromewebstore.google.com/detail/adblock-%E2%80%94-block-ads-acros/gighmmpiobklfepjocnamgkkbiglidom"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-[#800000] hover:bg-[#991b1b] text-white rounded-lg font-bold text-xs transition-transform hover:scale-105 shadow-lg shadow-red-900/20"
                                >
                                    <Shield size={14} className="fill-current" /> Get AdBlock
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={handleStartStreaming}
                            className="group/btn relative flex items-center gap-3 px-8 py-4 rounded-xl bg-[#2563eb] text-white font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95"
                        >
                            <Play size={24} fill="currentColor" />
                            Start Streaming
                        </button>
                    </div>
                ) : !isPlaying ? (
                    // Play Button (after consent)
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm transition-all z-10">
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="group/btn relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#2563eb]/20 text-[#2563eb] ring-1 ring-[#2563eb]/50 transition-all hover:scale-110 hover:bg-[#2563eb] hover:text-white hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] active:scale-95"
                        >
                            <Play size={48} fill="currentColor" className="ml-1 relative z-10" />
                            <div className="absolute inset-0 rounded-full bg-[#2563eb] opacity-0 group-hover/btn:animate-ping group-hover:opacity-20 transition-all" />
                        </button>
                        <h3 className="text-2xl font-bold text-white drop-shadow-md">Click to Play {mediaType === 'tv' ? `S${selectedSeason}:E${selectedEpisode}` : 'Movie'}</h3>
                        <p className="mt-2 text-sm text-gray-400">
                            Stream ready on <span className="text-[#2563eb] font-bold">{videoProviders[currentServer].name}</span>
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Server Switcher - OUTSIDE iframe so always clickable */}
                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                            {videoProviders.map((provider, index) => (
                                <button
                                    key={provider.name}
                                    onClick={() => handleServerChange(index)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 shadow-lg ${currentServer === index
                                        ? "bg-[#2563eb] text-white scale-105 shadow-[#2563eb]/30"
                                        : "bg-black/60 text-gray-300 hover:bg-black/80 backdrop-blur-sm"
                                        }`}
                                >
                                    {provider.name}
                                </button>
                            ))}
                        </div>

                        <iframe
                            key={`${tmdbId}-${currentServer}-${mediaType}-${selectedSeason}-${selectedEpisode}`}
                            src={src}
                            className="absolute inset-0 w-full h-full rounded-xl"
                            onLoad={() => setIsLoading(false)}
                            allowFullScreen
                            referrerPolicy="origin"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />

                        {/* Loading State */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563eb]"></div>
                                    <p className="text-sm text-gray-400">Loading {videoProviders[currentServer].name}...</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* TV Show Episode Selector */}
            {mediaType === 'tv' && (
                <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MonitorPlay size={20} className="text-[#2563eb]" />
                            Select Episode
                        </h3>

                        {/* Season Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-lg text-sm font-medium hover:bg-black/60 transition-colors border border-white/10 w-40 justify-between"
                            >
                                Season {selectedSeason}
                                <ChevronDown size={14} className={isSeasonDropdownOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                            </button>

                            {isSeasonDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-full max-h-60 overflow-y-auto bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-30">
                                    {availableSeasons.map((season) => (
                                        <button
                                            key={season.id}
                                            onClick={() => {
                                                setSelectedSeason(season.season_number);
                                                setIsSeasonDropdownOpen(false);
                                                // Reset episode to 1 when changing season IF current episode doesn't exist (simplest is just keep as is or reset)
                                                // Resetting to 1 is safer for user UX
                                                setSelectedEpisode(1);
                                            }}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${selectedSeason === season.season_number ? 'text-[#2563eb] font-bold bg-white/5' : 'text-gray-300'}`}
                                        >
                                            {season.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Episodes Grid */}
                    <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {episodes.map((episode) => (
                                <button
                                    key={episode.id}
                                    onClick={() => handleEpisodeSelect(episode.episode_number)}
                                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all text-left group ${selectedEpisode === episode.episode_number
                                        ? 'bg-[#2563eb]/10 border-[#2563eb]/50 ring-1 ring-[#2563eb]/20'
                                        : 'bg-black/20 border-transparent hover:bg-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="relative w-24 aspect-video bg-black/40 rounded overflow-hidden flex-shrink-0">
                                        {episode.still_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                                alt={`Episode ${episode.episode_number}`}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                                <Play size={20} />
                                            </div>
                                        )}
                                        <div className="absolute top-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                                            Ep {episode.episode_number}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-medium truncate mb-1 ${selectedEpisode === episode.episode_number ? 'text-[#2563eb]' : 'text-gray-200 group-hover:text-white'}`}>
                                            {episode.name}
                                        </h4>
                                        <p className="text-[10px] text-gray-500 line-clamp-2">
                                            {episode.overview || "No description available."}
                                        </p>
                                    </div>
                                </button>
                            ))}

                            {episodes.length === 0 && (
                                <div className="col-span-full py-8 text-center text-gray-500 text-sm">
                                    Loading episodes...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Streaming Info */}
            <div className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Server size={16} className="text-[#2563eb]" />
                    <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Server Info</h3>
                </div>
                {hasUserConsent ? (
                    <>
                        <p className="text-xs text-gray-400">
                            Currently streaming from <span className="text-[#2563eb] font-bold">{videoProviders[currentServer].name}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-500">Too many ads?</span>
                            <a
                                href="https://brave.com/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#ff5500] hover:underline flex items-center gap-1 transition-colors"
                            >
                                Get Brave
                            </a>
                            <span className="text-gray-700">|</span>
                            <a
                                href="https://chromewebstore.google.com/detail/adblock-%E2%80%94-block-ads-acros/gighmmpiobklfepjocnamgkkbiglidom"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-[#b91c1c] hover:underline flex items-center gap-1 transition-colors"
                            >
                                Get AdBlock
                            </a>
                        </div>
                    </>
                ) : (
                    <p className="text-xs text-gray-400">
                        Click "Start Streaming" above to begin watching
                    </p>
                )}
            </div>
        </div>
    );
};
