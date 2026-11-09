import Link from "next/link";
import Logo from "@/components/logo";
import { SITE } from "@/lib/site";

const navLink =
    "rounded-md px-3 py-1.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200";

export default function SiteHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-[#1B2637] bg-[#070B14]/85 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2.5" aria-label="Snippetly home">
                    <Logo />
                    <span className="text-[15px] font-semibold tracking-tight text-slate-100">
                        Snippetly
                    </span>
                </Link>

                <nav className="flex items-center gap-1">
                    <Link href="/explore" className={`hidden sm:block ${navLink}`}>
                        Explore
                    </Link>
                    <Link href="/mine" className={`hidden sm:block ${navLink}`}>
                        My snippets
                    </Link>
                    <a
                        href={SITE.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hidden sm:block ${navLink}`}
                    >
                        GitHub
                    </a>
                    <Link
                        href="/new"
                        className="ml-1 rounded-lg bg-emerald-400 px-3.5 py-1.5 text-sm font-medium text-slate-950 transition-colors hover:bg-emerald-300"
                    >
                        New snippet
                    </Link>
                </nav>
            </div>
        </header>
    );
}
