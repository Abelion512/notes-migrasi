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

      const hasDescriptions = item.highlights.some(h => h.includes(':'));

      item.highlights.forEach((highlight) => {
        const li = document.createElement('li');
        li.style.fontSize = '15px';
        li.style.color = 'var(--text-secondary)';
        li.style.display = 'flex';
        li.style.gap = '8px';

        const colonIndex = highlight.indexOf(':');
        if (colonIndex !== -1) {
          const title = highlight.substring(0, colonIndex).trim();
          const desc = highlight.substring(colonIndex + 1).trim();
          li.innerHTML = `<span style="color: var(--primary); flex-shrink: 0;">•</span> <span><strong>${title}</strong><span class="changelog-desc" style="display: none;">: ${desc}</span></span>`;
        } else {
          li.innerHTML = `<span style="color: var(--primary); flex-shrink: 0;">•</span> <span><strong>${highlight}</strong></span>`;
        }

        list.appendChild(li);
      });

      wrapper.appendChild(header);
      wrapper.appendChild(list);

      if (hasDescriptions) {
        const moreBtn = document.createElement('button');
        moreBtn.className = 'ghost-btn';
        moreBtn.style.marginTop = '12px';
        moreBtn.style.fontSize = '14px';
        moreBtn.style.padding = '4px 0';
        moreBtn.textContent = 'Lihat selengkapnya...';
        moreBtn.onclick = () => {
          const descs = wrapper.querySelectorAll('.changelog-desc');
          if (descs.length === 0) return;
          const isHidden = descs[0].style.display === 'none';
          descs.forEach(el => el.style.display = isHidden ? 'inline' : 'none');
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
