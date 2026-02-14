/**
 * Integritas Module: Handles data hashing for integrity checks.
 * Follows Data Integrity Policy: Excludes metadata (_hash, _timestamp) during calculation.
 */

export const Integritas = {
    /**
     * Calculates a SHA-256 hash of an object for integrity verification.
     * Metadata fields are stripped before calculation.
     */
    async hitungHash(data: unknown): Promise<string> {
        // Deep copy to avoid mutating original
        const cleanData = JSON.parse(JSON.stringify(data));

        // Remove transient metadata per policy
        delete cleanData._hash;
        delete cleanData._timestamp;
        delete cleanData.updatedAt; // UpdatedAt is also transient

        const text = JSON.stringify(cleanData);
        const encoder = new TextEncoder();
        const buffer = encoder.encode(text);

        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }
};
