/**
 * Runtime validation for values that cross a trust boundary. TypeScript types are not enforced
 * for Server Action arguments or URL parameters, so anything that ends up in a TMDB URL path or
 * query has to be checked here first.
 */
import type { MediaType } from "@/lib/types";

/** Longest search query accepted anywhere (API route and search page share it). */
export const MAX_QUERY_LENGTH = 100;

/** Sort orders the filter bar offers. Anything else is rejected rather than forwarded to TMDB. */
export const DISCOVER_SORTS: readonly string[] = [
    "popularity.desc",
    "vote_average.desc",
    "primary_release_date.desc",
    "first_air_date.desc",
];

export function isMediaType(value: unknown): value is MediaType {
    return value === "movie" || value === "tv";
}

/** A positive integer no larger than `max` — used for TMDB ids and season numbers. */
export function isIdLike(value: unknown, max = 2_000_000_000): value is number {
    return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max;
}

/** A short run of digits, as the genre and provider filters send them. */
export function isNumericString(value: unknown): value is string {
    return typeof value === "string" && /^\d{1,9}$/.test(value);
}

/** `Object.hasOwn` guard so inherited names like "constructor" or "__proto__" never match. */
export function hasOwnKey(map: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(map, key);
}

/** A URL query value can be `string | string[] | undefined`; take the first string. */
export function firstString(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}
