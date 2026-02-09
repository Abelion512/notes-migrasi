import * as webllm from "@mlc-ai/web-llm";

export interface AIResponse {
    text: string;
    usage?: unknown;
}

let engine: webllm.MLCEngine | null = null;

const selectedModel = "Llama-3.1-8B-Instruct-q4f16_1-MLC";

export async function muatPujangga(onProgress?: (report: webllm.InitProgressReport) => void) {
    if (engine) return engine;

    engine = await webllm.CreateMLCEngine(selectedModel, {
        initProgressCallback: onProgress,
    });
    return engine;
}

export async function ringkasCatatan(konten: string): Promise<string> {
    try {
        const p = await muatPujangga();
        const messages: webllm.ChatCompletionMessageParam[] = [
            { role: "system", content: "Anda adalah asisten cerdas Abelion Notes. Tugas Anda adalah meringkas catatan pengguna dengan singkat, padat, dan jelas dalam bahasa Indonesia." },
            { role: "user", content: `Ringkaslah catatan berikut ini:\n\n${konten}` },
        ];

        const reply = await p.chat.completions.create({
            messages,
        });

        return reply.choices[0].message.content || "Gagal meringkas.";
    } catch (error) {
        console.error("AI Error:", error);
        return "Terjadi kesalahan saat menghubungi Pujangga AI.";
    }
}
