import { NextResponse } from "next/server";
import { getStore } from "@/lib/get-store";
import { readOwnerKey } from "@/lib/owner";
import { parseSnippetPatch } from "@/lib/snippet";

type RouteContext = { params: Promise<{ id: string }> };

function serialize(s: {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    visibility: string;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
}) {
    return {
        id: s.id,
        title: s.title,
        description: s.description,
        language: s.language,
        code: s.code,
        visibility: s.visibility,
        views: s.views,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        expiresAt: s.expiresAt ? s.expiresAt.toISOString() : null,
    };
}

/** GET /api/snippets/[id] — read a snippet (never exposes the owner key). */
export async function GET(request: Request, context: RouteContext) {
    const { id } = await context.params;
    const snippet = await getStore().get(id);
    if (!snippet) return NextResponse.json({ error: "Snippet not found." }, { status: 404 });

    if (snippet.visibility === "private") {
        const ownerKey = await readOwnerKey();
        if (ownerKey !== snippet.ownerKey) {
            return NextResponse.json({ error: "Snippet not found." }, { status: 404 });
        }
    }

    return NextResponse.json(serialize(snippet));
}

/** PATCH /api/snippets/[id] — update fields (owner only). */
export async function PATCH(request: Request, context: RouteContext) {
    const { id } = await context.params;
    const ownerKey = await readOwnerKey();
    if (!ownerKey) return NextResponse.json({ errors: { code: "Not authorized." } }, { status: 401 });

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ errors: { code: "Invalid JSON body." } }, { status: 400 });
    }

    const parsed = parseSnippetPatch(body);
    if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: 400 });
    if (Object.keys(parsed.value).length === 0) {
        return NextResponse.json({ errors: { code: "Nothing to update." } }, { status: 400 });
    }

    const updated = await getStore().update(id, ownerKey, parsed.value);
    if (!updated) return NextResponse.json({ errors: { code: "Snippet not found." } }, { status: 404 });

    return NextResponse.json(serialize(updated));
}

/** DELETE /api/snippets/[id] — remove a snippet (owner only). */
export async function DELETE(request: Request, context: RouteContext) {
    const { id } = await context.params;
    const ownerKey = await readOwnerKey();
    if (!ownerKey) return NextResponse.json({ errors: { code: "Not authorized." } }, { status: 401 });

    const removed = await getStore().remove(id, ownerKey);
    if (!removed) return NextResponse.json({ errors: { code: "Snippet not found." } }, { status: 404 });

    return NextResponse.json({ ok: true });
}
