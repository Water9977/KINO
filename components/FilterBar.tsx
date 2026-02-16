"use client";

import { useEffect, useState, useRef } from "react";
import { ListFilter, ChevronDown, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
    id: string | number;
    name: string;
}

interface CustomSelectProps {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder: string;
    className?: string;
}

const CustomSelect = ({ value, options, onChange, placeholder, className }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id.toString() === value.toString());

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-10 flex items-center justify-between gap-3 bg-black/40 border border-white/10 rounded-lg px-4 text-sm text-gray-200 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50"
            >
                <span className="truncate">{selectedOption ? selectedOption.name : placeholder}</span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[100] mt-2 w-full min-w-[220px] max-h-72 overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl kino-scrollbar"
                    >
                        <div className="p-1.5 space-y-0.5">
                            {options.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.id.toString());
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${value.toString() === option.id.toString()
                                        ? 'bg-white/10 text-white font-bold'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="truncate">{option.name}</span>
                                    {value.toString() === option.id.toString() && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        >
                                            <Check size={16} className="text-[#2563eb]" strokeWidth={3} />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface FilterBarProps {
    type: "movie" | "tv";
    genres: { id: number; name: string }[];
    providers?: { provider_id: number; provider_name: string }[];
}

export function FilterBar({ type, genres, providers = [] }: FilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [sort, setSort] = useState(searchParams.get("sort_by") || "popularity.desc");
    const [genre, setGenre] = useState(searchParams.get("genre") || "");
    const [provider, setProvider] = useState(searchParams.get("provider") || "");

    useEffect(() => {
        setSort(searchParams.get("sort_by") || "popularity.desc");
        setGenre(searchParams.get("genre") || "");
        setProvider(searchParams.get("provider") || "");
    }, [searchParams]);

    const updateFilters = (newSort: string, newGenre: string, newProvider: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("sort_by", newSort);
        if (newGenre) params.set("genre", newGenre);
        else params.delete("genre");
        if (newProvider) params.set("provider", newProvider);
        else params.delete("provider");
        router.push(`?${params.toString()}`);
    };

    const sortOptions = [
        { id: "popularity.desc", name: "Most Popular" },
        { id: "vote_average.desc", name: "Top Rated" },
        { id: type === 'movie' ? "primary_release_date.desc" : "first_air_date.desc", name: "Newest Release" }
    ];

    const genreOptions = [
        { id: "", name: "All Genres" },
        ...genres.map(g => ({ id: g.id.toString(), name: g.name }))
    ];

    const providerOptions = [
        { id: "", name: "All Providers" },
        ...providers.map(p => ({ id: p.provider_id.toString(), name: p.provider_name }))
    ];

    return (
        <div className="relative z-40 flex flex-col sm:flex-row gap-4 mb-10 items-center bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2.5 px-2 text-gray-400">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#2563eb]">
                    <ListFilter size={18} />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-gray-300">Quick Filters</span>
            </div>

            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <CustomSelect
                    value={sort}
                    options={sortOptions}
                    onChange={(val) => {
                        setSort(val);
                        updateFilters(val, genre, provider);
                    }}
                    placeholder="Sort By"
                    className="w-full sm:w-56"
                />

                <CustomSelect
                    value={genre}
                    options={genreOptions}
                    onChange={(val) => {
                        setGenre(val);
                        updateFilters(sort, val, provider);
                    }}
                    placeholder="All Genres"
                    className="w-full sm:w-56"
                />

                {providers.length > 0 && (
                    <CustomSelect
                        value={provider}
                        options={providerOptions}
                        onChange={(val) => {
                            setProvider(val);
                            updateFilters(sort, genre, val);
                        }}
                        placeholder="All Providers"
                        className="w-full sm:w-56"
                    />
                )}
            </div>
        </div>
    );
}
