(function () {
  const {
    getVersionMeta,
    getVersionChangelog
  } = AbelionUtils;

  function populateSummary(meta) {
    const versionEl = document.getElementById('version-name');
    const codenameEl = document.getElementById('version-codename');
    const dateEl = document.getElementById('version-date');

    if (versionEl) versionEl.textContent = meta?.version || '—';
    if (codenameEl) codenameEl.textContent = meta?.codename || '—';
    if (dateEl) dateEl.textContent = meta?.build || '—';
  }

  function renderChangelog(changelog) {
    const container = document.getElementById('changelog-list');
    if (!container) return;

    if (!Array.isArray(changelog) || !changelog.length) {
      container.innerHTML = '<div class="section-card" style="padding: 16px;"><p>Belum ada catatan rilis.</p></div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    changelog.forEach(item => {
      const wrapper = document.createElement('article');
      wrapper.className = 'section-card';
      wrapper.style.padding = '16px';
      wrapper.style.marginBottom = '16px';

      const title = document.createElement('h3');
      title.style.marginBottom = '12px';
      title.textContent = `${item.version} (${item.releasedAt})`;

      const list = document.createElement('ul');
      list.style.listStyle = 'none';
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '8px';

      item.highlights.forEach(highlight => {
        const li = document.createElement('li');
        li.style.fontSize = '15px';
        li.style.color = 'var(--text-secondary)';
        li.style.display = 'flex';
        li.style.gap = '8px';
        li.innerHTML = `<span style="color: var(--primary);">•</span> <span>${highlight}</span>`;
        list.appendChild(li);
      });

      wrapper.appendChild(title);
      wrapper.appendChild(list);
      fragment.appendChild(wrapper);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  function wireNav() {
    const back = document.getElementById('version-back');
    if (back) back.addEventListener('click', () => {
      sessionStorage.setItem('skipIntro', '1');
      window.location.href = '../index.html';
    });
    const home = document.getElementById('version-home');
    if (home) home.addEventListener('click', () => {
      sessionStorage.setItem('skipIntro', '1');
      window.location.href = '../index.html';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const meta = getVersionMeta();
    populateSummary(meta);
    renderChangelog(getVersionChangelog());
    wireNav();
  });
})();
