"use client";

/**
 * Kino Skeleton Components
 * Premium shimmer-style loading placeholders that match the real UI 1:1.
 * The shimmer effect uses a CSS animation sweep instead of opacity pulse —
 * it feels much more alive and polished.
 */

import { cn } from "@/lib/utils";

/* ─── Base shimmer primitive ─────────────────────────────────────────────── */

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-lg bg-white/5",
                className
            )}
        >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>
    );
}

/* ─── Movie Card Skeleton ─────────────────────────────────────────────────── */

export function MovieCardSkeleton() {
    return (
        <div className="flex flex-col gap-3 p-2">
            {/* Poster */}
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            {/* Title */}
            <Skeleton className="h-3.5 w-4/5 rounded-md" />
            {/* Meta */}
            <Skeleton className="h-3 w-2/5 rounded-md" />
        </div>
    );
}

/* ─── Movie Row Skeleton ──────────────────────────────────────────────────── */

interface MovieRowSkeletonProps {
    title?: string;  // If provided, show real title + shimmer cards; else shimmer everything
    count?: number;
}

export function MovieRowSkeleton({ title, count = 8 }: MovieRowSkeletonProps) {
    return (
        <div className="space-y-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 md:px-10">
                {title ? (
                    <h2 className="text-2xl font-bold text-white font-outfit tracking-tight">
                        {title}
                    </h2>
                ) : (
                    <Skeleton className="h-7 w-44 rounded-md" />
                )}
                <Skeleton className="h-4 w-16 rounded-md" />
            </div>

            {/* Cards */}
            <div className="flex gap-4 overflow-hidden px-6 md:px-10 pb-8 pt-2">
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={i}
                        className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] flex-shrink-0"
                    >
                        <MovieCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Hero Carousel Skeleton ─────────────────────────────────────────────── */

export function HeroSkeleton() {
    return (
        <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden">
            {/* Background shimmer */}
            <Skeleton className="absolute inset-0 rounded-none" />

            {/* Gradient overlay — same as real hero */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />

            {/* Content placeholder — mirrors real hero layout */}
            <div className="absolute bottom-0 left-0 pb-28 md:pb-44 px-4 md:px-10 w-full max-w-4xl space-y-5">
                {/* Meta pills */}
                <div className="flex items-center gap-3">
                    <Skeleton className="h-7 w-16 rounded-full" />
                    <Skeleton className="h-7 w-16 rounded-full" />
                    <Skeleton className="h-7 w-14 rounded-full" />
                </div>
                {/* Title — 2 lines */}
                <div className="space-y-3">
                    <Skeleton className="h-10 md:h-14 w-3/4 rounded-xl" />
                    <Skeleton className="h-10 md:h-14 w-1/2 rounded-xl" />
                </div>
                {/* Description — 3 lines */}
                <div className="space-y-2 max-w-xl">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                    <Skeleton className="h-4 w-4/6 rounded-md" />
                </div>
                {/* Button */}
                <Skeleton className="h-12 w-36 rounded-full" />
            </div>

            {/* Indicators */}
            <div className="absolute bottom-24 md:bottom-36 right-6 md:right-10 flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                        key={i}
                        className={`h-1.5 rounded-full ${i === 1 ? "w-8" : "w-1.5"}`}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── Full Page Skeleton (used in loading.tsx) ───────────────────────────── */

export function BrowsePageSkeleton() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <HeroSkeleton />
            <div className="relative z-20 -mt-8 md:-mt-32 pb-20 space-y-8 bg-gradient-to-b from-transparent to-[#0a0a0a]">
                <MovieRowSkeleton />
                <MovieRowSkeleton />
                <MovieRowSkeleton />
                <MovieRowSkeleton />
                <MovieRowSkeleton />
            </div>
        </div>
    );
}
