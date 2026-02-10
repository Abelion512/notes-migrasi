import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { CommandList } from './CommandList';
import { Heading1, Heading2, List, ListOrdered, Quote, Code, Sparkles } from 'lucide-react';

const getSuggestionItems = ({ query }: { query: string }) => {
    return [
        {
            title: 'Heading 1',
            icon: <Heading1 size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
            },
        },
        {
            title: 'Heading 2',
            icon: <Heading2 size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
            },
        },
        {
            title: 'Bullet List',
            icon: <List size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run();
            },
        },
        {
            title: 'Ordered List',
            icon: <ListOrdered size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
            },
        },
        {
            title: 'Blockquote',
            icon: <Quote size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run();
            },
        },
        {
            title: 'Code Block',
            icon: <Code size={14} />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
            },
        },
        {
            title: 'Deep Research',
            icon: <Sparkles size={14} className="text-yellow-500" />,
            command: ({ editor, range }: any) => {
                editor.chain().focus().deleteRange(range).run();
                // Mock action: Insert a loading block or just a text for now
                editor.chain().focus().insertContent('<blockquote>✨ Melakukan Deep Research... (Implementasi di masa depan)</blockquote>').run();
            },
        },
    ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
};

const renderSuggestion = () => {
    let component: ReactRenderer;
    let popup: any;

    return {
        onStart: (props: any) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            });

            if (!props.clientRect) {
                return;
            }

            popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
            });
        },
        onUpdate(props: any) {
            component.updateProps(props);

            if (!props.clientRect) {
                return;
            }

            popup[0].setProps({
                getReferenceClientRect: props.clientRect,
            });
        },
        onKeyDown(props: any) {
            if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
            }
            // @ts-expect-error - ReactRenderer ref type mismatch
            return component?.ref?.onKeyDown(props);
        },
        onExit() {
            popup[0].destroy();
            component.destroy();
        },
    };
};

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
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

export const SlashCommandConfig = {
    suggestion: {
        items: getSuggestionItems,
        render: renderSuggestion,
    }
}
