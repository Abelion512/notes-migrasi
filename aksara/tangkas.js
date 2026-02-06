(function (global) {
  const utils = global.AbelionUtils;
  if (!utils) return;

  const {
    STORAGE_KEYS,
    safeGetItem,
    safeSetItem,
    isSameDay,
    differenceInDays,
    clamp,
    DateUtils // Import DateUtils
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

  const XP_GUIDE_URL = 'https://olivx.gitbook.io/abelion-notes/getting-started/claim-exp';

  const admin = Object.freeze({
    name: 'Abelion Lavv',
    email: 'agen.salva@gmail.com',
    privileges: Object.freeze({
      level: true,
      title: true,
      theme: true,
      background: true,
      badges: true
    })
  });

  const TITLE_PROGRESSION = Object.freeze([
    {
      id: 'explorer',
      level: 1,
      name: 'Penjelajah',
      description: 'Menjelajah ide dan membangun kebiasaan menulis.'
    },
    {
      id: 'trailblazer',
      level: 500,
      name: 'Perintis',
      description: 'Memimpin komunitas dengan konsistensi menulis tinggi.'
    }
  ]);

  const TIER_DEFINITIONS = [
    {
      id: 'novice',
      name: 'Penyusun',
      label: 'Penyusun',
      min: 1,
      max: 20,
      summary: 'Tahap awal dalam merintis dokumentasi dan arsip pribadi.',
      hint: 'Teruslah mencatat untuk mencapai kualifikasi Dokumentalis.'
    },
    {
      id: 'apprentice',
      name: 'Dokumentalis',
      label: 'Dokumentalis',
      min: 21,
      max: 60,
      summary: 'Telah menunjukkan dedikasi dalam mengelola informasi secara sistematis.',
      hint: 'Perdalam pengorganisasian data untuk menjadi seorang Arsiparis.'
    },
    {
      id: 'scholar',
      name: 'Arsiparis',
      label: 'Arsiparis',
      min: 61,
      max: 150,
      summary: 'Ahli dalam menjaga keberlangsungan dan aksesibilitas catatan penting.',
      hint: 'Kurasilah pengetahuan Anda untuk menembus jenjang Kurator.'
    },
    {
      id: 'archivist',
      name: 'Kurator',
      label: 'Kurator',
      min: 151,
      max: 300,
      summary: 'Memilih dan memelihara koleksi informasi dengan standar ketelitian tinggi.',
      hint: 'Pertahankan integritas arsip untuk diakui sebagai Konservator.'
    },
    {
      id: 'luminary',
      name: 'Konservator',
      label: 'Konservator',
      min: 301,
      max: Number.POSITIVE_INFINITY,
      summary: 'Penjaga warisan informasi yang berdedikasi penuh pada keabadian catatan.',
      hint: 'Anda adalah penjaga utama dalam hierarki dokumentasi Abelion.'
    }
  ];

  const BADGE_DEFINITIONS = {
    artisan: {
      id: 'artisan',
      baseName: 'Pengrajin Kata',
      icon: '✍️',
      description: 'Menulis banyak catatan.',
      criteria: 'Mencapai target jumlah catatan.',
      tiers: [
        { threshold: 10, xp: 100, suffix: 'I' },
        { threshold: 50, xp: 250, suffix: 'II' },
        { threshold: 100, xp: 500, suffix: 'III' }
      ]
    },
    nightOwl: {
      id: 'nightOwl',
      baseName: 'Burung Hantu',
      icon: '🦉',
      description: 'Menulis di larut malam.',
      criteria: 'Menulis antara jam 00:00 - 04:00.',
      xp: 150
    },
    earlyBird: {
      id: 'earlyBird',
      baseName: 'Burung Pagi',
      icon: '🌅',
      description: 'Menulis di pagi buta.',
      criteria: 'Menulis antara jam 05:00 - 08:00.',
      xp: 150
    },
    reviewer: {
      id: 'reviewer',
      baseName: 'Pemeriksa',
      icon: '🧐',
      description: 'Sering memperbarui catatan lama.',
      criteria: 'Memperbarui catatan yang berumur > 30 hari sebanyak 5 kali.',
      xp: 200
    },
    patcher: {
      id: 'patcher',
      baseName: 'Penyelamat Streak',
      icon: '🛡️',
      description: 'Menjaga streak menulis selama seminggu.',
      criteria: 'Streak menulis mencapai 7 hari.',
      xp: 300
    },
    veteran: {
      id: 'veteran',
      baseName: 'Veteran',
      icon: '🎖️',
      description: 'Pengguna setia Abelion selama satu tahun.',
      criteria: 'Akun berumur 365 hari dan 100 kali login.',
      xp: 1000
    },
    projectTamer: {
      id: 'projectTamer',
      baseName: 'Penjinak Proyek',
      icon: '🎯',
      description: 'Menyelesaikan banyak checklist.',
      criteria: 'Menyelesaikan 10 item checklist.',
      xp: 250
    },
    purist: {
      id: 'purist',
      baseName: 'Purist',
      icon: '🔐',
      description: 'Menggunakan fitur catatan rahasia.',
      criteria: 'Membuat 5 catatan rahasia.',
      xp: 300
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
      xpHistory: [], // [{ at: ISO, gained: Number }]
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
    state.xpHistory = Array.isArray(raw.xpHistory) ? raw.xpHistory.slice(-100) : [];
    state.createdAt = raw.createdAt || base.createdAt;
    state.updatedAt = raw.updatedAt || base.updatedAt;
    return state;
  }

  function xpRequiredForLevel(level) {
    if (level <= 1) return 0;
    // Mempermudah sistem: setiap naik level hanya bertambah +50 XP
    // Lvl 1->2: 100
    // Lvl 2->3: 150
    // Lvl 3->4: 200
    return (level - 2) * 50 + 100;
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

  function formatTierRange(tier) {
    if (!tier) return '';
    if (tier.max === Number.POSITIVE_INFINITY) {
      return `Level ${tier.min}+`;
    }
    return `Level ${tier.min}-${tier.max}`;
  }

  function buildNextLevelHint(progress) {
    const tier = getTier(progress.level);
    if (progress.xpToNext <= 50 && progress.xpForNext) {
      return `Hanya ${progress.xpToNext} XP lagi menuju Level ${progress.level + 1}!`;
    }
    const nextTier = getTier(progress.level + 1);
    if (nextTier && tier && nextTier.id !== tier.id) {
      const range = nextTier.max === Number.POSITIVE_INFINITY
        ? `Level ${nextTier.min}+`
        : `Level ${nextTier.min}`;
      return `Siap menuju ${nextTier.label || nextTier.name} di ${range}.`;
    }
    return tier?.hint || tier?.summary || '';
  }

  function resolveTitleInfo(level, customTitleRaw) {
    const customTitle = customTitleRaw && typeof customTitleRaw === 'string'
      ? customTitleRaw.trim()
      : '';
    const sorted = TITLE_PROGRESSION.slice().sort((a, b) => a.level - b.level);
    let active = sorted[0] || { name: 'Explorer', description: '' };
    let next = null;

    for (let i = 0; i < sorted.length; i++) {
      const candidate = sorted[i];
      if (level >= candidate.level) {
        active = candidate;
        next = sorted[i + 1] || null;
      } else {
        next = candidate;
        break;
      }
    }

    if (customTitle) {
      return {
        title: customTitle,
        description: 'Title kustom milikmu.',
        source: 'custom',
        nextTitle: next
      };
    }

    return {
      title: active.name,
      description: active.description || '',
      source: 'system',
      nextTitle: next
    };
  }

  function buildTierHint(tier, progress) {
    if (!tier) return '';
    const range = formatTierRange(tier);
    let hint = `${tier.label || tier.name} mencakup ${range}. ${tier.summary}`.trim();
    const nextTier = getTier(progress.level + 1);
    if (nextTier && nextTier.id !== tier.id) {
      hint = `${hint} Level ${nextTier.min} membuka ${nextTier.label || nextTier.name}.`;
    }
    return hint.trim();
  }

  function buildTitleHint(info) {
    if (!info) return '';
    if (info.source === 'custom') {
      let message = info.description || 'Title kustom milikmu.';
      if (info.nextTitle) {
        message = `${message} Level ${info.nextTitle.level} akan membuka gelar sistem ${info.nextTitle.name}.`;
      }
      return message.trim();
    }

    let message = info.description || '';
    if (info.nextTitle) {
      message = `${message} Level ${info.nextTitle.level} akan membuka gelar ${info.nextTitle.name}.`.trim();
    }
    return message.trim();
  }

  function refreshStateCache() {
    const stored = safeGetItem(STORAGE_KEY, null);
    ensureState.cache = normalizeState(stored);
    return ensureState.cache;
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

    // Log history
    const now = new Date().toISOString();
    state.xpHistory.push({ at: now, gained: xp });
    state.xpHistory = state.xpHistory.slice(-100); // Keep last 100 entries

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

    const targetKey = badgeKey(def, tierIndex);

    // Check existing badges
    const already = state.badges.some(entry => {
      // If we stored the key, use it
      if (entry.key && entry.key === targetKey) return true;

      // Fallback to recalculating key
      const entryTierIndex = entry.tier ? entry.tier - 1 : undefined;
      const entryKey = badgeKey(BADGE_DEFINITIONS[entry.id], entryTierIndex);
      return entryKey === targetKey;
    });

    if (already) return 0;

    const now = new Date().toISOString();
    let xpReward = def.xp || 0;

    if (def.tiers && typeof tierIndex === 'number') {
      const tier = def.tiers[tierIndex];
      xpReward = tier?.xp || xpReward;
    }

    // Create badge entry
    const badgeEntry = {
      id: badgeId,
      tier: def.tiers && typeof tierIndex === 'number' ? tierIndex + 1 : null,
      name: buildBadgeName(def, tierIndex),
      icon: def.icon,
      earnedAt: now,
      xpReward,
      key: targetKey  // Store key for future validation
    };

    state.badges.push(badgeEntry);
    state.badges = state.badges.slice(-48); // Keep last 48 badges

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

    if (!streak.lastDate) {
      streak.count = 1;
      streak.lastDate = DateUtils.nowISO();
      return streak.count;
    }

    const daysDiff = DateUtils.diffDays(isoDate, streak.lastDate);

    if (daysDiff === 0) {
      // Same day, no change
      return streak.count;
    } else if (daysDiff === 1) {
      // Next day, increment
      streak.count += 1;
      streak.lastDate = DateUtils.nowISO();
    } else if (daysDiff <= 2) {
      // Grace period: Update date, maintain count
      streak.lastDate = DateUtils.nowISO();
    } else {
      // Streak broken
      streak.count = 1;
      streak.lastDate = DateUtils.nowISO();
    }

    return streak.count;
  }

  const SPECIAL_DATES_MAP = {
    '0-1': '🎆 Tahun Baru',
    '1-14': '💖 Hari Kasih Sayang',
    '3-21': '👸 Hari Kartini',
    '4-1': '🛠️ Hari Buruh',
    '4-2': '📚 Hari Pendidikan Nasional',
    '4-20': '🇮🇩 Hari Kebangkitan Nasional',
    '5-1': '🦅 Hari Lahir Pancasila',
    '7-17': '🇮🇩 Hari Kemerdekaan RI',
    '9-1': '🛡️ Hari Kesaktian Pancasila',
    '9-28': '✊ Hari Sumpah Pemuda',
    '10-10': '🎖️ Hari Pahlawan',
    '11-22': '👩‍👧‍👦 Hari Ibu',
    '11-25': '🎄 Hari Natal'
  };

  async function getCustomSpecialDays() {
    return safeGetItem(STORAGE_KEYS.CUSTOM_SPECIAL_DAYS, []);
  }

  async function addCustomSpecialDay(month, day, name) {
    const days = await getCustomSpecialDays();
    const newDay = {
      id: utils.generateId('sd'),
      month: parseInt(month),
      day: parseInt(day),
      name: name.trim()
    };
    days.push(newDay);
    await safeSetItem(STORAGE_KEYS.CUSTOM_SPECIAL_DAYS, days);
    return newDay;
  }

  async function deleteCustomSpecialDay(id) {
    let days = await getCustomSpecialDays();
    days = days.filter(d => d.id !== id);
    await safeSetItem(STORAGE_KEYS.CUSTOM_SPECIAL_DAYS, days);
    return true;
  }

  async function applySeasonalBonus(state, isoDate) {
    if (!isoDate) return 0;
    const date = new Date(isoDate);
    const m = date.getMonth();
    const d = date.getDate();
    const key = `${m}-${d}`;

    // 1. Check System Special Dates
    let specialName = SPECIAL_DATES_MAP[key] || '';
    let isSpecial = !!specialName;

    // 2. Check Range Special Dates
    if (m === 11 && d >= 10 && d <= 15) {
      isSpecial = true;
      specialName = 'Pekan Menulis Akhir Tahun';
    }

    // 3. Check User Custom Special Dates
    if (!isSpecial) {
      const customDays = await getCustomSpecialDays();
      const match = customDays.find(cd => cd.month === m && cd.day === d);
      if (match) {
        isSpecial = true;
        specialName = match.name;
      }
    }

    if (!isSpecial) return 0;

    const storageKey = `special-${date.getFullYear()}-${key}`;
    if (state.specialDaysAwarded[storageKey]) return 0;

    const { level } = resolveProgress(state.totalXp);
    // Tiered bonus: 1-10=100, 11-20=200...
    const bonusTier = Math.ceil(level / 10);
    const bonus = bonusTier * 100;

    state.specialDaysAwarded[storageKey] = { awardedAt: isoDate, bonus };
    return addXp(state, bonus);
  }

  function checkArtisan(state) {
    const def = BADGE_DEFINITIONS.artisan;
    if (!def?.tiers) return 0;

    let totalXP = 0;
    const startTier = state.artisanTier || 0;

    for (let tierIndex = startTier; tierIndex < def.tiers.length; tierIndex++) {
      const tier = def.tiers[tierIndex];
      if (!tier || state.stats.notesCreated < tier.threshold) {
        break;
      }
      const xp = grantBadge(state, 'artisan', tierIndex);
      if (xp > 0) {
        totalXP += xp;
        state.artisanTier = tierIndex + 1;
      }
    }

    return totalXP;
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

  async function persistState(state, previousProgress, retries = 3) {
    state.updatedAt = new Date().toISOString();

    // Deep clone before attempting persist
    const stateClone = clone(state);

    for (let attempt = 0; attempt < retries; attempt++) {
      const success = await safeSetItem(STORAGE_KEY, stateClone);

      if (success) {
        // Only update cache after successful persist
        ensureState.cache = stateClone;
        syncProfileOverlay(stateClone);

        const currentProgress = resolveProgress(stateClone.totalXp);
        if (previousProgress && currentProgress.level > previousProgress.level) {
          showLevelUpCelebration(currentProgress.level);
        }

        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('abelion-xp-update', {
            detail: { totalXp: currentProgress.totalXp, level: currentProgress.level }
          }));
        }

        return true;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }

    console.error('Failed to persist gamification state after retries');
    return false;
  }

  function syncProfileOverlay(state) {
    const profileRaw = safeGetItem(STORAGE_KEYS.PROFILE, {});
    const profile = typeof profileRaw === 'object' && profileRaw ? { ...profileRaw } : {};
    const progress = resolveProgress(state.totalXp);
    const tier = getTier(progress.level);
    const titleInfo = resolveTitleInfo(progress.level, profile.title);
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
    profile.title = titleInfo.title;
    profile.titleHint = buildTitleHint(titleInfo);
    profile.tier = tier.label || tier.name;
    profile.tierHint = buildTierHint(tier, progress);
    profile.xp = progress.totalXp;
    profile.nextLevelHint = buildNextLevelHint(progress);
    profile.gamification = {
      current: progress.xpInLevel,
      target: progress.xpForNext || progress.xpInLevel,
      percent: progress.percent,
      total: progress.totalXp,
      toNext: progress.xpToNext
    };
    const earnedIcons = badges.map(item => item.icon).filter(Boolean);
    profile.badges = earnedIcons.slice(0, 12);

    // Default badges to ensure fallback
    const defaults = [];

    if (!profile.activeBadge || (!earnedIcons.includes(profile.activeBadge) && !defaults.includes(profile.activeBadge))) {
      profile.activeBadge = earnedIcons[earnedIcons.length - 1] || earnedIcons[0] || '';
    }
    profile.xpGuideUrl = XP_GUIDE_URL;
    profile.updatedAt = new Date().toISOString();
    safeSetItem(STORAGE_KEYS.PROFILE, profile);
  }

  async function trackDailyLogin(referenceDate) {
    const state = ensureState();
    const previousProgress = resolveProgress(state.totalXp);
    const now = referenceDate ? new Date(referenceDate) : new Date();
    const iso = now.toISOString();
    const lastLogin = state.streaks.login.lastDate;

    if (lastLogin && isSameDay(iso, lastLogin)) {
      return { xp: 0, streak: state.streaks.login.count, bonus: 0 };
    }

    const streakCount = updateStreak(state.streaks.login, iso);
    state.stats.logins += 1;

    // Base login: +25
    let gained = addXp(state, 25);
    let bonus = 0;

    // Streak Bonus: Every 5 days -> +150
    if (streakCount > 0 && streakCount % 5 === 0) {
      bonus += addXp(state, 150);
      state.stats.streakBonuses += 1;
    }

    bonus += applySeasonalBonus(state, iso);
    bonus += checkVeteran(state, iso);

    const persisted = await persistState(state, previousProgress);
    if (!persisted) {
      throw new Error('Failed to persist daily login state');
    }
    return { xp: gained + bonus, streak: streakCount, bonus };
  }

  function recordNoteCreated({ id, createdAt }) {
    if (!id) return { xp: 0 };
    const state = ensureState();
    const previousProgress = resolveProgress(state.totalXp);
    const nowIso = createdAt || new Date().toISOString();
    const existing = state.notes[id] || {};
    state.notes[id] = {
      createdAt: existing.createdAt || nowIso,
      updatedAwarded: Boolean(existing.updatedAwarded),
      deleteAwarded: Boolean(existing.deleteAwarded)
    };
    pruneNotes(state);
    state.stats.notesCreated += 1;

    // Note Create: +50 XP
    let xp = addXp(state, 50);

    xp += checkArtisan(state);
    xp += checkPatcher(state, nowIso);
    // ...Bio checks kept...
    const hour = new Date(nowIso).getHours();
    if (hour >= 0 && hour < 4) {
      xp += grantBadge(state, 'nightOwl');
    } else if (hour >= 5 && hour < 8) {
      xp += grantBadge(state, 'earlyBird');
    }
    persistState(state, previousProgress);
    return { xp };
  }

  function recordNoteUpdated({ id, updatedAt, createdAt, charDiff }) {
    if (!id) return { xp: 0 };
    const state = ensureState();
    const previousProgress = resolveProgress(state.totalXp);
    const note = state.notes[id] || {
      createdAt: createdAt || updatedAt,
      updatedAwarded: false,
      deleteAwarded: false
    };

    // Always track update
    note.lastUpdatedAt = updatedAt || new Date().toISOString();
    state.notes[id] = note;
    state.stats.notesUpdated += 1;

    // +1 XP per character modified (absolute diff)
    let xp = 0;
    if (charDiff && charDiff > 0) {
      // Allow max 100 xp per edit to sane-cap it
      const gained = Math.min(Math.floor(charDiff), 100);
      xp = addXp(state, gained);
    }

    xp += checkReviewer(state, note.lastUpdatedAt, createdAt || note.createdAt);
    persistState(state, previousProgress);
    return { xp };
  }

  function recordNoteDeleted({ id, deletedAt, createdAt }) {
    if (!id) return { xp: 0 };
    const state = ensureState();
    const previousProgress = resolveProgress(state.totalXp);
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
      persistState(state, previousProgress);
      return { xp: 0 };
    }
    const created = createdAt || note.createdAt;
    const createdDate = new Date(created);
    const eligible = !Number.isNaN(createdDate.getTime()) && (new Date(nowIso) - createdDate) >= DAY_MS;
    if (!eligible) {
      delete state.notes[id];
      persistState(state, previousProgress);
      return { xp: 0 };
    }
    note.deleteAwarded = true;
    state.stats.notesDeleted += 1;
    const xp = addXp(state, 5);
    delete state.notes[id];
    persistState(state, previousProgress);
    return { xp };
  }

  function recordChecklistCompletion(count = 1) {
    const state = ensureState();
    const previousProgress = resolveProgress(state.totalXp);
    const amount = Math.max(1, Math.floor(numberOr(count, 1)));
    state.checklistLog.push({ count: amount, at: new Date().toISOString() });
    state.checklistLog = state.checklistLog.slice(-100);
    state.stats.checklistsCompleted += amount;
    const xp = addXp(state, 2 * amount);
    if (state.stats.checklistsCompleted >= 10) {
      grantBadge(state, 'projectTamer');
    }
    persistState(state, previousProgress);
    return { xp };
  }

  function evaluateProfileCompletion(profile) {
    const state = ensureState();
    const previousProgress = resolveProgress(state.totalXp);
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
      persistState(state, previousProgress);
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
      criteria: def.criteria || null,
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

    const profileName = profileRaw?.name && profileRaw.name.trim() ? profileRaw.name.trim() : 'Pengguna Abelion';
    const titleInfo = resolveTitleInfo(progress.level, profileRaw?.title);
    const tierLabel = tier.label || tier.name;
    const tierHint = buildTierHint(tier, progress);
    const titleHint = buildTitleHint(titleInfo);

    return {
      name: profileName,
      title: titleInfo.title,
      titleSource: titleInfo.source,
      titleHint,
      titleNext: titleInfo.nextTitle ? { ...titleInfo.nextTitle } : null,
      photo: profileRaw?.photo || '',
      level: progress.level,
      tier: tierLabel,
      tierId: tier.id,
      tierHint,
      tierRange: { min: tier.min, max: tier.max },
      totalXp: progress.totalXp,
      xpCurrent: progress.xpInLevel,
      xpTarget: progress.xpForNext || progress.xpInLevel,
      xpPercent: progress.percent,
      xpToNext: progress.xpToNext,
      nextLevelHint: buildNextLevelHint(progress),
      badges,
      badgeIcons: badgeIcons.slice(0, 12),
      activeBadge,
      stats: clone(state.stats),
      xpHistory: clone(state.xpHistory),
      xpGuideUrl: XP_GUIDE_URL
    };
  }

  function showLevelUpCelebration(newLevel) {
    if (typeof document === 'undefined') return;
    const existing = document.querySelector('.level-up-modal');
    if (existing) {
      existing.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'level-up-modal';
    modal.innerHTML = `
      <div class="level-up-content">
        <div class="level-up-confetti"><svg viewBox="0 0 24 24" width="48" height="48" fill="var(--primary)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
        <h2>Level Up!</h2>
        <div class="level-up-number">${newLevel}</div>
        <p>Kamu telah mencapai level ${newLevel}!</p>
        <button class="primary-btn" type="button">Lanjutkan</button>
      </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 250);
    };

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    const button = modal.querySelector('button');
    if (button) {
      button.addEventListener('click', closeModal);
    }

    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
  }

  function recordSecretNoteUsed() {
    const state = ensureState();
    const previousProgress = resolveProgress(state.totalXp);

    // Logic: If user has at least 5 notes (created or updated) that are marked secret
    // But since we don't track secret status in the gamification state's notes map yet,
    // let's just increment a flag or count.
    state.stats.secretNotesCreated = (state.stats.secretNotesCreated || 0) + 1;

    if (state.stats.secretNotesCreated >= 5) {
      grantBadge(state, 'purist');
    }

    persistState(state, previousProgress);
  }

  global.AbelionGamification = {
    getCustomSpecialDays,
    addCustomSpecialDay,
    deleteCustomSpecialDay,
    trackDailyLogin,
    recordNoteCreated,
    recordNoteUpdated,
    recordNoteDeleted,
    recordSecretNoteUsed,
    recordChecklistCompletion,
    evaluateProfileCompletion,
    getBadgeCatalog,
    getProfileSummary,
    refreshStateCache,
    admin,
    xpGuideUrl: XP_GUIDE_URL
  };
})(window);
