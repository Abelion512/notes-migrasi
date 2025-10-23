(function(){
  const {
    getVersionMeta,
    getVersionChangelog
  } = AbelionUtils;

  function populateSummary(meta){
    const versionEl = document.getElementById('version-name');
    const codenameEl = document.getElementById('version-codename');
    const dateEl = document.getElementById('version-date');
    const envEl = document.getElementById('version-env');
    const majorEl = document.getElementById('version-major');
    const minorEl = document.getElementById('version-minor');
    const patchEl = document.getElementById('version-patch');
    const channelEl = document.getElementById('version-channel');
    const updatedEl = document.getElementById('version-updated');

    if (versionEl) versionEl.textContent = meta?.version || '—';
    if (codenameEl) codenameEl.textContent = meta?.codename || '—';
    if (dateEl) dateEl.textContent = meta?.build || '—';
    if (envEl) envEl.textContent = meta?.environment || '—';

    const versioning = meta?.versioning || null;
    if (majorEl) majorEl.textContent = versioning ? versioning.major : '—';
    if (minorEl) minorEl.textContent = versioning ? versioning.minor : '—';
    if (patchEl) patchEl.textContent = versioning ? versioning.patch : '—';
    if (channelEl) channelEl.textContent = versioning?.channel || '—';

    if (updatedEl) {
      if (versioning?.updatedAt) {
        const updatedDate = new Date(versioning.updatedAt);
        updatedEl.textContent = Number.isNaN(updatedDate.getTime())
          ? versioning.updatedAt
          : updatedDate.toLocaleString('id-ID');
      } else {
        updatedEl.textContent = '—';
      }
    }
  }

  function renderChangelog(changelog){
    const container = document.getElementById('changelog-list');
    if (!container) return;

    if (!Array.isArray(changelog) || !changelog.length) {
      container.innerHTML = '<div class="section-card"><p>Belum ada catatan rilis.</p></div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    changelog.forEach(item => {
      const wrapper = document.createElement('article');
      wrapper.className = 'section-card';
      const title = document.createElement('h3');
      title.textContent = `${item.version} – ${item.releasedAt}`;
      const list = document.createElement('ul');
      list.className = 'settings-items';
      item.highlights.forEach(highlight => {
        const li = document.createElement('li');
        li.textContent = highlight;
        list.appendChild(li);
      });
      wrapper.appendChild(title);
      wrapper.appendChild(list);
      fragment.appendChild(wrapper);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  function wireNav(){
    const back = document.getElementById('version-back');
    if (back) back.addEventListener('click', () => window.history.back());
    const home = document.getElementById('version-home');
    if (home) home.addEventListener('click', () => {
      sessionStorage.setItem('skipIntro', '1');
      window.location.href = 'index.html';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const meta = getVersionMeta();
    populateSummary(meta);
    renderChangelog(getVersionChangelog());
    wireNav();
  });
})();
