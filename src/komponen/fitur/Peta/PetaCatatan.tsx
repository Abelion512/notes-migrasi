'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Arsip } from '@/aksara/Arsip';
import { Note } from '@/aksara/Rumus';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface Node extends Note {
    x: number;
    y: number;
}

export const PetaCatatan = ({ onClose }: { onClose: () => void }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<{ source: number, target: number }[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const loadGraph = async () => {
            const allNotes = await Arsip.getAllNotes();
            const graphNodes: Node[] = allNotes.map((note, i) => ({
                ...note,
                x: 50 + Math.random() * 800,
                y: 50 + Math.random() * 500,
            }));

            const graphLinks: { source: number, target: number }[] = [];

            // Create links based on shared tags
            for (let i = 0; i < graphNodes.length; i++) {
                for (let j = i + 1; j < graphNodes.length; j++) {
                    const sharedTags = graphNodes[i].tags.filter(tag => graphNodes[j].tags.includes(tag));
                    if (sharedTags.length > 0) {
                        graphLinks.push({ source: i, target: j });
                    }
                }
            }

            setNodes(graphNodes);
            setLinks(graphLinks);
        };
        loadGraph();
    }, []);

    return (
        <div className={`fixed inset-0 z-[150] bg-[var(--background)]/80 backdrop-blur-xl flex flex-col ${isFullScreen ? 'p-0' : 'p-6'}`}>
            <div className="flex justify-between items-center mb-6 px-4">
                <h2 className="text-2xl font-bold tracking-tight">Peta Memori</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-2 rounded-full bg-[var(--surface)] active:opacity-40"
                    >
                        {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-[var(--surface)] active:opacity-40 text-red-500"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-[var(--surface)]/30 rounded-3xl border border-[var(--separator)]/20 shadow-inner">
                <svg className="w-full h-full cursor-grab active:cursor-grabbing">
                    {/* Links */}
                    {links.map((link, i) => (
                        <line
                            key={i}
                            x1={nodes[link.source].x}
                            y1={nodes[link.source].y}
                            x2={nodes[link.target].x}
                            y2={nodes[link.target].y}
                            stroke="var(--primary)"
                            strokeWidth="1"
                            strokeOpacity="0.2"
                        />
                    ))}

                    {/* Nodes */}
                    {nodes.map((node, i) => (
                        <motion.g
                            key={node.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            drag
                            dragMomentum={false}
                            onDrag={(e, info) => {
                                const newNodes = [...nodes];
                                newNodes[i].x += info.delta.x;
                                newNodes[i].y += info.delta.y;
                                setNodes(newNodes);
                            }}
                        >
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r="6"
                                fill="var(--primary)"
                                className="shadow-lg"
                            />
                            <text
                                x={node.x}
                                y={node.y + 20}
                                textAnchor="middle"
                                className="text-[10px] fill-[var(--text-secondary)] font-medium pointer-events-none"
                            >
                                {node.title || 'Tanpa Judul'}
                            </text>
                        </motion.g>
                    ))}
                </svg>

                <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-[var(--background)]/80 backdrop-blur-md border border-[var(--separator)]/30 shadow-xl max-w-xs">
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        Simpul (node) merepresentasikan catatan Anda. Garis penghubung menunjukkan kesamaan label (tags) antar catatan. Tarik simpul untuk menata peta Anda.
                    </p>
                </div>
            </div>
        </div>
    );
};
