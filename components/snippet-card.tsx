import Link from "next/link";
import type { Snippet } from "@/lib/snippet";
import { getLanguage } from "@/lib/languages";
import { compactNumber, relTime } from "@/lib/utils";

export default function SnippetCard({ snippet }: { snippet: Snippet }) {
    const lang = getLanguage(snippet.language);

    return (
        <Link
            href={`/s/${snippet.id}`}
            className="group flex flex-col rounded-xl border border-[#1B2637] bg-[#0B1220] p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-400/30"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-medium text-slate-200 group-hover:text-emerald-300">
                        {snippet.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {relTime(snippet.createdAt)} · {compactNumber(snippet.views)} views
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    {snippet.visibility === "private" ? (
                        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-300">
                            Private
                        </span>
                    ) : null}
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
                        {lang.label}
                    </span>
                </div>
            </div>

            {snippet.description ? (
                <p className="mt-3 line-clamp-2 text-sm text-slate-400">{snippet.description}</p>
            ) : null}

            <pre className="code-scroll mt-4 flex-1 overflow-hidden rounded-lg bg-[#0A0F1C] p-3 font-mono text-[12px] leading-relaxed text-slate-400">
                <code>{snippet.code.slice(0, 200).trim()}{snippet.code.length > 200 ? "…" : ""}</code>
            </pre>
        </Link>
    );
}
