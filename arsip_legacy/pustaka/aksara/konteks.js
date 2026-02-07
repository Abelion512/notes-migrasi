/**
 * @file pustaka/aksara/konteks.js
 * @description Custom context menu handler for Abelion Notes
 * Supports Desktop (right-click) and Mobile (long-press)
 * Part of "Phase 2: Functionality & Interaction"
 */

(function () {
    const MENU_ID = 'abelion-context-menu';

    // Prevent default context menu
    document.addEventListener('contextmenu', (e) => {
        // Allow in input/textarea for native copy/paste
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, e.target);
    });

    // Mobile Long Press Logic
    let longPressTimer;
    const LONG_PRESS_DURATION = 600;

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];

        longPressTimer = setTimeout(() => {
            // Check if context menu is allowed (e.g. not on inputs)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }
            showContextMenu(touch.clientX, touch.clientY, e.target);
            // Vibrate if supported
            if (navigator.vibrate) navigator.vibrate(50);
        }, LONG_PRESS_DURATION);
    }, { passive: true });

    document.addEventListener('touchend', () => clearTimeout(longPressTimer));
    document.addEventListener('touchmove', () => clearTimeout(longPressTimer));

    // Create Menu
    function createMenuElement() {
        if (document.getElementById(MENU_ID)) return document.getElementById(MENU_ID);

        const menu = document.createElement('div');
        menu.id = MENU_ID;
        menu.style.cssText = `
            position: fixed;
            z-index: 10000;
            background: rgba(255, 255, 255, 0.85); /* Glass Light */
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 0.5px solid rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            padding: 6px;
            display: none;
            flex-direction: column;
            width: 200px;
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            color: #1c1c1e;
            animation: contextScale 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            transform-origin: top left;
        `;

        // Dark mood support override if detected
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            menu.style.background = "rgba(40, 40, 40, 0.85)";
            menu.style.border = "0.5px solid rgba(255, 255, 255, 0.1)";
            menu.style.color = "#ffffff";
        }

        // Add Keyframe for animation if not exists
        if (!document.getElementById('abelion-context-style')) {
            const style = document.createElement('style');
            style.id = 'abelion-context-style';
            style.textContent = `
                @keyframes contextScale {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .context-item {
                    display: flex; align-items: center; gap: 8px;
                    padding: 8px 10px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.1s;
                    user-select: none;
                }
                .context-item:active {
                    transform: scale(0.98);
                }
                .context-item:hover {
                    background: rgba(0, 0, 0, 0.05);
                }
                 [data-theme="dark"] .context-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                .context-divider {
                    height: 0.5px;
                    background: rgba(0,0,0,0.1);
                    margin: 4px 6px;
                }
                [data-theme="dark"] .context-divider {
                    background: rgba(255,255,255,0.1);
                }
                .context-shortcut {
                    margin-left: auto;
                    opacity: 0.5;
                    font-size: 11px;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(menu);
        return menu;
    }

    function showContextMenu(x, y, target) {
        const menu = createMenuElement();

        // Dynamic Content
        const selection = window.getSelection().toString();
        const items = [];

        // Basic actions
        if (selection) {
            items.push({
                label: 'Salin Teks',
                icon: '📋',
                shortcut: 'Ctrl+C',
                action: () => navigator.clipboard.writeText(selection)
            });
            items.push('divider');
        }

        // Navigation
        items.push({
            label: 'Catatan Baru',
            icon: '📝',
            action: () => {
                if (window.openNoteModal) window.openNoteModal('create');
                else window.location.href = window.location.origin + '?action=new';
            }
        });

        items.push({
            label: 'Segarkan Lembaran',
            icon: '🔄',
            shortcut: 'F5',
            action: () => window.location.reload()
        });

        items.push('divider');

        items.push({
            label: 'Kembali',
            icon: '⬅️',
            action: () => window.history.back()
        });

        // Render
        menu.innerHTML = items.map(item => {
            if (item === 'divider') return `<div class="context-divider"></div>`;
            return `
                <div class="context-item">
                    <span>${item.icon}</span>
                    <span>${item.label}</span>
                    ${item.shortcut ? `<span class="context-shortcut">${item.shortcut}</span>` : ''}
                </div>
            `;
        }).join('');

        // Attach events
        const itemEls = menu.querySelectorAll('.context-item');
        let index = 0;
        items.forEach(item => {
            if (item === 'divider') return;
            const el = itemEls[index];
            el.onclick = () => {
                item.action();
                hideContextMenu();
            };
            index++;
        });

        // Positioning (prevent overflow)
        menu.style.display = 'flex';
        const rect = menu.getBoundingClientRect();
        let posX = x;
        let posY = y;

        if (posX + rect.width > window.innerWidth) posX = window.innerWidth - rect.width - 10;
        if (posY + rect.height > window.innerHeight) posY = window.innerHeight - rect.height - 10;

        menu.style.left = posX + 'px';
        menu.style.top = posY + 'px';

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', hideContextMenu, { once: true });
        }, 0);
    }

    function hideContextMenu() {
        const menu = document.getElementById(MENU_ID);
        if (menu) menu.style.display = 'none';
        document.removeEventListener('click', hideContextMenu);
    }

})();
