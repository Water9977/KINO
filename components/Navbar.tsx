"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell, User, X, Linkedin, Github, Instagram, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { KinoLogo } from "./ui/KinoLogo";
import { GlowCard } from "./ui/spotlight-card";
import ExpandableSearchBar from "./ui/expandable-search-bar";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [easterEggClicks, setEasterEggClicks] = useState(0);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchWidth, setSearchWidth] = useState(450);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 640) setSearchWidth(Math.max(width - 140, 200));
            else if (width < 768) setSearchWidth(350);
            else setSearchWidth(450);
        };

        handleResize(); // initial set
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        }
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSuggestions(data.results || []);
            } catch (error) {
                console.error("Failed to fetch search suggestions", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
        }
    };

    const handleNameClick = () => {
        setEasterEggClicks(prev => {
            const newCount = prev + 1;
            if (newCount === 9) {
                setShowEasterEgg(true);
                // Reset after the animation completes
                setTimeout(() => {
                    setShowEasterEgg(false);
                }, 3000); // 3 second animation
                return 0; // reset counter
            }
            return newCount;
        });
    };

    const navLinks = [
        { name: "Home", href: "/browse" },
        { name: "Discover", href: "/discover" },
        { name: "Movies", href: "/movies" },
        { name: "TV Shows", href: "/tv" },
    ];

    return (
        <>
            <motion.nav
                className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled
                    ? "bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3"
                    : "bg-gradient-to-b from-black/80 to-transparent py-5"
                    }`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 lg:px-10 relative">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4 lg:gap-10">
                        {/* Mobile Menu Button - Left Aligned */}
                        <button
                            className="lg:hidden p-2 -ml-2 text-gray-300 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <User size={24} className="opacity-0 w-0" /> {/* Spacer/Placeholder if needed, or just use Menu */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                        </button>

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
                    <div className="flex items-center gap-2 md:gap-6 z-20">
                        {/* Search Trigger/Input using ExpandableSearchBar */}
                        <div className="relative flex items-center h-10">
                            <ExpandableSearchBar
                                expandDirection="left"
                                placeholder="Search movies, series..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                open={isSearchOpen}
                                onOpenChange={setIsSearchOpen}
                                onBlur={(e) => {
                                    // Let blur happen, but delay clearing suggestions so click can register
                                    setTimeout(() => setSuggestions([]), 200);
                                }}
                                width={searchWidth}
                                onSearch={(query) => {
                                    if (query.trim()) {
                                        router.push(`/search?q=${encodeURIComponent(query)}`);
                                        setIsSearchOpen(false);
                                    }
                                }}
                            >
                                <AnimatePresence>
                                    {(suggestions.length > 0 || isSearching) && searchQuery && isSearchOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="w-full bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                                        >
                                            {isSearching ? (
                                                <div className="flex items-center justify-center p-6 text-gray-400">
                                                    <Loader2 className="animate-spin" size={20} />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {suggestions.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            onMouseDown={(e) => {
                                                                e.preventDefault(); // Prevents input onBlur
                                                                router.push(`/watch/${item.id}?type=${item.media_type || 'movie'}`);
                                                                setIsSearchOpen(false);
                                                                setSearchQuery("");
                                                                setSuggestions([]);
                                                            }}
                                                            className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors"
                                                        >
                                                            {item.poster_path ? (
                                                                <img
                                                                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                                    alt={item.title || item.name}
                                                                    className="w-10 h-14 rounded-md object-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-14 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0 text-white/20">
                                                                    <Search size={16} />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                                <span className="text-white text-sm font-semibold truncate">
                                                                    {item.title || item.name}
                                                                </span>
                                                                <span className="text-gray-400 text-xs">
                                                                    {(item.release_date || item.first_air_date)?.split("-")[0] || "N/A"} • {(item.media_type || 'movie').toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            const fakeEvent = { preventDefault: () => { } } as React.FormEvent;
                                                            handleSearchSubmit(fakeEvent);
                                                        }}
                                                        className="p-3 text-center text-xs font-semibold text-[#2563eb] hover:bg-white/5 hover:text-blue-400 mt-1 transition-colors"
                                                    >
                                                        See all results for "{searchQuery}"
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </ExpandableSearchBar>
                        </div>

                        <div className="hidden sm:flex items-center gap-4 relative">
                            <button
                                onClick={() => setShowNotification(!showNotification)}
                                className="relative p-2 text-gray-300 hover:text-white transition-colors group"
                            >
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#2563eb] ring-2 ring-black animate-pulse" />
                            </button>

                            <AnimatePresence>
                                {showNotification && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 mt-4 w-60 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
                                    >
                                        <div className="flex flex-col gap-2 relative">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[#2563eb]">
                                                    <Sparkles size={16} />
                                                    <span className="text-sm font-bold tracking-tight">Beta Version</span>
                                                </div>
                                                <button
                                                    onClick={() => setShowNotification(false)}
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed mt-1">
                                                Welcome to Kino! We are currently in our beta phase. Expect frequent updates and new features.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative cursor-pointer group" onClick={() => setShowProfileCard(true)}>
                            <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-[#0a0a0a]/50 backdrop-blur-md border border-white/5 shadow-sm flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:bg-[#0a0a0a]/80 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:border-[#2563eb]/40">
                                <User size={16} className="text-white group-hover:text-blue-400 transition-colors duration-150 md:hidden" />
                                <User size={18} className="text-white group-hover:text-blue-400 transition-colors duration-150 hidden md:block" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0a0a0a] border-r border-white/10 lg:hidden flex flex-col p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <KinoLogo fontSize="text-2xl" />
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <nav className="flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${pathname === link.href
                                            ? "bg-[#2563eb]/10 text-[#2563eb]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <button className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                    <div className="relative">
                                        <Bell size={20} />
                                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#2563eb] ring-2 ring-[#0a0a0a]" />
                                    </div>
                                    <span className="font-medium">Notifications</span>
                                </button>
                                <button className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" onClick={() => { setIsMobileMenuOpen(false); setShowProfileCard(true); }}>
                                    <User size={20} />
                                    <span className="font-medium">Profile</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Profile Card Overlay */}
            <AnimatePresence>
                {showProfileCard && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowProfileCard(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative z-10"
                        >
                            <GlowCard
                                customSize={true}
                                glowColor="blue"
                                className="!w-[320px] !h-[280px] !bg-black/40 border-white/5 shadow-2xl overflow-hidden"
                            >
                                <div className="flex flex-col h-full items-center justify-center p-6 relative">
                                    <div className="flex flex-col items-center gap-4 mt-2">
                                        <div className="text-center space-y-1 flex justify-center items-center">
                                            <KinoLogo fontSize="text-4xl" />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Link
                                                href="https://www.linkedin.com/in/siddharth-sharma-310785356?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BXCis%2B464SsSZx0xiAT0b2A%3D%3D"
                                                target="_blank"
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#0077b5] hover:bg-white/10 hover:border-[#0077b5]/30 transition-all duration-300"
                                            >
                                                <Linkedin size={20} />
                                            </Link>
                                            <Link
                                                href="https://github.com/Water9977/KINO"
                                                target="_blank"
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                                            >
                                                <Github size={20} />
                                            </Link>
                                            <Link
                                                href="https://www.instagram.com/siddharthhh.sharma"
                                                target="_blank"
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#E4405F] hover:bg-white/10 hover:border-[#E4405F]/30 transition-all duration-300"
                                            >
                                                <Instagram size={20} />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="w-full pt-6">
                                        <p className="text-gray-400 text-xs font-medium text-center flex items-center justify-center gap-1.5 leading-relaxed">
                                            Made with love
                                            <motion.span
                                                className={`text-base inline-block ${showEasterEgg ? 'text-[#00ffff]' : 'text-blue-500 animate-pulse'}`}
                                                animate={showEasterEgg ? {
                                                    scale: [1, 1.5, 1.8, 1.5, 1],
                                                    rotate: [0, -10, 10, -10, 0],
                                                    filter: [
                                                        "drop-shadow(0 0 0px rgba(0,255,255,0))",
                                                        "drop-shadow(0 0 20px rgba(0,255,255,0.8))",
                                                        "drop-shadow(0 0 40px rgba(0,255,255,1))",
                                                        "drop-shadow(0 0 20px rgba(0,255,255,0.8))",
                                                        "drop-shadow(0 0 0px rgba(0,255,255,0))"
                                                    ]
                                                } : {}}
                                                transition={showEasterEgg ? {
                                                    duration: 2.5,
                                                    ease: "easeInOut"
                                                } : {}}
                                            >
                                                💙
                                            </motion.span>
                                            by
                                            <span
                                                className="text-white font-semibold cursor-default select-none"
                                                onClick={handleNameClick}
                                                style={{ WebkitTapHighlightColor: 'transparent' }} // prevents flashing on mobile
                                            >
                                                Siddharth Sharma
                                            </span>
                                        </p>
                                    </div>

                                    {/* Close Button Inside Card */}
                                    <button
                                        onClick={() => setShowProfileCard(false)}
                                        className="absolute top-3 right-3 p-2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </GlowCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

