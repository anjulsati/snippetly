"use client";

import { useState } from "react";
import type { RunState } from "@/lib/snippet";
import { cn } from "@/lib/utils";

function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={async () => {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
            {copied ? "Copied ✓" : label}
        </button>
    );
}

/**
 * Presentational output console shared by the editor form and the
 * snippet view page.
 */
export default function RunOutput({ state }: { state: RunState }) {
    return (
        <div className="overflow-hidden rounded-xl border border-[#1B2637] bg-[#0B1220]">
            <div className="flex items-center justify-between border-b border-[#1B2637] px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Output
                    </span>
                    {state.status === "done" && state.result ? (
                        <span
                            className={cn(
                                "rounded-full border px-2 py-0.5 text-xs",
                                state.result.exitCode === 0
                                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                    : "border-rose-400/20 bg-rose-400/10 text-rose-300",
                            )}
                        >
                            exit code {state.result.exitCode ?? "—"}
                        </span>
                    ) : null}
                    {state.status === "done" && state.result ? (
                        <span className="hidden text-xs text-slate-500 sm:inline">
                            {state.result.durationMs
                                ? `${state.result.durationMs} ms`
                                : state.result.runtimeVersion
                                  ? `runtime ${state.result.runtimeVersion}`
                                  : ""}
                        </span>
                    ) : null}
                </div>
                {state.status === "done" && state.result ? (
                    <CopyButton
                        text={
                            [state.result.stdout, state.result.stderr].filter(Boolean).join("\n") ||
                            ""
                        }
                        label="Copy output"
                    />
                ) : null}
            </div>

            <div className="min-h-[120px] max-h-[280px] overflow-auto bg-[#0B1220] p-4 font-mono text-[13px] leading-relaxed">
                {state.status === "idle" ? (
                    <p className="text-slate-500">
                        Press <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-300">Run</span>{" "}
                        (or <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-300">Ctrl/Cmd + Enter</span>)
                        to execute the code.
                    </p>
                ) : null}

                {state.status === "running" ? (
                    <div className="space-y-2 text-slate-400">
                        <p className="flex items-center gap-2">
                            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-400" />
                            Executing…
                        </p>
                        <div className="h-2 w-3/5 rounded bg-white/5" />
                        <div className="h-2 w-2/5 rounded bg-white/5" />
                    </div>
                ) : null}

                {state.status === "error" ? (
                    <p className="text-rose-300">{state.message || "Something went wrong."}</p>
                ) : null}

                {state.status === "done" && state.result ? (
                    <div className="space-y-3">
                        {state.result.stderr ? (
                            <pre className="code-scroll whitespace-pre-wrap text-rose-300">
                                {state.result.stderr}
                            </pre>
                        ) : null}
                        {state.result.stdout ? (
                            <pre className="code-scroll whitespace-pre-wrap text-slate-300">
                                {state.result.stdout}
                            </pre>
                        ) : null}
                        {!state.result.stdout && !state.result.stderr ? (
                            <p className="text-slate-500">
                                Program finished with no output and exit code {state.result.exitCode ?? "—"}.
                            </p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
