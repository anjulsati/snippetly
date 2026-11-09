import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { SITE, siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl()),
    title: {
        default: "Snippetly — Create, run & share code snippets",
        template: "%s · Snippetly",
    },
    description: SITE.description,
    applicationName: SITE.name,
    authors: [{ name: SITE.author, url: SITE.authorUrl }],
    creator: SITE.author,
    keywords: [
        "Snippetly",
        "code sharing",
        "code execution",
        "snippets",
        "run code online",
        "share code",
        "developer tools",
        "Anjul Sati",
    ],
    openGraph: {
        title: "Snippetly — Create, run & share code snippets",
        description: SITE.description,
        url: "/",
        siteName: SITE.name,
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Snippetly — Create, run & share code snippets",
        description: SITE.description,
    },
};

export const viewport: Viewport = {
    colorScheme: "dark",
    themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#070B14" }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
            <body className="min-h-dvh bg-[#070B14] font-sans text-slate-200 antialiased">
                <div className="flex min-h-dvh flex-col">
                    <SiteHeader />
                    <main className="flex-1">{children}</main>
                    <SiteFooter />
                </div>
            </body>
        </html>
    );
}
