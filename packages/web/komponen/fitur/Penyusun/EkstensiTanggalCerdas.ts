import { Extension } from '@tiptap/core';
import { parseSmartDate, formatArsipDate } from '@lembaran/core/Kalender';

export const EkstensiTanggalCerdas = Extension.create({
    name: 'tanggalCerdas',

    addKeyboardShortcuts() {
        return {
            'Space': ({ editor }) => {
                const { state } = editor;
                const { selection } = state;
                const { from } = selection;

                // Get the last word before the cursor
                const textBefore = state.doc.textBetween(Math.max(0, from - 15), from, ' ');
                const words = textBefore.split(' ');
                const lastWord = words[words.length - 1];

                if (lastWord.startsWith('@')) {
                    const parsed = parseSmartDate(lastWord);
                    if (parsed) {
                        const formatted = formatArsipDate(parsed);
                        // Delete the tag and insert the formatted date
                        editor.chain()
                            .deleteRange({ from: from - lastWord.length, to: from })
                            .insertContent(`[${formatted}]`)
                            .run();
                        return true;
                    }
                }
                return false;
            },
        };
    },
});
