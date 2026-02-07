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

    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-container';

    changelog.forEach((item, index) => {
      const isLatest = index === 0;

      const itemEl = document.createElement('div');
      itemEl.className = 'timeline-item';

      const dot = document.createElement('div');
      dot.className = 'timeline-dot';
      if (!isLatest) dot.style.borderColor = 'var(--text-muted)'; // Gray out old dots

      const content = document.createElement('div');
      content.className = 'timeline-content';

      // Header
      const header = document.createElement('div');
      header.className = 'timeline-header';

      const titleArea = document.createElement('div');
      const title = document.createElement('span');
      title.style.fontWeight = '700';
      title.style.fontSize = '17px';
      title.textContent = `v${item.version}`;

      const codename = document.createElement('span');
      if (item.codename) {
        codename.textContent = ` • ${item.codename}`;
        codename.style.fontSize = '13px';
        codename.style.color = 'var(--text-secondary)';
        codename.style.fontWeight = '500';
      }
      titleArea.appendChild(title);
      titleArea.appendChild(codename);

      const date = document.createElement('div');
      date.className = 'timeline-date';
      date.textContent = item.releasedAt || 'UNKNOWN DATE';

      header.appendChild(titleArea);
      header.appendChild(date);
      content.appendChild(header);

      // Highlights List
      const list = document.createElement('ul');
      list.className = 'changelog-highlights';
      list.style.listStyle = 'none';
      list.style.padding = '0';
      list.style.margin = '0';
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '8px';

      item.highlights.forEach(highlight => {
        const li = document.createElement('li');
        li.style.fontSize = '14px';
        li.style.lineHeight = '1.5';
        li.style.color = 'var(--text-secondary)';
        li.style.display = 'flex';
        li.style.gap = '8px';

        const colonIndex = highlight.indexOf(':');
        if (colonIndex !== -1) {
          const t = highlight.substring(0, colonIndex).trim();
          const d = highlight.substring(colonIndex + 1).trim();
          li.innerHTML = `<span style="color: var(--primary);">•</span> <span><strong>${t}</strong>: ${d}</span>`;
        } else {
          li.innerHTML = `<span style="color: var(--primary);">•</span> <span>${highlight}</span>`;
        }
        list.appendChild(li);
      });
      content.appendChild(list);

      itemEl.appendChild(dot);
      itemEl.appendChild(content);
      timelineContainer.appendChild(itemEl);
    });

    container.innerHTML = '';
    container.appendChild(timelineContainer);
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
