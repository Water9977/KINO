import type { Metadata } from "next";
import { displayFontVariables } from "@/lib/fonts";
import { LandingHero } from "@/components/LandingHero";

export const metadata: Metadata = {
    title: "Kino | Premium Streaming Experience",
    description:
        "Unlimited movies, TV shows, and more. Stream with cinematic quality and premium features.",
    alternates: { canonical: "/" },
};

/**
 * Server shell for the landing page.
 *
 * The six display faces used by the genre flip-word are scoped to this
 * element, so no other route in the app pays to preload them.
 */
export default function HomePage() {
    return (
        <div className={displayFontVariables}>
            <LandingHero />
        </div>
    );
}
