import type { SnippetStore } from "./store";
import type { Snippet, SnippetInput, SnippetPatch } from "./snippet";
import { newSnippetId } from "./id";

/**
 * In-memory store used when DATABASE_URL is not configured.
 * Perfect for local development and previews; data resets on restart.
 * In production (serverless), configure DATABASE_URL for shared storage.
 */
export class MemoryStore implements SnippetStore {
    private static instance: MemoryStore | null = null;
    private data = new Map<string, Snippet>();

    static getInstance(): MemoryStore {
        if (!MemoryStore.instance) MemoryStore.instance = new MemoryStore();
        return MemoryStore.instance;
    }

    private purge(): void {
        const now = Date.now();
        for (const [id, s] of this.data) {
            if (s.expiresAt && s.expiresAt.getTime() < now) this.data.delete(id);
        }
    }

    async create(input: SnippetInput, ownerKey: string): Promise<Snippet> {
        let id = newSnippetId();
        while (this.data.has(id)) id = newSnippetId();
        const now = new Date();
        const snippet: Snippet = { id, ...input, ownerKey, views: 0, createdAt: now, updatedAt: now };
        this.data.set(id, snippet);
        return snippet;
    }

    async get(id: string): Promise<Snippet | null> {
        this.purge();
        return this.data.get(id) ?? null;
    }

    async addView(id: string): Promise<void> {
        const s = this.data.get(id);
        if (s) s.views += 1;
    }

    async listPublic(limit: number): Promise<Snippet[]> {
        this.purge();
        return [...this.data.values()]
            .filter((s) => s.visibility === "public")
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    async listByOwner(ownerKey: string): Promise<Snippet[]> {
        this.purge();
        return [...this.data.values()]
            .filter((s) => s.ownerKey === ownerKey)
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    async update(id: string, ownerKey: string, patch: SnippetPatch): Promise<Snippet | null> {
        this.purge();
        const s = this.data.get(id);
        if (!s || s.ownerKey !== ownerKey) return null;
        Object.assign(s, patch);
        s.updatedAt = new Date();
        return s;
    }

    async remove(id: string, ownerKey: string): Promise<boolean> {
        this.purge();
        const s = this.data.get(id);
        if (!s || s.ownerKey !== ownerKey) return false;
        this.data.delete(id);
        return true;
    }
}
