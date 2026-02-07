export interface Catatan {
  id: string;
  judul: string;
  konten: string;
  folderId?: string;
  dibuatPada: string;
  diperbaruiPada: string;
  mood?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  tags?: string[];
  deletedAt?: string;
}

export interface Folder {
  id: string;
  nama: string;
  ikon: string;
  parentId?: string;
  dibuatPada: string;
}

export interface Profil {
  nama: string;
  bio: string;
  avatar: string;
  level: number;
  exp: number;
}

export interface Pengaturan {
  tema: 'light' | 'dark' | 'system';
  enkripsiEnabled: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
}
