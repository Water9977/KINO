"use client";

import { startTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, TriangleAlert } from "lucide-react";

/**
 * Error boundary for every page inside the main layout. It renders inside that layout, so the
 * navbar stays on screen and the visitor has a way forward; without it any thrown error (a TMDB
 * outage, say) replaced the whole page with Next's bare default.
 */
export default function MainError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error("[page error]", error.digest ?? "", error.message);
    }, [error]);

    // `reset()` alone re-renders with the server result that already failed. The route has to be
    // refreshed too, so the server component runs again and fetches fresh data.
    const retry = () => {
        startTransition(() => {
            router.refresh();
            reset();
        });
    };

    return (
        <div
            role="alert"
            className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-6 pt-24 text-center text-white"
        >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb]">
                <TriangleAlert size={44} aria-hidden="true" />
            </div>

            <div className="space-y-3">
                <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                    Something went wrong
                </h1>
                <p className="max-w-md text-gray-400">
                    We couldn&apos;t load this page. This is usually temporary, so trying again often
                    fixes it.
                </p>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={retry}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-7 py-3 text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] active:scale-95"
                >
                    <RefreshCw size={16} aria-hidden="true" />
                    Try again
                </button>
                <Link
                    href="/browse"
                    className="inline-flex items-center rounded-full border border-white/15 px-7 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-white/10"
                >
                    Back to browsing
                </Link>
            </div>
        </div>
    );
}
