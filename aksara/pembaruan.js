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
            background: rgba(0,0,0,0.6); backdrop-filter: blur(15px) saturate(180%);
            z-index: 9999; display: flex; align-items: center; justify-content: center;
            padding: 20px; box-sizing: border-box;
        `;

        const card = document.createElement('div');
        card.style = `
            background: var(--frosted-heavy); width: 100%; max-width: 320px;
            border-radius: 20px; padding: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.4);
            border: 0.5px solid rgba(255,255,255,0.2); color: var(--text-primary);
            text-align: center;
        `;

        const changelogHtml = info.changelog.map(item => `<li style="margin-bottom: 6px;">${item}</li>`).join('');

        card.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="width: 54px; height: 54px; background: var(--primary); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 16px var(--primary-soft);">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <h2 style="margin: 0; font-size: 19px; font-weight: 700; letter-spacing: -0.5px;">Versi Baru Tersedia</h2>
                <p style="color: var(--text-secondary); margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">v${info.version} • ${info.codename}</p>
            </div>
            <div style="background: rgba(150,150,150,0.1); border-radius: 14px; padding: 16px; margin-bottom: 24px; max-height: 180px; overflow-y: auto; text-align: left;">
                <h3 style="margin: 0 0 10px 0; font-size: 11px; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; font-weight: 700;">Rincian Perubahan</h3>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.5; color: var(--text-primary); font-weight: 400;">
                    ${changelogHtml}
                </ul>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button id="update-now" class="btn-blue" style="width: 100%; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px;">Muat Ulang Sekarang</button>
                <button id="update-later" class="btn-ghost" style="width: 100%; padding: 12px; border-radius: 12px; font-weight: 500; font-size: 15px; color: var(--primary);">Nanti</button>
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
