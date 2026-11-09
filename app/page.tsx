import Link from "next/link";
import { SITE } from "@/lib/site";
import { runnableCount } from "@/lib/languages";

const FEATURES = [
    {
        title: "Share with one link",
        text: "Every snippet gets a short, permanent URL — perfect for tutorials, bug reports, code reviews, and DMs.",
        icon: "🔗",
    },
    {
        title: "Run code, live",
        text: "Execute directly in the browser. Your program's stdout, stderr, and exit code show up in a real console.",
        icon: "⚡",
    },
    {
        title: "A serious editor",
        text: "The Monaco engine behind VS Code: syntax highlighting, autocomplete, and smart indentation for every language.",
        icon: "✍️",
    },
    {
        title: "Public or private",
        text: "Share with the world or keep it to yourself. Private snippets are visible only in the browser that created them.",
        icon: "🔒",
    },
    {
        title: "Expiring snippets",
        text: "Sensitive scratch code? Set snippets to self-destruct after 1 hour, 24 hours, 7 days, or 30 days.",
        icon: "⏳",
    },
    {
        title: "Remix anything",
        text: "Found a snippet you like? Fork it into your own workspace in one click and make it yours.",
        icon: "⑂",
    },
] as const;

const CODE_SAMPLE = `>>> # Snippetly — write, run, share in one place
>>> def fib(n):
...     a, b = 0, 1
...     while a < n:
...         print(a, end=" ")
...         a, b = b, a + b
>>> fib(100)

0 1 1 2 3 5 8 13 21 34 55 89
exit code 0 · python 3.10 · 42 ms`;

export default function HomePage() {
    return (
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
            {/* hero */}
            <section className="grid items-center gap-12 pt-16 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
                <div className="animate-fade-up">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs font-medium text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Free · No account needed · Built by {SITE.author}
                    </span>
                    <h1 className="mt-5 text-4xl font-semibold leading-[1.15] tracking-tight text-slate-100 sm:text-5xl lg:text-[3.4rem]">
                        Your code,
                        <span className="bg-linear-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                            {" "}
                            shareable in seconds.
                        </span>
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
                        Snippetly is a fast, login-free platform for creating, running, and sharing
                        code snippets. Write it in a full editor, run it live, then share it with a
                        single link.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            href="/new"
                            className="rounded-lg bg-emerald-400 px-5 py-2.5 text-[15px] font-medium text-slate-950 transition-colors hover:bg-emerald-300"
                        >
                            Create a snippet →
                        </Link>
                        <Link
                            href="/explore"
                            className="rounded-lg border border-[#1B2637] bg-[#0B1220] px-5 py-2.5 text-[15px] font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
                        >
                            Explore snippets
                        </Link>
                        <a
                            href={SITE.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-500 underline decoration-slate-700 underline-offset-4 transition-colors hover:text-slate-300"
                        >
                            View source
                        </a>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-500">
                        <div>
                            <span className="font-semibold text-slate-300">{runnableCount()}</span>{" "}
                            executable languages
                        </div>
                        <div>
                            <span className="font-semibold text-slate-300">0</span> accounts required
                        </div>
                        <div>
                            <span className="font-semibold text-slate-300">1 click</span> to share
                        </div>
                    </div>
                </div>

                {/* demo window */}
                <div className="animate-fade-up-delay-1 rounded-2xl border border-[#1B2637] bg-[#0B1220] shadow-2xl shadow-black/40">
                    <div className="flex items-center gap-2 border-b border-[#1B2637] px-4 py-3">
                        <span className="h-3 w-3 rounded-full bg-rose-400/70" />
                        <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                        <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                        <span className="ml-3 font-mono text-xs text-slate-500">
                            hello-snippetly · python
                        </span>
                        <span className="ml-auto rounded-full bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                            public
                        </span>
                    </div>
                    <pre className="code-scroll overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-slate-300">
                        <code>{CODE_SAMPLE}</code>
                    </pre>
                </div>
            </section>

            {/* features */}
            <section className="pb-24">
                <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-100">
                    Everything you need to move code around
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-slate-400">
                    Built for developers who paste code into chats far too often.
                </p>
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {FEATURES.map((f) => (
                        <div
                            key={f.title}
                            className="rounded-xl border border-[#1B2637] bg-[#0B1220] p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-400/30"
                        >
                            <span className="text-2xl" aria-hidden>
                                {f.icon}
                            </span>
                            <h3 className="mt-3 text-[15px] font-medium text-slate-200">{f.title}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* how it works */}
            <section className="rounded-2xl border border-[#1B2637] bg-[#0B1220] p-8 sm:p-12">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
                    How it works
                </h2>
                <div className="mt-8 grid gap-8 sm:grid-cols-3">
                    {[
                        { n: "01", t: "Write or paste", d: "Open the editor and drop in code — the draft autosaves locally as you type." },
                        { n: "02", t: "Run & verify", d: "Execute it with Ctrl/Cmd + Enter and watch stdio appear in the console." },
                        { n: "03", t: "Share the link", d: "Save once and share the short URL — or keep it private with an expiry." },
                    ].map((s) => (
                        <div key={s.n}>
                            <span className="font-mono text-sm text-emerald-400">{s.n}</span>
                            <h3 className="mt-2 text-[15px] font-medium text-slate-200">{s.t}</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{s.d}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-10">
                    <Link
                        href="/new"
                        className="inline-block rounded-lg bg-emerald-400 px-5 py-2.5 text-[15px] font-medium text-slate-950 transition-colors hover:bg-emerald-300"
                    >
                        Start your first snippet →
                    </Link>
                </div>
            </section>
        </div>
    );
}
