/**
 * Pujangga Engine: Smart Automation & Local AI.
 */

export const Pujangga = {
    /**
     * Sugesti tag berdasarkan konten secara otomatis.
     */
    async sarankanTag(konten: string): Promise<string[]> {
        const clean = konten.toLowerCase();
        const tags: string[] = [];

        if (clean.includes('koding') || clean.includes('bug') || clean.includes('fix')) tags.push('Developer');
        if (clean.includes('makan') || clean.includes('resep')) tags.push('Kuliner');
        if (clean.includes('penting') || clean.includes('rahasia')) tags.push('Privat');
        if (clean.includes('kerja') || clean.includes('proyek')) tags.push('Pekerjaan');
        if (clean.includes('ide') || clean.includes('gagasan')) tags.push('Inspirasi');

        return tags;
    },

    /**
     * Sugesti judul jika judul kosong.
     */
    async sarankanJudul(konten: string): Promise<string> {
        const clean = konten.replace(/<[^>]*>?/gm, '').trim();
        if (!clean) return 'Tanpa Judul';
        return clean.substring(0, 30) + (clean.length > 30 ? '...' : '');
    },

    /**
     * Ringkasan cerdas (Heuristik untuk performa instan).
     */
    async ringkasCerdas(konten: string): Promise<string> {
        const clean = konten.replace(/<[^>]*>?/gm, '').trim();
        if (clean.length < 50) return clean;

        // Find first sentence or first 150 chars
        const firstSentence = clean.split(/[.!?]/)[0];
        return firstSentence.length > 150 ? firstSentence.substring(0, 150) + '...' : firstSentence;
    }
};
