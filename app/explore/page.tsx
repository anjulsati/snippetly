import type { Metadata } from "next";
import SnippetCard from "@/components/snippet-card";
import { getStore } from "@/lib/get-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Explore",
    description: "Discover recently shared public code snippets from the Snippetly community.",
};

const MAX = 24;

export default async function ExplorePage() {
    const snippets = await getStore().listPublic(MAX);

    return (
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
                    Explore snippets
                </h1>
                <p className="mt-2 text-[15px] text-slate-400">
                    The most recent public snippets. Create one and it will show up here.
                </p>
            </div>

            {snippets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#1B2637] bg-[#0B1220]/50 p-16 text-center">
                    <p className="text-lg font-medium text-slate-300">No public snippets yet</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Be the very first — it takes about 30 seconds.
                    </p>
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
