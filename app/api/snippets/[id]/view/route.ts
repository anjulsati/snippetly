import { getStore } from "@/lib/get-store";

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/snippets/[id]/view — count a view (fire-and-forget friendly). */
export async function POST(request: Request, context: RouteContext) {
    const { id } = await context.params;
    try {
        const snippet = await getStore().get(id);
        if (snippet && snippet.visibility === "public") {
            await getStore().addView(id);
        }
        return new Response(null, { status: 204 });
    } catch (err) {
        console.error("[POST view]", err);
        return new Response(null, { status: 204 });
    }
}
