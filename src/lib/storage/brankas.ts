/**
 * Brankas Engine: Web Crypto API implementation
 * Standards: AES-GCM 256-bit, PBKDF2-HMAC-SHA256
 */

const ITERATIONS = 600000;
const ALGO_ENC = 'AES-GCM';
const ALGO_KDF = 'PBKDF2';

export class Brankas {
    private static key: CryptoKey | null = null;

    /**
     * Derives a CryptoKey from a password and salt
     */
    static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const baseKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            ALGO_KDF,
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: ALGO_KDF,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                salt: salt as any,
                iterations: ITERATIONS,
                hash: 'SHA-256',
            },
            baseKey,
            { name: ALGO_ENC, length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    static setActiveKey(key: CryptoKey) {
        this.key = key;
    }

    static clearKey() {
        this.key = null;
    }

    static isLocked(): boolean {
        return this.key === null;
    }

    /**
     * Encrypts a string of text
     */
    static async encrypt(text: string, customKey?: CryptoKey): Promise<{ data: ArrayBuffer; iv: Uint8Array }> {
        const key = customKey || this.key;
        if (!key) throw new Error('Vault Locked: No active key');

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();

        const data = await crypto.subtle.encrypt(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { name: ALGO_ENC, iv: iv as any },
            key,
            encoder.encode(text)
        );

        return { data, iv };
    }

    /**
     * Decrypts an ArrayBuffer back to string
     */
    static async decrypt(encryptedData: ArrayBuffer, iv: Uint8Array, customKey?: CryptoKey): Promise<string> {
        const key = customKey || this.key;
        if (!key) throw new Error('Vault Locked: No active key');

        const decrypted = await crypto.subtle.decrypt(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            { name: ALGO_ENC, iv: iv as any },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
}
