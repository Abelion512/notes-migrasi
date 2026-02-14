# Abelion Notes - Agent Guidelines

## Overview
Abelion Notes is a secure, local-first personal digital archive focusing on data sovereignty and premium iOS-inspired user experience.

## Core Features
- **Vault Security**: Uses Argon2id (Pure JS) for key derivation and AES-GCM 256-bit for data encryption.
- **Unified Navigation**: Pill-shaped bottom navigation for all devices.
- **Smart Detection**: Automatic official favicon fetching and credential parsing.
- **Global Autocomplete**: Real-time service suggestions (50+ services) for credential notes.
- **Local-First**: Powered by IndexedDB (`Gudang.ts`) and Dexie.
- **Aesthetic**: Plagiat iOS 18 design language with glassmorphism and haptic feedback.

## Coding Conventions
1. **Thematic Naming**: Follow the 'Poetic Indonesian' naming convention for internal logic and components.
2. **Security First**: Encryption logic is centralized in `src/aksara/Arsip.ts` and `Brankas.ts`. Never store raw sensitive data.
3. **Performance**: Use atomic selectors with Zustand (`usePundi`) and memoize list items (`BarisCatatan.tsx`).
4. **Responsiveness**: Ensure all UI components are compact and adapt to both mobile and macOS full-screen views. Use `min-w-0` and `flex-shrink-0` to avoid truncation.
5. **Autosave**: 2-second debounced autosave with hash-based change detection to prevent redundant writes.

## Recent Improvements (Feb 2026)
- **Unified UI**: Transitioned from sidebar to a centralized bottom navigation.
- **Smart Icon System**: Expanded mapping to support automation tools (n8n, make), developer platforms (Neon, Supabase), and productivity suites.
- **Global Suggestions**: Integrated a prioritized autocomplete system in the credentials form.
- **Mobile UX**: Refined header compactness and responsive layouts for small screens.

## Repository Structure
- `src/aksara`: Core logic, storage, and utilities (The "Soul").
- `src/komponen`: UI components and features (The "Body").
- `src/app`: Next.js App Router pages (The "Pages").
- `src/gaya`: Tailwind CSS and global styles.

## Common Tasks
- **Adding Icons**: Update `src/aksara/IkonLayanan.tsx`.
- **Modifying Store**: Edit `src/aksara/Pundi.ts`.
- **Changing Styles**: Use Tailwind classes or `src/gaya/Utama.css`.
