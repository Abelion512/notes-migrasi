'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, User, Settings, Search } from 'lucide-react';
import { useAbelionStore } from '@/aksara/Pundi';

const KemudiBawah: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const tambahCatatan = useAbelionStore(state => state.tambahCatatan);

  const navItems = [
    { href: '/', label: 'Beranda', icon: <Home size={22} /> },
    { href: '/jatidiri', label: 'Jatidiri', icon: <User size={22} /> },
    { type: 'add', label: 'Tambah', icon: <Plus size={26} /> },
    { href: '/laras', label: 'Laras', icon: <Settings size={22} /> },
    { href: '/pencarian', label: 'Cari', icon: <Search size={22} /> },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        if ('type' in item && item.type === 'add') {
          return (
            <button
              key="add-btn"
              className="nav-button nav-add-btn"
              onClick={() => {
                tambahCatatan({});
                if (pathname !== '/') router.push('/');
              }}
              aria-label="Tambah Catatan"
            >
              <Plus size={26} />
            </button>
          );
        }

        const navItem = item as { href: string; label: string; icon: React.ReactNode };
        return (
          <Link
            key={navItem.href}
            href={navItem.href}
            className={`nav-button ${pathname === navItem.href ? 'active' : ''}`}
          >
            <span className="nav-icon">{navItem.icon}</span>
            <span className="nav-label">{navItem.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default KemudiBawah;
