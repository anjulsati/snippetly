import postgres from "postgres";
import { newSnippetId } from "./id";
import type { SnippetStore } from "./store";
import type { Snippet, SnippetPatch, SnippetInput } from "./snippet";

type Row = {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    visibility: string;
    owner_key: string;
    views: number;
    created_at: Date;
    updated_at: Date;
    expires_at: Date | null;
};

function toSnippet(r: Row): Snippet {
    return {
        id: r.id,
        title: r.title,
        description: r.description,
        language: r.language,
        code: r.code,
        visibility: r.visibility === "private" ? "private" : "public",
        ownerKey: r.owner_key,
        views: r.views,
        createdAt: new Date(r.created_at),
        updatedAt: new Date(r.updated_at),
        expiresAt: r.expires_at ? new Date(r.expires_at) : null,
    };
}

/**
 * PostgreSQL-backed store (works with any Postgres 14+ database,
 * including serverless providers such as Neon or Supabase).
 */
export class PostgresStore implements SnippetStore {
    private client: postgres.Sql | null = null;
    private schemaReady = false;

    private sql(): postgres.Sql {
        if (!this.client) {
            const url = process.env.DATABASE_URL as string;
            const isLocal = url.includes("localhost") || url.includes("127.0.0.1");
            this.client = postgres(url, {
                max: 5,
                idle_timeout: 20,
                connect_timeout: 10,
                ssl: isLocal ? undefined : "require",
            });
        }
        return this.client;
    }

    private async ensureSchema(): Promise<void> {
        if (this.schemaReady) return;
        const sql = this.sql();
        await sql`CREATE TABLE IF NOT EXISTS snippets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            language TEXT NOT NULL,
            code TEXT NOT NULL,
            visibility TEXT NOT NULL DEFAULT 'public',
            owner_key TEXT NOT NULL,
            views INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            expires_at TIMESTAMPTZ
        )`;
        await sql`CREATE INDEX IF NOT EXISTS snippets_owner_idx ON snippets (owner_key)`;
        await sql`CREATE INDEX IF NOT EXISTS snippets_public_idx ON snippets (created_at DESC) WHERE visibility = 'public'`;
        this.schemaReady = true;
    }

    async create(input: SnippetInput, ownerKey: string): Promise<Snippet> {
        await this.ensureSchema();
        const sql = this.sql();
        let id: string;
        // Retry on primary key collision (vanishingly unlikely, but free to handle).
        for (let attempt = 0; attempt < 5; attempt++) {
            id = newSnippetId();
            const created = (await sql`
                INSERT INTO snippets (id, title, description, language, code, visibility, owner_key, expires_at)
                VALUES (${id}, ${input.title}, ${input.description}, ${input.language}, ${input.code},
                        ${input.visibility}, ${ownerKey}, ${input.expiresAt})
                ON CONFLICT (id) DO NOTHING
                RETURNING *`) as Row[];
            if (created.length > 0) return toSnippet(created[0]);
        }
        throw new Error("Could not generate a unique snippet id.");
    }

    async get(id: string): Promise<Snippet | null> {
        await this.ensureSchema();
        const sql = this.sql();
        const rows = (await sql`
            SELECT * FROM snippets
            WHERE id = ${id} AND (expires_at IS NULL OR expires_at > now())`) as Row[];
        return rows.length ? toSnippet(rows[0]) : null;
    }

    async addView(id: string): Promise<void> {
        await this.ensureSchema();
        const sql = this.sql();
        await sql`UPDATE snippets SET views = views + 1 WHERE id = ${id}`;
    }

    async listPublic(limit: number): Promise<Snippet[]> {
        await this.ensureSchema();
        const sql = this.sql();
        const rows = (await sql`
            SELECT * FROM snippets
            WHERE visibility = 'public' AND (expires_at IS NULL OR expires_at > now())
            ORDER BY created_at DESC LIMIT ${limit}`) as Row[];
        // Occasional opportunistic cleanup of expired snippets.
        await sql`DELETE FROM snippets WHERE expires_at IS NOT NULL AND expires_at < now()`;
        return rows.map(toSnippet);
    }

    async listByOwner(ownerKey: string): Promise<Snippet[]> {
        await this.ensureSchema();
        const sql = this.sql();
        const rows = (await sql`
            SELECT * FROM snippets
            WHERE owner_key = ${ownerKey} AND (expires_at IS NULL OR expires_at > now())
            ORDER BY updated_at DESC`) as Row[];
        return rows.map(toSnippet);
    }

    async update(id: string, ownerKey: string, patch: SnippetPatch): Promise<Snippet | null> {
        await this.ensureSchema();
        const sql = this.sql();
        const rows = (await sql`
            UPDATE snippets SET
                title = COALESCE(${patch.title ?? null}, title),
                description = COALESCE(${patch.description ?? null}, description),
                language = COALESCE(${patch.language ?? null}, language),
                code = COALESCE(${patch.code ?? null}, code),
                visibility = COALESCE(${patch.visibility ?? null}, visibility),
                updated_at = now()
            WHERE id = ${id} AND owner_key = ${ownerKey}
              AND (expires_at IS NULL OR expires_at > now())
            RETURNING *`) as Row[];
        return rows.length ? toSnippet(rows[0]) : null;
    }

    async remove(id: string, ownerKey: string): Promise<boolean> {
        await this.ensureSchema();
        const sql = this.sql();
        const rows = await sql`
            DELETE FROM snippets WHERE id = ${id} AND owner_key = ${ownerKey} RETURNING id`;
        return rows.length > 0;
    }
}
