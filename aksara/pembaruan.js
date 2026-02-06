(function () {
    const STORAGE_KEY = 'abelion-last-seen-version';

    async function checkUpdate() {
        try {
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
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            padding: 20px; box-sizing: border-box;
        `;

        const card = document.createElement('div');
        card.style = `
            background: var(--surface-modal); width: 100%; max-width: 400px;
            border-radius: 20px; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            border: 1px solid var(--border-subtle); color: var(--text-primary);
        `;

        const changelogHtml = info.changelog.map(item => `<li>${item}</li>`).join('');

        card.innerHTML = `
            <div style="text-align: center; margin-bottom: 16px;">
                <div style="width: 60px; height: 60px; background: var(--accent); border-radius: 15px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; color: white;">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <h2 style="margin: 0; font-size: 20px;">Versi Baru Tersedia!</h2>
                <p style="color: var(--text-secondary); margin: 4px 0 0 0; font-size: 14px;">v${info.version} - ${info.codename}</p>
            </div>
            <div style="background: var(--surface-strong); border-radius: 12px; padding: 16px; margin-bottom: 20px; max-height: 200px; overflow-y: auto;">
                <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px;">Rincian Perubahan</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6; color: var(--text-primary);">
                    ${changelogHtml}
                </ul>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="update-later" class="btn-ghost" style="flex: 1; border: 1px solid var(--border-subtle);">Nanti</button>
                <button id="update-now" class="btn-blue" style="flex: 1;">Muat Ulang Sekarang</button>
            </div>
        `;

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        document.getElementById('update-later').onclick = () => {
            localStorage.setItem(STORAGE_KEY, info.version);
            overlay.remove();
        };

        document.getElementById('update-now').onclick = () => {
            localStorage.setItem(STORAGE_KEY, info.version);
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
