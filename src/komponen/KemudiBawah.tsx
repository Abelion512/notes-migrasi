'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, User, Settings } from 'lucide-react';

interface KemudiBawahProps {
  onAddClick?: () => void;
}

const KemudiBawah: React.FC<KemudiBawahProps> = ({ onAddClick }) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Beranda', icon: <Home size={24} /> },
    { href: '/jatidiri', label: 'Profil', icon: <User size={24} /> },
    { href: '/laras', label: 'Setelan', icon: <Settings size={24} /> },
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
                onClick={onAddClick}
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

export default KemudiBawah;
