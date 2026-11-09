import type { Metadata } from "next";
import EditorForm from "@/components/editor-form";

export const metadata: Metadata = {
    title: "New snippet",
    description: "Create, run, and share a code snippet on Snippetly in seconds.",
};

export default function NewSnippetPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
                    New snippet
                </h1>
                <p className="mt-2 text-[15px] text-slate-400">
                    Choose a language, drop in code, and hit{" "}
                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-xs text-slate-300">
                        Ctrl/Cmd + Enter
                    </span>{" "}
                    to run it before sharing.
                </p>
            </div>
            <EditorForm mode="create" />
        </div>
    );
}
