import type { Snippet, SnippetInput, SnippetPatch } from "./snippet";

export interface SnippetStore {
    create(input: SnippetInput, ownerKey: string): Promise<Snippet>;
    get(id: string): Promise<Snippet | null>;
    addView(id: string): Promise<void>;
    listPublic(limit: number): Promise<Snippet[]>;
    listByOwner(ownerKey: string): Promise<Snippet[]>;
    update(id: string, ownerKey: string, patch: SnippetPatch): Promise<Snippet | null>;
    remove(id: string, ownerKey: string): Promise<boolean>;
}
