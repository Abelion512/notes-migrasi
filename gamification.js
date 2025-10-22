(function(global){
  const utils = global.AbelionUtils;
  if (!utils) return;

  const {
    STORAGE_KEYS,
    safeGetItem,
    safeSetItem,
    isSameDay,
    differenceInDays,
    clamp
  } = utils;

  const STORAGE_KEY = STORAGE_KEYS.GAMIFICATION;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const clone = value => (typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value)));

  const numberOr = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const TIER_DEFINITIONS = [
    { id: 'novice', name: 'Novice', min: 1, max: 20, hint: 'Bangun rutinitas menulis untuk menembus Apprentice.' },
    { id: 'apprentice', name: 'Apprentice', min: 21, max: 50, hint: 'Eksplor variasi catatan untuk memperkaya pengalaman.' },
    { id: 'scholar', name: 'Scholar', min: 51, max: 100, hint: 'Gabungkan eksperimen dengan konsistensi untuk naik ke Archivist.' },
    { id: 'archivist', name: 'Archivist', min: 101, max: 200, hint: 'Optimalkan organisasi catatan untuk menuju Grand Master.' },
    { id: 'grandmaster', name: 'Grand Master', min: 201, max: Number.POSITIVE_INFINITY, hint: 'Bagikan ilmu dan jaga ritme produktifmu.' }
  ];

  const BADGE_DEFINITIONS = {
    patcher: {
      id: 'patcher',
      icon: '🔥',
      baseName: 'The Patcher',
      description: 'Mencatat selama 7 hari berturut-turut.',
      xp: 50
    },
    artisan: {
      id: 'artisan',
      icon: '🖋️',
      baseName: 'The Artisan',
      description: 'Merayakan pencapaian jumlah catatan yang ditulis.',
      tiers: [
        { threshold: 100, xp: 100, suffix: 'I' },
        { threshold: 200, xp: 150, suffix: 'II' },
        { threshold: 500, xp: 250, suffix: 'III' }
      ]
    },
    archivist: {
      id: 'archivist',
      icon: '📚',
      baseName: 'The Archivist',
      description: 'Aktif menggunakan 5 fitur pengorganisasian dalam satu hari.',
      xp: 75
    },
    projectTamer: {
      id: 'projectTamer',
      icon: '🎯',
      baseName: 'The Project Tamer',
      description: 'Menyelesaikan 10 checklist di 10 catatan berbeda.',
      xp: 150
    },
    nightOwl: {
      id: 'nightOwl',
      icon: '🌙',
      baseName: 'The Night Owl',
      description: 'Membuat catatan pada pukul 00:00 - 04:00.',
      xp: 30
    },
    earlyBird: {
      id: 'earlyBird',
      icon: '🌅',
      baseName: 'The Early Bird',
      description: 'Membuat catatan pada pukul 05:00 - 08:00.',
      xp: 30
    },
    purist: {
      id: 'purist',
      icon: '🔒',
      baseName: 'The Purist',
      description: 'Mengamankan 5 catatan dengan proteksi.',
      xp: 100
    },
    reviewer: {
      id: 'reviewer',
      icon: '🔍',
      baseName: 'The Reviewer',
      description: 'Menghidupkan kembali catatan lama (30+ hari) sebanyak 5 kali dalam seminggu.',
      xp: 60
    },
    veteran: {
      id: 'veteran',
      icon: '🌳',
      baseName: 'The Veteran',
      description: 'Aktif selama 1 tahun dengan minimal 100 login.',
      xp: 200
    }
  };

  function createDefaultState() {
    const now = new Date().toISOString();
    return {
      totalXp: 500,
      stats: {
        logins: 0,
        notesCreated: 0,
        notesUpdated: 0,
        notesDeleted: 0,
        checklistsCompleted: 0,
        streakBonuses: 0
      },
      flags: {
        profileCompleted: false,
        veteranAwarded: false,
        archivistAwarded: false,
        puristAwarded: false
      },
      streaks: {
        login: { count: 0, lastDate: null },
        note: { count: 0, lastDate: null }
      },
      notes: {},
      reviewLog: [],
      checklistLog: [],
      badges: [],
      specialDaysAwarded: {},
      artisanTier: 0,
      createdAt: now,
      updatedAt: now
    };
  }

  function sanitizeBadgeEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;
    const def = BADGE_DEFINITIONS[entry.id];
    return {
      id: entry.id || '',
      tier: entry.tier ? Math.max(1, Math.floor(numberOr(entry.tier, 1))) : null,
      name: entry.name || (def ? def.baseName : ''),
      icon: entry.icon || (def ? def.icon : ''),
      earnedAt: entry.earnedAt || new Date().toISOString(),
      xpReward: Math.max(0, Math.floor(numberOr(entry.xpReward, def?.xp || 0)))
    };
  }

  function normalizeState(raw) {
    const base = createDefaultState();
    if (!raw || typeof raw !== 'object') return base;

    const state = createDefaultState();
    state.totalXp = Math.max(0, Math.floor(numberOr(raw.totalXp, base.totalXp)));

    Object.keys(state.stats).forEach(key => {
      state.stats[key] = Math.max(0, Math.floor(numberOr(raw.stats?.[key], state.stats[key])));
    });

    state.flags = {
      ...state.flags,
      ...(raw.flags && typeof raw.flags === 'object' ? {
        profileCompleted: Boolean(raw.flags.profileCompleted),
        veteranAwarded: Boolean(raw.flags.veteranAwarded),
        archivistAwarded: Boolean(raw.flags.archivistAwarded),
        puristAwarded: Boolean(raw.flags.puristAwarded)
      } : {})
    };

    state.streaks = {
      login: {
        count: Math.max(0, Math.floor(numberOr(raw.streaks?.login?.count, 0))),
        lastDate: raw.streaks?.login?.lastDate || null
      },
      note: {
        count: Math.max(0, Math.floor(numberOr(raw.streaks?.note?.count, 0))),
        lastDate: raw.streaks?.note?.lastDate || null
      }
    };

    state.notes = raw.notes && typeof raw.notes === 'object' ? clone(raw.notes) : {};
    state.reviewLog = Array.isArray(raw.reviewLog) ? raw.reviewLog.slice(-20) : [];
    state.checklistLog = Array.isArray(raw.checklistLog) ? raw.checklistLog.slice(-50) : [];
    state.badges = Array.isArray(raw.badges) ? raw.badges.map(sanitizeBadgeEntry).filter(Boolean) : [];
    state.specialDaysAwarded = raw.specialDaysAwarded && typeof raw.specialDaysAwarded === 'object'
      ? clone(raw.specialDaysAwarded)
      : {};
    state.artisanTier = Math.max(0, Math.floor(numberOr(raw.artisanTier, 0)));
    state.createdAt = raw.createdAt || base.createdAt;
    state.updatedAt = raw.updatedAt || base.updatedAt;
    return state;
  }

  function xpRequiredForLevel(level) {
    if (level <= 1) return 0;
    const base = 50 * level;
    return level % 100 === 0 ? base + 100 : base;
  }

  function resolveProgress(totalXp) {
    let remaining = Math.max(0, Math.floor(totalXp));
    let level = 1;
    let xpForNext = xpRequiredForLevel(level + 1);
    while (xpForNext > 0 && remaining >= xpForNext) {
      remaining -= xpForNext;
      level += 1;
      xpForNext = xpRequiredForLevel(level + 1);
    }
    const percent = xpForNext > 0
      ? clamp(Math.round((remaining / xpForNext) * 100), 0, 100)
      : 100;
    return {
      level,
      totalXp: Math.max(0, Math.floor(totalXp)),
      xpInLevel: remaining,
      xpForNext,
      percent,
      xpToNext: Math.max(0, xpForNext - remaining)
    };
  }

  function getTier(level) {
    return TIER_DEFINITIONS.find(tier => level >= tier.min && level <= tier.max) || TIER_DEFINITIONS[TIER_DEFINITIONS.length - 1];
  }

  function buildNextLevelHint(progress) {
    if (progress.xpToNext <= 50 && progress.xpForNext) {
      return `Hanya ${progress.xpToNext} XP lagi menuju Level ${progress.level + 1}!`;
    }
    const tier = getTier(progress.level);
    return tier.hint;
  }

  function ensureState() {
    if (!ensureState.cache) {
      const stored = safeGetItem(STORAGE_KEY, null);
      ensureState.cache = normalizeState(stored);
      if (!stored) {
        safeSetItem(STORAGE_KEY, ensureState.cache);
      }
      syncProfileOverlay(ensureState.cache);
    }
    return ensureState.cache;
  }

  function addXp(state, amount) {
    const xp = Math.max(0, Math.floor(numberOr(amount, 0)));
    if (xp <= 0) return 0;
    state.totalXp += xp;
    return xp;
  }

  function badgeKey(def, tierIndex) {
    if (!def) return '';
    if (def.tiers && typeof tierIndex === 'number') {
      return `${def.id}-${tierIndex + 1}`;
    }
    return def.id;
  }

  function buildBadgeName(def, tierIndex) {
    if (!def) return '';
    if (def.tiers && typeof tierIndex === 'number') {
      const tier = def.tiers[tierIndex];
      const suffix = tier?.suffix ? ` ${tier.suffix}` : '';
      return `${def.baseName}${suffix}`;
    }
    return def.baseName;
  }

  function grantBadge(state, badgeId, tierIndex) {
    const def = BADGE_DEFINITIONS[badgeId];
    if (!def) return 0;
    const key = badgeKey(def, tierIndex);
    const already = state.badges.some(entry => badgeKey(BADGE_DEFINITIONS[entry.id], entry.tier ? entry.tier - 1 : undefined) === key);
    if (already) return 0;
    const now = new Date().toISOString();
    let xpReward = def.xp || 0;
    if (def.tiers && typeof tierIndex === 'number') {
      const tier = def.tiers[tierIndex];
      xpReward = tier?.xp || xpReward;
    }
    state.badges.push({
      id: badgeId,
      tier: def.tiers && typeof tierIndex === 'number' ? tierIndex + 1 : null,
      name: buildBadgeName(def, tierIndex),
      icon: def.icon,
      earnedAt: now,
      xpReward
    });
    state.badges = state.badges.slice(-48);
    return addXp(state, xpReward);
  }

  function pruneNotes(state) {
    const entries = Object.entries(state.notes);
    if (entries.length <= 200) return;
    entries
      .sort((a, b) => new Date(a[1]?.createdAt || 0) - new Date(b[1]?.createdAt || 0))
      .slice(0, entries.length - 200)
      .forEach(([id]) => { delete state.notes[id]; });
  }

  function updateStreak(streak, isoDate) {
    if (!isoDate) return streak.count;
    const current = new Date(isoDate).toISOString().split('T')[0];
    const last = streak.lastDate ? new Date(streak.lastDate).toISOString().split('T')[0] : null;
    if (last && current === last) {
      return streak.count;
    }
    if (last && differenceInDays(isoDate, streak.lastDate) === 1) {
      streak.count += 1;
    } else {
      streak.count = 1;
    }
    streak.lastDate = isoDate;
    return streak.count;
  }

  function applySeasonalBonus(state, isoDate) {
    if (!isoDate) return 0;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 0;
    const month = date.getMonth();
    const day = date.getDate();
    if (month !== 11 || (day !== 15 && day !== 25)) return 0;
    const key = `${date.getFullYear()}-${day}`;
    if (state.specialDaysAwarded[key]) return 0;
    const level = resolveProgress(state.totalXp).level;
    const bonusTier = Math.floor((Math.max(1, level) - 1) / 10);
    const bonus = 100 + (bonusTier * 100);
    state.specialDaysAwarded[key] = { awardedAt: isoDate, level, bonus };
    return addXp(state, bonus);
  }

  function checkArtisan(state) {
    const def = BADGE_DEFINITIONS.artisan;
    if (!def?.tiers) return 0;
    const currentTier = state.artisanTier || 0;
    if (currentTier >= def.tiers.length) return 0;
    const nextTier = def.tiers[currentTier];
    if (!nextTier) return 0;
    if (state.stats.notesCreated >= nextTier.threshold) {
      const xp = grantBadge(state, 'artisan', currentTier);
      if (xp > 0) {
        state.artisanTier = currentTier + 1;
      }
      return xp;
    }
    return 0;
  }

  function checkReviewer(state, isoDate, noteCreatedAt) {
    if (!noteCreatedAt) return 0;
    const created = new Date(noteCreatedAt);
    if (Number.isNaN(created.getTime())) return 0;
    const now = new Date(isoDate || new Date().toISOString());
    if (now - created < 30 * DAY_MS) return 0;
    state.reviewLog.push(now.toISOString());
    state.reviewLog = state.reviewLog.filter(entry => differenceInDays(isoDate, entry) <= 7);
    if (state.reviewLog.length >= 5) {
      const xp = grantBadge(state, 'reviewer');
      if (xp > 0) {
        state.reviewLog = [];
      }
      return xp;
    }
    return 0;
  }

  function checkPatcher(state, isoDate) {
    const streak = updateStreak(state.streaks.note, isoDate);
    if (streak >= 7) {
      return grantBadge(state, 'patcher');
    }
    return 0;
  }

  function checkVeteran(state, isoDate) {
    if (state.flags.veteranAwarded) return 0;
    const daysActive = differenceInDays(isoDate || new Date().toISOString(), state.createdAt);
    if (daysActive >= 365 && state.stats.logins >= 100) {
      const xp = grantBadge(state, 'veteran');
      if (xp > 0) {
        state.flags.veteranAwarded = true;
      }
      return xp;
    }
    return 0;
  }

  function persistState(state) {
    state.updatedAt = new Date().toISOString();
    ensureState.cache = state;
    safeSetItem(STORAGE_KEY, state);
    syncProfileOverlay(state);
  }

  function syncProfileOverlay(state) {
    const profileRaw = safeGetItem(STORAGE_KEYS.PROFILE, {});
    const profile = typeof profileRaw === 'object' && profileRaw ? { ...profileRaw } : {};
    const progress = resolveProgress(state.totalXp);
    const tier = getTier(progress.level);
    const badges = state.badges
      .slice()
      .sort((a, b) => new Date(a.earnedAt || 0) - new Date(b.earnedAt || 0))
      .map(entry => ({
        icon: entry.icon,
        id: entry.id,
        name: entry.name,
        tier: entry.tier,
        earnedAt: entry.earnedAt
      }));

    profile.level = progress.level;
    profile.tier = tier.name;
    profile.xp = progress.totalXp;
    profile.nextLevelHint = buildNextLevelHint(progress);
    profile.gamification = {
      current: progress.xpInLevel,
      target: progress.xpForNext || progress.xpInLevel,
      percent: progress.percent,
      total: progress.totalXp,
      toNext: progress.xpToNext
    };
    profile.badges = badges.map(item => item.icon).slice(0, 12);
    if (!profile.activeBadge || !profile.badges.includes(profile.activeBadge)) {
      profile.activeBadge = profile.badges[profile.badges.length - 1] || profile.badges[0] || '';
    }
    profile.updatedAt = new Date().toISOString();
    safeSetItem(STORAGE_KEYS.PROFILE, profile);
  }

  function trackDailyLogin(referenceDate) {
    const state = ensureState();
    const now = referenceDate ? new Date(referenceDate) : new Date();
    const iso = now.toISOString();
    const lastLogin = state.streaks.login.lastDate;
    if (lastLogin && isSameDay(iso, lastLogin)) {
      return { xp: 0, streak: state.streaks.login.count, bonus: 0 };
    }
    const streakCount = updateStreak(state.streaks.login, iso);
    state.stats.logins += 1;
    let gained = addXp(state, 5);
    let bonus = 0;
    if (streakCount > 0 && streakCount % 5 === 0) {
      bonus += addXp(state, 100);
      state.stats.streakBonuses += 1;
    }
    bonus += applySeasonalBonus(state, iso);
    bonus += checkVeteran(state, iso);
    persistState(state);
    return { xp: gained + bonus, streak: streakCount, bonus };
  }

  function recordNoteCreated({ id, createdAt }) {
    if (!id) return { xp: 0 };
    const state = ensureState();
    const nowIso = createdAt || new Date().toISOString();
    const existing = state.notes[id] || {};
    state.notes[id] = {
      createdAt: existing.createdAt || nowIso,
      updatedAwarded: Boolean(existing.updatedAwarded),
      deleteAwarded: Boolean(existing.deleteAwarded)
    };
    pruneNotes(state);
    state.stats.notesCreated += 1;
    let xp = addXp(state, 20);
    xp += checkArtisan(state);
    xp += checkPatcher(state, nowIso);
    const hour = new Date(nowIso).getHours();
    if (hour >= 0 && hour < 4) {
      xp += grantBadge(state, 'nightOwl');
    } else if (hour >= 5 && hour < 8) {
      xp += grantBadge(state, 'earlyBird');
    }
    persistState(state);
    return { xp };
  }

  function recordNoteUpdated({ id, updatedAt, createdAt }) {
    if (!id) return { xp: 0 };
    const state = ensureState();
    const note = state.notes[id] || {
      createdAt: createdAt || updatedAt,
      updatedAwarded: false,
      deleteAwarded: false
    };
    if (note.updatedAwarded) {
      note.lastUpdatedAt = updatedAt || new Date().toISOString();
      state.notes[id] = note;
      persistState(state);
      return { xp: 0 };
    }
    note.updatedAwarded = true;
    note.lastUpdatedAt = updatedAt || new Date().toISOString();
    note.createdAt = note.createdAt || createdAt || note.lastUpdatedAt;
    state.notes[id] = note;
    state.stats.notesUpdated += 1;
    let xp = addXp(state, 10);
    xp += checkReviewer(state, note.lastUpdatedAt, createdAt || note.createdAt);
    persistState(state);
    return { xp };
  }

  function recordNoteDeleted({ id, deletedAt, createdAt }) {
    if (!id) return { xp: 0 };
    const state = ensureState();
    const note = state.notes[id] || {
      createdAt: createdAt,
      updatedAwarded: false,
      deleteAwarded: false
    };
    note.createdAt = note.createdAt || createdAt;
    state.notes[id] = note;
    const nowIso = deletedAt || new Date().toISOString();
    if (note.deleteAwarded) {
      delete state.notes[id];
      persistState(state);
      return { xp: 0 };
    }
    const created = createdAt || note.createdAt;
    const createdDate = new Date(created);
    const eligible = !Number.isNaN(createdDate.getTime()) && (new Date(nowIso) - createdDate) >= DAY_MS;
    if (!eligible) {
      delete state.notes[id];
      persistState(state);
      return { xp: 0 };
    }
    note.deleteAwarded = true;
    state.stats.notesDeleted += 1;
    const xp = addXp(state, 5);
    delete state.notes[id];
    persistState(state);
    return { xp };
  }

  function recordChecklistCompletion(count = 1) {
    const state = ensureState();
    const amount = Math.max(1, Math.floor(numberOr(count, 1)));
    state.checklistLog.push({ count: amount, at: new Date().toISOString() });
    state.checklistLog = state.checklistLog.slice(-100);
    state.stats.checklistsCompleted += amount;
    const xp = addXp(state, 2 * amount);
    if (state.stats.checklistsCompleted >= 10) {
      grantBadge(state, 'projectTamer');
    }
    persistState(state);
    return { xp };
  }

  function evaluateProfileCompletion(profile) {
    const state = ensureState();
    if (state.flags.profileCompleted) {
      return { xp: 0 };
    }
    const nameFilled = profile?.name && profile.name.trim() && profile.name.trim().toLowerCase() !== 'abelion';
    const photoFilled = Boolean(profile?.photo);
    const badgeFilled = (profile?.activeBadge && profile.activeBadge.trim())
      || (Array.isArray(profile?.badges) && profile.badges.some(Boolean));
    if (nameFilled && photoFilled && badgeFilled) {
      state.flags.profileCompleted = true;
      const xp = addXp(state, 100);
      persistState(state);
      return { xp };
    }
    return { xp: 0 };
  }

  function getBadgeCatalog() {
    return Object.values(BADGE_DEFINITIONS).map(def => ({
      id: def.id,
      icon: def.icon,
      name: def.baseName,
      description: def.description,
      tiers: def.tiers ? def.tiers.map(t => ({ threshold: t.threshold, xp: t.xp, suffix: t.suffix })) : null,
      xp: def.xp || null
    }));
  }

  function getProfileSummary() {
    const state = ensureState();
    const profileRaw = safeGetItem(STORAGE_KEYS.PROFILE, {});
    const progress = resolveProgress(state.totalXp);
    const tier = getTier(progress.level);
    const badges = state.badges
      .slice()
      .sort((a, b) => new Date(a.earnedAt || 0) - new Date(b.earnedAt || 0))
      .map(entry => ({
        id: entry.id,
        tier: entry.tier,
        name: entry.name,
        icon: entry.icon,
        earnedAt: entry.earnedAt,
        xpReward: entry.xpReward
      }));
    const badgeIcons = badges.map(item => item.icon).filter(Boolean);
    const activeBadge = profileRaw?.activeBadge && badgeIcons.includes(profileRaw.activeBadge)
      ? profileRaw.activeBadge
      : (badgeIcons[badgeIcons.length - 1] || badgeIcons[0] || '');

    return {
      name: profileRaw?.name && profileRaw.name.trim() ? profileRaw.name.trim() : 'Abelion',
      title: profileRaw?.title && profileRaw.title.trim() ? profileRaw.title.trim() : tier.name,
      photo: profileRaw?.photo || '',
      level: progress.level,
      tier: tier.name,
      totalXp: progress.totalXp,
      xpCurrent: progress.xpInLevel,
      xpTarget: progress.xpForNext || progress.xpInLevel,
      xpPercent: progress.percent,
      xpToNext: progress.xpToNext,
      nextLevelHint: buildNextLevelHint(progress),
      badges,
      badgeIcons: badgeIcons.slice(0, 12),
      activeBadge,
      stats: clone(state.stats)
    };
  }

  global.AbelionGamification = {
    trackDailyLogin,
    recordNoteCreated,
    recordNoteUpdated,
    recordNoteDeleted,
    recordChecklistCompletion,
    evaluateProfileCompletion,
    getBadgeCatalog,
    getProfileSummary
  };
})(window);
