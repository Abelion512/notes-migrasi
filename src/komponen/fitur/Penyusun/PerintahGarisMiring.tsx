import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
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

export const PerintahGarisMiring = Extension.create({
    name: 'perintahGarisMiring',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: { editor: unknown, range: unknown, props: unknown }) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addStorage() {
        return {
            tippyInstance: null as TippyInstance | null,
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
                items: ({ query }: { query: string }) => {
                    return [
                        {
                            title: 'Judul 1',
                            icon: <Heading1 size={16} />,
                            command: ({ editor, range }: { editor: unknown, range: unknown }) => {
                                editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
                            },
                        },
                        {
                            title: 'Judul 2',
                            icon: <Heading2 size={16} />,
                            command: ({ editor, range }: { editor: unknown, range: unknown }) => {
                                editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
                            },
                        },
                        {
                            title: 'Daftar Poin',
                            icon: <List size={16} />,
                            command: ({ editor, range }: { editor: unknown, range: unknown }) => {
                                editor.chain().focus().deleteRange(range).toggleBulletList().run();
                            },
                        },
                        {
                            title: 'Daftar Angka',
                            icon: <ListOrdered size={16} />,
                            command: ({ editor, range }: { editor: unknown, range: unknown }) => {
                                editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                            },
                        },
                        {
                            title: 'Blok Kode',
                            icon: <Code size={16} />,
                            command: ({ editor, range }: { editor: unknown, range: unknown }) => {
                                editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                            },
                        },
                        {
                            title: 'Garis Pemisah',
                            icon: <Minus size={16} />,
                            command: ({ editor, range }: { editor: unknown, range: unknown }) => {
                                editor.chain().focus().deleteRange(range).setHorizontalRule().run();
                            },
                        },
                        {
                            title: 'Teks Biasa',
                            icon: <Type size={16} />,
                            command: ({ editor, range }: { editor: unknown, range: unknown }) => {
                                editor.chain().focus().deleteRange(range).setParagraph().run();
                            },
                        },
                    ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
                },
                render: () => {
                    let component: ReactRenderer<unknown>;
                    let popup: TippyInstance[];

                    return {
                        onStart: (props: unknown) => {
                            component = new ReactRenderer(DaftarPerintah, {
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

                        onUpdate(props: unknown) {
                            component.updateProps(props);

                            if (!props.clientRect) {
                                return;
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            });
                        },

                        onKeyDown(props: unknown) {
                            if (props.event.key === 'Escape') {
                                popup[0].hide();
                                return true;
                            }

                            return (component.ref as { onKeyDown: (props: unknown) => boolean })?.onKeyDown(props);
                        },

                        onExit() {
                            popup[0].destroy();
                            component.destroy();
                        },
                    };
                },
            }),
        ];
    },
});
