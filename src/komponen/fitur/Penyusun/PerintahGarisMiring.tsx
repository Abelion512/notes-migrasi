import { Extension } from '@tiptap/core';
import { Range, Editor } from '@tiptap/core';
import Suggestion, { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import { DaftarPerintah } from './DaftarPerintah';
import React from 'react';
import {
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Code,
    Minus,
    Type
} from 'lucide-react';

interface CommandProps {
    editor: Editor;
    range: Range;
}

interface SlashCommandItem {
    title: string;
    icon: React.ReactNode;
    command: (props: CommandProps) => void;
}

export const PerintahGarisMiring = Extension.create({
    name: 'perintahGarisMiring',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommandItem }) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export const PerintahGarisMiringConfig = {
    suggestion: {
        items: ({ query }: { query: string }) => {
            return [
                {
                    title: 'Teks Normal',
                    icon: <Type size={16} />,
                    command: ({ editor, range }: CommandProps) => {
                        editor.chain().focus().deleteRange(range).setNode('paragraph').run();
                    },
                },
                {
                    title: 'Heading 1',
                    icon: <Heading1 size={16} />,
                    command: ({ editor, range }: CommandProps) => {
                        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
                    },
                },
                {
                    title: 'Heading 2',
                    icon: <Heading2 size={16} />,
                    command: ({ editor, range }: CommandProps) => {
                        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
                    },
                },
                {
                    title: 'Daftar Poin',
                    icon: <List size={16} />,
                    command: ({ editor, range }: CommandProps) => {
                        editor.chain().focus().deleteRange(range).toggleBulletList().run();
                    },
                },
                {
                    title: 'Daftar Nomor',
                    icon: <ListOrdered size={16} />,
                    command: ({ editor, range }: CommandProps) => {
                        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                    },
                },
                {
                    title: 'Blok Kode',
                    icon: <Code size={16} />,
                    command: ({ editor, range }: CommandProps) => {
                        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                    },
                },
                {
                    title: 'Garis Pemisah',
                    icon: <Minus size={16} />,
                    command: ({ editor, range }: CommandProps) => {
                        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
                    },
                },
            ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
        },
        render: () => {
            let component: ReactRenderer | null = null;
            let popup: Instance[] | null = null;

            return {
                onStart: (props: SuggestionProps<SlashCommandItem>) => {
                    component = new ReactRenderer(DaftarPerintah, {
                        props,
                        editor: props.editor,
                    });

                    if (!props.clientRect) {
                        return;
                    }

                    popup = tippy('body', {
                        getReferenceClientRect: props.clientRect as () => DOMRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    });
                },

                onUpdate(props: SuggestionProps<SlashCommandItem>) {
                    component?.updateProps(props);

                    if (!props.clientRect) {
                        return;
                    }

                    popup?.[0].setProps({
                        getReferenceClientRect: props.clientRect as () => DOMRect,
                    });
                },

                onKeyDown(props: SuggestionKeyDownProps) {
                    if (props.event.key === 'Escape') {
                        popup?.[0].hide();
                        return true;
                    }
                    return (component?.ref as { onKeyDown: (props: SuggestionKeyDownProps) => boolean } | null)?.onKeyDown(props) ?? false;
                },

                onExit() {
                    popup?.[0].destroy();
                    component?.destroy();
                },
            };
        },
    },
};
