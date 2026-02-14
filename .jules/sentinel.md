## 2026-02-12 - [Hardening Metadata & Integrity]
**Vulnerability:** Plaintext leak of note titles and 100-character previews in IndexedDB, plus missing verification of the promised "Segel Digital" (SHA-256 hash).
**Learning:** Performance-oriented design (like keeping metadata in plaintext for fast list rendering) often compromises security in local-first apps. The "Segel Digital" was documented but never implemented in code.
**Prevention:** Encrypt all metadata (titles, previews, tags) on disk. Implement proactive integrity checks during decryption to detect unauthorized database manipulation.
