(function(){
  const {
    getVersionMeta,
    getVersionChangelog
  } = AbelionUtils;

  function populateSummary(meta){
    document.getElementById('version-name').textContent = meta.version;
    document.getElementById('version-codename').textContent = meta.codename || '—';
    document.getElementById('version-date').textContent = meta.build || '—';
    document.getElementById('version-env').textContent = meta.environment || '—';
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
