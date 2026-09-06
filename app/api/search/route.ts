import { NextResponse } from "next/server";
import { TMDB } from "@/lib/tmdb";

/** Autocomplete only needs a handful of rows. */
const RESULT_LIMIT = 5;
const MAX_QUERY_LENGTH = 100;

// Simple fixed-window limiter, per instance. Enough to stop a single client
// hammering the endpoint and burning the shared TMDB quota. A multi-instance
// deployment needs a shared store (Upstash/Redis) for a real guarantee.
const RATE_LIMIT = { windowMs: 60_000, maxRequests: 30 };
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });

        // Opportunistically drop expired entries so the map can't grow forever.
        if (hits.size > 5000) {
            for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
        }
        return false;
    }

    entry.count += 1;
    return entry.count > RATE_LIMIT.maxRequests;
}

function clientKey(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function GET(request: Request) {
    if (isRateLimited(clientKey(request))) {
        return NextResponse.json(
            { results: [], error: "Too many requests" },
            { status: 429, headers: { "Retry-After": "60" } }
        );
    }

    const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, MAX_QUERY_LENGTH);

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    try {
        const data = await TMDB.search(query);

        const results = (data.results ?? [])
            .filter((item) => item.media_type === "movie" || item.media_type === "tv")
            .slice(0, RESULT_LIMIT);

        return NextResponse.json(
            { results },
            { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
        );
    } catch (error) {
        console.error("[api/search] failed:", error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
