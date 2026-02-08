import Dexie, { type Table } from 'dexie';

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
    return doc ? JSON.stringify(doc.data) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await gudang.negara.put({
      id: name,
      data: JSON.parse(value)
    });
  },
  removeItem: async (name: string): Promise<void> => {
    await gudang.negara.delete(name);
  }
};
