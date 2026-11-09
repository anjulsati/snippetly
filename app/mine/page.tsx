import type { Metadata } from "next";
import Link from "next/link";
import SnippetCard from "@/components/snippet-card";
import { getStore } from "@/lib/get-store";
import { readOwnerKey } from "@/lib/owner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "My snippets",
    description: "All snippets created from this browser on Snippetly.",
    robots: { index: false, follow: false },
};

export default async function MySnippetsPage() {
    const ownerKey = await readOwnerKey();
    const snippets = ownerKey ? await getStore().listByOwner(ownerKey) : [];

    return (
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
                    My snippets
                </h1>
                <p className="mt-2 max-w-2xl text-[15px] text-slate-400">
                    Snippets are tied to this browser via a private cookie — no account, no
                    password. Expired snippets are hidden automatically.
                </p>
            </div>

            {snippets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1B2637] bg-[#0B1220]/50 p-16 text-center">
                    <p className="text-lg font-medium text-slate-300">
                        {ownerKey ? "Nothing here yet" : "No owner key in this browser yet"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Create your first snippet and it will appear here.
                    </p>
                    <Link
                        href="/new"
                        className="mt-6 inline-block rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-300"
                    >
                        Create a snippet →
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {snippets.map((s) => (
                        <SnippetCard key={s.id} snippet={s} />
                    ))}
                </div>
            )}
        </div>
    );
}
