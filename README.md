# 🗒️ Abelion Notes

Abelion Notes is a modern, gamified note-taking web app that runs fully in the browser. It pairs fast local storage with a progression system so every action feels rewarding.

## ✨ Core Features

- 📝 Create, edit, pin, and delete notes with emoji icons and subtle animations.
- 🔍 Debounced search and tag filtering for fast discovery.
- 😊 Daily mood tracker with a 7-day emoji timeline.
- 📌 Persistent layout that remembers state across reloads.
- ⚡ Optimised localStorage reads/writes via safe helpers and quota handling.

## 🎮 Gamification System

- 🆙 Progressive XP curve (50 → 75 → 100 → 150+) that scales with level.
- 🔄 Daily login tracking with streak bonuses, seasonal rewards, and veteran checks.
- 🏅 Nine unique badges plus multi-tier Artisan rewards granted cumulatively.
- 🎉 Level-up celebrations, XP toasts, and cross-tab sync via custom events.
- 🧠 Profile summary overlay that keeps the profile view in sync automatically.

## 👤 Profile Experience

- 👤 Avatar upload with in-browser compression and smooth previews.
- 🎖️ Badge picker with rich empty states, metadata, and keyboard navigation.
- 📊 Animated XP bar, tier hints, and next-level guidance on the profile page.
- 🔄 Real-time updates between edit, profile, and home views using storage listeners.
- ⏰ Dynamic greetings based on local time.

## 🧱 Architecture Highlights

- **Vanilla JavaScript (ES2020+)** broken into dedicated modules (`index.js`, `profile.js`, `gamification.js`, `utils.js`).
- **Local persistence** with typed `STORAGE_KEYS`, defensive reads, and quota fallbacks.
- **Input sanitisation** via `sanitizeText` and `sanitizeRichContent` to mitigate XSS.
- **Event-driven updates** (`abelion-xp-update`) so UI stays fresh without reloads.
- **Version metadata utilities** prepared for future release tracking.

## 🚀 Getting Started

No build step required—just open the main HTML file in a browser.

```bash
# Clone this repository
git clone https://github.com/username/abelion-notes.git
cd abelion-notes

# Launch in your preferred browser
open index.html  # macOS
# or
xdg-open index.html  # Linux
```

## 📱 Deployment Options

- **GitHub Pages:** Commit to `main`, enable Pages, and access via `https://username.github.io/abelion-notes/`.
- **Netlify:** Drag-and-drop the project folder to [Netlify Drop](https://app.netlify.com/drop).
- **Vercel:** Install the CLI (`npm install -g vercel`) and run `vercel` from the project root.

## 🔐 Security & Resilience

- Sanitised user inputs before rendering to the DOM.
- Graceful handling of `QuotaExceededError` when localStorage fills up.
- Safe fallbacks for missing note dates (`createdAt` or derived ISO values).
- Default avatar fallback everywhere a profile photo is used.
- Strict Content Security Policy applied on every entry page via `<meta http-equiv="Content-Security-Policy">` restricting assets to `self`, Google Fonts, and data URLs; inline scripts are allowed only when tagged with the shared `nonce-abelion`. New pages should mirror this policy and add `rel="noopener noreferrer"` to external links.

## 📄 Roadmap Ideas

- 📤 Export/import of notes for easy backups.
- 🌙 Optional dark mode theme.
- 📝 Rich modal editor instead of `prompt()` for note creation.
- 📱 Progressive Web App manifest for installable experience.

## 👨‍💻 Author

Crafted with care by Abelion Lavv (agen.salva@gmail.com).
