"use client";

import { useEffect, useState } from "react";
import { ListFilter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

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
        // Sync state with URL if it changes externally (e.g. back button)
        setSort(searchParams.get("sort_by") || "popularity.desc");
        setGenre(searchParams.get("genre") || "");
        setProvider(searchParams.get("provider") || "");
    }, [searchParams]);

    const updateFilters = (newSort: string, newGenre: string, newProvider: string) => {
        const params = new URLSearchParams(searchParams);

        // Always set sort
        params.set("sort_by", newSort);

        // Set or delete genre
        if (newGenre) params.set("genre", newGenre);
        else params.delete("genre");

        // Set or delete provider
        if (newProvider) params.set("provider", newProvider);
        else params.delete("provider");

        // Ensure type matches the page context if not already there, 
        // but typically the page handles the fetch based on its own type. 
        // However, if we switch tabs, we might want to keep filters? 
        // For now, assume single page application logic.

        // Replace URL
        router.push(`?${params.toString()}`);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSort(val);
        updateFilters(val, genre, provider);
    };

    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setGenre(val);
        updateFilters(sort, val, provider);
    };

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setProvider(val);
        updateFilters(sort, genre, val);
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
                <ListFilter size={20} />
                <span className="font-semibold text-sm uppercase tracking-wide">Filters</span>
            </div>

            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                {/* Sort Dropdown */}
                <select
                    value={sort}
                    onChange={handleSortChange}
                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer hover:bg-white/10 transition-colors"
                >
                    <option value="popularity.desc">Most Popular</option>
                    <option value="vote_average.desc">Top Rated</option>
                    <option value={type === 'movie' ? "primary_release_date.desc" : "first_air_date.desc"}>
                        Newest Release
                    </option>
                </select>

                {/* Genre Dropdown */}
                <select
                    value={genre}
                    onChange={handleGenreChange}
                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer hover:bg-white/10 transition-colors max-w-[200px]"
                >
                    <option value="">All Genres</option>
                    {genres.map((g) => (
                        <option key={g.id} value={g.id.toString()}>
                            {g.name}
                        </option>
                    ))}
                </select>

                {/* Provider Dropdown */}
                {providers.length > 0 && (
                    <select
                        value={provider}
                        onChange={handleProviderChange}
                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] cursor-pointer hover:bg-white/10 transition-colors max-w-[200px]"
                    >
                        <option value="">All Providers</option>
                        {providers.map((p) => (
                            <option key={p.provider_id} value={p.provider_id.toString()}>
                                {p.provider_name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );
}
