import React from 'react';

interface Item {
    title: string;
    icon: React.ReactNode;
    command: (props: { editor: unknown; range: unknown }) => void;
}

interface DaftarPerintahProps {
    items: Item[];
    command: (item: Item) => void;
}

export const DaftarPerintah = React.forwardRef((props: DaftarPerintahProps, ref) => {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    React.useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
                return true;
            }

            if (event.key === 'ArrowDown') {
                setSelectedIndex((selectedIndex + 1) % props.items.length);
                return true;
            }

            if (event.key === 'Enter') {
                selectItem(selectedIndex);
                return true;
            }

            return false;
        },
    }));

    return (
        <div className="ios-list-group min-w-[200px] overflow-hidden">
            {props.items.length > 0 ? (
                props.items.map((item, index) => (
                    <button
                        className={`ios-list-item w-full text-left flex items-center gap-3 ${
                            index === selectedIndex ? 'bg-primary/10 text-primary' : ''
                        }`}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        <span className="opacity-70">{item.icon}</span>
                        <span className="font-medium">{item.title}</span>
                    </button>
                ))
            ) : (
                <div className="p-3 text-[var(--text-secondary)] text-sm">Tidak ada perintah</div>
            )}
        </div>
    );
});

DaftarPerintah.displayName = 'DaftarPerintah';
