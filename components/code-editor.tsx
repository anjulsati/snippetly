"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";

// Monaco is a heavyweight editor (~2 MB); load it on the client only.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-[#0B1220] text-sm text-slate-500">
            Loading editor…
        </div>
    ),
});

const THEME = "snippetly-dark";

function defineTheme(monaco: Monaco) {
    monaco.editor.defineTheme(THEME, {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#0B1220",
            "editor.foreground": "#E2E8F0",
            "editorGutter.background": "#0B1220",
            "editorLineNumber.foreground": "#334155",
            "editorLineNumber.activeForeground": "#94A3B8",
            "editor.lineHighlightBackground": "#101B2E",
            "editorCursor.foreground": "#34D399",
            "editorIndentGuide.background": "#1B2637",
            "editorIndentGuide.activeBackground": "#334155",
            "scrollbarSlider.background": "#1B263780",
        },
    });
}

interface CodeEditorProps {
    value: string;
    onChange?: (value: string) => void;
    /** Monaco language id. */
    language: string;
    readOnly?: boolean;
    height?: string | number;
    /** Optional callback bound to Ctrl/Cmd+Enter inside the editor. */
    onRun?: () => void;
}

export default function CodeEditor({
    value,
    onChange,
    language,
    readOnly = false,
    height = "100%",
    onRun,
}: CodeEditorProps) {
    const onChangeRef = useRef(onChange);
    const onRunRef = useRef(onRun);
    useEffect(() => {
        onChangeRef.current = onChange;
        onRunRef.current = onRun;
    }, [onChange, onRun]);

    return (
        <MonacoEditor
            height={height}
            language={language}
            theme={THEME}
            value={value}
            beforeMount={defineTheme}
            onMount={(editor, monaco) => {
                if (onRunRef.current) {
                    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                        onRunRef.current?.();
                    });
                }
            }}
            onChange={(v) => onChangeRef.current?.(v ?? "")}
            options={{
                readOnly,
                fontSize: 13.5,
                fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 14, bottom: 14 },
                renderWhitespace: "selection",
                smoothScrolling: true,
            }}
        />
    );
}
