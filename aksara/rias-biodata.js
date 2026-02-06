(async function () {
  const { STORAGE_KEYS, sanitizeText } = AbelionUtils;
  const Storage = window.AbelionStorage;
  const Gamification = window.AbelionGamification || null;
  const XP_GUIDE_URL = 'https://olivx.gitbook.io/abelion-notes/getting-started/claim-exp';

  const DEFAULT_PROFILE = {
    name: 'Penyusun',
    title: '',
    bio: '',
    link: '',
    photo: '',
    badges: [],
    activeBadge: ''
  };

  const cloneDefaultProfile = () => ({
    ...DEFAULT_PROFILE,
    badges: [...DEFAULT_PROFILE.badges]
  });

  async function loadProfile() {
    await Storage.ready;
    let stored = null;
    try {
      stored = await Storage.getValue(STORAGE_KEYS.PROFILE, null);
    } catch (error) {
      if (error?.code !== 'STORAGE_LOCKED') console.error(error);
    }
    if (!stored) return cloneDefaultProfile();

    const badges = Array.isArray(stored.badges)
      ? stored.badges.map((item) => sanitizeText(String(item || '').trim())).filter(Boolean)
      : [];

    const profile = {
      ...cloneDefaultProfile(),
      ...stored,
      badges,
      activeBadge: sanitizeText(String(stored.activeBadge || '').trim())
        || badges[0]
        || DEFAULT_PROFILE.activeBadge
    };

    if (typeof profile.photo !== 'string') profile.photo = '';
    if (typeof profile.bio !== 'string') profile.bio = '';
    if (typeof profile.link !== 'string') profile.link = '';

    return profile;
  }

  let profileState = await loadProfile();

  function computeBadgeOptions() {
    const map = new Map();
    const summary = Gamification?.getProfileSummary?.();
    const catalog = Gamification?.getBadgeCatalog?.() || [];
    const catalogById = new Map(catalog.map((item) => [item.id, item]));

    const addOption = (option) => {
      if (!option) return;
      const icon = option.icon ? option.icon.trim() : '';
      if (!icon) return;
      const key = option.key || `${option.id || 'icon'}-${icon}-${option.meta?.tier || 0}`;
      if (!map.has(key)) {
        map.set(key, {
          id: option.id || null,
          icon,
          name: option.name && option.name.trim() ? option.name.trim() : icon,
          meta: option.meta || {}
        });
      }
    };

    if (summary?.badges?.length) {
      summary.badges.forEach((item) => {
        if (!item?.icon) return;
        const definition = catalogById.get(item.id);
        addOption({
          key: `${item.id || item.icon}-${item.tier || 0}`,
          id: item.id || null,
          icon: item.icon,
          name: item.name || definition?.name || item.icon,
          meta: {
            tier: item.tier || null,
            earnedAt: item.earnedAt || '',
            xp: item.xpReward || definition?.xp || '',
            criteria: definition?.criteria || definition?.description || ''
          }
        });
      });
    }

    if (Array.isArray(profileState.badges)) {
      profileState.badges
        .map((icon) => sanitizeText(String(icon || '').trim()))
        .filter(Boolean)
        .forEach((icon) => {
          addOption({
            key: `profile-${icon}`,
            icon,
            name: icon,
            meta: {}
          });
        });
    }

    DEFAULT_PROFILE.badges.forEach((icon) => {
      addOption({
        key: `default-${icon}`,
        icon,
        name: icon,
        meta: {}
      });
    });

    if (profileState.activeBadge && !Array.from(map.values()).some((option) => option.icon === profileState.activeBadge)) {
      addOption({
        key: `active-${profileState.activeBadge}`,
        icon: profileState.activeBadge,
        name: profileState.activeBadge,
        meta: {}
      });
    }

    return Array.from(map.values());
  }

  function updateAvatarPreview(source) {
    const avatar = document.getElementById('profile-avatar');
    if (!avatar) return;
    if (source) {
      avatar.src = source;
      avatar.classList.remove('is-empty');
      avatar.alt = 'Foto profil terkini';
    } else {
      avatar.src = '../pustaka/Avatar_Bawaan.svg';
      avatar.classList.add('is-empty');
      avatar.alt = 'Belum ada foto profil';
    }
  }

  function formatEarnedDate(isoDate) {
    if (!isoDate) return '';
    try {
      const parsed = new Date(isoDate);
      if (Number.isNaN(parsed.getTime())) return '';
      return parsed.toLocaleDateString('id-ID');
    } catch (error) {
      return '';
    }
  }

  function handleBadgeSelect(button) {
    const container = document.getElementById('badge-list');
    if (!container || !button) return;
    container.querySelectorAll('.badge-choice').forEach((node) => {
      node.classList.remove('is-active');
      node.setAttribute('aria-selected', 'false');
    });
    button.classList.add('is-active');
    button.setAttribute('aria-selected', 'true');
    profileState.activeBadge = button.dataset.icon || '';
    updateBadgeHint();
  }

  function createBadgeButton(option, activeBadge) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'badge-choice';
    button.dataset.icon = option.icon || '';
    button.dataset.label = option.name || '';
    button.dataset.tier = option.meta?.tier ? String(option.meta.tier) : '';
    button.dataset.xp = option.meta?.xp ? String(option.meta.xp) : '';
    button.dataset.criteria = option.meta?.criteria || '';
    button.dataset.earnedAt = option.meta?.earnedAt || '';
    button.setAttribute('role', 'option');

    const iconSpan = document.createElement('span');
    iconSpan.className = 'badge-choice-icon';
    iconSpan.textContent = option.icon || '—';

    const info = document.createElement('div');
    info.className = 'badge-choice-info';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'badge-choice-title';
    titleSpan.textContent = option.icon ? option.name || 'Badge' : 'Tanpa badge';
    info.appendChild(titleSpan);

    const metaParts = [];
    if (option.meta?.xp) metaParts.push(`+${option.meta.xp} XP`);
    if (option.meta?.tier) metaParts.push(`Tier ${option.meta.tier}`);
    if (option.meta?.criteria) metaParts.push(option.meta.criteria);
    if (metaParts.length) {
      const meta = document.createElement('span');
      meta.className = 'badge-choice-meta';
      meta.textContent = metaParts.join(' • ');
      info.appendChild(meta);
    }

    const earnedLabel = formatEarnedDate(option.meta?.earnedAt);
    if (earnedLabel) {
      const earned = document.createElement('span');
      earned.className = 'badge-choice-earned';
      earned.textContent = `Diraih ${earnedLabel}`;
      info.appendChild(earned);
    }

    button.append(iconSpan, info);

    const isActive = (option.icon || '') === (activeBadge || '');
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');

    if (!option.icon) {
      button.classList.add('is-neutral');
    }

    const titleParts = [];
    if (option.icon) titleParts.push(`Badge ${option.icon}`);
    if (option.name && option.name !== option.icon) titleParts.push(option.name);
    if (option.meta?.tier) titleParts.push(`Tier ${option.meta.tier}`);
    if (option.meta?.xp) titleParts.push(`+${option.meta.xp} XP`);
    if (option.meta?.criteria) titleParts.push(option.meta.criteria);
    button.title = titleParts.join(' • ') || 'Tidak ada badge';

    button.addEventListener('click', () => handleBadgeSelect(button));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleBadgeSelect(button);
      }
    });
    return button;
  }

  function renderBadgeOptions(activeBadge) {
    const container = document.getElementById('badge-list');
    if (!container) return;
    container.innerHTML = '';
    const options = computeBadgeOptions();
    const defaultOption = { icon: '', name: 'Tanpa badge', meta: {} };
    container.appendChild(createBadgeButton(defaultOption, activeBadge));

    if (!options.length) {
      const empty = document.createElement('div');
      empty.className = 'badge-empty-state badge-empty-state--compact';
      empty.innerHTML = `
        <div class="badge-empty-copy">
          <div class="badge-empty-icon"><svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" style="opacity:0.5"><path d="M12 15l-2 5 2 2 2-2-2-5z"></path><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"></path><circle cx="12" cy="7" r="7"></circle></svg></div>
          <p>Pencapaian akan muncul setelah Anda membuka kualifikasi.</p>
          <a href="${XP_GUIDE_URL}" class="badge-guide-link" target="_blank" rel="noopener">Pelajari cara kualifikasi XP</a>
        </div>
      `;
      container.appendChild(empty);
      updateBadgeHint();
      return;
    }

    options.forEach((option) => {
      container.appendChild(createBadgeButton(option, activeBadge));
    });
    updateBadgeHint();
  }

  function getSelectedBadges() {
    return Array.from(document.querySelectorAll('#badge-list .badge-choice'))
      .map((button) => button.dataset.icon || '')
      .filter(Boolean);
  }

  function getActiveBadge() {
    const active = document.querySelector('#badge-list .badge-choice.is-active');
    return active ? active.dataset.icon || '' : '';
  }

  function compressImage(file) {
    const MAX_DIMENSION = 240;
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const ratio = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Use lower quality for storage efficiency
        resolve(canvas.toDataURL('image/jpeg', 0.70));
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Gagal memuat gambar'));
      };

      img.src = objectUrl;
    });
  }

  const MAX_PHOTO_SIZE_KB = 500;

  async function handlePhotoChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate size
    if (file.size > MAX_PHOTO_SIZE_KB * 1024) {
      alert(`File terlalu besar. Maksimal ${MAX_PHOTO_SIZE_KB}KB.`);
      event.target.value = '';
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar.');
      event.target.value = '';
      return;
    }

    try {
      // Revoke old object URL if exists to preventing memory leaks
      // (Although we are storing base64 strings mostly, if we used ObjectURLs this would be critical)
      // Since we use DataURL, the memory is in the string. 
      // The issue #13 mentions "Object URL tidak di-revoke". 
      // In compressImage, we assign event.target.result to img.src.
      // But we are using readAsDataURL, so it's a base64 string, not an object URL.
      // However, if we switch to createObjectURL for performance, we MUST revoke.
      // For now, sticking to logic but ensuring cleanup.

      const compressed = await compressImage(file);
      profileState.photo = compressed;
      updateAvatarPreview(compressed);
    } catch (error) {
      console.error('Gagal memproses gambar', error);
      alert('Gambar tidak dapat diproses. Coba gunakan gambar lain.');
    } finally {
      event.target.value = '';
    }
  }

  function sanitizeLink(input) {
    const trimmed = sanitizeText(String(input || '')).trim();
    if (!trimmed) return '';
    const normalized = trimmed.replace(/\s+/g, '');
    if (!/^https?:\/\//i.test(normalized)) {
      return `https://${normalized}`;
    }
    return normalized;
  }

  function updateBadgeHint() {
    const hint = document.getElementById('badge-hint');
    if (!hint) return;
    const active = document.querySelector('#badge-list .badge-choice.is-active');
    if (!active || !(active.dataset.icon || '')) {
      hint.textContent = 'Profil akan disimpan tanpa badge aktif. Kamu bisa fokus mengejar XP terlebih dahulu.';
      return;
    }
    const label = active.dataset.label || active.dataset.icon;
    const detailParts = [];
    if (active.dataset.tier) detailParts.push(`Tier ${active.dataset.tier}`);
    if (active.dataset.xp) detailParts.push(`+${active.dataset.xp} XP`);
    if (active.dataset.criteria) detailParts.push(active.dataset.criteria);
    const detailText = detailParts.length ? ` (${detailParts.join(' • ')})` : '';
    hint.textContent = `Badge ${label}${detailText} akan tampil di profil.`;
  }

  function populateForm() {
    updateAvatarPreview(profileState.photo);
    const nameInput = document.getElementById('profile-name');
    const titleInput = document.getElementById('profile-title');
    const bioInput = document.getElementById('profile-bio');
    const linkInput = document.getElementById('profile-link');

    if (nameInput) nameInput.value = profileState.name || '';
    if (titleInput) titleInput.value = profileState.title || '';
    if (bioInput) bioInput.value = profileState.bio || '';
    if (linkInput) linkInput.value = profileState.link || '';

    renderBadgeOptions(profileState.activeBadge);
    renderCustomDays();
  }

  async function renderCustomDays() {
    const container = document.getElementById('custom-days-list');
    if (!container) return;
    container.innerHTML = '';
    const days = await Gamification.getCustomSpecialDays();

    if (days.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; text-align: center;">Belum ada hari spesial kustom.</p>';
      return;
    }

    days.forEach(day => {
      const el = document.createElement('div');
      el.className = 'list-item';
      el.style.justifyContent = 'space-between';
      el.style.padding = '8px 0';
      el.innerHTML = `
        <div style="display: flex; flex-direction: column;">
          <span style="font-weight: 600; font-size: 14px;">${day.name}</span>
          <span style="font-size: 12px; color: var(--text-muted);">${day.day} ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][day.month]}</span>
        </div>
        <button type="button" class="ghost-btn delete-day-btn" data-id="${day.id}" style="color: var(--danger); font-size: 12px; padding: 4px 8px;">Hapus</button>
      `;
      container.appendChild(el);
    });

    container.querySelectorAll('.delete-day-btn').forEach(btn => {
      btn.onclick = async () => {
        await Gamification.deleteCustomSpecialDay(btn.dataset.id);
        renderCustomDays();
      };
    });
  }

  async function handleAddDay() {
    const nameInput = document.getElementById('new-day-name');
    const dateInput = document.getElementById('new-day-date');
    if (!nameInput || !dateInput) return;

    const name = nameInput.value.trim();
    const dateStr = dateInput.value;
    if (!name || !dateStr) {
      alert('Nama dan tanggal harus diisi.');
      return;
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      alert('Tanggal tidak valid.');
      return;
    }

    await Gamification.addCustomSpecialDay(date.getMonth(), date.getDate(), name);
    nameInput.value = '';
    dateInput.value = '';
    renderCustomDays();
  }

  function clearAvatar() {
    profileState.photo = '';
    updateAvatarPreview('');
  }

  async function resetProfile() {
    const ok = await AbelionUtils.confirmAction('Reset Profil', 'Apakah Anda yakin ingin menghapus semua data profil dan pencapaian?');
    if (!ok) return;
    profileState = cloneDefaultProfile();
    await Storage.setValue(STORAGE_KEYS.PROFILE, profileState);
    populateForm();
    const photoInput = document.getElementById('photo-input');
    if (photoInput) photoInput.value = '';
    alert('Profil telah direset.');
  }

  async function saveProfile() {
    const nameInput = document.getElementById('profile-name');
    const titleInput = document.getElementById('profile-title');
    const bioInput = document.getElementById('profile-bio');
    const linkInput = document.getElementById('profile-link');

    const name = sanitizeText((nameInput?.value || '').trim()).slice(0, 40) || DEFAULT_PROFILE.name;
    const title = sanitizeText((titleInput?.value || '').trim()).slice(0, 32) || DEFAULT_PROFILE.title;
    const bio = sanitizeText((bioInput?.value || '').trim()).slice(0, 160);
    const link = sanitizeLink(linkInput?.value || '');
    const badges = Array.from(new Set(getSelectedBadges()));
    const activeBadge = getActiveBadge();

    const updated = {
      ...profileState,
      name,
      title,
      bio,
      link,
      badges,
      activeBadge,
      updatedAt: new Date().toISOString()
    };

    profileState = updated;
    const success = await Storage.setValue(STORAGE_KEYS.PROFILE, updated).then(() => true).catch(() => false);
    if (!success) {
      alert('Profil gagal disimpan. Coba lagi.');
      return;
    }
    if (Gamification?.evaluateProfileCompletion) {
      Gamification.evaluateProfileCompletion(updated);
    }
    alert('Profil disimpan!');
    window.location.href = 'biodata.html';
  }

  function init() {
    const form = document.getElementById('profile-form');
    const photoInput = document.getElementById('photo-input');
    const uploadBtn = document.getElementById('avatar-upload-btn');
    const removeBtn = document.getElementById('avatar-remove-btn');
    const resetBtn = document.getElementById('reset-profile-btn');
    const backBtn = document.getElementById('back-btn');
    const versionBtn = document.getElementById('version-btn');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        sessionStorage.setItem('skipIntro', '1');
        window.location.href = 'biodata.html';
      });
    }

    if (versionBtn) {
      versionBtn.addEventListener('click', () => {
        window.location.href = 'riwayat.html';
      });
    }

    if (uploadBtn && photoInput) {
      uploadBtn.addEventListener('click', () => photoInput.click());
    }

    if (photoInput) {
      photoInput.addEventListener('change', handlePhotoChange);
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', clearAvatar);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', resetProfile);
    }

    const addDayBtn = document.getElementById('add-day-btn');
    if (addDayBtn) {
      addDayBtn.addEventListener('click', handleAddDay);
    }

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        saveProfile();
      });
    }

    populateForm();
    window.resetProfile = resetProfile;
    window.saveProfile = saveProfile;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
