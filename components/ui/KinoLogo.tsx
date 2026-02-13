"use client";

import { motion } from "framer-motion";

interface KinoLogoProps {
    fontSize?: string;
}

export const KinoLogo = ({ fontSize = "text-4xl" }: KinoLogoProps) => {
    return (
        <motion.div
            className="flex items-baseline gap-[0.04em] cursor-default group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.span
                className={`${fontSize} font-black tracking-tighter text-white transition-colors duration-300 group-hover:text-gray-200`}
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.1)" }}
            >
                KIN
            </motion.span>
            <motion.span
                className={`${fontSize} font-black tracking-tighter text-kino-blue drop-shadow-[0_0_15px_rgba(37,99,235,0.6)]`}
                animate={{
                    textShadow: ["0 0 15px rgba(37,99,235,0.6)", "0 0 25px rgba(37,99,235,0.9)", "0 0 15px rgba(37,99,235,0.6)"]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                O
            </motion.span>
        </motion.div>
    );
};
