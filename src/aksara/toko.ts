import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Catatan, Folder, Profil, Pengaturan } from './jenis';

interface AbelionStore {
  catatan: Catatan[];
  folder: Folder[];
  sampah: Catatan[];
  profil: Profil;
  pengaturan: Pengaturan;

  // Aksi
  tambahCatatan: (catatan: Partial<Catatan>) => void;
  perbaruiCatatan: (id: string, catatan: Partial<Catatan>) => void;
  hapusCatatan: (id: string) => void;
  pindahkanKeSampah: (id: string) => void;
  pulihkanDariSampah: (id: string) => void;

  tambahFolder: (folder: Partial<Folder>) => void;
  perbaruiFolder: (id: string, folder: Partial<Folder>) => void;
  hapusFolder: (id: string) => void;

  perbaruiProfil: (profil: Partial<Profil>) => void;
  perbaruiPengaturan: (pengaturan: Partial<Pengaturan>) => void;
}

export const useAbelionStore = create<AbelionStore>()(
  persist(
    (set) => ({
      catatan: [],
      folder: [],
      sampah: [],
      profil: {
        nama: 'Pengguna Abelion',
        bio: 'Catatan rahasiaku.',
        avatar: '/pustaka/citra/Avatar_Bawaan.svg',
        level: 1,
        exp: 0,
      },
      pengaturan: {
        tema: 'system',
        enkripsiEnabled: false,
      },

      tambahCatatan: (baru) => set((state) => ({
        catatan: [
          {
            id: crypto.randomUUID(),
            judul: '',
            konten: '',
            dibuatPada: new Date().toISOString(),
            diperbaruiPada: new Date().toISOString(),
            ...baru
          } as Catatan,
          ...state.catatan
        ]
      })),

      perbaruiCatatan: (id, update) => set((state) => ({
        catatan: state.catatan.map((c) =>
          c.id === id ? { ...c, ...update, diperbaruiPada: new Date().toISOString() } : c
        )
      })),

      hapusCatatan: (id) => set((state) => ({
        catatan: state.catatan.filter((c) => c.id !== id)
      })),

      pindahkanKeSampah: (id) => set((state) => {
        const c = state.catatan.find((n) => n.id === id);
        if (!c) return state;
        return {
          catatan: state.catatan.filter((n) => n.id !== id),
          sampah: [...state.sampah, { ...c, deletedAt: new Date().toISOString() }]
        };
      }),

      pulihkanDariSampah: (id) => set((state) => {
        const c = state.sampah.find((n) => n.id === id);
        if (!c) return state;
        const { deletedAt, ...rest } = c;
        return {
          sampah: state.sampah.filter((n) => n.id !== id),
          catatan: [rest as Catatan, ...state.catatan]
        };
      }),

      tambahFolder: (baru) => set((state) => ({
        folder: [
          {
            id: crypto.randomUUID(),
            nama: 'Folder Baru',
            ikon: '📁',
            dibuatPada: new Date().toISOString(),
            ...baru
          } as Folder,
          ...state.folder
        ]
      })),

      perbaruiFolder: (id, update) => set((state) => ({
        folder: state.folder.map((f) => f.id === id ? { ...f, ...update } : f)
      })),

      hapusFolder: (id) => set((state) => ({
        folder: state.folder.filter((f) => f.id !== id)
      })),

      perbaruiProfil: (update) => set((state) => ({
        profil: { ...state.profil, ...update }
      })),

      perbaruiPengaturan: (update) => set((state) => ({
        pengaturan: { ...state.pengaturan, ...update }
      })),
    }),
    {
      name: 'abelion-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
