"use client";

import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb";
import type { TmdbListItem } from "@/lib/types";

interface SearchSuggestionsProps {
    suggestions: TmdbListItem[];
    isSearching: boolean;
    query: string;
    onSelect: (item: TmdbListItem) => void;
    onSeeAll: () => void;
}

export function SearchSuggestions({
    suggestions,
    isSearching,
    query,
    onSelect,
    onSeeAll,
}: SearchSuggestionsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        >
            {isSearching ? (
                <div className="flex items-center justify-center p-6 text-gray-400">
                    <Loader2 className="animate-spin" size={20} aria-hidden="true" />
                    <span className="sr-only">Searching</span>
                </div>
            ) : (
                <ul role="listbox" aria-label="Search suggestions" className="flex flex-col">
                    {suggestions.map((item) => {
                        const posterUrl = tmdbImage(item.poster_path, "w92");
                        const label = item.title || item.name || "Untitled";
                        const year = (item.release_date || item.first_air_date)?.split("-")[0] || "N/A";

                        return (
                            <li key={`${item.media_type}-${item.id}`} role="option" aria-selected={false}>
                                <button
                                    type="button"
                                    // mousedown fires before the input's blur, so the
                                    // dropdown is still mounted when the click lands.
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        onSelect(item);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            onSelect(item);
                                        }
                                    }}
                                    className="flex w-full items-center gap-3 p-3 text-left hover:bg-white/10 transition-colors"
                                >
                                    {posterUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={posterUrl}
                                            alt=""
                                            width={40}
                                            height={56}
                                            loading="lazy"
                                            className="w-10 h-14 rounded-md object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <span className="w-10 h-14 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 text-white/20">
                                            <Search size={16} aria-hidden="true" />
                                        </span>
                                    )}
                                    <span className="flex flex-col flex-1 overflow-hidden">
                                        <span className="text-white text-sm font-semibold truncate">{label}</span>
                                        <span className="text-gray-400 text-xs">
                                            {year} • {(item.media_type || "movie").toUpperCase()}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}

                    <li>
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                onSeeAll();
                            }}
                            className="w-full p-3 text-center text-xs font-semibold text-[#2563eb] hover:bg-white/5 hover:text-blue-400 mt-1 transition-colors"
                        >
                            See all results for &ldquo;{query}&rdquo;
                        </button>
                    </li>
                </ul>
            )}
        </motion.div>
    );
}
