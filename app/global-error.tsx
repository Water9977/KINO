"use client";

/**
 * Last-resort boundary for errors thrown in the root layout itself (everything else is caught by
 * app/(main)/error.tsx). It replaces the whole document, so it has to render its own <html> and
 * <body> and can't rely on the app's stylesheet loading.
 */
export default function GlobalError() {
    return (
        <html lang="en">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 16,
                    background: "#0a0a0a",
                    color: "#fff",
                    fontFamily: "system-ui, sans-serif",
                    textAlign: "center",
                    padding: 24,
                }}
            >
                <h1 style={{ margin: 0 }}>Something went wrong</h1>
                <p style={{ margin: 0, color: "#9ca3af" }}>Please try again in a moment.</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "12px 28px",
                        borderRadius: 999,
                        border: 0,
                        background: "#2563eb",
                        color: "#fff",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
