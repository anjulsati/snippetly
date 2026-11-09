import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditorForm, { type EditorInitial } from "@/components/editor-form";
import { getStore } from "@/lib/get-store";
import { readOwnerKey } from "@/lib/owner";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: "Edit snippet",
    robots: { index: false, follow: false },
};

export default async function EditSnippetPage({ params }: PageProps) {
    const { id } = await params;
    const ownerKey = await readOwnerKey();
    const snippet = await getStore().get(id);

    if (!snippet || !ownerKey || snippet.ownerKey !== ownerKey) notFound();

    const initial: EditorInitial = {
        title: snippet.title,
        description: snippet.description,
        language: snippet.language,
        code: snippet.code,
        visibility: snippet.visibility,
    };

    return (
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
            <div className="mb-8 space-y-2">
                <Link href={`/s/${id}`} className="text-sm text-slate-500 transition-colors hover:text-slate-300">
                    ← Back to snippet
                </Link>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
                    Edit snippet
                </h1>
                <p className="font-mono text-xs text-slate-500">/s/{snippet.id}</p>
            </div>
            <EditorForm mode="edit" initial={initial} snippetId={snippet.id} />
        </div>
    );
}
