"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Compass, Tv2, Film } from "lucide-react";
import { hapticTick } from "@/lib/haptics";
import { useEffect, useState, useRef } from "react";

const TABS = [
    { href: "/browse", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/tv", label: "TV Shows", icon: Tv2 },
    { href: "/movies", label: "Movies", icon: Film },
];

export function MobileTabBar() {
    const pathname = usePathname();
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    // Hide on scroll-down, show on scroll-up — using requestAnimationFrame to avoid layout thrash
    useEffect(() => {
        const handleScroll = () => {
            if (ticking.current) return;
            ticking.current = true;

            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const delta = currentScrollY - lastScrollY.current;

                // Only trigger if scrolled more than 8px to avoid micro-jitter
                if (Math.abs(delta) > 8) {
                    setVisible(delta < 0 || currentScrollY < 80);
                    lastScrollY.current = currentScrollY;
                }
                ticking.current = false;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (href: string) => {
        if (href === "/browse") return pathname === "/browse" || pathname === "/";
        return pathname?.startsWith(href);
    };

    return (
        <>
            {/* Bottom padding so content isn't hidden behind the tab bar */}
            <div className="h-24 md:hidden" aria-hidden="true" />

            <AnimatePresence>
                {visible && (
                    <motion.nav
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                            mass: 0.8,
                        }}
                        aria-label="Mobile navigation"
                        className="mobile-tab-bar md:hidden"
                    >
                        <div className="flex items-center justify-around w-full px-2 py-2">
                            {TABS.map((tab) => {
                                const active = isActive(tab.href);
                                const Icon = tab.icon;

                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        onClick={hapticTick}
                                        className="relative flex flex-col items-center gap-1 min-w-[64px] py-1 transition-transform duration-150 active:scale-90"
                                        aria-label={tab.label}
                                        aria-current={active ? "page" : undefined}
                                    >
                                        {/* Active background pill */}
                                        <AnimatePresence>
                                            {active && (
                                                <motion.div
                                                    layoutId="mobile-tab-active"
                                                    className="absolute inset-0 rounded-2xl bg-[#2563eb]/15 border border-[#2563eb]/25"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 500,
                                                        damping: 35,
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>

                                        <motion.div
                                            animate={{
                                                scale: active ? 1.1 : 1,
                                                color: active ? "#60a5fa" : "rgba(156,163,175,1)",
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className="relative z-10"
                                        >
                                            <Icon
                                                size={22}
                                                strokeWidth={active ? 2.5 : 1.8}
                                                fill={active ? "rgba(37,99,235,0.18)" : "none"}
                                            />
                                        </motion.div>

                                        <motion.span
                                            animate={{
                                                opacity: active ? 1 : 0.5,
                                                fontWeight: active ? 700 : 500,
                                            }}
                                            className="text-[9px] leading-none tracking-wide relative z-10 text-gray-400"
                                            style={{ color: active ? "#60a5fa" : undefined }}
                                        >
                                            {tab.label}
                                        </motion.span>

                                        {/* Active dot indicator */}
                                        <AnimatePresence>
                                            {active && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#2563eb]"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </>
    );
}
