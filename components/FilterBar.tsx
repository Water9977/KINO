"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ListFilter, ChevronDown, Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import type { MediaType, TmdbGenre, TmdbWatchProvider } from "@/lib/types";

interface Option {
    id: string;
    name: string;
}

interface CustomSelectProps {
    label: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder: string;
    className?: string;
}

/**
 * A styled single-select, built as the ARIA "select-only combobox".
 *
 * DOM focus never leaves the button: the options are not tab stops, and the button points at the
 * highlighted one with aria-activedescendant. That removes the old split between "the option that
 * has focus" and "the option that is highlighted", which made Enter commit the wrong choice.
 *
 *  - Enter / Space / ArrowDown / ArrowUp open the list on the current selection
 *  - ArrowUp/Down, Home, End move the highlight; Enter commits it; Escape closes without changing
 *  - Tab commits the highlighted option and moves on (the pattern's behaviour); clicking away closes
 *  - typing a letter jumps to the next option starting with it
 */
const CustomSelect = ({
    label,
    value,
    options,
    onChange,
    placeholder,
    className,
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const typeahead = useRef<{ text: string; timer: ReturnType<typeof setTimeout> | undefined }>({
        text: "",
        timer: undefined,
    });
    const baseId = useId();
    const listboxId = `${baseId}-listbox`;
    const labelId = `${baseId}-label`;
    const valueId = `${baseId}-value`;
    const optionId = (index: number) => `${baseId}-opt-${index}`;

    const selectedIndex = Math.max(
        options.findIndex((opt) => opt.id === value),
        0
    );
    const selectedOption = options[selectedIndex];

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        listRef.current
            ?.querySelectorAll('[role="option"]')
            [activeIndex]?.scrollIntoView({ block: "nearest" });
    }, [isOpen, activeIndex]);

    /** Opening always starts the highlight on the current selection. */
    const open = () => {
        setActiveIndex(selectedIndex);
        setIsOpen(true);
    };

    const commit = (index: number) => {
        const option = options[index];
        // Re-choosing the current value is not a change; skip the navigation it would trigger.
        if (option && option.id !== value) onChange(option.id);
        setIsOpen(false);
    };

    const handleTypeahead = (char: string) => {
        const state = typeahead.current;
        clearTimeout(state.timer);
        state.text += char.toLowerCase();
        state.timer = setTimeout(() => {
            state.text = "";
        }, 600);

        // The same letter pressed repeatedly cycles through the options that start with it.
        const cycling = state.text.split("").every((c) => c === state.text[0]);
        const needle = cycling ? state.text[0] : state.text;
        const from = (isOpen ? activeIndex : selectedIndex) + (cycling && state.text.length > 1 ? 1 : 0);
        const match = options
            .map((_, i) => (from + i) % options.length)
            .find((i) => options[i].name.toLowerCase().startsWith(needle));
        if (match === undefined) return;
        if (!isOpen) setIsOpen(true);
        setActiveIndex(match);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        switch (e.key) {
            case "Escape":
                if (isOpen) {
                    e.preventDefault();
                    setIsOpen(false);
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (!isOpen) open();
                else setActiveIndex((i) => Math.min(i + 1, options.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                if (!isOpen) open();
                else setActiveIndex((i) => Math.max(i - 1, 0));
                break;
            case "Home":
                if (isOpen) {
                    e.preventDefault();
                    setActiveIndex(0);
                }
                break;
            case "End":
                if (isOpen) {
                    e.preventDefault();
                    setActiveIndex(options.length - 1);
                }
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (isOpen) commit(activeIndex);
                else open();
                break;
            case "Tab":
                // Not prevented: focus moves on as normal, after the highlighted choice is applied.
                if (isOpen) commit(activeIndex);
                break;
            default:
                if (e.key.length === 1) handleTypeahead(e.key);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className ?? ""}`}>
            {/* Name = "<label> <current value>", so the visible text is part of the accessible name. */}
            <span id={labelId} className="sr-only">
                {label}
            </span>
            <button
                type="button"
                role="combobox"
                aria-labelledby={`${labelId} ${valueId}`}
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-haspopup="listbox"
                aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
                onClick={() => (isOpen ? setIsOpen(false) : open())}
                onKeyDown={handleKeyDown}
                onBlur={() => setIsOpen(false)}
                className="w-full h-10 flex items-center justify-between gap-3 bg-black/40 border border-white/10 rounded-lg px-4 text-sm text-gray-200 hover:bg-white/10 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
            >
                <span id={valueId} className="truncate">
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={listRef}
                        id={listboxId}
                        role="listbox"
                        aria-label={label}
                        // Keeps focus on the button while the list (including its scrollbar) is clicked.
                        onMouseDown={(e) => e.preventDefault()}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[100] mt-2 w-full min-w-[220px] max-h-72 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] kino-scrollbar"
                    >
                        <div className="p-1.5 space-y-0.5">
                            {options.map((option, index) => {
                                const selected = option.id === value;
                                return (
                                    <div
                                        key={option.id}
                                        id={optionId(index)}
                                        role="option"
                                        aria-selected={selected}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => commit(index)}
                                        className={`w-full flex cursor-pointer items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${selected
                                            ? "bg-white/10 text-white font-bold"
                                            : index === activeIndex
                                                ? "bg-white/5 text-white"
                                                : "text-gray-400"
                                            }`}
                                    >
                                        <span className="truncate">{option.name}</span>
                                        {selected && (
                                            <Check size={16} aria-hidden="true" className="text-blue-400" strokeWidth={3} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface FilterBarProps {
    type: MediaType;
    genres: TmdbGenre[];
    providers?: TmdbWatchProvider[];
}

export function FilterBar({ type, genres, providers = [] }: FilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // The URL is the single source of truth. Mirroring it into useState and
    // syncing back with an effect caused cascading renders and could drift.
    const sort = searchParams.get("sort_by") || "popularity.desc";
    const genre = searchParams.get("genre") || "";
    const provider = searchParams.get("provider") || "";

    const updateFilter = (key: "sort_by" | "genre" | "provider", value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    };

    const sortOptions: Option[] = [
        { id: "popularity.desc", name: "Most Popular" },
        { id: "vote_average.desc", name: "Top Rated" },
        {
            id: type === "movie" ? "primary_release_date.desc" : "first_air_date.desc",
            name: "Newest Release",
        },
    ];

    const genreOptions: Option[] = [
        { id: "", name: "All Genres" },
        ...genres.map((g) => ({ id: String(g.id), name: g.name })),
    ];

    const providerOptions: Option[] = [
        { id: "", name: "All Providers" },
        ...providers.map((p) => ({ id: String(p.provider_id), name: p.provider_name })),
    ];

    return (
        <div className="relative z-40 flex flex-col sm:flex-row gap-4 mb-10 items-center bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2.5 px-2 text-gray-400">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-blue-400">
                    <ListFilter size={18} aria-hidden="true" />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-gray-300">
                    Quick Filters
                </span>
            </div>

            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <CustomSelect
                    label="Sort by"
                    value={sort}
                    options={sortOptions}
                    onChange={(val) => updateFilter("sort_by", val)}
                    placeholder="Sort By"
                    className="w-full sm:w-56"
                />

                <CustomSelect
                    label="Genre"
                    value={genre}
                    options={genreOptions}
                    onChange={(val) => updateFilter("genre", val)}
                    placeholder="All Genres"
                    className="w-full sm:w-56"
                />

                {providers.length > 0 && (
                    <CustomSelect
                        label="Provider"
                        value={provider}
                        options={providerOptions}
                        onChange={(val) => updateFilter("provider", val)}
                        placeholder="All Providers"
                        className="w-full sm:w-56"
                    />
                )}
            </div>
        </div>
    );
}
