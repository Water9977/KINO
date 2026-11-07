// Route smoke test. Usage: node scripts/smoke.mjs [baseUrl]   (default http://localhost:3000)
//
// Start the site first (`npm run build && npm run start`). Point TMDB_BASE_URL at a mock TMDB
// server if the real one is unreachable; the checks below only depend on routing/validation, not
// on TMDB's content.
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

/** [path, expected HTTP status] */
const statusChecks = [
    ["/", 200],
    ["/browse", 200],
    ["/movies", 200],
    ["/tv", 200],
    ["/discover", 200],
    ["/search?q=cars", 200],
    ["/search?q=a&q=b", 200], // repeated param used to crash with a 500
    ["/category/popular", 200],
    ["/category/popular?type=tv", 200],
    ["/category/constructor", 404], // inherited object keys used to pass the slug check
    ["/category/__proto__", 404],
    ["/category/toString", 404],
    ["/category/bogus", 404],
    ["/nonexistent", 404],
    ["/robots.txt", 200],
    ["/sitemap.xml", 200],
];

/** [path, regex the canonical link must match] */
const canonicalChecks = [
    ["/watch/550", /\/watch\/550"/],
    ["/watch/1399?type=tv", /\/watch\/1399\?type=tv"/],
    ["/category/popular", /\/category\/popular"/],
    ["/category/popular?type=tv", /\/category\/popular\?type=tv"/],
];

let failures = 0;
const report = (ok, label, detail = "") => {
    if (!ok) failures += 1;
    console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  ${detail}` : ""}`);
};

for (const [path, expected] of statusChecks) {
    const res = await fetch(base + path, { redirect: "manual" });
    report(res.status === expected, `${path} -> ${expected}`, res.status === expected ? "" : `got ${res.status}`);
}

for (const [path, pattern] of canonicalChecks) {
    const html = await (await fetch(base + path)).text();
    const link = html.match(/<link rel="canonical"[^>]*>/)?.[0] ?? "";
    report(pattern.test(link), `${path} has its own canonical`, link ? "" : "no canonical tag");
}

const long = await (await fetch(`${base}/search?q=${"x".repeat(5000)}`)).text();
const title = long.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
report(title.length > 0 && title.length < 130, "very long search query is capped in <title>", `(${title.length} chars)`);

console.log(failures === 0 ? "\nAll smoke checks passed." : `\n${failures} smoke check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
