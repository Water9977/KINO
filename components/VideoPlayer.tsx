"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, MonitorPlay } from "lucide-react";
import Image from "next/image";
import { getSeasonDetails } from "@/app/actions";
import { tmdbImage } from "@/lib/tmdb";
import type { MediaType, TmdbEpisode, TmdbSeasonSummary } from "@/lib/types";
import KineticDotsLoader from "@/components/ui/kinetic-dots-loader";

interface VideoPlayerProps {
    tmdbId: number;
    mediaType?: MediaType;
    seasons?: TmdbSeasonSummary[];
    backdropPath?: string | null;
    title?: string;
}

/**
 * The embed provider that actually serves playback.
 *
 * The iframe is sandboxed: the embed gets scripts and its own origin, but
 * explicitly NOT `allow-top-navigation` or `allow-popups`, so it cannot
 * redirect the user off Kino or spawn pop-unders.
 */
const STREAM_PROVIDER = {
    name: "vidlink",
    buildUrl: (tmdbId: number, mediaType: MediaType, season?: number, episode?: number) => {
        const theme = "player=jw&primaryColor=ffffff&secondaryColor=808080&iconColor=ffffff";
        return mediaType === "tv"
            ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?${theme}`
            : `https://vidlink.pro/movie/${tmdbId}?${theme}`;
    },
} as const;

export const VideoPlayer = ({
    tmdbId,
    mediaType = "movie",
    seasons = [],
    backdropPath,
    title,
}: VideoPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFrameLoading, setIsFrameLoading] = useState(true);

    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [episodes, setEpisodes] = useState<TmdbEpisode[]>([]);
    const [episodesLoading, setEpisodesLoading] = useState(false);

    const availableSeasons = seasons.filter((s) => s.season_number > 0);

    // Load the selected season's episodes. `ignore` discards responses that
    // arrive after the user has already moved to a different season.
    useEffect(() => {
        if (mediaType !== "tv" || availableSeasons.length === 0) return;

        let ignore = false;
        setEpisodes([]);
        setEpisodesLoading(true);

        getSeasonDetails(tmdbId, selectedSeason)
            .then((data) => {
                if (ignore) return;
                setEpisodes(data?.episodes ?? []);
            })
            .catch((error) => {
                if (ignore) return;
                console.error("Failed to fetch episodes", error);
                setEpisodes([]);
            })
            .finally(() => {
                if (!ignore) setEpisodesLoading(false);
            });

        return () => {
            ignore = true;
        };
        // availableSeasons is derived from `seasons`, which is stable per title.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tmdbId, mediaType, selectedSeason, seasons.length]);

    const handleSeasonSelect = (seasonNumber: number) => {
        setSelectedSeason(seasonNumber);
        setSelectedEpisode(1);
        setIsFrameLoading(true);
    };

    const handleEpisodeSelect = (episodeNumber: number) => {
        setSelectedEpisode(episodeNumber);
        setIsFrameLoading(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const src = STREAM_PROVIDER.buildUrl(
        tmdbId,
        mediaType,
        mediaType === "tv" ? selectedSeason : undefined,
        mediaType === "tv" ? selectedEpisode : undefined
    );

    const backdropUrl = tmdbImage(backdropPath, "w1280");

    return (
        <div className="w-full space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-[#2563eb]/10 border border-white/5 group ring-1 ring-white/10">
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20 overflow-hidden">
                        {backdropUrl && (
                            <Image
                                src={backdropUrl}
                                alt=""
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 1000px"
                                className="object-cover opacity-40 group-hover:opacity-30 transition-opacity duration-700 blur-[2px]"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        <div className="relative z-10 flex flex-col items-center">
                            <button
                                onClick={() => setIsPlaying(true)}
                                aria-label={
                                    mediaType === "tv"
                                        ? `Play season ${selectedSeason} episode ${selectedEpisode} of ${title ?? "this series"}`
                                        : `Play ${title ?? "this movie"}`
                                }
                                className="group/btn relative flex items-center justify-center transition-all duration-500 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-4 focus-visible:ring-offset-black rounded-full"
                            >
                                <div className="absolute inset-0 bg-[#2563eb] rounded-full blur-2xl opacity-0 group-hover/btn:opacity-60 transition-opacity duration-500" />
                                <Play
                                    size={72}
                                    className="text-white fill-white transition-all duration-500 drop-shadow-[0_0_0_rgba(37,99,235,0)] group-hover/btn:drop-shadow-[0_0_30px_rgba(37,99,235,0.8)] relative z-10"
                                />
                            </button>
                            <p className="mt-8 text-gray-400 font-bold text-xs tracking-[0.2em] uppercase">
                                {mediaType === "tv"
                                    ? `S${selectedSeason} · E${selectedEpisode}`
                                    : "Click to play"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <iframe
                            key={`${tmdbId}-${mediaType}-${selectedSeason}-${selectedEpisode}`}
                            src={src}
                            title={title ? `${title} player` : "Video player"}
                            className="absolute inset-0 w-full h-full rounded-2xl bg-[#050505]"
                            onLoad={() => setIsFrameLoading(false)}
                            allowFullScreen
                            referrerPolicy="no-referrer"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        />

                        {isFrameLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] z-10">
                                <KineticDotsLoader />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* TV Show Episode Selector */}
            {mediaType === "tv" && availableSeasons.length > 0 && (
                <div className="flex flex-col gap-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] shadow-lg shadow-[#2563eb]/20">
                                <MonitorPlay size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">EPISODES</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                    Season {selectedSeason}
                                </p>
                            </div>
                        </div>

                        <div
                            role="tablist"
                            aria-label="Select season"
                            className="flex items-center gap-2 overflow-x-auto pb-4 max-w-[60%] lg:max-w-[75%] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2563eb]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#2563eb] [&::-webkit-scrollbar-thumb]:rounded-full"
                        >
                            {availableSeasons.map((season) => {
                                const active = selectedSeason === season.season_number;
                                return (
                                    <button
                                        key={season.id}
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => handleSeasonSelect(season.season_number)}
                                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black tracking-widest transition-all ${active
                                            ? "bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/20"
                                            : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                            }`}
                                    >
                                        S{season.season_number}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {episodesLoading ? (
                        <div className="flex justify-center py-8">
                            <KineticDotsLoader />
                        </div>
                    ) : episodes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-500">
                            No episode information is available for this season.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {episodes.map((episode) => {
                                const active = selectedEpisode === episode.episode_number;
                                const stillUrl = tmdbImage(episode.still_path, "w400");

                                return (
                                    <motion.button
                                        key={episode.id}
                                        whileHover={{ y: -4 }}
                                        aria-current={active ? "true" : undefined}
                                        onClick={() => handleEpisodeSelect(episode.episode_number)}
                                        className={`flex flex-col overflow-hidden rounded-2xl border transition-all text-left group ${active
                                            ? "bg-[#2563eb]/10 border-[#2563eb]/30 ring-1 ring-[#2563eb]/20"
                                            : "bg-[#151515] border-white/5 hover:border-white/10"
                                            }`}
                                    >
                                        <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                                            {stillUrl ? (
                                                <Image
                                                    src={stillUrl}
                                                    alt=""
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
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

                                            {active && (
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#2563eb] flex items-center justify-center shadow-2xl">
                                                    <Play size={24} fill="currentColor" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
                                            <h4
                                                className={`text-sm font-black truncate mb-1.5 ${active ? "text-[#2563eb]" : "text-gray-200 group-hover:text-white"
                                                    }`}
                                            >
                                                {episode.name}
                                            </h4>
                                            {episode.overview && (
                                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium">
                                                    {episode.overview}
                                                </p>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
