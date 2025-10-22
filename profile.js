(function(){
  const {
    STORAGE_KEYS,
    safeGetItem,
    getVersionMeta,
    sanitizeText
  } = AbelionUtils;

  const clone = value => (typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value)));

  const DEFAULT_PROFILE = Object.freeze({
    name: 'Abelion',
    photo: '',
    title: 'Explorer',
    level: 1,
    xp: 0,
    totalXP: 0,
    nextLevelHint: 'Tetap semangat, XP akan naik dengan konsisten!',
    badges: ['🪜', '🌿', '🔧', ''],
    activeBadge: '🪜',
    gamification: Object.freeze({ current: 0, target: 100, percent: 0 })
  });

  const dom = {};

  function cacheDom(){
    dom.avatar = document.getElementById('profile-avatar');
    dom.greeting = document.getElementById('profile-greeting');
    dom.title = document.getElementById('profile-title');
    dom.level = document.getElementById('profile-level');
    dom.streak = document.getElementById('profile-streak');
    dom.xpPercent = document.getElementById('xp-percent');
    dom.xpBar = document.getElementById('xp-bar-fill');
    dom.xpHint = document.getElementById('xp-hint');
    dom.xpCounter = document.getElementById('xp-counter');
    dom.badgeGrid = document.getElementById('badge-grid');
    dom.versionPill = document.getElementById('profile-version-pill');
    dom.versionText = document.getElementById('profile-version');
  }

  function loadProfile(){
    const stored = safeGetItem(STORAGE_KEYS.PROFILE, null);
    if (!stored) return clone(DEFAULT_PROFILE);
    return normaliseProfile(stored);
  }

  function normaliseProfile(raw){
    const base = clone(DEFAULT_PROFILE);
    const profile = { ...base, ...raw };

    profile.name = typeof raw?.name === 'string' && raw.name.trim() ? raw.name.trim() : base.name;
    profile.photo = typeof raw?.photo === 'string' ? raw.photo : base.photo;
    profile.title = typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim() : base.title;
    const progress = deriveProgress(raw);
    profile.level = progress.level;
    profile.xp = progress.xpInLevel;
    profile.totalXP = progress.totalXP;
    profile.nextLevelHint = progress.nextLevelHint;
    profile.gamification = {
      current: progress.xpInLevel,
      target: progress.target,
      percent: progress.percent
    };

    const badges = Array.isArray(raw?.badges) && raw.badges.length ? raw.badges : base.badges;
    profile.badges = badges.slice(0, 12).map(item => (typeof item === 'string' ? item : ''));
    const fallbackBadge = profile.badges.find(Boolean) || base.activeBadge;
    profile.activeBadge = badges.includes(raw?.activeBadge) && raw?.activeBadge ? raw.activeBadge : fallbackBadge;

    return profile;
  }

  function deriveProgress(raw){
    const target = Math.max(1, Math.round(toNumber(raw?.gamification?.target, 100)));
    const xpRaw = Math.max(0, Math.round(toNumber(raw?.xp, raw?.gamification?.current ?? 0)));
    const totalRaw = Math.max(0, Math.round(toNumber(raw?.totalXP, xpRaw)));
    const levelFromTotal = Math.floor(totalRaw / target) + 1;
    const levelCandidate = Math.max(1, Math.round(toNumber(raw?.level, levelFromTotal)));
    const level = Math.max(levelCandidate, levelFromTotal);
    const xpFromLevel = (level - 1) * target + (xpRaw % target);
    const totalXP = Math.max(totalRaw, xpFromLevel);
    const xpInLevel = totalXP % target;
    const percent = Math.max(0, Math.min(100, Math.round((xpInLevel / target) * 100)));
    const hint = typeof raw?.nextLevelHint === 'string' && raw.nextLevelHint.trim()
      ? raw.nextLevelHint.trim()
      : `${target - xpInLevel || target} XP lagi untuk level ${level + 1}!`;

    return {
      level,
      xpInLevel,
      totalXP,
      target,
      percent,
      nextLevelHint: hint
    };
  }

  function toNumber(value, fallback){
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function greetingMessage(name){
    const hour = new Date().getHours();
    const greetings = [
      { min: 5, max: 11, text: 'Selamat pagi' },
      { min: 11, max: 15, text: 'Selamat siang' },
      { min: 15, max: 19, text: 'Selamat sore' },
      { min: 19, max: 5, text: 'Selamat malam' }
    ];

    const greeting = greetings.find(range => (
      range.min < range.max
        ? hour >= range.min && hour < range.max
        : hour >= range.min || hour < range.max
    )) || greetings[greetings.length - 1];

    const safeName = sanitizeText(name || DEFAULT_PROFILE.name);
    return `${greeting.text}, <b>${safeName}</b> 👋`;
  }

  function renderBadges(profile){
    if (!dom.badgeGrid) return;
    const badges = profile.badges.length ? profile.badges : DEFAULT_PROFILE.badges;
    const fragment = document.createDocumentFragment();

    const total = Math.max(4, badges.length);
    for (let i = 0; i < total; i += 1) {
      const badgeValue = badges[i] || '';
      const cell = document.createElement('div');
      cell.className = 'badge-item';
      if (!badgeValue) cell.classList.add('is-empty');
      if (badgeValue && badgeValue === profile.activeBadge) cell.classList.add('is-active');
      cell.textContent = badgeValue || '–';
      fragment.appendChild(cell);
    }

    dom.badgeGrid.innerHTML = '';
    dom.badgeGrid.appendChild(fragment);
  }

  function applyProfile(){
    const profile = loadProfile();
    const displayName = typeof profile.name === 'string' ? profile.name : DEFAULT_PROFILE.name;

    if (dom.avatar) {
      dom.avatar.src = profile.photo || 'default-avatar.svg';
      dom.avatar.classList.toggle('is-empty', !profile.photo);
    }

    if (dom.greeting) dom.greeting.innerHTML = greetingMessage(displayName);
    if (dom.title) dom.title.textContent = profile.title || DEFAULT_PROFILE.title;
    if (dom.level) dom.level.textContent = `Level ${profile.level}`;
    if (dom.streak) dom.streak.textContent = `${profile.totalXP ?? profile.gamification.current} XP`;

    if (dom.xpPercent) dom.xpPercent.textContent = `${profile.gamification.percent}%`;
    if (dom.xpBar) dom.xpBar.style.width = `${profile.gamification.percent}%`;
    if (dom.xpHint) dom.xpHint.textContent = profile.nextLevelHint || DEFAULT_PROFILE.nextLevelHint;
    if (dom.xpCounter) dom.xpCounter.textContent = `${profile.gamification.current} / ${profile.gamification.target} XP`;

    renderBadges(profile);
  }

  function renderVersion(){
    if (!dom.versionPill || !dom.versionText) return;
    const meta = getVersionMeta();
    if (!meta?.version) {
      dom.versionPill.hidden = true;
      return;
    }
    dom.versionText.textContent = `${meta.version} • ${meta.codename}`;
    dom.versionPill.hidden = false;
  }

  function wireInteractions(){
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
      if (event.key === STORAGE_KEYS.PROFILE) {
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
