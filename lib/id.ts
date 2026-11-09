import { randomBytes } from "crypto";

/**
 * URL-safe, unambiguous identifier alphabet ("1", "l", "I", "0" and "o"
 * are excluded on purpose so shared links are easy to transcribe).
 */
const ALPHABET = "23456789abcdefghjkmnpqrstvwxyz";

export function newSnippetId(length = 10): string {
    const bytes = randomBytes(length);
    let id = "";
    for (let i = 0; i < length; i++) {
        id += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return id;
}

export function newOwnerKey(): string {
    return `sko_${randomBytes(24).toString("hex")}`;
}
