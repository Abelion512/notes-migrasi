'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, User, Settings } from 'lucide-react';
import { useAbelionStore } from '@/aksara/toko';

const NavigasiBawah: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const tambahCatatan = useAbelionStore(state => state.tambahCatatan);

  const navItems = [
    { href: '/', label: 'Beranda', icon: <Home size={24} /> },
    { href: '/biodata', label: 'Profil', icon: <User size={24} /> },
    { href: '/setelan', label: 'Setelan', icon: <Settings size={24} /> },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item, index) => {
        // Simple hack to insert the Add button in the middle
        const isMiddle = index === 1;
        return (
          <React.Fragment key={item.href}>
            {isMiddle && (
              <button
                className="nav-button nav-add-btn"
                onClick={() => {
                  tambahCatatan({});
                  if (pathname !== '/') router.push('/');
                }}
              >
                <span className="nav-icon"><Plus size={24} /></span>
                <span className="nav-label">Tambah</span>
              </button>
            )}
            <Link
              href={item.href}
              className={`nav-button ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default NavigasiBawah;
