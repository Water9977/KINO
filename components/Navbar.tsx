"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Bell, User, X, Menu, Sparkles } from "lucide-react";

import { KinoLogo } from "./ui/KinoLogo";
import ExpandableSearchBar from "./ui/expandable-search-bar";
import { NAV_LINKS, BETA_NOTICE } from "./navbar/nav-links";
import {
    SearchSuggestions,
    suggestionOptionId,
    type SearchSuggestionsState,
} from "./navbar/SearchSuggestions";
import { MobileDrawer } from "./navbar/MobileDrawer";
import { ProfileCard } from "./navbar/ProfileCard";
import { BetaNoticeCard } from "./navbar/BetaNoticeCard";
import type { TmdbListItem } from "@/lib/types";
import { hapticLight, hapticMedium } from "@/lib/haptics";

const SEARCH_DEBOUNCE_MS = 300;
/** Matches the cap `/api/search` applies, so the field never accepts text the server would cut. */
const SEARCH_MAX_LENGTH = 100;

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
    /** The query the current `suggestions` answer; null until the first response arrives. */
    const [resultsFor, setResultsFor] = useState<string | null>(null);
    const [searchFailed, setSearchFailed] = useState(false);
    /** Whether the dropdown is showing. Follows input focus; suggestions are kept across blur. */
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    /** Keyboard-highlighted row (suggestions.length = the "See all" row); -1 = none. */
    const [activeIndex, setActiveIndex] = useState(-1);
    const [searchWidth, setSearchWidth] = useState(450);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileCard, setShowProfileCard] = useState(false);
    const [showDesktopNotice, setShowDesktopNotice] = useState(false);
    const [showMobileNotice, setShowMobileNotice] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const listboxId = useId();

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

    const trimmedQuery = searchQuery.trim();

    // Debounced autocomplete. The abort controller drops responses for queries
    // the user has already typed past.
    useEffect(() => {
        if (!trimmedQuery) {
            setSuggestions([]);
            setResultsFor(null);
            setSearchFailed(false);
            setIsSearching(false);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
                    signal: controller.signal,
                });
                // A rate-limited or failed lookup used to be swallowed and shown as an empty box.
                setSearchFailed(!res.ok);
                const data = res.ok ? await res.json() : null;
                setSuggestions(data?.results ?? []);
                setResultsFor(trimmedQuery);
                setActiveIndex(-1);
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    console.error("Failed to fetch search suggestions", error);
                    setSuggestions([]);
                    setSearchFailed(true);
                    setResultsFor(trimmedQuery);
                }
            } finally {
                if (!controller.signal.aborted) setIsSearching(false);
            }
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [trimmedQuery]);

    const dismissKeyboard = () => (document.activeElement as HTMLElement | null)?.blur();

    const resetSearch = () => {
        setIsSearchOpen(false);
        setSuggestionsOpen(false);
        setActiveIndex(-1);
    };

    const goToSearch = (query: string) => {
        if (!query.trim()) return;
        dismissKeyboard();
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        resetSearch();
    };

    const goToTitle = (item: TmdbListItem) => {
        dismissKeyboard();
        router.push(`/watch/${item.id}?type=${item.media_type || "movie"}`);
        resetSearch();
        setSearchQuery("");
        setSuggestions([]);
        setResultsFor(null);
    };

    // What the dropdown should show. Stale suggestions stay on screen while the next query is
    // debounced (no flicker), but an empty list is only reported once its query has been answered.
    const answered = resultsFor === trimmedQuery;
    const suggestionsState: SearchSuggestionsState = isSearching ? "loading" : searchFailed ? "error" : "ready";
    const listVisible =
        isSearchOpen &&
        suggestionsOpen &&
        trimmedQuery !== "" &&
        (isSearching || suggestions.length > 0 || (answered && resultsFor !== null) || searchFailed);
    const optionCount = suggestions.length + 1; // the extra row is "See all results"

    const searchStatus = !isSearchOpen || !trimmedQuery
        ? ""
        : isSearching
            ? "Searching"
            : searchFailed
                ? "Search is busy. Press Enter to see results."
                : answered
                    ? suggestions.length > 0
                        ? `${suggestions.length} suggestion${suggestions.length === 1 ? "" : "s"}. Use the up and down arrow keys to review them.`
                        : `No results for ${trimmedQuery}`
                    : "";

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const selectable = listVisible && !isSearching;

        if (e.key === "ArrowDown") {
            if (!selectable) {
                // Re-open a list that Escape/blur closed.
                if (trimmedQuery && suggestions.length > 0 && !suggestionsOpen) {
                    e.preventDefault();
                    setSuggestionsOpen(true);
                    setActiveIndex(0);
                }
                return;
            }
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % optionCount);
        } else if (e.key === "ArrowUp") {
            if (!selectable) return;
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? optionCount - 1 : i - 1));
        } else if (e.key === "Enter" && selectable && activeIndex >= 0) {
            // A highlighted row wins over plain "submit the query".
            e.preventDefault();
            if (activeIndex < suggestions.length) goToTitle(suggestions[activeIndex]);
            else goToSearch(searchQuery);
        }
    };

    const openProfile = () => setShowProfileCard(true);
    const openNotice = () => setShowMobileNotice(true);

    return (
        <>
            <motion.nav
                aria-label="Main"
                className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled
                    ? "bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3"
                    : "bg-gradient-to-b from-black/80 to-transparent py-5"
                    }`}
                // `initial={false}`: render in the final position. An `initial` of opacity 0 was
                // baked into the server HTML, so the navbar stayed invisible until hydration.
                initial={false}
                animate={{ y: 0, opacity: 1 }}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 lg:px-10 relative">
                    <div className="flex items-center gap-4 lg:gap-10">
                        <button
                            ref={menuButtonRef}
                            aria-label="Open menu"
                            aria-haspopup="dialog"
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
                                            className={`relative text-sm font-semibold transition-all duration-300 hover:text-blue-400 group ${active ? "text-white" : "text-gray-400"
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
                                inputLabel="Search movies and TV shows"
                                maxLength={SEARCH_MAX_LENGTH}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSuggestionsOpen(true);
                                    setActiveIndex(-1);
                                }}
                                open={isSearchOpen}
                                onOpenChange={(open) => {
                                    setIsSearchOpen(open);
                                    if (!open) {
                                        setSuggestionsOpen(false);
                                        setActiveIndex(-1);
                                    }
                                }}
                                onFocus={() => setSuggestionsOpen(true)}
                                // No delay needed: options swallow mousedown, so a click on one never
                                // blurs the input. The old 200 ms timer deleted the list from under
                                // a keyboard user who pressed Tab.
                                onBlur={() => setSuggestionsOpen(false)}
                                inputProps={{
                                    role: "combobox",
                                    "aria-autocomplete": "list",
                                    "aria-expanded": listVisible,
                                    "aria-controls": listboxId,
                                    "aria-activedescendant":
                                        listVisible && !isSearching && activeIndex >= 0
                                            ? suggestionOptionId(listboxId, activeIndex)
                                            : undefined,
                                    onKeyDown: handleSearchKeyDown,
                                }}
                                width={searchWidth}
                                onSearch={goToSearch}
                            >
                                <AnimatePresence>
                                    {listVisible && (
                                        <SearchSuggestions
                                            suggestions={suggestions}
                                            state={suggestionsState}
                                            query={trimmedQuery}
                                            listboxId={listboxId}
                                            activeIndex={activeIndex}
                                            onSelect={goToTitle}
                                            onSeeAll={() => goToSearch(searchQuery)}
                                            onActivate={setActiveIndex}
                                        />
                                    )}
                                </AnimatePresence>
                            </ExpandableSearchBar>

                            {/* Spoken equivalent of the dropdown: counts, "no results", failures. */}
                            <div role="status" className="sr-only">
                                {searchStatus}
                            </div>
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
                                            <span className="flex items-center gap-2 text-blue-400">
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
                                openProfile();
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
                    <MobileDrawer
                        pathname={pathname}
                        onClose={() => setIsMobileMenuOpen(false)}
                        onAnnouncements={openNotice}
                        onAbout={openProfile}
                        returnFocusRef={menuButtonRef}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showMobileNotice && (
                    <BetaNoticeCard onClose={() => setShowMobileNotice(false)} returnFocusRef={menuButtonRef} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showProfileCard && (
                    <ProfileCard onClose={() => setShowProfileCard(false)} returnFocusRef={menuButtonRef} />
                )}
            </AnimatePresence>
        </>
    );
};
