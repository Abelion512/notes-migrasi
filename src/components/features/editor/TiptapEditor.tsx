'use client';

import { useEditor, EditorContent } from '@tiptap/react';

import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { SlashCommand, SlashCommandConfig } from './SlashCommand';
import React from 'react';
import {
    Bold, Italic, Strikethrough,
    Heading1, Heading2, List, ListOrdered
} from 'lucide-react';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
    placeholder?: string;
}

export const TiptapEditor = ({
    content,
    onChange,
    editable = true,
    placeholder = 'Mulai menulis kisah Anda...'
}: TiptapEditorProps) => {

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            }),
            Placeholder.configure({
                placeholder: placeholder,
            }),
            SlashCommand.configure(SlashCommandConfig),
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[calc(100vh-300px)] text-[var(--text-primary)]',
            },
        },
        immediatelyRender: false,
    });

    // Sync content if it changes externally (only if needed/safe)
    // useEffect(() => {
    //     if (editor && content !== editor.getHTML()) {
    //         editor.commands.setContent(content);
    //     }
    // }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="relative w-full h-full">
            {editable && (
                <>
                    <BubbleMenu
                        editor={editor}
                        className="flex items-center gap-1 p-1 rounded-xl bg-[var(--background)] border border-[var(--separator)] shadow-lg backdrop-blur-md"
                    >
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('bold') ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}
                        >
                            <Bold size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('italic') ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}
                        >
                            <Italic size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('strike') ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}
                        >
                            <Strikethrough size={16} />
                        </button>
                    </BubbleMenu>

                    <FloatingMenu
                        editor={editor}
                        className="flex items-center gap-1 p-1 rounded-xl bg-[var(--background)] border border-[var(--separator)] shadow-lg backdrop-blur-md"
                    >
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}
                        >
                            <Heading1 size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}
                        >
                            <Heading2 size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('bulletList') ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}
                        >
                            <List size={16} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors ${editor.isActive('orderedList') ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--text-secondary)]'}`}
                        >
                            <ListOrdered size={16} />
                        </button>
                    </FloatingMenu>
                </>
            )}

            <EditorContent editor={editor} className="min-h-full pb-20 editor-instance" />
        </div>
    );
};
