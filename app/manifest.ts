import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Kino — Premium Streaming",
        short_name: "Kino",
        description: "Unlimited movies, TV shows, and more. Stream with cinematic quality.",
        start_url: "/browse",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        orientation: "portrait-primary",
        categories: ["entertainment", "movies", "streaming"],
        icons: [
            {
                src: "/icon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
        screenshots: [],
        shortcuts: [
            {
                name: "Browse Movies",
                short_name: "Browse",
                description: "Browse trending movies and TV shows",
                url: "/browse",
                icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
            {
                name: "Search",
                short_name: "Search",
                description: "Search for movies and TV shows",
                url: "/search",
                icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
        ],
    };
}
