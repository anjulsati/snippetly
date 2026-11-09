import { ImageResponse } from "next/og";
import { getStore } from "@/lib/get-store";
import { getLanguage } from "@/lib/languages";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = { params: Promise<{ id: string }> };

export default async function Image({ params }: ImageProps) {
    const { id } = await params;
    const snippet = await getStore().get(id);
    const isPrivate = !snippet || snippet.visibility === "private";
    const title = !isPrivate ? snippet!.title : "Private snippet";
    const label = !isPrivate ? getLanguage(snippet!.language).label : "Snippetly";

    // Truncate long titles so the card stays readable.
    const shown = title.length > 90 ? `${title.slice(0, 90)}…` : title;

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#070B14",
                    padding: 72,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            background: "linear-gradient(135deg, #34D399, #22D3EE)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#06281C",
                            fontSize: 30,
                            fontWeight: 700,
                        }}
                    >
                        {"</>"}
                    </div>
                    <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#F1F5F9" }}>
                        Snippetly
                    </div>
                    <div style={{ display: "flex", fontSize: 24, color: "#475569" }}>· {label}</div>
                </div>

                <div
                    style={{
                        display: "flex",
                        fontSize: 64,
                        fontWeight: 700,
                        color: "#E2E8F0",
                        lineHeight: 1.15,
                    }}
                >
                    {shown}
                </div>

                <div style={{ display: "flex", fontSize: 26, color: "#64748B" }}>
                    Create, run, and share code snippets on Snippetly
                </div>
            </div>
        ),
        size,
    );
}
