import Link from "next/link";
import Logo from "@/components/logo";
import { SITE } from "@/lib/site";
import { isDemoMode } from "@/lib/get-store";

export default function SiteFooter() {
    const demo = isDemoMode();

    return (
        <footer className="mt-24 border-t border-[#1B2637]">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Logo size={18} />
                        <span className="text-sm font-semibold text-slate-300">{SITE.name}</span>
                    </div>
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} {SITE.author}. Released under the{" "}
                        <a
                            href={`${SITE.repoUrl}/blob/main/LICENSE`}
                            className="underline decoration-slate-600 underline-offset-2 hover:text-slate-300"
                        >
                            MIT license
                        </a>
                        .
                    </p>
                    {demo ? (
                        <p className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-xs text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-dot" />
                            Demo mode — connect DATABASE_URL for permanent storage
                        </p>
                    ) : null}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-500">
                    <Link href="/explore" className="hover:text-slate-300">
                        Explore
                    </Link>
                    <Link href="/mine" className="hover:text-slate-300">
                        My snippets
                    </Link>
                    <a href={SITE.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">
                        GitHub
                    </a>
                    <span className="hidden text-slate-600 sm:inline">Built with Next.js &amp; deployed on Vercel</span>
                </div>
            </div>
        </footer>
    );
}
