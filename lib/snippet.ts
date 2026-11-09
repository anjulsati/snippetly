import { isRunnable, getLanguage } from "./languages";

export type Visibility = "public" | "private";

export interface Snippet {
    id: string;
    title: string;
    description: string;
    /** Stable language identifier (see lib/languages.ts). */
    language: string;
    code: string;
    visibility: Visibility;
    ownerKey: string;
    views: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date | null;
}

/** Fields a client may update on an existing snippet. */
export type SnippetPatch = Partial<
    Pick<Snippet, "title" | "description" | "language" | "code" | "visibility">
>;

export interface SnippetInput {
    title: string;
    description: string;
    language: string;
    code: string;
    visibility: Visibility;
    expiresAt: Date | null;
}

/** Payload returned by code execution (see app/api/run). */
export interface RunResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    durationMs: number;
    runtimeVersion?: string;
}

export interface RunState {
    status: "idle" | "running" | "done" | "error";
    result?: RunResult;
    message?: string;
}

export const LIMITS = {
    code: 100_000,
    stdin: 10_000,
    title: 120,
    description: 300,
} as const;

export const EXPIRY_OPTIONS = [
    { label: "Never expires", value: "" },
    { label: "Expires in 1 hour", value: "1h" },
    { label: "Expires in 24 hours", value: "24h" },
    { label: "Expires in 7 days", value: "7d" },
    { label: "Expires in 30 days", value: "30d" },
] as const;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const EXPIRY_MS: Record<string, number> = {
    "1h": HOUR,
    "24h": DAY,
    "7d": 7 * DAY,
    "30d": 30 * DAY,
};

export function expiryDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const ms = EXPIRY_MS[value];
    return ms ? new Date(Date.now() + ms) : null;
}

export interface ValidationError {
    ok: false;
    errors: Record<string, string>;
}

function str(value: unknown): string {
    return typeof value === "string" ? value : "";
}

/**
 * Validate a raw create payload into a fully typed SnippetInput.
 */
export function parseSnippetInput(
    body: unknown,
): { ok: true; value: SnippetInput } | ValidationError {
    const errors: Record<string, string> = {};
    const data = (body ?? {}) as Record<string, unknown>;

    const code = str(data.code);
    if (!code.trim()) errors.code = "Code is required.";
    else if (code.length > LIMITS.code) errors.code = `Code must be under ${LIMITS.code} characters.`;

    const lang = getLanguage(str(data.language));
    if (str(data.language) && lang.key !== str(data.language)) {
        errors.language = "Language is not supported.";
    }

    const visibility = str(data.visibility) === "private" ? "private" : "public";

    const title =
        str(data.title).trim() ||
        `${getLanguage(str(data.language)).label} snippet`;
    if (title.length > LIMITS.title) errors.title = `Title must be under ${LIMITS.title} characters.`;

    const description = str(data.description);
    if (description.length > LIMITS.description)
        errors.description = `Description must be under ${LIMITS.description} characters.`;

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    return {
        ok: true,
        value: {
            title,
            description,
            language: lang.key,
            code,
            visibility: visibility as Visibility,
            expiresAt: expiryDate(str(data.expiresIn)),
        },
    };
}

/**
 * Validate a partial update payload. Only present keys are applied.
 */
export function parseSnippetPatch(
    body: unknown,
): { ok: true; value: SnippetPatch } | ValidationError {
    const errors: Record<string, string> = {};
    const data = (body ?? {}) as Record<string, unknown>;
    const patch: SnippetPatch = {};

    if ("title" in data) {
        const title = str(data.title).trim();
        if (!title) errors.title = "Title cannot be empty.";
        else if (title.length > LIMITS.title) errors.title = `Title must be under ${LIMITS.title} characters.`;
        else patch.title = title;
    }
    if ("description" in data) {
        const description = str(data.description);
        if (description.length > LIMITS.description)
            errors.description = `Description must be under ${LIMITS.description} characters.`;
        else patch.description = description;
    }
    if ("code" in data) {
        const code = str(data.code);
        if (!code.trim()) errors.code = "Code cannot be empty.";
        else if (code.length > LIMITS.code) errors.code = `Code must be under ${LIMITS.code} characters.`;
        else patch.code = code;
    }
    if ("language" in data) {
        const lang = getLanguage(str(data.language));
        if (lang.key !== str(data.language)) errors.language = "Language is not supported.";
        else patch.language = lang.key;
    }
    if ("visibility" in data) {
        const visibility = str(data.visibility);
        if (visibility !== "public" && visibility !== "private")
            errors.visibility = "Visibility must be public or private.";
        else patch.visibility = visibility as Visibility;
    }

    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, value: patch };
}

export function canRun(language: string): boolean {
    return isRunnable(language);
}
