/**
 * TMDB fetching that reports failure honestly.
 *
 * The old `tmdbFetch` resolved every failure to an empty "success" payload. For ISR pages that
 * poisoned the cache: Next only keeps serving the last good page when regeneration *throws*, so a
 * single TMDB blip replaced the cached homepage with an empty one for the whole revalidate window.
 * Everything here throws `TmdbError` instead, and callers choose how to degrade.
 *
 * Kept free of imports (and of TypeScript-only runtime syntax such as parameter properties) so
 * `node --test` can run it directly.
 */

export type TmdbErrorReason =
    | "auth" // key missing, revoked or not allowed for this request
    | "not_found"
    | "bad_request"
    | "rate_limited"
    | "server"
    | "network"
    | "bad_shape"; // a 200 response that isn't the JSON object we expected (HTML block page, null...)

export class TmdbError extends Error {
    reason: TmdbErrorReason;
    status?: number;

    constructor(reason: TmdbErrorReason, message: string, status?: number) {
        super(message);
        this.name = "TmdbError";
        this.reason = reason;
        this.status = status;
    }
}

export interface FetchOptions {
    /** Next.js data-cache lifetime for a successful response, in seconds. */
    revalidateSeconds: number;
    /** Per-attempt timeout. */
    timeoutMs: number;
    /** Total attempts for retryable failures. */
    retries: number;
    /** First backoff step; doubles after each failed attempt. */
    baseBackoffMs: number;
    /** Longest we will wait on a Retry-After header, so one request can't stall a page for minutes. */
    maxRetryAfterMs: number;
}

export interface FetchDeps {
    fetch?: typeof fetch;
    sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Strips the API key so a URL can be logged or put in an error message. */
export function redact(url: string): string {
    return url.replace(/api_key=[^&\s]*/g, "api_key=***");
}

/** Retry-After as milliseconds: a number of seconds, or an HTTP date. `null` when absent or unusable. */
export function parseRetryAfter(header: string | null, now: number = Date.now()): number | null {
    if (!header) return null;
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const date = Date.parse(header);
    if (Number.isNaN(date)) return null;
    return Math.max(0, date - now);
}

export async function fetchTmdbJson<T>(url: string, options: FetchOptions, deps: FetchDeps = {}): Promise<T> {
    const doFetch = deps.fetch ?? fetch;
    const sleep = deps.sleep ?? defaultSleep;
    const safeUrl = redact(url);

    let lastError = new TmdbError("network", `No attempt was made for ${safeUrl}`);

    for (let attempt = 0; attempt < options.retries; attempt++) {
        const isLast = attempt === options.retries - 1;
        try {
            const res = await doFetch(url, {
                // `next` is read by Next's patched fetch and ignored by plain fetch.
                next: { revalidate: options.revalidateSeconds },
                signal: AbortSignal.timeout(options.timeoutMs),
            } as RequestInit);

            if (res.ok) {
                const body: unknown = await res.json().catch(() => undefined);
                if (body === null || typeof body !== "object") {
                    lastError = new TmdbError("bad_shape", `Unexpected response body for ${safeUrl}`, res.status);
                } else {
                    return body as T;
                }
            } else if (res.status === 401 || res.status === 403) {
                throw new TmdbError("auth", `TMDB rejected the API key (HTTP ${res.status}) for ${safeUrl}`, res.status);
            } else if (res.status === 404) {
                throw new TmdbError("not_found", `Not found: ${safeUrl}`, 404);
            } else if (res.status === 429) {
                lastError = new TmdbError("rate_limited", `Rate limited by TMDB for ${safeUrl}`, 429);
                if (!isLast) {
                    const wait = parseRetryAfter(res.headers.get("Retry-After")) ?? 2000;
                    await sleep(Math.min(wait, options.maxRetryAfterMs));
                }
                continue;
            } else if (res.status >= 400 && res.status < 500) {
                throw new TmdbError("bad_request", `TMDB rejected the request (HTTP ${res.status}) for ${safeUrl}`, res.status);
            } else {
                lastError = new TmdbError("server", `TMDB returned HTTP ${res.status} for ${safeUrl}`, res.status);
            }
        } catch (error) {
            if (error instanceof TmdbError) throw error;
            const message = error instanceof Error ? error.message : String(error);
            lastError = new TmdbError("network", `Request failed for ${safeUrl}: ${redact(message)}`);
        }

        if (!isLast) await sleep(options.baseBackoffMs * 2 ** attempt);
    }

    throw lastError;
}

/**
 * Settles independent requests that make up one page. A failed request becomes `null` so the page
 * can render without that section, unless it was `required` or more than half failed — then the
 * first failure is thrown. For an ISR page that throw is what makes Next keep the previous good
 * page; for a dynamic page it reaches the error boundary.
 */
export async function settleAll<T extends readonly unknown[]>(
    requests: { [K in keyof T]: Promise<T[K]> },
    options: { required?: number[]; tolerateTotalFailure?: boolean } = {}
): Promise<{ [K in keyof T]: T[K] | null }> {
    const results = await Promise.allSettled(requests as readonly Promise<unknown>[]);
    const failures = results.flatMap((result, index) =>
        result.status === "rejected" ? [{ index, reason: result.reason as unknown }] : []
    );

    if (failures.length > 0 && !options.tolerateTotalFailure) {
        const requiredFailed = failures.some((failure) => options.required?.includes(failure.index));
        const tooMany = failures.length * 2 > results.length;
        if (requiredFailed || tooMany) throw failures[0].reason;
    }

    return results.map((result) => (result.status === "fulfilled" ? result.value : null)) as {
        [K in keyof T]: T[K] | null;
    };
}
