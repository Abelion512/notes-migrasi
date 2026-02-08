'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Settings, Archive, Trash2, Plus } from 'lucide-react';
import { useAbelionStore } from '@/aksara/Pundi';

export default function SidebarUtama() {
  const pathname = usePathname();
  const { folder, tambahCatatan } = useAbelionStore();

  const navItems = [
    { href: '/', label: 'Semua Catatan', icon: <Home size={20} /> },
    { href: '/jatidiri', label: 'Profil', icon: <User size={20} /> },
    { href: '/laras', label: 'Setelan', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="px-4 mb-6 mt-4">
        <h2 className="text-xl font-bold text-primary">Abelion</h2>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 px-4">
        <div className="list-header !m-0 !mb-2 opacity-50">Folder</div>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {folder.map((f) => (
          <div key={f.id} className="sidebar-item">
            <span className="text-lg">{f.ikon}</span>
            <span className="truncate">{f.nama}</span>
          </div>
        ))}
        <div className="sidebar-item opacity-50">
          <Archive size={20} />
          <span>Arsip</span>
        </div>
        <div className="sidebar-item opacity-50">
          <Trash2 size={20} />
          <span>Sampah</span>
        </div>
      </nav>

      <div className="mt-auto p-4">
        <button
          className="w-full btn-blue flex items-center justify-center gap-2"
          onClick={() => tambahCatatan({})}
        >
          <Plus size={20} />
          <span>Catatan Baru</span>
        </button>
      </div>
    </aside>
  );
}
