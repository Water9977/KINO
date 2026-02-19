"use client";

import Link from "next/link";
import { Search, Bell, User, X, Linkedin, Github, Instagram } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { KinoLogo } from "./ui/KinoLogo";
import { GlowCard } from "./ui/spotlight-card";

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

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
                                        animate={{ width: "100%", opacity: 1 }} // Responsive width handled via CSS/JS logic if needed, but here fixed mainly
                                        exit={{ width: 0, opacity: 0 }}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center w-[calc(100vw-120px)] sm:w-[350px] md:w-[450px]"
                                    >
                                        <form onSubmit={handleSearchSubmit} className="w-full">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                placeholder="Search..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                                className="w-full h-10 rounded-full bg-black/90 border border-white/20 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#2563eb]/50 transition-all"
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
                        </div>

                        <div className="relative cursor-pointer" onClick={() => setShowProfileCard(true)}>
                            <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-gradient-to-br from-[#2563eb] via-[#60a5fa] to-purple-600 p-[1.5px] transition-transform hover:scale-110">
                                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0a0a]">
                                    <User size={16} className="text-white md:hidden" />
                                    <User size={18} className="text-white hidden md:block" />
                                </div>
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
                                        <div className="text-center space-y-1">
                                            <h2 className="text-3xl font-black tracking-tighter uppercase italic flex items-center justify-center">
                                                <span className="text-white">KIN</span>
                                                <motion.span
                                                    className="text-[#2563eb] drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]"
                                                    animate={{
                                                        textShadow: ["0 0 15px rgba(37,99,235,0.4)", "0 0 25px rgba(37,99,235,0.8)", "0 0 15px rgba(37,99,235,0.4)"]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    O
                                                </motion.span>
                                            </h2>
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
                                            Made with love <span className="text-blue-500 text-base animate-pulse inline-block">💙</span> by <span className="text-white font-semibold">Siddharth Sharma</span>
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

