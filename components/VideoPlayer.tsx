"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, MonitorPlay, RotateCw } from "lucide-react";
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
 * Note: this player is intentionally NOT sandboxed. vidlink.pro detects the
 * sandbox attribute and refuses to play, showing "Please Disable Sandbox"
 * instead of the video. The `frame-src` allowlist in the CSP (next.config.ts)
 * is what restricts which origin may be framed here. The remaining mitigations for an
 * unsandboxed third-party frame are the `beforeunload` guard and the trimmed `allow` list below.
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

/**
 * Features the embed may use. A video player needs playback, DRM and picture-in-picture.
 * Fullscreen comes from `allowFullScreen`. Motion sensors and clipboard access were delegated
 * before but have no use in a video embed, so they are no longer handed to a third party.
 */
const PLAYER_ALLOW = "autoplay; encrypted-media; picture-in-picture";

/** How long the frame may stay on the loading overlay before we offer a retry. */
const FRAME_SLOW_MS = 12_000;

export const VideoPlayer = ({
    tmdbId,
    mediaType = "movie",
    seasons = [],
    backdropPath,
    title,
}: VideoPlayerProps) => {
    const availableSeasons = seasons.filter((s) => s.season_number > 0);
    const firstSeason = availableSeasons[0]?.season_number ?? 1;

    const [isPlaying, setIsPlaying] = useState(false);
    /** Bumped to remount the iframe (Retry / Reload player). */
    const [attempt, setAttempt] = useState(0);
    const [loadedKey, setLoadedKey] = useState<string | null>(null);
    const [slowKey, setSlowKey] = useState<string | null>(null);

    // Two separate ideas that used to share one piece of state: the season whose episode list is
    // being *browsed*, and the episode that is being *played*. Looking at another season must not
    // tear down the stream.
    const [browsedSeason, setBrowsedSeason] = useState(firstSeason);
    const [playing, setPlaying] = useState({ season: firstSeason, episode: 1 });

    const [episodes, setEpisodes] = useState<TmdbEpisode[]>([]);
    const [episodesLoading, setEpisodesLoading] = useState(false);
    const frameRef = useRef<HTMLIFrameElement>(null);

    // Loading state is derived from the iframe that is actually mounted, not toggled by hand. The old
    // flag was set whenever an episode or season was clicked, but a click on the one already selected
    // keeps the same iframe (no new `load` event), which left the overlay up forever.
    const frameKey = `${tmdbId}-${mediaType}-${playing.season}-${playing.episode}-${attempt}`;
    const isFrameLoading = loadedKey !== frameKey;
    const isSlow = isFrameLoading && slowKey === frameKey;

    // Load the browsed season's episodes. `ignore` discards responses that
    // arrive after the user has already moved to a different season.
    useEffect(() => {
        if (mediaType !== "tv" || availableSeasons.length === 0) return;

        let ignore = false;
        setEpisodes([]);
        setEpisodesLoading(true);

        getSeasonDetails(tmdbId, browsedSeason)
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
    }, [tmdbId, mediaType, browsedSeason, seasons.length]);

    // A cross-origin iframe reports neither HTTP status nor an error event (it fires `load` even for
    // its own error page), so the only thing we can detect is "never finished loading".
    useEffect(() => {
        if (!isPlaying || !isFrameLoading) return;
        const timer = setTimeout(() => setSlowKey(frameKey), FRAME_SLOW_MS);
        return () => clearTimeout(timer);
    }, [isPlaying, isFrameLoading, frameKey]);

    // The embed is a third-party page we cannot sandbox (see STREAM_PROVIDER). After a click inside
    // it, the page is allowed to navigate the whole window away. While something is playing, ask
    // before the document unloads: that turns a silent hijack into a "Leave site?" prompt. In-app
    // navigation does not unload the document, so normal browsing is unaffected.
    useEffect(() => {
        if (!isPlaying) return;
        const guard = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", guard);
        return () => window.removeEventListener("beforeunload", guard);
    }, [isPlaying]);

    // Pressing Play removes the (focused) Play button, which would drop keyboard focus to <body>.
    // Hand it to the player instead, but only when focus was lost: never steal it from a control the
    // visitor is using (the persistent Reload button, an episode card).
    useEffect(() => {
        if (!isPlaying) return;
        const active = document.activeElement;
        if (!active || active === document.body) frameRef.current?.focus();
    }, [isPlaying, attempt]);

    const handleSeasonSelect = (seasonNumber: number) => {
        setBrowsedSeason(seasonNumber);
        // Before playback starts, the poster names the episode that Play will start, so keep it in
        // step with the season the visitor chose. Once something is playing, leave the stream alone.
        if (!isPlaying) setPlaying({ season: seasonNumber, episode: 1 });
    };

    const handleEpisodeSelect = (episodeNumber: number) => {
        setPlaying({ season: browsedSeason, episode: episodeNumber });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const reloadPlayer = () => setAttempt((n) => n + 1);

    const src = STREAM_PROVIDER.buildUrl(
        tmdbId,
        mediaType,
        mediaType === "tv" ? playing.season : undefined,
        mediaType === "tv" ? playing.episode : undefined
    );

    const backdropUrl = tmdbImage(backdropPath, "w1280");

    return (
        <div className="w-full space-y-6">
            {/* The embedded page is out of our control and may capture the keyboard; give a way past it. */}
            <a
                href="#title-details"
                className="sr-only focus:not-sr-only focus:inline-block focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
            >
                Skip the player and go to details
            </a>

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
                                        ? `Play season ${playing.season} episode ${playing.episode} of ${title ?? "this series"}`
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
                                    ? `S${playing.season} · E${playing.episode}`
                                    : "Click to play"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <iframe
                            // A new key = a new iframe. It changes with the episode and with Retry.
                            key={frameKey}
                            ref={frameRef}
                            src={src}
                            title={title ? `${title} player` : "Video player"}
                            className="absolute inset-0 w-full h-full rounded-2xl bg-[#050505]"
                            onLoad={() => setLoadedKey(frameKey)}
                            allowFullScreen
                            referrerPolicy="origin"
                            allow={PLAYER_ALLOW}
                        />

                        {isFrameLoading && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a] px-6 text-center">
                                {isSlow ? (
                                    <>
                                        <p role="status" className="text-sm font-semibold text-gray-100">
                                            Taking longer than usual…
                                        </p>
                                        <p className="max-w-sm text-xs text-gray-400">
                                            The player may be slow or unreachable on your connection.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={reloadPlayer}
                                            className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95"
                                        >
                                            <RotateCw size={14} aria-hidden="true" />
                                            Retry
                                        </button>
                                    </>
                                ) : (
                                    <KineticDotsLoader label="Loading player" />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* `load` fires for the frame's own error page too (refused, 503, blocked), which the
                watchdog above cannot see, so a manual way to reload is always on offer. */}
            {isPlaying && (
                <div className="-mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={reloadPlayer}
                        className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:text-white"
                    >
                        <RotateCw size={12} aria-hidden="true" />
                        Player not loading? Reload player
                    </button>
                </div>
            )}

            {/* TV Show Episode Selector */}
            {mediaType === "tv" && availableSeasons.length > 0 && (
                <div className="flex flex-col gap-6 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] shadow-lg shadow-[#2563eb]/20">
                                <MonitorPlay size={20} className="text-white" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">EPISODES</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                    Season {browsedSeason}
                                </p>
                            </div>
                        </div>

                        {/* Plain toggle buttons. The previous role="tablist"/"tab" promised arrow-key
                            navigation and tab panels that were never implemented. */}
                        <div
                            role="group"
                            aria-label="Seasons"
                            className="flex items-center gap-2 overflow-x-auto pb-4 max-w-[60%] lg:max-w-[75%] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#2563eb]/50 hover:[&::-webkit-scrollbar-thumb]:bg-[#2563eb] [&::-webkit-scrollbar-thumb]:rounded-full"
                        >
                            {availableSeasons.map((season) => {
                                const active = browsedSeason === season.season_number;
                                return (
                                    <button
                                        key={season.id}
                                        type="button"
                                        aria-pressed={active}
                                        aria-label={`S${season.season_number}, season ${season.season_number}`}
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
                            <KineticDotsLoader label="Loading episodes" />
                        </div>
                    ) : episodes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-400">
                            No episode information is available for this season.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {episodes.map((episode) => {
                                const active =
                                    playing.season === browsedSeason && playing.episode === episode.episode_number;
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
                                                    <Play size={32} className="text-gray-800" aria-hidden="true" />
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
                                                    <Play size={24} fill="currentColor" aria-hidden="true" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 bg-gradient-to-b from-transparent to-black/20">
                                            <h4
                                                className={`text-sm font-black truncate mb-1.5 ${active ? "text-blue-400" : "text-gray-200 group-hover:text-white"
                                                    }`}
                                            >
                                                {episode.name}
                                            </h4>
                                            {episode.overview && (
                                                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed font-medium">
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
