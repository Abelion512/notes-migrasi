# 🗒️ Abelion Notes

Abelion Notes is a modern, gamified note-taking web app that runs fully in the browser. It pairs fast local storage with a progression system so every action feels rewarding.

## ✨ Core Features

- 📝 Create, edit, pin, and delete notes with emoji icons and subtle animations.
- 🔍 Debounced search and tag filtering for fast discovery.
- 😊 Daily mood tracker with a 7-day emoji timeline.
- 📌 Persistent layout that remembers state across reloads.
- ⚡ Optimised localStorage reads/writes via safe helpers and quota handling.

## 🎮 Gamification System (v2.0)

- 🆙 **Smart XP**: XP scaling based on level (Base + 100/level).
- 🔄 **Realtime Sync**: Actions in one tab update XP/Level across all tabs instantly.
- 📅 **Streak & Bonus**: Daily login +15 XP, Streak +150 XP, and Special Date Multipliers.
- 🏅 **Badge System**: 12+ Badges including tiered Artisan rewards.
- 🧠 **XP Modal**: Dynamic "Cara Dapat XP" guide injected with user's current rank stats.

## 👤 Profile Experience

- 📸 **Interactive Avatar**: Click camera icon to upload/change photo instantly.
- 💊 **Minimalist Stats**: Apple-style "pill" design for Level & XP.
- 🔄 **Seamless Navigation**: Smart back-button logic and hover tooltips on nav icons.
- ⏰ **Dynamic Greetings**: Greeting changes based on time of day (Pagi/Siang/Sore/Malam).

## 🧱 Architecture Highlights

- **Vanilla JavaScript (ES2020+)** broken into dedicated modules (`index.js`, `profile.js`, `gamification.js`, `utils.js`).
- **Local persistence** with typed `STORAGE_KEYS`, defensive reads, and quota fallbacks.
- **Input sanitisation** via `sanitizeText` and `sanitizeRichContent` to mitigate XSS.
- **Event-driven updates** (`abelion-xp-update`) so UI stays fresh without reloads.
- **Changelog System**: Built-in version history and update highlights.

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
- Strict Content Security Policy applied on every entry page via `<meta http-equiv="Content-Security-Policy">` restricting assets to `self`, Google Fonts, and data/blob URLs.

## 📄 Roadmap Ideas

- 📤 Export/import of notes for easy backups.
- 🌙 Optional dark mode theme.
- 📝 Rich modal editor instead of `prompt()` for note creation.
- 📱 Progressive Web App manifest for installable experience.

## 👨‍💻 Author

Crafted with care by Abelion Lavv (agen.salva@gmail.com).
