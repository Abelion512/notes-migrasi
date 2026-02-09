import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Catatan, Folder, Profil, Pengaturan } from './jenis';
import { GudangZustand } from './Gudang';

interface AbelionStore {
  catatan: Catatan[];
  folder: Folder[];
  sampah: Catatan[];
  profil: Profil;
  pengaturan: Pengaturan;
  editingId: string | null;

  // Aksi
  setEditingId: (id: string | null) => void;
  tambahCatatan: (catatan: Partial<Catatan>) => string;
  perbaruiCatatan: (id: string, catatan: Partial<Catatan>) => void;
  hapusCatatan: (id: string) => void;
  pindahkanKeSampah: (id: string) => void;
  pulihkanDariSampah: (id: string) => void;

  tambahFolder: (folder: Partial<Folder>) => void;
  perbaruiFolder: (id: string, folder: Partial<Folder>) => void;
  hapusFolder: (id: string) => void;

  perbaruiProfil: (profil: Partial<Profil>) => void;
  perbaruiPengaturan: (pengaturan: Partial<Pengaturan>) => void;

  // Mood
  mood: Record<string, string>;
  setMood: (date: string, emoji: string) => void;
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
        gaya: 'ios',
        warnaAksen: '#007AFF',
        enkripsiEnabled: false,
        kdfType: 'argon2id',
        tintedMode: false,
      },
      mood: {},
      editingId: null,

      setEditingId: (id) => set({ editingId: id }),

      tambahCatatan: (baru) => {
        const id = crypto.randomUUID();
        set((state) => ({
          catatan: [
            {
              id,
              judul: '',
              konten: '',
              dibuatPada: new Date().toISOString(),
              diperbaruiPada: new Date().toISOString(),
              versi: 1,
              ...baru
            } as Catatan,
            ...state.catatan
          ],
          editingId: id
        }));
        return id;
      },

      perbaruiCatatan: (id, update) => set((state) => {
        const existing = state.catatan.find((c) => c.id === id);
        if (!existing) return state;

        // Deteksi Konflik Sederhana:
        // Jika update memiliki versi dan versinya berbeda/lebih rendah dari yang ada di memori,
        // kita tandai sebagai konflik daripada langsung menimpa.
        if (update.versi !== undefined && existing.versi !== undefined && update.versi < existing.versi) {
          console.warn('[Konflik] Versi catatan tidak cocok:', id);
          return {
            catatan: state.catatan.map((c) =>
              c.id === id ? {
                ...c,
                konflik: [...(c.konflik || []), { ...existing, ...update } as Catatan]
              } : c
            )
          };
        }

        return {
          catatan: state.catatan.map((c) =>
            c.id === id ? {
              ...c,
              ...update,
              versi: (existing.versi || 0) + 1,
              diperbaruiPada: new Date().toISOString()
            } : c
          )
        };
      }),

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
        const { deletedAt: _deletedAt, ...rest } = c;
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
      setMood: (date, emoji) => set((state) => ({
        mood: { ...state.mood, [date]: emoji }
      })),
    }),
    {
      name: 'abelion-storage',
      storage: createJSONStorage(() => GudangZustand),
    }
  )
);
