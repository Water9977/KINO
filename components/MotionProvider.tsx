"use client";

import { MotionConfig } from "framer-motion";

/**
 * Makes every Framer Motion animation in the app follow the visitor's reduced-motion setting.
 *
 * Framer's own default is `reducedMotion: "never"`, so only the few components that called
 * `useReducedMotion()` themselves respected the preference; navbar springs, modal pops, tab-bar
 * springs and hover lifts animated regardless. With "user", transform and layout animations are
 * switched off for those visitors while opacity/colour changes still play.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
