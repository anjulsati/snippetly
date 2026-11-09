import type { SnippetStore } from "./store";
import { MemoryStore } from "./memory-store";
import { PostgresStore } from "./postgres-store";

let store: SnippetStore | null = null;

/** Request-process-wide snippet store (memory demo mode or PostgreSQL). */
export function getStore(): SnippetStore {
    if (!store) {
        store = process.env.DATABASE_URL ? new PostgresStore() : MemoryStore.getInstance();
    }
    return store;
}

/** True when no DATABASE_URL is configured (in-memory storage). */
export const isDemoMode = () => !process.env.DATABASE_URL;
