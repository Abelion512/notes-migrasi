'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { PerintahGarisMiring, PerintahGarisMiringConfig } from './PerintahGarisMiring';
import { EkstensiTanggalCerdas } from './EkstensiTanggalCerdas';
import React, { useState } from 'react';
import {
    Bold, Italic, Heading1, List, Terminal, Sparkles, Loader2
} from 'lucide-react';
import { Pujangga } from '@lembaran/core/Pujangga';
import { haptic } from '@lembaran/core/Indera';

// Import highlight.js styles
import 'highlight.js/styles/github-dark.css';

const lowlight = createLowlight(common);

interface PenyusunCatatanProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
    placeholder?: string;
}

export const PenyusunCatatan = ({
    content,
    onChange,
    editable = true,
    placeholder = 'Mulai menulis kisah Anda...'
}: PenyusunCatatanProps) => {
    const [isMonospace, setIsMonospace] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
                codeBlock: false,
            }),
            CodeBlockLowlight.configure({ lowlight }),
            Placeholder.configure({ placeholder }),
            PerintahGarisMiring.configure(PerintahGarisMiringConfig),
            EkstensiTanggalCerdas,
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert my-4 px-1 focus:outline-none min-h-[calc(100vh-300px)] text-[var(--text-primary)] ${isMonospace ? 'font-mono' : 'font-sans'}`,
            },
        },
        immediatelyRender: false,
    });

    const handleAISummary = async () => {
        if (!editor || isSummarizing) return;

        setIsSummarizing(true);
        haptic.medium();

        try {
            const summary = await Pujangga.ringkasCerdas(editor.getHTML());
            editor.chain().focus().insertContent(`<p><strong>${summary}</strong></p>`).run();
            haptic.success();
        } catch (err) {
            console.error(err);
            haptic.error();
        } finally {
            setIsSummarizing(false);
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="relative w-full h-full">
            {editable && (
                <>
                    <div className="absolute top-[-45px] right-0 flex items-center gap-2 z-10">
                        <button
                            onClick={() => setIsMonospace(!isMonospace)}
                            className={`p-1.5 rounded-md border transition-all ${isMonospace ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-[var(--surface)] border-[var(--separator)]/30 text-[var(--text-secondary)] opacity-40 hover:opacity-100'}`}
                            title="Tampilan Monospace"
                        >
                            <Terminal size={16} />
                        </button>
                        <button
                            onClick={handleAISummary}
                            disabled={isSummarizing}
                            className={`p-1.5 rounded-md border transition-all ${isSummarizing ? 'bg-purple-500/10 text-purple-500 border-purple-500/30' : 'bg-[var(--surface)] border-[var(--separator)]/30 text-purple-500 opacity-40 hover:opacity-100'}`}
                            title="Ringkas Catatan (AI)"
                        >
                            {isSummarizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        </button>
                    </div>

                    <BubbleMenu editor={editor} className="flex items-center gap-1 p-1 rounded-xl bg-[var(--background)] border border-[var(--separator)] shadow-lg backdrop-blur-md">
                        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('bold') ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}>
                            <Bold size={16} />
                        </button>
                        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('italic') ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}>
                            <Italic size={16} />
                        </button>
                    </BubbleMenu>

                    <FloatingMenu editor={editor} className="flex items-center gap-1 p-1 rounded-xl bg-[var(--background)] border border-[var(--separator)] shadow-lg backdrop-blur-md">
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}>
                            <Heading1 size={16} />
                        </button>
                        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('bulletList') ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}>
                            <List size={16} />
                        </button>
                        <button onClick={handleAISummary} className="p-2 rounded-lg hover:bg-[var(--glass-bg)] text-purple-500">
                            <Sparkles size={16} />
                        </button>
                    </FloatingMenu>
                </>
            )}

            <EditorContent editor={editor} className="min-h-full pb-20 editor-instance" />
        </div>
    );
};
