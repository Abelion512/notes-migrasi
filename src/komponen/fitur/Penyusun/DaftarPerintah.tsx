'use client';

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Heading1, Heading2, List, ListOrdered, CheckSquare, Quote, Code } from 'lucide-react';

export const DaftarPerintah = forwardRef((props: any, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => {
        setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }
            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }
            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }
            return false;
        },
    }));

    return (
        <div className="flex flex-col p-1 w-64 bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--separator)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {props.items.length ? (
                props.items.map((item: any, index: number) => (
                    <button
                        key={index}
                        onClick={() => selectItem(index)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg transition-colors ${index === selectedIndex
                                ? 'bg-[var(--primary)] text-white'
                                : 'hover:bg-[var(--glass-bg)] text-[var(--text-primary)]'
                            }`}
                    >
                        <div className={`p-1 rounded ${index === selectedIndex ? 'bg-white/20' : 'bg-[var(--glass-border)]'}`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="font-medium">{item.title}</p>
                            {/* <p className="text-[10px] opacity-70">{item.description}</p> */}
                        </div>
                    </button>
                ))
            ) : (
                <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                    Tidak ada hasil
                </div>
            )}
        </div>
    );
});

DaftarPerintah.displayName = 'CommandList';
