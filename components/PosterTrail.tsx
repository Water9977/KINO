"use client";

import { useState } from "react";
import ImageTrail from "./ImageTrail";
import { POSTER_SETS } from "@/lib/landing-posters";

/**
 * Picks one of the poster sets at random per visit.
 *
 * This component is only ever loaded with `ssr: false`, so it never renders on
 * the server — which is what makes randomising in a state initialiser safe.
 * Doing the same in a server-rendered component would make the markup differ
 * between server and client and trip a hydration mismatch.
 */
export default function PosterTrail() {
    const [posters] = useState(
        () => POSTER_SETS[Math.floor(Math.random() * POSTER_SETS.length)]
    );

    return <ImageTrail items={posters} />;
}
