/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BuktiIntegritas {
    hash: string;
    timestamp: number;
    versi: number;
}

export async function hitungHash(data: unknown): Promise<string> {
    const canonicalString = JSON.stringify(data, Object.keys(data as object).sort());
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(canonicalString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifikasiIntegritas(data: unknown, hashTersimpan: string): Promise<boolean> {
    const hashBaru = await hitungHash(data);
    return hashBaru === hashTersimpan;
}

export async function segelData<T>(data: T): Promise<T & { _hash: string; _timestamp: number }> {
  const dataBersih = { ...data } as any;
  // KEAMANAN: _hash dan _timestamp adalah metadata dan tidak boleh menjadi bagian dari hash integritas.
  // Kita harus menghapusnya untuk memastikan verifikasi hash yang konsisten pada pemuatan berikutnya.
  delete dataBersih._hash;
  delete dataBersih._timestamp;

  const hash = await hitungHash(dataBersih);

  return {
    ...dataBersih,
    _hash: hash,
    _timestamp: Date.now(),
  };
}
