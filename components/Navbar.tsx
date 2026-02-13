"use client";

import Link from "next/link";
import { Search, Bell, User, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { KinoLogo } from "./ui/KinoLogo";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
        }
    };

    return (
        <motion.nav
            className={`fixed top-0 z-50 w-full transition-colors duration-300 ${scrolled ? "bg-kino-dark/90 backdrop-blur-lg border-b border-white/5" : "bg-transparent"}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 relative">
                {/* Logo */}
                <Link href="/browse" className="flex items-center gap-1 group z-20 hover:scale-105 transition-transform duration-300">
                    <KinoLogo fontSize="text-2xl" />
                </Link>

                {/* Navigation Links (Hidden when search is open) */}
                <AnimatePresence>
                    {!isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
                        >
                            {["Home", "Movies", "TV Shows", "New & Popular"].map((item) => (
                                <Link
                                    key={item}
                                    href={`/browse`} // For now, all point to browse
                                    className="text-sm font-medium text-gray-300 transition-colors hover:text-[#2563eb]"
                                >
                                    {item}
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search Bar Overlay */}
                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 flex items-center justify-center px-4 md:px-20 z-10"
                        >
                            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search movies, shows, people..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 rounded-full bg-white/10 border border-white/10 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-[#2563eb]/50 focus:bg-black/40 backdrop-blur-md transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-6 z-20">
                    {!isSearchOpen && (
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="text-gray-300 hover:text-[#2563eb] transition-colors"
                        >
                            <Search size={20} />
                        </button>
                    )}
                    <button className="text-gray-300 hover:text-[#2563eb] transition-colors">
                        <Bell size={20} />
                    </button>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#2563eb] to-purple-600 p-[1px]">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-kino-dark">
                            <User size={16} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};
