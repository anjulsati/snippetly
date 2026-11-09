export interface Language {
    /** Stable identifier stored on snippets (execution id for runnable languages). */
    key: string;
    /** Human-readable display name. */
    label: string;
    /** Execution backend compiler name, or null when the language is view-only. */
    compiler: string | null;
    /** Monaco editor language id. */
    monaco: string;
    /** File extension used for downloads. */
    ext: string;
}

export const LANGUAGES: Language[] = [
    { key: "javascript", label: "JavaScript", compiler: "nodejs-20.17.0", monaco: "javascript", ext: "js" },
    { key: "typescript", label: "TypeScript", compiler: "typescript-5.6.2", monaco: "typescript", ext: "ts" },
    { key: "python", label: "Python", compiler: "cpython-3.13.8", monaco: "python", ext: "py" },
    { key: "c", label: "C", compiler: "gcc-13.2.0-c", monaco: "c", ext: "c" },
    { key: "c++", label: "C++", compiler: "gcc-13.2.0", monaco: "cpp", ext: "cpp" },
    { key: "csharp", label: "C#", compiler: "mono-6.12.0.199", monaco: "csharp", ext: "cs" },
    { key: "java", label: "Java", compiler: "openjdk-jdk-21+35", monaco: "java", ext: "java" },
    { key: "go", label: "Go", compiler: "go-1.23.2", monaco: "go", ext: "go" },
    { key: "rust", label: "Rust", compiler: "rust-1.82.0", monaco: "rust", ext: "rs" },
    { key: "php", label: "PHP", compiler: "php-8.3.12", monaco: "php", ext: "php" },
    { key: "ruby", label: "Ruby", compiler: "ruby-3.4.9", monaco: "ruby", ext: "rb" },
    { key: "kotlin", label: "Kotlin", compiler: null, monaco: "kotlin", ext: "kt" },
    { key: "dart", label: "Dart", compiler: null, monaco: "dart", ext: "dart" },
    { key: "swift", label: "Swift", compiler: "swift-6.0.1", monaco: "swift", ext: "swift" },
    { key: "bash", label: "Bash", compiler: "bash", monaco: "shell", ext: "sh" },
    { key: "lua", label: "Lua", compiler: "lua-5.4.7", monaco: "lua", ext: "lua" },
    { key: "perl", label: "Perl", compiler: "perl-5.44.0", monaco: "perl", ext: "pl" },
    { key: "r", label: "R", compiler: "r-4.4.1", monaco: "r", ext: "r" },
    { key: "sqlite3", label: "SQL (SQLite)", compiler: "sqlite-3.46.1", monaco: "sql", ext: "sql" },
    { key: "html", label: "HTML", compiler: null, monaco: "html", ext: "html" },
    { key: "css", label: "CSS", compiler: null, monaco: "css", ext: "css" },
    { key: "json", label: "JSON", compiler: null, monaco: "json", ext: "json" },
    { key: "plaintext", label: "Plain text", compiler: null, monaco: "plaintext", ext: "txt" },
];

export const DEFAULT_LANGUAGE_KEY = "python";

export function getLanguage(key: string): Language {
    return LANGUAGES.find((l) => l.key === key) ?? LANGUAGES[LANGUAGES.length - 1];
}

export function runnableCount(): number {
    return LANGUAGES.filter((l) => l.compiler !== null).length;
}

export function isRunnable(key: string): boolean {
    return getLanguage(key).compiler !== null;
}
