import { cookies } from "next/headers";
import { newOwnerKey } from "./id";

export const OWNER_COOKIE = "snippetly_owner";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Read the browser owner key in server components / route handlers. */
export async function readOwnerKey(): Promise<string | null> {
    const jar = await cookies();
    return jar.get(OWNER_COOKIE)?.value ?? null;
}

/**
 * Read the owner key, creating and setting one if missing.
 * Only callable in route handlers / server actions (cookies are not writable
 * during server component render).
 */
export async function ensureOwnerKey(): Promise<string | null> {
    const jar = await cookies();
    const existing = jar.get(OWNER_COOKIE)?.value;
    if (existing) return existing;

    const fresh = newOwnerKey();
    jar.set({
        name: OWNER_COOKIE,
        value: fresh,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ONE_YEAR,
    });
    return fresh;
}
