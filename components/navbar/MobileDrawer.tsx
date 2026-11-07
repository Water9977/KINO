"use client";

import { useRef, type RefObject } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, User, X } from "lucide-react";

import { KinoLogo } from "@/components/ui/KinoLogo";
import { useDialogFocus } from "@/components/ui/useDialogFocus";
import { NAV_LINKS } from "./nav-links";
import { hapticLight, hapticSuccess } from "@/lib/haptics";

interface MobileDrawerProps {
    pathname: string | null;
    onClose: () => void;
    onAnnouncements: () => void;
    onAbout: () => void;
    /** The hamburger button, so focus can go back to it when the drawer closes. */
    returnFocusRef: RefObject<HTMLElement | null>;
}

/**
 * The slide-in navigation for narrow screens.
 *
 * It sits above the bottom tab bar (z-50): at the same level the tab bar painted over the
 * drawer's lower buttons, so "About" could not be tapped. The dialog stays below `Modal` (z-100).
 * Focus handling is the same hook the modals use, so the drawer traps Tab and restores focus.
 */
export function MobileDrawer({ pathname, onClose, onAnnouncements, onAbout, returnFocusRef }: MobileDrawerProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    useDialogFocus(panelRef, { onClose, returnFocusRef });

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                aria-hidden="true"
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-[70] w-[280px] bg-[#0a0a0a] border-r border-white/10 lg:hidden flex flex-col p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-8">
                    <KinoLogo fontSize="text-2xl" />
                    <button
                        onClick={() => {
                            hapticLight();
                            onClose();
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
                                        onClose();
                                    }}
                                    className={`block px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${active
                                        ? "bg-[#2563eb]/10 text-blue-400"
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
                            onClose();
                            onAnnouncements();
                        }}
                    >
                        <Bell size={20} aria-hidden="true" />
                        <span className="font-medium">Announcements</span>
                    </button>
                    <button
                        className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        onClick={() => {
                            hapticLight();
                            onClose();
                            onAbout();
                        }}
                    >
                        <User size={20} aria-hidden="true" />
                        <span className="font-medium">About</span>
                    </button>
                </div>
            </motion.div>
        </>
    );
}
