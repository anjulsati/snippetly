import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SnippetViewer, { type SnippetView } from "@/components/snippet-viewer";
import { getStore } from "@/lib/get-store";
import { readOwnerKey } from "@/lib/owner";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const snippet = await getStore().get(id);
    if (!snippet) {
        return { title: "Snippet not found" };
    }
    return {
        title: snippet.title,
        description: snippet.description || undefined,
        robots: snippet.visibility === "private" ? { index: false, follow: false } : undefined,
    };
}

export default async function SnippetPage({ params }: PageProps) {
    const { id } = await params;
    const snippet = await getStore().get(id);

    if (!snippet) notFound();

    // Private snippets stay hidden from everyone except the creating browser.
    if (snippet.visibility === "private") {
        const ownerKey = await readOwnerKey();
        if (ownerKey !== snippet.ownerKey) notFound();
    }

    const isOwner = (await readOwnerKey()) === snippet.ownerKey;

    const view: SnippetView = {
        id: snippet.id,
        title: snippet.title,
        description: snippet.description,
        language: snippet.language,
        code: snippet.code,
        visibility: snippet.visibility,
        views: snippet.views,
        createdAt: snippet.createdAt.toISOString(),
        updatedAt: snippet.updatedAt.toISOString(),
        expiresAt: snippet.expiresAt ? snippet.expiresAt.toISOString() : null,
    };

    return (
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
            <SnippetViewer snippet={view} isOwner={isOwner} />
        </div>
    );
}
