"use client";

import { useEffect } from "react";

/**
 * Registers the Kino service worker for PWA offline support.
 * Mounted once at the root layout — no UI output.
 */
export function ServiceWorkerRegistrar() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js", { scope: "/" })
                .then((reg) => {
                    console.log("[Kino SW] Registered:", reg.scope);
                })
                .catch((err) => {
                    console.warn("[Kino SW] Registration failed:", err);
                });
        }
    }, []);

    return null;
}
