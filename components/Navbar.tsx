"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Bell, User, X, Menu, Sparkles } from "lucide-react";

import { KinoLogo } from "./ui/KinoLogo";
import ExpandableSearchBar from "./ui/expandable-search-bar";
import { NAV_LINKS, BETA_NOTICE } from "./navbar/nav-links";
import { SearchSuggestions } from "./navbar/SearchSuggestions";
import { ProfileCard } from "./navbar/ProfileCard";
import { BetaNoticeCard } from "./navbar/BetaNoticeCard";
import type { TmdbListItem } from "@/lib/types";
import { hapticLight, hapticMedium, hapticSuccess } from "@/lib/haptics";

const SEARCH_DEBOUNCE_MS = 300;

/** Expanded search-field width per breakpoint, mirroring Tailwind's sm/md. */
function searchWidthFor(viewportWidth: number) {
    if (viewportWidth < 400) return Math.max(viewportWidth - 150, 200);
    if (viewportWidth < 640) return 250;
    if (viewportWidth < 768) return 320;
    return 450;
}

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<TmdbListItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchWidth, setSearchWidth] = useState(450);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [showDesktopNotice, setShowDesktopNotice] = useState(false);
    const [showMobileNotice, setShowMobileNotice] = useState(false);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        const handleResize = () => setSearchWidth(searchWidthFor(window.innerWidth));

        handleResize();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Debounced autocomplete. The abort controller drops responses for queries
    // the user has already typed past.
    useEffect(() => {
        const query = searchQuery.trim();
        if (!query) {
            setSuggestions([]);
            setIsSearching(false);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
                    signal: controller.signal,
                });
                const data = await res.json();
                setSuggestions(data.results ?? []);
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Failed to fetch search suggestions", error);
                    setSuggestions([]);
                }
            } finally {
                if (!controller.signal.aborted) setIsSearching(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [searchQuery]);

    // Lock scroll while the mobile drawer is open.
    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [isMobileMenuOpen]);

    // Close the drawer on Escape.
    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsMobileMenuOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isMobileMenuOpen]);

    const dismissKeyboard = () => (document.activeElement as HTMLElement | null)?.blur();

    const goToSearch = (query: string) => {
        if (!query.trim()) return;
        dismissKeyboard();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsSearchOpen(false);
        setSuggestions([]);
    };

    const goToTitle = (item: TmdbListItem) => {
        dismissKeyboard();
        router.push(`/watch/${item.id}?type=${item.media_type || "movie"}`);
        setIsSearchOpen(false);
        setSearchQuery("");
        setSuggestions([]);
    };

    return (
        <>
            <motion.nav
                aria-label="Main"
                className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled
                    ? "bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3"
                    : "bg-gradient-to-b from-black/80 to-transparent py-5"
                    }`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 lg:px-10 relative">
                    <div className="flex items-center gap-4 lg:gap-10">
                        <button
                            aria-label="Open menu"
                            aria-expanded={isMobileMenuOpen}
                            className="lg:hidden p-2 -ml-2 text-gray-300 hover:text-white transition-colors"
                            onClick={() => {
                                hapticMedium();
                                setIsMobileMenuOpen(true);
                            }}
                        >
                            <Menu size={24} aria-hidden="true" />
                        </button>

                        <Link
                            href="/browse"
                            aria-label="Kino home"
                            className="flex items-center gap-2 z-20 hover:scale-105 transition-transform duration-300"
                        >
                            <KinoLogo fontSize="text-2xl md:text-3xl" />
                        </Link>

                        <ul className="hidden lg:flex items-center gap-8 list-none">
                            {NAV_LINKS.map((link) => {
                                const active = pathname === link.href;
                                return (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            aria-current={active ? "page" : undefined}
                                            className={`relative text-sm font-semibold transition-all duration-300 hover:text-[#2563eb] group ${active ? "text-white" : "text-gray-400"
                                                }`}
                                        >
                                            {link.name}
                                            <span
                                                aria-hidden="true"
                                                className={`absolute -bottom-1 left-0 h-0.5 bg-[#2563eb] transition-all duration-300 group-hover:w-full ${active ? "w-full" : "w-0"
                                                    }`}
                                            />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="flex items-center gap-2 md:gap-6 z-20">
                        <div className="relative flex items-center h-10">
                            <ExpandableSearchBar
                                expandDirection="left"
                                placeholder="Search movies, series..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                open={isSearchOpen}
                                onOpenChange={setIsSearchOpen}
                                // Delay clearing so a suggestion click still registers.
                                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                                width={searchWidth}
                                onSearch={goToSearch}
                            >
                                <AnimatePresence>
                                    {isSearchOpen && searchQuery && (suggestions.length > 0 || isSearching) && (
                                        <SearchSuggestions
                                            suggestions={suggestions}
                                            isSearching={isSearching}
                                            query={searchQuery}
                                            onSelect={goToTitle}
                                            onSeeAll={() => goToSearch(searchQuery)}
                                        />
                                    )}
                                </AnimatePresence>
                            </ExpandableSearchBar>
                        </div>

                        <div className="hidden sm:flex items-center gap-4 relative">
                            <button
                                onClick={() => {
                                    hapticLight();
                                    setShowDesktopNotice((open) => !open);
                                }}
                                aria-label="Announcements"
                                aria-expanded={showDesktopNotice}
                                className="relative p-2 text-gray-300 hover:text-white transition-colors"
                            >
                                <Bell size={20} aria-hidden="true" />
                                <span
                                    aria-hidden="true"
                                    className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#2563eb] ring-2 ring-black"
                                />
                            </button>

                            <AnimatePresence>
                                {showDesktopNotice && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        role="status"
                                        className="absolute top-full right-0 mt-4 w-60 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-[#2563eb]">
                                                <Sparkles size={16} aria-hidden="true" />
                                                <span className="text-sm font-bold tracking-tight">
                                                    {BETA_NOTICE.title}
                                                </span>
                                            </span>
                                            <button
                                                onClick={() => setShowDesktopNotice(false)}
                                                aria-label="Dismiss announcement"
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                <X size={14} aria-hidden="true" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed mt-2">
                                            {BETA_NOTICE.body}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            aria-label="About Kino"
                            onClick={() => {
                                hapticLight();
                                setShowProfileCard(true);
                            }}
                            className="relative group hidden sm:flex"
                        >
                            <span className="h-10 w-10 rounded-xl bg-[#0a0a0a]/50 backdrop-blur-md border border-white/5 shadow-sm flex items-center justify-center transition-all duration-150 group-hover:scale-110 group-hover:bg-[#0a0a0a]/80 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:border-[#2563eb]/40">
                                <User
                                    size={18}
                                    aria-hidden="true"
                                    className="text-white group-hover:text-blue-400 transition-colors duration-150"
                                />
                            </span>
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-hidden="true"
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation menu"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0a0a0a] border-r border-white/10 lg:hidden flex flex-col p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <KinoLogo fontSize="text-2xl" />
                                <button
                                    onClick={() => {
                                        hapticLight();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    aria-label="Close menu"
                                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                                >
                                    <X size={20} aria-hidden="true" />
                                </button>
                            </div>

                            <ul className="flex flex-col gap-2 list-none">
                                {NAV_LINKS.map((link) => {
                                    const active = pathname === link.href;
                                    return (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                aria-current={active ? "page" : undefined}
                                                onClick={() => {
                                                    hapticSuccess();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`block px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${active
                                                    ? "bg-[#2563eb]/10 text-[#2563eb]"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                                    }`}
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="mt-auto pt-6 border-t border-white/5">
                                <button
                                    className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                    onClick={() => {
                                        hapticLight();
                                        setIsMobileMenuOpen(false);
                                        setShowMobileNotice(true);
                                    }}
                                >
                                    <Bell size={20} aria-hidden="true" />
                                    <span className="font-medium">Announcements</span>
                                </button>
                                <button
                                    className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                    onClick={() => {
                                        hapticLight();
                                        setIsMobileMenuOpen(false);
                                        setShowProfileCard(true);
                                    }}
                                >
                                    <User size={20} aria-hidden="true" />
                                    <span className="font-medium">About</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showMobileNotice && <BetaNoticeCard onClose={() => setShowMobileNotice(false)} />}
            </AnimatePresence>

            <AnimatePresence>
                {showProfileCard && <ProfileCard onClose={() => setShowProfileCard(false)} />}
            </AnimatePresence>
        </>
    );
};
