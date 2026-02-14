"use client";

import Link from "next/link";
import { Search, Bell, User, X, Laptop } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { KinoLogo } from "./ui/KinoLogo";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
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

    const navLinks = [
        { name: "Home", href: "/browse" },
        { name: "Discover", href: "/discover" },
        { name: "Movies", href: "/movies" },
        { name: "TV Shows", href: "/tv" },
    ];

    return (
        <motion.nav
            className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled
                ? "bg-black/60 backdrop-blur-2xl border-b border-white/5 py-3"
                : "bg-gradient-to-b from-black/80 to-transparent py-5"
                }`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10 relative">
                {/* Logo Section */}
                <div className="flex items-center gap-10">
                    <Link href="/browse" className="flex items-center gap-2 group z-20 hover:scale-105 transition-transform duration-300">
                        <KinoLogo fontSize="text-2xl md:text-3xl" />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative text-sm font-semibold transition-all duration-300 hover:text-[#2563eb] group ${pathname === link.href ? "text-white" : "text-gray-400"
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 h-0.5 w-0 bg-[#2563eb] transition-all duration-300 group-hover:w-full ${pathname === link.href ? "w-full" : "w-0"}`} />
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 md:gap-6 z-20">
                    {/* Search Trigger/Input */}
                    <div className="relative flex items-center">
                        <AnimatePresence mode="wait">
                            {!isSearchOpen ? (
                                <motion.button
                                    key="search-btn"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                >
                                    <Search size={20} />
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="search-input"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "450px", opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    className="relative flex items-center"
                                >
                                    <form onSubmit={handleSearchSubmit} className="w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Titles, people, genres..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                            className="w-full h-10 rounded-full bg-white/10 border border-white/10 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50 focus:bg-black/60 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="hidden sm:flex items-center gap-4">
                        <button className="relative p-2 text-gray-300 hover:text-white transition-colors group">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#2563eb] ring-2 ring-black animate-pulse" />
                        </button>

                        <Link href="/browse" className="hidden xl:flex items-center gap-2 group p-2 text-gray-400 hover:text-white transition-colors">
                            <Laptop size={20} />
                            <span className="text-xs font-bold tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">WATCH ON TV</span>
                        </Link>
                    </div>

                    <div className="relative group cursor-pointer">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#2563eb] via-[#60a5fa] to-purple-600 p-[1.5px] transition-transform group-hover:scale-110">
                            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0a0a]">
                                <User size={18} className="text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

