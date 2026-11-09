"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CodeEditor from "@/components/code-editor";
import RunOutput from "@/components/run-output";
import { getLanguage, isRunnable } from "@/lib/languages";
import type { RunState } from "@/lib/snippet";
import { cn, relTime, compactNumber, untilTime } from "@/lib/utils";

/** Serializable snippet DTO sent from the server page to this client island. */
export interface SnippetView {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    visibility: "public" | "private";
    views: number;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
}

function ToolbarButton({
    children,
    onClick,
    danger,
}: {
    children: ReactNode;
    onClick?: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                danger
                    ? "border-rose-400/20 bg-rose-400/5 text-rose-300 hover:bg-rose-400/15"
                    : "border-[#1B2637] bg-[#0B1220] text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300",
            )}
        >
            {children}
        </button>
    );
}

export default function SnippetViewer({
    snippet,
    isOwner,
}: {
    snippet: SnippetView;
    isOwner: boolean;
}) {
    const router = useRouter();
    const lang = getLanguage(snippet.language);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [remixing, setRemixing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [run, setRun] = useState<RunState>({ status: "idle" });

    // Count one view per browser session per page mount.
    const viewCounted = useRef(false);
    useEffect(() => {
        if (viewCounted.current) return;
        viewCounted.current = true;
        fetch(`/api/snippets/${snippet.id}/view`, { method: "POST" }).catch(() => {});
    }, [snippet.id]);

    async function runCode() {
        if (!isRunnable(snippet.language)) return;
        setRun({ status: "running" });
        try {
            const res = await fetch("/api/run", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ language: snippet.language, code: snippet.code, stdin: "" }),
            });
            const data = await res.json();
            if (!res.ok) setRun({ status: "error", message: data.error || "Request failed." });
            else setRun({ status: "done", result: data });
        } catch {
            setRun({ status: "error", message: "Network error — could not reach the server." });
        }
    }

    async function handleRemix() {
        setRemixing(true);
        try {
            const res = await fetch("/api/snippets", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    title: `${snippet.title} (remix)`,
                    description: snippet.description,
                    language: snippet.language,
                    code: snippet.code,
                    visibility: "private",
                    expiresIn: "",
                }),
            });
            if (res.ok) {
                const data = (await res.json()) as { id: string };
                router.push(`/s/${data.id}/edit`);
            }
        } finally {
            setRemixing(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Delete this snippet permanently?")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/snippets/${snippet.id}`, { method: "DELETE" });
            if (res.ok) router.push("/mine");
        } finally {
            setDeleting(false);
        }
    }

    function download() {
        const blob = new Blob([snippet.code], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `main.${lang.ext}`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="space-y-6">
            {/* header */}
            <div className="space-y-3">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
                    {snippet.title}
                </h1>
                {snippet.description ? (
                    <p className="max-w-3xl text-[15px] text-slate-400">{snippet.description}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-emerald-300">
                        {lang.label}
                    </span>
                    {snippet.visibility === "private" ? (
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-amber-300">
                            Private · only you can view this
                        </span>
                    ) : null}
                    <span className="text-slate-500">created {relTime(snippet.createdAt)}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-500">{compactNumber(snippet.views)} views</span>
                    {snippet.expiresAt ? (
                        <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-2.5 py-0.5 text-purple-300">
                            expires in {untilTime(snippet.expiresAt)}
                        </span>
                    ) : null}
                </div>
            </div>

            {/* toolbar */}
            <div className="flex flex-wrap gap-2">
                {isRunnable(snippet.language) ? (
                    <ToolbarButton onClick={runCode}>
                        {run.status === "running" ? "Running…" : "▶ Run code"}
                    </ToolbarButton>
                ) : null}
                <ToolbarButton
                    onClick={async () => {
                        await navigator.clipboard.writeText(snippet.code);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 1500);
                    }}
                >
                    {copiedCode ? "Copied ✓" : "Copy code"}
                </ToolbarButton>
                <ToolbarButton
                    onClick={async () => {
                        await navigator.clipboard.writeText(window.location.href);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 1500);
                    }}
                >
                    {copiedLink ? "Link copied ✓" : "Copy link"}
                </ToolbarButton>
                <ToolbarButton onClick={download}>Download</ToolbarButton>
                {!isOwner ? (
                    <ToolbarButton onClick={handleRemix} >
                        {remixing ? "Remixing…" : "⑂ Remix into my snippets"}
                    </ToolbarButton>
                ) : null}
                {isOwner ? (
                    <>
                        <Link
                            href={`/s/${snippet.id}/edit`}
                            className="rounded-lg border border-[#1B2637] bg-[#0B1220] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-emerald-400/40 hover:text-emerald-300"
                        >
                            Edit
                        </Link>
                        <ToolbarButton onClick={handleDelete} danger>
                            {deleting ? "Deleting…" : "Delete"}
                        </ToolbarButton>
                    </>
                ) : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                {/* editor */}
                <div className="overflow-hidden rounded-xl border border-[#1B2637]">
                    <div className="flex items-center justify-between border-b border-[#1B2637] bg-[#0B1220] px-4 py-2">
                        <span className="font-mono text-xs text-slate-500">main.{lang.ext}</span>
                        <span className="font-mono text-xs text-slate-600">
                            {snippet.code.length.toLocaleString()} chars
                        </span>
                    </div>
                    <CodeEditor
                        value={snippet.code}
                        language={lang.monaco}
                        readOnly
                        height="520px"
                        onRun={isRunnable(snippet.language) ? runCode : undefined}
                    />
                </div>

                {/* side panel */}
                <div className="space-y-6">
                    {isRunnable(snippet.language) ? (
                        <RunOutput state={run} />
                    ) : (
                        <div className="rounded-xl border border-[#1B2637] bg-[#0B1220] p-4 text-sm text-slate-400">
                            {lang.label} is view-only on Snippetly. Copy the code and use it anywhere you like.
                        </div>
                    )}

                    <div className="rounded-xl border border-[#1B2637] bg-[#0B1220] p-5">
                        <h2 className="text-sm font-medium text-slate-300">Details</h2>
                        <dl className="mt-3 space-y-2 font-mono text-xs text-slate-500">
                            <div className="flex justify-between gap-4">
                                <dt>ID</dt>
                                <dd className="text-slate-300">{snippet.id}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt>Language</dt>
                                <dd className="text-slate-300">{lang.label}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt>Visibility</dt>
                                <dd className="text-slate-300 capitalize">{snippet.visibility}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt>Created</dt>
                                <dd className="text-slate-300">{relTime(snippet.createdAt)}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt>Updated</dt>
                                <dd className="text-slate-300">{relTime(snippet.updatedAt)}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt>Views</dt>
                                <dd className="text-slate-300">{snippet.views}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5">
                        <h2 className="text-sm font-medium text-emerald-300">
                            Want a snippet like this?
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-400">
                            Create, run, and share your own in seconds — no account needed.
                        </p>
                        <Link
                            href="/new"
                            className="mt-3 inline-block rounded-lg bg-emerald-400 px-3.5 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-300"
                        >
                            Create a snippet →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
