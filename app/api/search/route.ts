import { NextResponse } from "next/server";
import { TMDB } from "@/lib/tmdb";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    try {
        const data = await TMDB.search(query);
        // Filter out people, and keep only movies and tv shows
        const filteredResults = data.results?.filter(
            (item: any) => item.media_type === "movie" || item.media_type === "tv"
        ) || [];

        // Return top 5 results
        return NextResponse.json({ results: filteredResults.slice(0, 5) });
    } catch (error) {
        console.error("Search API offset error:", error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
