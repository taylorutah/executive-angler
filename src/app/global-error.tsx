"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ backgroundColor: "#0D1117", color: "#F0F6FC", fontFamily: "system-ui" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <p style={{ fontSize: "4rem", fontWeight: "bold", opacity: 0.2, color: "#E8923A" }}>Error</p>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Something went wrong</h2>
            <p style={{ color: "#A8B2BD", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#E8923A",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
