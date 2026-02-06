(function () {
    const STORAGE_KEY = 'abelion-last-seen-version';
    const TIMESTAMP_KEY = 'abelion-update-popup-timestamp';

    async function checkUpdate() {
        try {
            // Throttling: Check if we showed the popup recently (within 24h)
            const lastShown = localStorage.getItem(TIMESTAMP_KEY);
            const now = Date.now();
            if (lastShown && (now - parseInt(lastShown)) < 24 * 60 * 60 * 1000) {
                return;
            }

            // Determine path to versi.json
            const isInPages = window.location.pathname.indexOf('/lembaran/') !== -1;
            const path = isInPages ? '../versi.json' : './versi.json';

            const response = await fetch(path + '?t=' + Date.now());
            if (!response.ok) return;

            const updateInfo = await response.json();
            const currentVersion = AbelionUtils.getVersionMeta().version;
            const lastSeen = localStorage.getItem(STORAGE_KEY);

            // If remote version is newer than current OR user just updated and hasn't seen the changelog
            const isFreshUpdate = updateInfo.version === currentVersion && lastSeen !== currentVersion;

            if ((isNewer(updateInfo.version, currentVersion) || isFreshUpdate) && updateInfo.version !== lastSeen) {
                showUpdatePopup(updateInfo);
            }
        } catch (e) {
            console.warn('Gagal memeriksa pembaruan:', e);
        }
    }

    function isNewer(remote, local) {
        const r = remote.split('.').map(Number);
        const l = local.split('.').map(Number);
        for (let i = 0; i < r.length; i++) {
            if (r[i] > (l[i] || 0)) return true;
            if (r[i] < (l[i] || 0)) return false;
        }
        return false;
    }

    function showUpdatePopup(info) {
        const overlay = document.createElement('div');
        overlay.className = 'update-popup-overlay';
        overlay.style = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(25px) saturate(200%);
            -webkit-backdrop-filter: blur(25px) saturate(200%);
            z-index: 99999; display: flex; align-items: center; justify-content: center;
            padding: 40px; box-sizing: border-box;
            animation: fadeIn 0.3s ease-out;
        `;

        const card = document.createElement('div');
        card.style = `
            background: var(--surface); width: 100%; max-width: 280px;
            border-radius: 14px; overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
            border: 0.5px solid var(--glass-outline); color: var(--text-primary);
            text-align: center; animation: alertPop 0.3s cubic-bezier(0.2, 1, 0.2, 1);
        `;

        const changelogHtml = info.changelog.map(item => `<div style="margin-bottom: 4px;">• ${item}</div>`).join('');

        card.innerHTML = `
            <div style="padding: 20px 16px;">
                <h2 style="margin: 0; font-size: 17px; font-weight: 600; line-height: 1.3;">Pembaruan Perangkat Lunak</h2>
                <p style="color: var(--text-secondary); margin: 4px 0 12px; font-size: 13px;">Versi ${info.version} tersedia.</p>
                <div style="text-align: left; font-size: 11px; line-height: 1.4; color: var(--text-secondary); max-height: 120px; overflow-y: auto; padding: 8px; background: var(--primary-soft); border-radius: 8px;">
                    <div style="font-weight: 700; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; color: var(--primary);">Apa yang Baru:</div>
                    ${changelogHtml}
                </div>
            </div>
            <div style="display: flex; flex-direction: column; border-top: 0.5px solid var(--border-subtle);">
                <button id="update-now" style="width: 100%; padding: 12px; background: none; border: none; font-size: 17px; color: var(--primary); font-weight: 600; cursor: pointer; border-bottom: 0.5px solid var(--border-subtle);">Pasang Sekarang</button>
                <button id="update-later" style="width: 100%; padding: 12px; background: none; border: none; font-size: 17px; color: var(--primary); font-weight: 400; cursor: pointer;">Tunda</button>
            </div>
            <style>
                @keyframes alertPop {
                    from { opacity: 0; transform: scale(1.1); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                #update-now:active, #update-later:active { background: var(--primary-soft); }
            </style>
        `;

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        document.getElementById('update-later').onclick = () => {
            localStorage.setItem(STORAGE_KEY, info.version);
            localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
            overlay.remove();
        };

        document.getElementById('update-now').onclick = () => {
            localStorage.setItem(STORAGE_KEY, info.version);
            localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    for (let registration of registrations) registration.update();
                });
            }
            window.location.reload(true);
        };
    }

    // Check after 2 seconds
    setTimeout(checkUpdate, 2000);
})();
