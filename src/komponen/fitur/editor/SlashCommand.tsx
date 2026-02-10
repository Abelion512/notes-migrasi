import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';

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

    addStorage() {
        return {
            isOpen: false,
        };
    },

    onUpdate() {
        this.storage.isOpen = !!this.editor.isFocused;
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
        items: ({ query }: { query: string }) => {
            return [
                {
                    title: 'Heading 1',
                    icon: 'h1',
                    command: ({ editor, range }: any) => {
                        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
                    },
                },
                {
                    title: 'Heading 2',
                    icon: 'h2',
                    command: ({ editor, range }: any) => {
                        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
                    },
                },
                {
                    title: 'Bullet List',
                    icon: 'ul',
                    command: ({ editor, range }: any) => {
                        editor.chain().focus().deleteRange(range).toggleBulletList().run();
                    },
                },
                {
                    title: 'Code Block',
                    icon: 'code',
                    command: ({ editor, range }: any) => {
                        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                    },
                },
                {
                    title: 'Horizontal Rule',
                    icon: 'hr',
                    command: ({ editor, range }: any) => {
                        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
                    },
                },
            ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()));
        },
        render: () => {
            return {
                onStart: (props: any) => {
                    // Logic to show a popup list
                    console.log('Slash command started', props);
                },
                onUpdate: (props: any) => {
                    console.log('Slash command updated', props);
                },
                onKeyDown: (props: any) => {
                    if (props.event.key === 'Escape') {
                        return true;
                    }
                    return false;
                },
                onExit: () => {
                    console.log('Slash command exited');
                },
            };
        },
    },
};
