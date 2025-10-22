(function(){
  const utils = window.AbelionUtils || {};
  const { STORAGE_KEYS = {} } = utils;
  const gamification = window.AbelionGamification || null;

  const dom = {};

  function cacheDom() {
    dom.avatar = document.getElementById('profile-avatar');
    dom.greeting = document.getElementById('profile-greeting');
    dom.title = document.getElementById('profile-title');
    dom.tier = document.getElementById('profile-tier');
    dom.level = document.getElementById('profile-level');
    dom.totalXp = document.getElementById('profile-total-xp');
    dom.xpPercent = document.getElementById('xp-percent');
    dom.xpBar = document.getElementById('xp-bar-fill');
    dom.xpHint = document.getElementById('xp-hint');
    dom.xpCounter = document.getElementById('xp-counter');
    dom.xpNext = document.getElementById('xp-next');
    dom.badgeGrid = document.getElementById('badge-grid');
    dom.versionPill = document.getElementById('profile-version-pill');
    dom.versionText = document.getElementById('profile-version');
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('id-ID');
  }

  function greetingMessage(name) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return `Selamat pagi, ${name} 👋`;
    if (hour >= 11 && hour < 15) return `Selamat siang, ${name} 👋`;
    if (hour >= 15 && hour < 19) return `Selamat sore, ${name} 👋`;
    return `Selamat malam, ${name} 👋`;
  }

  function renderBadges(summary) {
    if (!dom.badgeGrid) return;
    const badges = summary?.badges || [];
    const fragment = document.createDocumentFragment();

    if (!badges.length) {
      const empty = document.createElement('div');
      empty.className = 'badge-item is-empty';
      empty.textContent = '—';
      empty.title = 'Belum ada badge yang terbuka.';
      fragment.appendChild(empty);
    } else {
      badges.slice(-12).reverse().forEach(badge => {
        const cell = document.createElement('div');
        cell.className = 'badge-item';
        cell.textContent = badge.icon || '—';
        if (badge.icon && summary.activeBadge && badge.icon === summary.activeBadge) {
          cell.classList.add('is-active');
        }
        const details = [];
        if (badge.name) details.push(badge.name);
        if (badge.tier) details.push(`Tier ${badge.tier}`);
        if (badge.earnedAt) {
          try {
            const date = new Date(badge.earnedAt);
            if (!Number.isNaN(date.getTime())) {
              details.push(`Diraih ${date.toLocaleDateString('id-ID')}`);
            }
          } catch (error) {
            // ignore parsing failure
          }
        }
        cell.title = details.join(' • ') || 'Badge';
        fragment.appendChild(cell);
      });
    }

    dom.badgeGrid.innerHTML = '';
    dom.badgeGrid.appendChild(fragment);
  }

  function applyProfile() {
    if (!gamification) return;
    const summary = gamification.getProfileSummary();
    if (!summary) return;

    if (dom.avatar) {
      dom.avatar.src = summary.photo || 'default-avatar.svg';
      dom.avatar.classList.toggle('is-empty', !summary.photo);
    }

    if (dom.greeting) dom.greeting.textContent = greetingMessage(summary.name);
    if (dom.title) dom.title.textContent = summary.title || 'Explorer';
    if (dom.tier) dom.tier.textContent = summary.tier || 'Novice';
    if (dom.level) dom.level.textContent = `Level ${summary.level}`;
    if (dom.totalXp) dom.totalXp.textContent = `Total ${formatNumber(summary.totalXp)} XP`;

    if (dom.xpPercent) dom.xpPercent.textContent = `${summary.xpPercent}%`;
    if (dom.xpBar) dom.xpBar.style.width = `${summary.xpPercent}%`;
    if (dom.xpHint) dom.xpHint.textContent = summary.nextLevelHint;
    if (dom.xpCounter) dom.xpCounter.textContent = `${formatNumber(summary.xpCurrent)} / ${formatNumber(summary.xpTarget)} XP`;
    if (dom.xpNext) {
      if (summary.xpToNext <= 0) {
        dom.xpNext.textContent = 'Level saat ini sudah maksimal untuk konfigurasi ini.';
      } else {
        dom.xpNext.textContent = `Perlu ${formatNumber(summary.xpToNext)} XP lagi untuk naik level.`;
      }
    }

    renderBadges(summary);
  }

  function renderVersion() {
    if (!dom.versionPill || !dom.versionText) return;
    const meta = utils.getVersionMeta ? utils.getVersionMeta() : null;
    if (!meta?.version) {
      dom.versionPill.hidden = true;
      return;
    }
    dom.versionText.textContent = `${meta.version} • ${meta.codename}`;
    dom.versionPill.hidden = false;
  }

  function wireInteractions() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.addEventListener('click', () => window.history.back());

    const versionBtn = document.getElementById('version-btn');
    if (versionBtn) versionBtn.addEventListener('click', () => {
      window.location.href = 'version-info.html';
    });

    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) editBtn.addEventListener('click', () => {
      sessionStorage.setItem('skipIntro', '1');
      window.location.href = 'edit-profile.html';
    });

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) settingsBtn.addEventListener('click', () => {
      sessionStorage.setItem('skipIntro', '1');
      window.location.href = 'settings.html';
    });

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEYS.PROFILE || event.key === STORAGE_KEYS.GAMIFICATION) {
        applyProfile();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    renderVersion();
    applyProfile();
    wireInteractions();
  });
})();
