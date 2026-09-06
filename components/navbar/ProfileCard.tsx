"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Linkedin, Github, Instagram } from "lucide-react";

import { KinoLogo } from "@/components/ui/KinoLogo";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Modal, ModalCloseButton } from "@/components/ui/Modal";
import { hapticHeartbeat, hapticTick } from "@/lib/haptics";

/** Taps on the author's name before the easter egg fires. */
const EASTER_EGG_TAPS = 9;
const EASTER_EGG_DURATION_MS = 3000;

const SOCIALS = [
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/siddharth-sharma-310785356",
        icon: Linkedin,
        hover: "hover:text-[#0077b5] hover:border-[#0077b5]/30",
    },
    {
        label: "GitHub",
        href: "https://github.com/Water9977/KINO",
        icon: Github,
        hover: "hover:text-white",
    },
    {
        label: "Instagram",
        href: "https://www.instagram.com/siddharthhh.sharma",
        icon: Instagram,
        hover: "hover:text-[#E4405F] hover:border-[#E4405F]/30",
    },
] as const;

export function ProfileCard({ onClose }: { onClose: () => void }) {
    const [taps, setTaps] = useState(0);
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    const handleNameClick = () => {
        const next = taps + 1;
        if (next >= EASTER_EGG_TAPS) {
            setTaps(0);
            setShowEasterEgg(true);
            hapticHeartbeat();
            setTimeout(() => setShowEasterEgg(false), EASTER_EGG_DURATION_MS);
            return;
        }
        setTaps(next);
        hapticTick();
    };

    return (
        <Modal onClose={onClose} label="About Kino">
            <GlowCard
                customSize
                glowColor="blue"
                className="!w-[320px] !h-[280px] !bg-black/40 border-white/5 shadow-2xl overflow-hidden"
            >
                <div className="flex flex-col h-full items-center justify-center p-6 relative">
                    <div className="flex flex-col items-center gap-4 mt-2">
                        <KinoLogo fontSize="text-4xl" />

                        <ul className="flex items-center gap-3 list-none">
                            {SOCIALS.map(({ label, href, icon: Icon, hover }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${label} (opens in a new tab)`}
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all duration-300 ${hover}`}
                                    >
                                        <Icon size={20} aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="w-full pt-6">
                        <p className="text-gray-400 text-xs font-medium text-center flex items-center justify-center gap-1.5 leading-relaxed">
                            Made with love
                            <motion.span
                                aria-hidden="true"
                                className={`text-base inline-block ${showEasterEgg ? "text-[#00ffff]" : "text-blue-500"}`}
                                animate={
                                    showEasterEgg
                                        ? {
                                            scale: [1, 1.5, 1.8, 1.5, 1],
                                            rotate: [0, -10, 10, -10, 0],
                                        }
                                        : {}
                                }
                                transition={showEasterEgg ? { duration: 2.5, ease: "easeInOut" } : {}}
                            >
                                💙
                            </motion.span>
                            by
                            <button
                                type="button"
                                onClick={handleNameClick}
                                className="text-white font-semibold select-none focus-visible:outline-none focus-visible:underline"
                                style={{ WebkitTapHighlightColor: "transparent" }}
                            >
                                Siddharth Sharma
                            </button>
                        </p>
                    </div>

                    <ModalCloseButton onClose={onClose} />
                </div>
            </GlowCard>
        </Modal>
    );
}
