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

      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '12px';

      const title = document.createElement('h3');
      title.style.margin = '0';
      title.textContent = `${item.version}`;

      const date = document.createElement('span');
      date.style.fontSize = '12px';
      date.style.color = 'var(--text-muted)';
      date.textContent = item.releasedAt;

      header.appendChild(title);
      header.appendChild(date);

      const list = document.createElement('ul');
      list.className = 'changelog-highlights';
      list.style.listStyle = 'none';
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '8px';

      const MAX_VISIBLE = 2;
      const hasMore = item.highlights.length > MAX_VISIBLE;

      item.highlights.forEach((highlight, idx) => {
        const li = document.createElement('li');
        li.style.fontSize = '15px';
        li.style.color = 'var(--text-secondary)';
        li.style.display = idx < MAX_VISIBLE ? 'flex' : 'none';
        li.style.gap = '8px';
        li.className = idx >= MAX_VISIBLE ? 'extra-highlight' : '';
        li.innerHTML = `<span style="color: var(--primary);">•</span> <span>${highlight}</span>`;
        list.appendChild(li);
      });

      wrapper.appendChild(header);
      wrapper.appendChild(list);

      if (hasMore) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'ghost-btn';
        moreBtn.style.marginTop = '12px';
        moreBtn.style.fontSize = '14px';
        moreBtn.style.padding = '4px 0';
        moreBtn.textContent = 'Lihat selengkapnya...';
        moreBtn.onclick = () => {
          const extras = wrapper.querySelectorAll('.extra-highlight');
          const isHidden = extras[0].style.display === 'none';
          extras.forEach(el => el.style.display = isHidden ? 'flex' : 'none');
          moreBtn.textContent = isHidden ? 'Sembunyikan' : 'Lihat selengkapnya...';
        };
        wrapper.appendChild(moreBtn);
      }

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
