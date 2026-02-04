(function () {
  const utils = window.AbelionUtils || {};
  const { STORAGE_KEYS = {}, sanitizeText, sanitizeRichContent } = utils;
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
    dom.tierHint = document.getElementById('profile-tier-hint');
    dom.titleHint = document.getElementById('profile-title-hint');
    dom.xpGuide = document.getElementById('xp-guide');
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
    const catalog = gamification && typeof gamification.getBadgeCatalog === 'function'
      ? gamification.getBadgeCatalog()
      : [];
    const fragment = document.createDocumentFragment();

    if (!badges.length) {
      const empty = document.createElement('div');
      empty.className = 'badge-empty-state';
      const guideUrl = summary?.xpGuideUrl
        || (gamification && gamification.xpGuideUrl)
        || 'https://olivx.gitbook.io/abelion-notes/getting-started/claim-exp';
      empty.innerHTML = `
        <div class="badge-empty-copy">
          <div class="badge-empty-icon">🎖️</div>
          <p style="margin:0;color:var(--text-muted);font-size:0.95em;">
            Belum ada badge.<br>
            <small>Mulai kumpulkan XP untuk membuka pencapaian.</small>
          </p>
          <a class="badge-guide-link" href="${guideUrl}" target="_blank" rel="noopener">Panduan klaim XP</a>
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
        const definition = catalog.find(item => item.id === badge.id);
        const details = [];
        if (badge.name) details.push(badge.name);
        if (badge.tier) details.push(`Tier ${badge.tier}`);
        if (badge.xpReward) details.push(`+${badge.xpReward} XP`);
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
        if (definition?.criteria) {
          details.push(definition.criteria);
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
    if (dom.title) {
      dom.title.textContent = summary.title || 'Explorer';
      if (summary.titleHint) {
        dom.title.title = summary.titleHint;
        dom.title.setAttribute('aria-label', `${summary.title} – ${summary.titleHint}`);
      } else {
        dom.title.removeAttribute('title');
        dom.title.removeAttribute('aria-label');
      }
    }
    if (dom.tier) {
      dom.tier.textContent = summary.tier || 'Novice';
      if (summary.tierHint) {
        dom.tier.title = summary.tierHint;
        dom.tier.setAttribute('aria-label', `${summary.tier} – ${summary.tierHint}`);
      } else {
        dom.tier.removeAttribute('title');
        dom.tier.removeAttribute('aria-label');
      }
    }
    if (dom.level) dom.level.textContent = `Level ${summary.level}`;
    if (dom.totalXp) dom.totalXp.textContent = `Total ${formatNumber(summary.totalXp)} XP`;

    if (dom.tierHint) {
      dom.tierHint.textContent = summary.tierHint || '';
    }

    if (dom.titleHint) {
      dom.titleHint.textContent = summary.titleHint || '';
    }

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

    if (dom.xpGuide) {
      dom.xpGuide.onclick = (e) => {
        e.preventDefault();
        const modal = document.getElementById('xp-rules-modal');
        if (modal) {
          modal.classList.add('show');

          // Close handler
          const closeBtn = document.getElementById('xp-rules-close');
          const closeFn = () => modal.classList.remove('show');

          if (closeBtn) closeBtn.onclick = closeFn;
          modal.onclick = (ev) => {
            if (ev.target === modal) closeFn();
          };
        }
      };
      dom.xpGuide.style.display = 'inline-block';
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
    const versionLabel = meta.codename ? `${meta.version} • ${meta.codename}` : meta.version;
    dom.versionText.textContent = versionLabel;
    if (meta.versioning) {
      const { major, minor, patch } = meta.versioning;
      dom.versionPill.title = `Major ${major} • Minor ${minor} • Patch ${patch}`;
    } else {
      dom.versionPill.removeAttribute('title');
    }
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
    const criteria = definition?.criteria || '';

    const content = document.createElement('div');
    content.className = 'badge-detail-content';
    content.setAttribute('role', 'dialog');
    content.setAttribute('aria-modal', 'true');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'modal-close';
    closeButton.setAttribute('aria-label', 'Tutup');
    closeButton.textContent = '×';

    const iconEl = document.createElement('div');
    iconEl.className = 'badge-detail-icon';
    iconEl.textContent = badge.icon || '🎖️';

    const title = document.createElement('h2');
    title.textContent = badge.name ? sanitizeText?.(badge.name) || badge.name : 'Badge';

    const desc = document.createElement('p');
    desc.textContent = sanitizeText?.(description) || description;

    content.append(closeButton, iconEl, title, desc);

    if (criteria) {
      const criteriaEl = document.createElement('p');
      criteriaEl.className = 'badge-detail-criteria';
      if (typeof criteria === 'string' && criteria.includes('<') && typeof sanitizeRichContent === 'function') {
        criteriaEl.innerHTML = sanitizeRichContent(criteria);
      } else {
        criteriaEl.textContent = sanitizeText?.(criteria) || criteria;
      }
      content.appendChild(criteriaEl);
    }

    const meta = document.createElement('div');
    meta.className = 'badge-detail-meta';

    const reward = document.createElement('div');
    const rewardStrong = document.createElement('strong');
    rewardStrong.textContent = `+${xpReward} XP`;
    reward.appendChild(rewardStrong);

    const earned = document.createElement('div');
    earned.textContent = `Diraih: ${earnedLabel}`;

    meta.append(reward, earned);
    content.appendChild(meta);

    modal.appendChild(content);

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 200);
    };

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    closeButton.addEventListener('click', closeModal);

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('show'));
  }

  async function renderProductivityCharts() {
    const canvas = document.getElementById('xp-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const summary = gamification ? gamification.getProfileSummary() : null;
    const notesList = await window.AbelionStorage.getNotes();

    document.getElementById('total-notes-stat').textContent = notesList.length;
    document.getElementById('streak-stat').textContent = (summary?.stats?.logins || 0) + ' hari';

    // Simulated XP history for the last 7 days
    const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const data = [10, 25, 45, 30, 60, 90, summary?.totalXp || 100].slice(-7);

    // Storage Info
    const usage = await window.AbelionStorage.getUsage();
    const usageValEl = document.getElementById('storage-usage-value');
    const usageBarEl = document.getElementById('storage-usage-bar');

    if (usage && usageValEl && usageBarEl) {
       const used = usage.usage || 0;
       const quota = usage.quota || 1;
       const pct = Math.min(100, (used / quota) * 100);

       const units = ['B', 'KB', 'MB', 'GB'];
       let size = used, unitIdx = 0;
       while (size > 1024 && unitIdx < units.length - 1) { size /= 1024; unitIdx++; }

       usageValEl.textContent = `${size.toFixed(1)} ${units[unitIdx]}`;
       usageBarEl.style.width = `${pct}%`;
    }

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'XP',
          data: data,
          borderColor: '#007AFF',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { display: false } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function wireInteractions() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) backBtn.addEventListener('click', () => {
      sessionStorage.setItem('skipIntro', '1');
      window.location.href = '../index.html';
    });

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

  document.addEventListener('DOMContentLoaded', async () => {
    cacheDom();
    renderVersion();
    applyProfile();
    wireInteractions();
    await renderProductivityCharts();
  });
})();
