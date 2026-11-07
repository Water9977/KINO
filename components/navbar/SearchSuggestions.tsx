"use client";

import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { tmdbImage } from "@/lib/tmdb";
import type { TmdbListItem } from "@/lib/types";

export type SearchSuggestionsState = "loading" | "ready" | "error";

interface SearchSuggestionsProps {
    suggestions: TmdbListItem[];
    state: SearchSuggestionsState;
    query: string;
    /** id of the listbox, referenced by the input's aria-controls. */
    listboxId: string;
    /** Index of the keyboard-highlighted option; `suggestions.length` is the "See all" row. */
    activeIndex: number;
    onSelect: (item: TmdbListItem) => void;
    onSeeAll: () => void;
    onActivate: (index: number) => void;
}

/** DOM id of option `index`, shared with the input's aria-activedescendant. */
export const suggestionOptionId = (listboxId: string, index: number) => `${listboxId}-opt-${index}`;

/**
 * The dropdown under the search field.
 *
 * It is the popup half of an ARIA combobox: focus never leaves the text input, so the options are
 * plain `li[role=option]` (no nested buttons, not tabbable) and the input points at the highlighted
 * one with aria-activedescendant. `onMouseDown` is prevented so a click does not blur the input
 * first; selection happens on `click`, so a press that slides off an option can be cancelled.
 */
export function SearchSuggestions({
    suggestions,
    state,
    query,
    listboxId,
    activeIndex,
    onSelect,
    onSeeAll,
    onActivate,
}: SearchSuggestionsProps) {
    const keepFocusInInput = (e: React.MouseEvent) => e.preventDefault();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        >
            {state === "loading" ? (
                <div className="flex items-center justify-center p-6 text-gray-400">
                    <Loader2 className="animate-spin" size={20} aria-hidden="true" />
                </div>
            ) : (
                <>
                    {suggestions.length === 0 && (
                        <p className="px-4 pt-4 pb-1 text-center text-sm text-gray-400">
                            {state === "error"
                                ? "Search is busy right now. Press Enter to see results."
                                : <>No results for &ldquo;{query}&rdquo;</>}
                        </p>
                    )}

                    <ul id={listboxId} role="listbox" aria-label="Search suggestions" className="flex flex-col">
                        {suggestions.map((item, index) => {
                            const posterUrl = tmdbImage(item.poster_path, "w92");
                            const label = item.title || item.name || "Untitled";
                            const year = (item.release_date || item.first_air_date)?.split("-")[0] || "N/A";
                            const active = index === activeIndex;

                            return (
                                <li
                                    key={`${item.media_type}-${item.id}`}
                                    id={suggestionOptionId(listboxId, index)}
                                    role="option"
                                    aria-selected={active}
                                    onMouseDown={keepFocusInInput}
                                    onMouseMove={() => onActivate(index)}
                                    onClick={() => onSelect(item)}
                                    className={`flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors ${active ? "bg-white/10" : "hover:bg-white/10"
                                        }`}
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
                                </li>
                            );
                        })}

                        <li
                            id={suggestionOptionId(listboxId, suggestions.length)}
                            role="option"
                            aria-selected={activeIndex === suggestions.length}
                            onMouseDown={keepFocusInInput}
                            onMouseMove={() => onActivate(suggestions.length)}
                            onClick={onSeeAll}
                            className={`mt-1 w-full cursor-pointer p-3 text-center text-xs font-semibold text-blue-400 transition-colors hover:bg-white/5 hover:text-blue-300 ${activeIndex === suggestions.length ? "bg-white/10" : ""
                                }`}
                        >
                            See all results for &ldquo;{query}&rdquo;
                        </li>
                    </ul>
                </>
            )}
        </motion.div>
    );
}
