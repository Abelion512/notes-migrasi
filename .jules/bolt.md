# ⚡ Bolt's Journal - Abelion Performance

## 2025-01-24 - Initial Performance Audit
**Learning:** The application uses a monolithic store subscription pattern `const { ... } = useAbelionStore()`, which causes the entire main view to re-render whenever *any* part of the state changes (e.g., mood updates, XP gains, or settings changes). In a notes app intended to handle thousands of items, this is a major bottleneck.

**Action:** Implement atomic selectors for Zustand and memoize list items to isolate re-renders to only the components that actually need to update.

## 2025-01-24 - Result: O(1) Note List Updates
**Learning:** In React, especially with Framer Motion and large lists, prop stability is king. Simply wrapping a component in `React.memo` isn't enough if the parent passes fresh arrow functions on every render. Using `useCallback` for all handlers and `useShallow` for store picking is essential to actually stop the re-render chain.

**Action:** Extracted `ItemCatatan`, applied `React.memo` with custom comparison, and ensured all handlers in `LembaranUtama` are wrapped in `useCallback`. Verified that store subscriptions in `BingkaiUtama` and `SidebarUtama` are now atomic, preventing global app re-renders during note edits.
