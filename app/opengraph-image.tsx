import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Snippetly — Create, run & share code snippets";

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    backgroundColor: "#070B14",
                    padding: "80px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div
                        style={{
                            width: 88,
                            height: 88,
                            borderRadius: 22,
                            background: "linear-gradient(135deg, #34D399, #22D3EE)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#06281C",
                            fontSize: 52,
                            fontWeight: 700,
                        }}
                    >
                        {"</>"}
                    </div>
                    <div style={{ display: "flex", fontSize: 84, fontWeight: 700, color: "#F1F5F9" }}>
                        Snippetly
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 36,
                        display: "flex",
                        fontSize: 34,
                        color: "#94A3B8",
                        maxWidth: 900,
                    }}
                >
                    Create, run, and share code snippets with a single link.
                </div>

                <div style={{ display: "flex", marginTop: 48, gap: 16 }}>
                    <div
                        style={{
                            display: "flex",
                            padding: "10px 28px",
                            borderRadius: 12,
                            background: "#34D399",
                            color: "#06281C",
                            fontSize: 26,
                            fontWeight: 600,
                        }}
                    >
                        Free · no account needed
                    </div>
                    <div
                        style={{
                            display: "flex",
                            padding: "10px 28px",
                            borderRadius: 12,
                            border: "2px solid #1B2637",
                            color: "#94A3B8",
                            fontSize: 26,
                        }}
                    >
                        by Anjul Sati
                    </div>
                </div>
            </div>
        ),
        size,
    );
}
