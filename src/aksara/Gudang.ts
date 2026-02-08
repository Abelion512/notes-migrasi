 
import Dexie, { type Table } from 'dexie';
import { segelData, verifikasiIntegritas } from './Integritas';

export interface DokumenPersisten {
  id: string;
  data: unknown;
}

export class GudangAbelion extends Dexie {
  negara!: Table<DokumenPersisten>;

  constructor() {
    super('GudangAbelion');
    this.version(1).stores({
      negara: 'id'
    });
  }
}

export const gudang = new GudangAbelion();

export const GudangZustand = {
  getItem: async (name: string): Promise<string | null> => {
    const doc = await gudang.negara.get(name);
    if (!doc) return null;

    const dataAsAny = doc.data as { _hash?: string, _timestamp?: number, [key: string]: unknown };
    if (dataAsAny && dataAsAny._hash) {
      const { _hash, _timestamp, ...dataClean } = dataAsAny;
      const isValid = await verifikasiIntegritas(dataClean, _hash);
      if (!isValid) {
        console.warn('[Integritas] Data mungkin rusak/dimanipulasi:', name);
      }
    }
    return JSON.stringify(doc.data);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const parsed = JSON.parse(value);
    const sealed = await segelData(parsed);
    await gudang.negara.put({
      id: name,
      data: sealed
    });
  },
  removeItem: async (name: string): Promise<void> => {
    await gudang.negara.delete(name);
  }
};
