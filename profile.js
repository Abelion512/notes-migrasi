(function(){
  const utils = window.AbelionUtils || {};
  const { STORAGE_KEYS = {} } = utils;
  const gamification = window.AbelionGamification || null;

  const dom = {};

  function animateNumber(element, start, end, duration, suffix = '') {
    if (!element) return;
    const startValue = Number(start);
    const endValue = Number(end);
    const totalChange = endValue - startValue;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + totalChange * eased);
      element.textContent = `${current}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

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
      empty.className = 'badge-empty-state';
      empty.innerHTML = `
        <div style="text-align:center;padding:28px 16px;">
          <div style="font-size:3em;margin-bottom:12px;opacity:0.6;">🎖️</div>
          <p style="margin:0;color:var(--text-muted);font-size:0.95em;">
            Belum ada badge.<br>
            <small>Tulis catatan untuk unlock pencapaian!</small>
          </p>
        </div>
      `;
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
        const label = details.join(' • ') || 'Badge';
        cell.title = label;
        cell.tabIndex = 0;
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', label);
        cell.addEventListener('click', () => showBadgeDetail(badge));
        cell.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            showBadgeDetail(badge);
          }
        });
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

    if (dom.xpBar && dom.xpPercent) {
      const previousPercent = Number(dom.xpBar.dataset.currentPercent || 0);
      const start = Number.isFinite(previousPercent) ? previousPercent : 0;
      const target = Math.max(0, Math.min(100, Number(summary.xpPercent) || 0));
      dom.xpBar.style.width = `${start}%`;
      dom.xpPercent.textContent = `${Math.round(start)}%`;
      requestAnimationFrame(() => {
        dom.xpBar.style.width = `${target}%`;
      });
      animateNumber(dom.xpPercent, start, target, 1000, '%');
      dom.xpBar.dataset.currentPercent = target;
    } else {
      if (dom.xpBar) dom.xpBar.style.width = `${summary.xpPercent}%`;
      if (dom.xpPercent) dom.xpPercent.textContent = `${summary.xpPercent}%`;
    }
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

  function showBadgeDetail(badge) {
    if (!badge || !document || !document.body) return;
    const catalog = gamification && typeof gamification.getBadgeCatalog === 'function'
      ? gamification.getBadgeCatalog()
      : [];
    const definition = catalog.find(item => item.id === badge.id);

    const existing = document.querySelector('.badge-detail-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'badge-detail-modal';

    const earnedDate = badge.earnedAt ? new Date(badge.earnedAt) : null;
    const earnedLabel = earnedDate && !Number.isNaN(earnedDate.getTime())
      ? earnedDate.toLocaleDateString('id-ID')
      : '-';
    const rewardNumber = Number(badge.xpReward);
    const definitionReward = Number(definition?.xp);
    const xpReward = Number.isFinite(rewardNumber)
      ? rewardNumber
      : (Number.isFinite(definitionReward) ? definitionReward : 0);
    const description = definition?.description || 'Badge pencapaian';

    modal.innerHTML = `
      <div class="badge-detail-content" role="dialog" aria-modal="true">
        <button type="button" class="modal-close" aria-label="Tutup">×</button>
        <div class="badge-detail-icon">${badge.icon || '🎖️'}</div>
        <h2>${badge.name || 'Badge'}</h2>
        <p>${description}</p>
        <div class="badge-detail-meta">
          <div><strong>+${xpReward} XP</strong></div>
          <div>Diraih: ${earnedLabel}</div>
        </div>
      </div>
    `;

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
    };

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    const closeButton = modal.querySelector('.modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
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

    window.addEventListener('abelion-xp-update', () => applyProfile());
  }

  document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    renderVersion();
    applyProfile();
    wireInteractions();
  });
})();
