import { Editor, Range } from '@tiptap/core';

export interface SuggestionProps {
    editor: Editor;
    range: Range;
    query: string;
    clientRect?: () => DOMRect | null;
    event: KeyboardEvent;
}
