## 2026-02-12 - [Hardening Metadata & Integrity]
**Vulnerability:** Plaintext leak of note titles and 100-character previews in IndexedDB, plus missing verification of the promised "Segel Digital" (SHA-256 hash).
**Learning:** Performance-oriented design (like keeping metadata in plaintext for fast list rendering) often compromises security in local-first apps. The "Segel Digital" was documented but never implemented in code.
**Prevention:** Encrypt all metadata (titles, previews, tags) on disk. Implement proactive integrity checks during decryption to detect unauthorized database manipulation.
## 2025-05-22 - [Critical] Hardcoded Mnemonic Recovery Key
**Vulnerability:** The vault setup process displayed a fixed list of 12 mnemonic words to all users as their "recovery key".
**Learning:** The implementation relied on a static array, giving users a false sense of security while their recovery keys were identical across all installations.
**Prevention:** Use `crypto.getRandomValues()` and a diverse wordlist to generate unique mnemonics for every user during the security setup phase.
