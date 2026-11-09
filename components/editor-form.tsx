"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CodeEditor from "@/components/code-editor";
import RunOutput from "@/components/run-output";
import { LANGUAGES, DEFAULT_LANGUAGE_KEY, getLanguage, isRunnable } from "@/lib/languages";
import { EXPIRY_OPTIONS } from "@/lib/snippet";
import type { RunResult, RunState } from "@/lib/snippet";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "snippetly:draft:v1";

interface StarterSet {
    [key: string]: string;
}

const STARTERS: StarterSet = {
    python: `# Python
def fib(n):
    a, b = 0, 1
    while a < n:
        print(a, end=" ")
        a, b = b, a + b

fib(100)`,
    javascript: `// JavaScript
function fib(n) {
  let a = 0, b = 1;
  while (a < n) {
    console.log(a);
    [a, b] = [b, a + b];
  }
}

fib(100);`,
    typescript: `// TypeScript
const fib = (n: number): void => {
  let a = 0, b = 1;
  while (a < n) console.log(a), [a, b] = [b, a + b];
};

fib(100);`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, C!\\n");
    return 0;
}`,
    "c++": `#include <iostream>

int main() {
    std::cout << "Hello, C++!" << std::endl;
    return 0;
}`,
    csharp: `using System;

class Program {
    static void Main() => Console.WriteLine("Hello, C#!");
}`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}`,
    rust: `fn main() {
    println!("Hello, Rust!");
}`,
    php: `<?php

echo "Hello, PHP!";
`,
    ruby: `puts "Hello, Ruby!"`,
    kotlin: `fun main() {
    println("Hello, Kotlin!")
}`,
    dart: `void main() {
  print('Hello, Dart!');
}`,
    swift: `print("Hello, Swift!")`,
    bash: `echo "Hello, Bash!"`,
    lua: `print("Hello, Lua!")`,
    perl: `print "Hello, Perl!\\n";`,
    r: `cat("Hello, R!\\n")`,
    sqlite3: `SELECT 'Hello, SQLite!' AS greeting;`,
    html: `<!-- HTML is view-only on Snippetly -->
<h1>Hello, world!</h1>`,
    css: `/* CSS is view-only on Snippetly */
body { font-family: sans-serif; }`,
    json: `"Hello, JSON!"`,
    plaintext: `Hello, Snippetly!`,
};

export interface EditorInitial {
    title: string;
    description: string;
    language: string;
    code: string;
    visibility: "public" | "private";
}

interface EditorFormProps {
    mode: "create" | "edit";
    initial?: EditorInitial;
    snippetId?: string;
}

const inputClass =
    "w-full rounded-lg border border-[#1B2637] bg-[#0B1220] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10 focus:outline-none";
const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-500";

export default function EditorForm({ mode, initial, snippetId }: EditorFormProps) {
    const router = useRouter();

    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [language, setLanguage] = useState(initial?.language ?? DEFAULT_LANGUAGE_KEY);
    const [code, setCode] = useState(
        initial?.code ??
            STARTERS[initial?.language ?? DEFAULT_LANGUAGE_KEY] ??
            STARTERS[DEFAULT_LANGUAGE_KEY],
    );
    const [visibility, setVisibility] = useState<EditorInitial["visibility"]>(
        initial?.visibility ?? "public",
    );
    const [expiresIn, setExpiresIn] = useState("");

    const [stdin, setStdin] = useState("");
    const [showStdin, setShowStdin] = useState(false);
    const [run, setRun] = useState<RunState>({ status: "idle" });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const lang = getLanguage(language);

    /* ---------- draft autosave (create mode) ---------- */
    useEffect(() => {
        if (mode !== "create" || initial) return;
        try {
            const draft = localStorage.getItem(DRAFT_KEY);
            if (!draft) return;
            const parsed = JSON.parse(draft) as Partial<EditorInitial>;
            if (parsed.code) setCode(parsed.code);
            if (parsed.title) setTitle(parsed.title);
            if (parsed.description) setDescription(parsed.description);
            if (parsed.language && LANGUAGES.some((l) => l.key === parsed.language)) {
                setLanguage(parsed.language);
            }
        } catch {
            // corrupted draft — ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (mode !== "create") return;
        const t = setTimeout(() => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, description, language, code }));
        }, 600);
        return () => clearTimeout(t);
    }, [title, description, language, code, mode]);

    /* ---------- actions ---------- */
    function switchLanguage(next: string) {
        setLanguage(next);
        if (code === STARTERS[language] || !code.trim()) {
            setCode(STARTERS[next] ?? "");
        }
    }

    async function handleRun() {
        if (!isRunnable(language)) {
            setRun({ status: "error", message: `${lang.label} is view-only and cannot be executed.` });
            return;
        }
        setRun({ status: "running" });
        setShowStdin(true);
        try {
            const res = await fetch("/api/run", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ language, code, stdin }),
            });
            const data = await res.json();
            if (!res.ok) {
                setRun({ status: "error", message: data.error || `Request failed (${res.status}).` });
            } else {
                setRun({ status: "done", result: data as RunResult });
            }
        } catch {
            setRun({ status: "error", message: "Network error — could not reach the server." });
        }
    }

    async function handleSave() {
        const fieldErrors: Record<string, string> = {};
        if (title.length > 120) fieldErrors.title = "Title is too long.";
        if (description.length > 300) fieldErrors.description = "Description is too long.";
        if (!code.trim()) fieldErrors.code = "Code is required.";
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length > 0) return;

        setSaving(true);
        try {
            if (mode === "create") {
                const res = await fetch("/api/snippets", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        title,
                        description,
                        language,
                        code,
                        visibility,
                        expiresIn,
                    }),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setErrors(data.errors ?? { code: `Something went wrong (${res.status}).` });
                    return;
                }
                const data = (await res.json()) as { id: string };
                localStorage.removeItem(DRAFT_KEY);
                router.push(`/s/${data.id}`);
            } else if (snippetId) {
                const res = await fetch(`/api/snippets/${snippetId}`, {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ title, description, language, code, visibility }),
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setErrors(data.errors ?? { code: `Something went wrong (${res.status}).` });
                    return;
                }
                router.push(`/s/${snippetId}`);
            }
        } finally {
            setSaving(false);
        }
    }

    /* ---------- UI ---------- */
    return (
        <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="sm:col-span-2">
                    <label htmlFor="title" className={labelClass}>
                        Title
                    </label>
                    <input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={`untitled ${lang.label.toLowerCase()} snippet`}
                        className={cn(inputClass, "mt-1.5", errors.title && "border-rose-400/60")}
                        maxLength={120}
                    />
                    {errors.title ? <p className="mt-1 text-xs text-rose-400">{errors.title}</p> : null}
                </div>

                <div>
                    <label htmlFor="language" className={labelClass}>
                        Language
                    </label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => switchLanguage(e.target.value)}
                        className={cn(inputClass, "mt-1.5 cursor-pointer appearance-none")}
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.key} value={l.key}>
                                {l.label}
                                {l.compiler ? "" : " (view-only)"}
                            </option>
                        ))}
                    </select>
                </div>

                {mode === "create" ? (
                    <div>
                        <label htmlFor="expiry" className={labelClass}>
                            Expiry
                        </label>
                        <select
                            id="expiry"
                            value={expiresIn}
                            onChange={(e) => setExpiresIn(e.target.value)}
                            className={cn(inputClass, "mt-1.5 cursor-pointer appearance-none")}
                        >
                            {EXPIRY_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <span className={labelClass}>Visibility</span>
                        <div className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-lg border border-[#1B2637]">
                            {(["public", "private"] as const).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() => setVisibility(v)}
                                    className={cn(
                                        "py-2 text-sm capitalize transition-colors",
                                        visibility === v
                                            ? "bg-emerald-400/10 text-emerald-300"
                                            : "text-slate-400 hover:bg-white/5",
                                    )}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {mode === "create" ? (
                <div>
                    <span className={cn(labelClass, "block")}>Visibility</span>
                    <div className="mt-1.5 inline-grid w-64 grid-cols-2 overflow-hidden rounded-lg border border-[#1B2637]">
                        {(["public", "private"] as const).map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={() => setVisibility(v)}
                                className={cn(
                                    "py-2 text-sm capitalize transition-colors",
                                    visibility === v
                                        ? "bg-emerald-400/10 text-emerald-300"
                                        : "text-slate-400 hover:bg-white/5",
                                )}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                        {visibility === "public"
                            ? "Anyone with the link can view, run, and remix this snippet."
                            : "Only this browser (owner) can open the link."}
                    </p>
                </div>
            ) : null}

            <div>
                <label htmlFor="description" className={labelClass}>
                    Description <span className="normal-case text-slate-600">(optional)</span>
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this snippet do?"
                    rows={2}
                    maxLength={300}
                    className={cn(inputClass, "mt-1.5 resize-y", errors.description && "border-rose-400/60")}
                />
            </div>

            {/* Code editor */}
            <div className="overflow-hidden rounded-xl border border-[#1B2637]">
                <div className="flex items-center justify-between border-b border-[#1B2637] bg-[#0B1220] px-4 py-2">
                    <span className="font-mono text-xs text-slate-500">
                        main.{lang.ext}
                        <span className="ml-3 text-slate-600">
                            {code.length.toLocaleString()} chars
                        </span>
                    </span>
                    <button
                        type="button"
                        onClick={() => setCode(STARTERS[language] ?? "")}
                        className="text-xs text-slate-500 transition-colors hover:text-slate-300"
                    >
                        Reset to starter
                    </button>
                </div>
                <CodeEditor
                    value={code}
                    onChange={setCode}
                    language={lang.monaco}
                    height="440px"
                    onRun={handleRun}
                />
                {errors.code ? (
                    <p className="border-t border-rose-400/30 bg-rose-400/10 px-4 py-1.5 text-xs text-rose-300">
                        {errors.code}
                    </p>
                ) : null}
            </div>

            {/* stdin */}
            <div>
                <button
                    type="button"
                    onClick={() => setShowStdin((s) => !s)}
                    className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-300"
                >
                    <span className={cn("transition-transform", showStdin && "rotate-90")}>▸</span>
                    Console input (stdin)
                </button>
                {showStdin ? (
                    <textarea
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        rows={3}
                        placeholder="Optional input your program reads from stdin…"
                        className={cn(inputClass, "mt-2 resize-y font-mono")}
                        maxLength={10_000}
                    />
                ) : null}
            </div>

            {/* actions */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleRun}
                    disabled={run.status === "running"}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#1B2637] bg-[#0B1220] px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-emerald-400/40 hover:text-emerald-300 disabled:opacity-50"
                >
                    <span aria-hidden>▶</span>
                    {run.status === "running" ? "Running…" : "Run"}
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-50"
                >
                    {mode === "create"
                        ? saving
                            ? "Creating…"
                            : "Create snippet →"
                        : saving
                          ? "Saving…"
                          : "Save changes"}
                </button>
                {mode === "edit" ? (
                    <button
                        type="button"
                        onClick={() => history.back()}
                        className="text-sm text-slate-500 transition-colors hover:text-slate-300"
                    >
                        Cancel
                    </button>
                ) : (
                    <p className="text-xs text-slate-500">
                        Your draft autosaves locally. Creating generates a permanent share link.
                    </p>
                )}
            </div>

            <RunOutput state={run} />
        </div>
    );
}
