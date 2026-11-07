// Run with: npm test   (node:test; Node strips the TypeScript types from tmdb-fetch.ts itself)
import assert from "node:assert/strict";
import { test } from "node:test";
import { TmdbError, fetchTmdbJson, parseRetryAfter, settleAll } from "./tmdb-fetch.ts";

const OPTIONS = { revalidateSeconds: 300, timeoutMs: 1000, retries: 3, baseBackoffMs: 10, maxRetryAfterMs: 50 };
const URL = "https://api.themoviedb.org/3/movie/popular?api_key=SECRETKEY&page=1";

/** Builds the injected fetch/sleep pair and records what happened. */
function harness(...steps) {
    const state = { calls: 0, sleeps: [] };
    const fetchStub = async () => {
        const step = steps[Math.min(state.calls, steps.length - 1)];
        state.calls += 1;
        if (step instanceof Error) throw step;
        return step;
    };
    const sleep = async (ms) => {
        state.sleeps.push(ms);
    };
    return { state, deps: { fetch: fetchStub, sleep } };
}

const json = (body, init) => new Response(JSON.stringify(body), { status: 200, ...init });
const status = (code, headers) => new Response("x", { status: code, headers });

async function rejection(promise) {
    try {
        await promise;
    } catch (error) {
        return error;
    }
    assert.fail("expected the promise to reject");
}

test("returns the parsed body on success", async () => {
    const { state, deps } = harness(json({ results: [1] }));
    assert.deepEqual(await fetchTmdbJson(URL, OPTIONS, deps), { results: [1] });
    assert.equal(state.calls, 1);
});

test("a server error is retried and a later success wins", async () => {
    const { state, deps } = harness(status(500), json({ results: [1] }));
    assert.deepEqual(await fetchTmdbJson(URL, OPTIONS, deps), { results: [1] });
    assert.equal(state.calls, 2);
});

test("persistent server errors throw instead of resolving to an empty payload", async () => {
    const { state, deps } = harness(status(503));
    const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
    assert.ok(error instanceof TmdbError);
    assert.equal(error.reason, "server");
    assert.equal(error.status, 503);
    assert.equal(state.calls, 3);
});

test("a rejected key is reported at once and not retried", async () => {
    for (const code of [401, 403]) {
        const { state, deps } = harness(status(code));
        const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
        assert.equal(error.reason, "auth");
        assert.equal(state.calls, 1);
    }
});

test("404 is not_found and not retried", async () => {
    const { state, deps } = harness(status(404));
    const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
    assert.equal(error.reason, "not_found");
    assert.equal(state.calls, 1);
});

test("other client errors are not retried", async () => {
    const { state, deps } = harness(status(422));
    const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
    assert.equal(error.reason, "bad_request");
    assert.equal(state.calls, 1);
});

test("429 waits for Retry-After but never longer than the cap", async () => {
    const { state, deps } = harness(status(429, { "Retry-After": "30" }), json({ ok: true }));
    assert.deepEqual(await fetchTmdbJson(URL, OPTIONS, deps), { ok: true });
    assert.deepEqual(state.sleeps, [OPTIONS.maxRetryAfterMs]);
});

test("429 with an HTTP-date Retry-After does not turn into instant retries", async () => {
    const date = new Date(Date.now() + 20_000).toUTCString();
    const { state, deps } = harness(status(429, { "Retry-After": date }), json({ ok: true }));
    await fetchTmdbJson(URL, OPTIONS, deps);
    assert.deepEqual(state.sleeps, [OPTIONS.maxRetryAfterMs]);
});

test("exhausted rate limiting throws rate_limited", async () => {
    const { deps } = harness(status(429));
    const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
    assert.equal(error.reason, "rate_limited");
});

test("an HTML page served with status 200 is an error, not a result", async () => {
    const { state, deps } = harness(new Response("<html>blocked</html>", { status: 200 }));
    const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
    assert.equal(error.reason, "bad_shape");
    assert.equal(state.calls, 3);
});

test("a JSON body that is not an object is rejected", async () => {
    const { deps } = harness(json(null));
    const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
    assert.equal(error.reason, "bad_shape");
});

test("network failures are retried then thrown as network errors", async () => {
    const { state, deps } = harness(new TypeError("fetch failed"));
    const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
    assert.equal(error.reason, "network");
    assert.equal(state.calls, 3);
    assert.deepEqual(state.sleeps, [10, 20]);
});

test("the API key never appears in a thrown error", async () => {
    const { deps } = harness(new TypeError(`connect failed: ${URL}`));
    const error = await rejection(fetchTmdbJson(URL, OPTIONS, deps));
    assert.doesNotMatch(error.message, /SECRETKEY/);
});

test("parseRetryAfter handles seconds, dates, junk and missing values", () => {
    assert.equal(parseRetryAfter("3"), 3000);
    assert.equal(parseRetryAfter(null), null);
    assert.equal(parseRetryAfter("soon"), null);
    assert.equal(parseRetryAfter(new Date(1_000_000 + 5_000).toUTCString(), 1_000_000), 5000);
    assert.equal(parseRetryAfter(new Date(0).toUTCString(), 1_000_000), 0);
});

// ── settleAll: independent requests for one page ─────────────────────────────────────────────

const failed = () => Promise.reject(new TmdbError("server", "down", 500));

test("settleAll returns every value when everything succeeds", async () => {
    assert.deepEqual(await settleAll([Promise.resolve(1), Promise.resolve(2)]), [1, 2]);
});

test("settleAll turns a minor failure into null so the rest of the page still renders", async () => {
    const result = await settleAll([Promise.resolve("a"), failed(), Promise.resolve("c")]);
    assert.deepEqual(result, ["a", null, "c"]);
});

test("settleAll throws when a required request fails (so ISR keeps the previous page)", async () => {
    const error = await rejection(settleAll([failed(), Promise.resolve(2), Promise.resolve(3)], { required: [0] }));
    assert.ok(error instanceof TmdbError);
});

test("settleAll throws when more than half of the requests fail", async () => {
    await rejection(settleAll([failed(), failed(), Promise.resolve(3)]));
});

test("settleAll tolerates exactly half failing", async () => {
    assert.deepEqual(await settleAll([failed(), Promise.resolve(2)]), [null, 2]);
});

test("settleAll can be told to accept an empty result (documented build escape hatch)", async () => {
    assert.deepEqual(await settleAll([failed(), failed()], { tolerateTotalFailure: true }), [null, null]);
});
