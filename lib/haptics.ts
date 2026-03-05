/**
 * WebHaptics utility for Kino
 * Provides tactile feedback on mobile via the Vibration API.
 * Silently no-ops on desktop browsers that don't support it.
 */

const isSupported = () =>
    typeof window !== "undefined" && "vibrate" in navigator;

/**
 * Light tap — for icon buttons, menu items, toggles
 */
export function hapticLight() {
    if (!isSupported()) return;
    navigator.vibrate(18);
}

/**
 * Medium click — for primary CTAs like "Watch Now", search submit
 */
export function hapticMedium() {
    if (!isSupported()) return;
    navigator.vibrate(40);
}

/**
 * Heavy — for opening/closing full overlays (mobile menu, profile card, notification)
 */
export function hapticHeavy() {
    if (!isSupported()) return;
    navigator.vibrate(70);
}

/**
 * Success — double-tap pattern, e.g. when navigating to a movie
 */
export function hapticSuccess() {
    if (!isSupported()) return;
    navigator.vibrate([30, 50, 60]);
}

/**
 * Error / warning pattern
 */
export function hapticError() {
    if (!isSupported()) return;
    navigator.vibrate([60, 40, 60, 40, 80]);
}

/**
 * Carousel swipe tick — very subtle, like a page snap
 */
export function hapticTick() {
    if (!isSupported()) return;
    navigator.vibrate(10);
}

/**
 * Easter egg heartbeat — triggered on 9th logo tap
 */
export function hapticHeartbeat() {
    if (!isSupported()) return;
    navigator.vibrate([30, 80, 30, 200, 50, 80, 50]);
}
