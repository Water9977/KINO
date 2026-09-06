import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kino-web-neon.vercel.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Search result pages are per-query and add no indexable value.
            disallow: ["/api/", "/search"],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
