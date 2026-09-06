/**
 * WebHaptics utility for Kino
 * Supported: Android Chrome. Not supported: iOS Safari (Apple restriction).
 * Silently no-ops on unsupported browsers.
 */

const isSupported = () =>
    typeof window !== "undefined" && "vibrate" in navigator;

/** Light tap — icon buttons, toggles (60ms — actually feelable) */
export function hapticLight() {
    if (!isSupported()) return;
    navigator.vibrate(60);
}

/** Medium click — primary CTAs like Watch Now, search submit */
export function hapticMedium() {
    if (!isSupported()) return;
    navigator.vibrate(100);
}

/** Heavy — opening/closing full overlays (mobile menu, modals) */
export function hapticHeavy() {
    if (!isSupported()) return;
    navigator.vibrate(150);
}

/** Success — double-tap pattern, navigating to a movie */
export function hapticSuccess() {
    if (!isSupported()) return;
    navigator.vibrate([60, 40, 100]);
}

/** Carousel dot tick — subtle snap */
export function hapticTick() {
    if (!isSupported()) return;
    navigator.vibrate(40);
}

/** Easter egg heartbeat — triggered on 9th logo tap */
export function hapticHeartbeat() {
    if (!isSupported()) return;
    navigator.vibrate([80, 100, 80, 250, 100, 100, 120]);
}
