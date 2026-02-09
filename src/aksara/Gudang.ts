 
import Dexie, { type Table } from 'dexie';
import { segelData } from './Integritas';
import { Catatan, Folder } from './jenis';

export interface DokumenPersisten {
  id: string;
  data: unknown;
}

export class GudangAbelion extends Dexie {
  catatan!: Table<Catatan & { _hash?: string, _timestamp?: number }>;
  folder!: Table<Folder & { _hash?: string, _timestamp?: number }>;
  sampah!: Table<Catatan & { _hash?: string, _timestamp?: number }>;
  atribut!: Table<{ id: string, data: unknown }>;

  negara!: Table<DokumenPersisten>;

  constructor() {
    super('GudangAbelion');
    this.version(2).stores({
      catatan: 'id, folderId, diperbaruiPada',
      folder: 'id',
      sampah: 'id',
      atribut: 'id',
      negara: 'id'
    });
  }
}

export const gudang = new GudangAbelion();

export const GudangZustand = {
  getItem: async (name: string): Promise<string | null> => {
    const [catatan, folder, sampah] = await Promise.all([
      gudang.catatan.toArray(),
      gudang.folder.toArray(),
      gudang.sampah.toArray()
    ]);

    const profilDoc = await gudang.atribut.get('profil');
    const pengaturanDoc = await gudang.atribut.get('pengaturan');
    const moodDoc = await gudang.atribut.get('mood');

    if (catatan.length > 0 || folder.length > 0 || profilDoc || pengaturanDoc) {
      const state = {
        state: {
          catatan: catatan.map(({ _hash, _timestamp, ...c }) => c),
          folder: folder.map(({ _hash, _timestamp, ...f }) => f),
          sampah: sampah.map(({ _hash, _timestamp, ...s }) => s),
          profil: profilDoc?.data,
          pengaturan: pengaturanDoc?.data,
          mood: moodDoc?.data || {},
        },
        version: 0
      };
      return JSON.stringify(state);
    }

    // Migrasi dari legacy
    const doc = await gudang.negara.get(name);
    if (!doc) return null;

    return JSON.stringify(doc.data);
  },

  setItem: async (_name: string, value: string): Promise<void> => {
    const parsed = JSON.parse(value);
    const state = parsed.state;

    if (!state) return;

    // Menggunakan array untuk menghindari masalah sirkularitas tipe data pada Catatan di Dexie transaction
    await gudang.transaction('rw', ['catatan', 'folder', 'sampah', 'atribut'], async () => {
      // 1. Catatan
      const catatanSelled = await Promise.all((state.catatan || []).map((c: Catatan) => segelData(c)));
      await (gudang as any).catatan.clear();
      await (gudang as any).catatan.bulkPut(catatanSelled);

      // 2. Folder
      const folderSelled = await Promise.all((state.folder || []).map((f: Folder) => segelData(f)));
      await (gudang as any).folder.clear();
      await (gudang as any).folder.bulkPut(folderSelled);

      // 3. Sampah
      const sampahSelled = await Promise.all((state.sampah || []).map((s: Catatan) => segelData(s)));
      await (gudang as any).sampah.clear();
      await (gudang as any).sampah.bulkPut(sampahSelled);

      // 4. Atribut
      if (state.profil) await (gudang as any).atribut.put({ id: 'profil', data: state.profil });
      if (state.pengaturan) await (gudang as any).atribut.put({ id: 'pengaturan', data: state.pengaturan });
      if (state.mood) await (gudang as any).atribut.put({ id: 'mood', data: state.mood });
    });
  },

  removeItem: async (name: string): Promise<void> => {
    await gudang.transaction('rw', ['catatan', 'folder', 'sampah', 'atribut', 'negara'], async () => {
      await (gudang as any).catatan.clear();
      await (gudang as any).folder.clear();
      await (gudang as any).sampah.clear();
      await (gudang as any).atribut.clear();
      await gudang.negara.delete(name);
    });
  }
};
