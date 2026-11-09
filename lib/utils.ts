/** Join class names, skipping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(" ");
}

const SEC = 1_000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

export function relTime(input: string | Date): string {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return "";
    const diff = Math.abs(Date.now() - d.getTime());
    if (diff < MIN) return "just now";
    if (diff < HOUR) return `${Math.floor(diff / MIN)}m ago`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
    if (diff < 30 * DAY) return `${Math.floor(diff / DAY)}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function untilTime(input: string | Date): string {
    const d = typeof input === "string" ? new Date(input) : input;
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return "expired";
    if (diff < HOUR) return `${Math.round(diff / SEC)}s`;
    if (diff < DAY) return `${Math.round(diff / MIN)}m`;
    return `${Math.round(diff / DAY)}d`;
}

export function compactNumber(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}
