import Link from "next/link";
import Logo from "@/components/logo";

export default function NotFound() {
    return (
        <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-32 text-center">
            <Logo size={40} />
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-100">
                404 — nothing to see here
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
                This snippet may have been deleted, set to private, or expired — or the URL might
                have a typo.
            </p>
            <div className="mt-8 flex items-center gap-3">
                <Link
                    href="/"
                    className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-300"
                >
                    Back home
                </Link>
                <Link
                    href="/new"
                    className="rounded-lg border border-[#1B2637] bg-[#0B1220] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600"
                >
                    Create a snippet
                </Link>
            </div>
        </div>
    );
}
