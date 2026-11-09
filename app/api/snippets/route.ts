import { NextResponse } from "next/server";
import { getStore } from "@/lib/get-store";
import { ensureOwnerKey } from "@/lib/owner";
import { parseSnippetInput } from "@/lib/snippet";

/**
 * POST /api/snippets — create a snippet.
 * Body: { title?, description?, language, code, visibility?, expiresIn? }
 * The creating browser is tied to the snippet via a long-lived cookie.
 */
export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ errors: { code: "Invalid JSON body." } }, { status: 400 });
    }

    const parsed = parseSnippetInput(body);
    if (!parsed.ok) {
        return NextResponse.json({ errors: parsed.errors }, { status: 400 });
    }

    const ownerKey = await ensureOwnerKey();
    if (!ownerKey) {
        return NextResponse.json({ errors: { code: "Could not establish owner." } }, { status: 500 });
    }

    try {
        const snippet = await getStore().create(parsed.value, ownerKey);
        return NextResponse.json(
            { id: snippet.id, url: `/s/${snippet.id}` },
            { status: 201 },
        );
    } catch (err) {
        console.error("[POST /api/snippets]", err);
        return NextResponse.json({ errors: { code: "Failed to save snippet." } }, { status: 500 });
    }
}
