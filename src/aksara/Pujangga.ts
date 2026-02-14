/**
 * Pujangga Engine: On-device AI logic using local-first principles.
 * Current implementation uses mock logic for demonstration.
 */

export const Pujangga = {
    async ringkasCatatan(konten: string): Promise<string> {
        // Mocking AI process delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const cleanText = konten.replace(/<[^>]*>?/gm, '');
        if (cleanText.length < 50) return "Catatan terlalu pendek untuk diringkas.";

        return "✨ Ringkasan AI: " + cleanText.substring(0, 100) + "... [Diringkas secara lokal]";
    }
};
