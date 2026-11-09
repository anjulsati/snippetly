import { NextResponse } from "next/server";
import { execute } from "@/lib/execute";
import { getLanguage } from "@/lib/languages";
import { LIMITS } from "@/lib/snippet";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > MAX_REQUESTS;
}

function clientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || "127.0.0.1";
}

export const maxDuration = 60; // slow starts on some runtimes (Java, TS need >10s on Hobby tier)

/**
 * POST /api/run — execute a snippet on the configured execution backend
 * (the free public Wandbox API by default; plug in your own via EXEC_API_URL).
 * Body: { language, code, stdin? }
 */
export async function POST(request: Request) {
    const ip = clientIp(request);
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many executions — try again in a minute." },
            { status: 429 },
        );
    }

    let body: { language?: unknown; code?: unknown; stdin?: unknown };
    try {
        body = (await request.json()) as typeof body;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const lang = getLanguage(typeof body.language === "string" ? body.language : "");
    if (!lang.compiler) {
        return NextResponse.json(
            { error: `${lang.label} is view-only and cannot be executed.` },
            { status: 400 },
        );
    }

    const code = typeof body.code === "string" ? body.code : "";
    const stdin = typeof body.stdin === "string" ? body.stdin : "";

    if (!code.trim()) {
        return NextResponse.json({ error: "Code is required." }, { status: 400 });
    }
    if (code.length > LIMITS.code) {
        return NextResponse.json({ error: "Code is too large to execute." }, { status: 413 });
    }

    const durationStarted = Date.now();
    const outcome = await execute(lang, code, stdin.slice(0, LIMITS.stdin));
    if (!outcome.ok) {
        return NextResponse.json({ error: outcome.error }, { status: 502 });
    }

    return NextResponse.json({
        stdout: outcome.result.stdout,
        stderr: outcome.result.stderr,
        exitCode: outcome.result.exitCode,
        runtimeVersion: outcome.result.runtimeVersion,
        durationMs: Date.now() - durationStarted,
    });
}
