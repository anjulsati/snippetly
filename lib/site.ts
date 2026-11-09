export const SITE = {
    name: "Snippetly",
    tagline: "Create, run, and share code snippets with a single link.",
    description:
        "Snippetly is a fast, login-free platform for creating, running, and sharing code snippets. Write code with a full Monaco editor, execute it live, and share it with one link.",
    author: "Anjul Sati",
    authorUrl: "https://github.com/anjulsati",
    repoUrl: "https://github.com/anjulsati/snippetly",
} as const;

export function siteUrl(): string {
    const vercelUrl =
        process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    return (
        process.env.NEXT_PUBLIC_SITE_URL ??
        (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")
    );
}
