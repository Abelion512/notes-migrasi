## 2026-02-13 - [UX/A11y Enhancements]
**Learning:** Adding keyboard support (Esc key) to custom floating menus significantly improves the "native" feel of a web app on desktop. Visual feedback for silent actions (like double-click to copy) reduces user uncertainty.
**Action:** Always consider Escape key for closing overlays and provide micro-animations for clipboard actions.

## 2026-02-18 - [Z-Index issues with Backdrop Blur]
**Learning:** Foreground elements in modals/palettes using `backdrop-blur` siblings can sometimes be intercepted by the backdrop in headless browser environments or specific CSS stacking contexts if not explicitly raised.
**Action:** Use `relative z-10` (or higher) on the modal/content container to ensure it stays above the backdrop and remains interactive.

## 2026-02-18 - [Brand Icon Consistency & Smart Detection]
**Learning:** Custom SVG icons for major services (Google, Microsoft) provide better brand recognition than generic Lucide icons. Implementing a simple fuzzy matching algorithm (Levenshtein) in service detection improves UX by tolerating minor typos during data entry.
**Action:** Use custom SVGs for high-traffic brands and always implement typo-tolerance for lookup/selection features.
