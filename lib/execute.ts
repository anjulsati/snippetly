import type { Language } from "./languages";

/**
 * Code-execution client for the Wandbox public API (https://wandbox.org).
 * Self-hosted / alternate instances can be plugged in via EXEC_API_URL.
 */

const BASE = (process.env.EXEC_API_URL || "https://wandbox.org/api").replace(/\/$/, "");

export type ExecuteOutcome =
    | {
          ok: true;
          result: {
              stdout: string;
              stderr: string;
              exitCode: number | null;
              runtimeVersion: string;
          };
      }
    | { ok: false; error: string };

interface WandboxResponse {
    status?: string;
    program_output?: string;
    program_error?: string;
    compiler_error?: string;
    compiler_output?: string;
}

export async function execute(
    lang: Language,
    code: string,
    stdin: string,
    timeoutMs = 45_000,
): Promise<ExecuteOutcome> {
    if (!lang.compiler) {
        return { ok: false, error: `${lang.label} is view-only and cannot be executed.` };
    }

    try {
        const res = await fetch(`${BASE}/compile.json`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            cache: "no-store",
            signal: AbortSignal.timeout(timeoutMs),
            body: JSON.stringify({
                compiler: lang.compiler,
                code,
                stdin,
                save: false,
            }),
        });

        if (res.status === 429) {
            return {
                ok: false,
                error: "The execution service is busy. Please try again in a few seconds.",
            };
        }
        if (!res.ok) {
            return { ok: false, error: `Execution failed (HTTP ${res.status}).` };
        }

        const data = (await res.json()) as WandboxResponse;
        const compileErr = data.compiler_error?.trim() ?? "";
        const programErr = data.program_error?.trim() ?? "";
        const stderr = [compileErr, programErr].filter(Boolean).join("\n");
        const rawStatus = data.status?.trim() ?? "";
        const exitCode = rawStatus === "" || Number.isNaN(Number(rawStatus)) ? null : Number(rawStatus);

        return {
            ok: true,
            result: {
                stdout: data.program_output ?? "",
                stderr,
                exitCode,
                runtimeVersion: deriveVersion(lang.compiler),
            },
        };
    } catch (err) {
        const message =
            err instanceof Error && err.name === "TimeoutError"
                ? "The execution service timed out. Please try again."
                : "Could not reach the execution service. Please try again later.";
        return { ok: false, error: message };
    }
}

/** cpython-3.13.8 -> 3.13.8, rust-1.82.0 -> 1.82.0, nodejs-20.17.0 -> 20.17.0 */
function deriveVersion(compiler: string): string {
    return compiler.replace(/^(cpython|python|nodejs|rust|gcc|openjdk-jdk|mono|php|ruby|lua|perl|r|sqlite|typescript|go|bash)-/, "");
}
