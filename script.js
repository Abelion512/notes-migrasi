const NoteEditor = window.NoteEditorModal;
const {
  sanitizeText,
  sanitizeRichContent
} = window.AbelionUtils || { sanitizeText: (v) => v || '', sanitizeRichContent: (v) => v };

// Sederhana, tersimpan di memori (refresh = hilang)
let groups = [
  { name: "Juni 2025", type: "Bulan", meta: "Juni 2025", notes: [{ title: "Catatan pertama!", markdown: "Catatan pertama!" }] },
  { name: "Happy", type: "Mood", meta: "😊 Mood: Happy", notes: [] },
];

function renderGroupNote(markdown) {
  if (NoteEditor && typeof NoteEditor.toHtml === 'function') {
    return NoteEditor.toHtml(markdown);
  }
  return sanitizeRichContent(sanitizeText(markdown));
}

function renderGroups() {
  const groupsList = document.getElementById('groups-list');
  if (!groupsList) return;
  groupsList.innerHTML = '';
  groups.forEach((group) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-card';
    groupDiv.innerHTML = `
      <div class="group-header">
        <span class="group-title">${sanitizeText(group.name)}</span>
        <span class="group-meta">${sanitizeText(group.meta)}</span>
      </div>
      <div class="notes-list">
        ${group.notes.map(note => {
          const markdown = typeof note === 'string' ? note : note.markdown;
          const title = typeof note === 'string' ? '' : note.title || '';
          return `<div class="note">${title ? `<strong>${sanitizeText(title)}</strong><br/>` : ''}${renderGroupNote(markdown)}</div>`;
        }).join('')}
      </div>
    `;
    groupsList.appendChild(groupDiv);
  });
}

function openGroupForm() {
  const overlay = document.createElement('div');
  overlay.className = 'note-editor-modal';
  overlay.innerHTML = `
    <div class="note-editor-dialog" role="dialog" aria-modal="true" aria-label="Tambah group">
      <div class="note-editor-header">
        <div>
          <p class="note-editor-subtitle">Tambah group baru</p>
          <h3 class="note-editor-title">Group Catatan</h3>
        </div>
        <button type="button" class="editor-close">×</button>
      </div>
      <form class="note-editor-form">
        <div class="note-editor-row">
          <label for="group-type">Tipe</label>
          <select id="group-type" required class="note-editor-area">
            <option value="bulan">Bulan</option>
            <option value="mood">Mood</option>
          </select>
        </div>
        <div class="note-editor-row">
          <label for="group-name">Nama</label>
          <input id="group-name" maxlength="40" required />
        </div>
        <div class="note-editor-actions">
          <button type="button" class="btn-ghost" data-action="cancel">Tutup</button>
          <button type="submit" class="btn-blue">Simpan</button>
        </div>
      </form>
    </div>
  `;
  const form = overlay.querySelector('form');
  const close = () => {
    document.body.classList.remove('modal-open');
    overlay.remove();
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.editor-close').onclick = close;
  form.querySelector('[data-action="cancel"]').onclick = close;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const type = form.querySelector('#group-type').value;
    const name = sanitizeText(form.querySelector('#group-name').value.trim());
    if (!name) return;
    const meta = type === 'mood' ? `😊 Mood: ${name}` : name;
    groups.push({ name, type: type === 'mood' ? 'Mood' : 'Bulan', meta, notes: [] });
    renderGroups();
    close();
  });
  document.body.classList.add('modal-open');
  document.body.appendChild(overlay);
  form.querySelector('#group-name').focus();
}

function openGroupPicker(onSelect) {
  const overlay = document.createElement('div');
  overlay.className = 'note-editor-modal';
  overlay.innerHTML = `
    <div class="note-editor-dialog" role="dialog" aria-modal="true" aria-label="Pilih group">
      <div class="note-editor-header">
        <div>
          <p class="note-editor-subtitle">Pilih group</p>
          <h3 class="note-editor-title">Tambah catatan ke</h3>
        </div>
        <button type="button" class="editor-close">×</button>
      </div>
      <form class="note-editor-form">
        <div class="note-editor-row">
          <label for="group-select">Group</label>
          <select id="group-select" class="note-editor-area">
            ${groups.map((g, idx) => `<option value="${idx}">${sanitizeText(g.name)} (${g.type})</option>`).join('')}
          </select>
        </div>
        <div class="note-editor-actions">
          <button type="button" class="btn-ghost" data-action="cancel">Tutup</button>
          <button type="submit" class="btn-blue">Lanjut</button>
        </div>
      </form>
    </div>
  `;
  const form = overlay.querySelector('form');
  const close = () => {
    document.body.classList.remove('modal-open');
    overlay.remove();
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.editor-close').onclick = close;
  form.querySelector('[data-action="cancel"]').onclick = close;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const idx = parseInt(form.querySelector('#group-select').value, 10);
    close();
    if (Number.isInteger(idx) && typeof onSelect === 'function') onSelect(idx);
  });
  document.body.classList.add('modal-open');
  document.body.appendChild(overlay);
  form.querySelector('#group-select').focus();
}

function openFallbackNoteModal(group, idx) {
  const overlay = document.createElement('div');
  overlay.className = 'note-editor-modal';
  overlay.innerHTML = `
    <div class="note-editor-dialog" role="dialog" aria-modal="true" aria-label="Catatan group">
      <div class="note-editor-header">
        <div>
          <p class="note-editor-subtitle">Tambah catatan</p>
          <h3 class="note-editor-title">${sanitizeText(group.name)}</h3>
        </div>
        <button type="button" class="editor-close">×</button>
      </div>
      <form class="note-editor-form">
        <div class="note-editor-row">
          <label for="fallback-title">Judul</label>
          <input id="fallback-title" maxlength="80" required />
        </div>
        <div class="note-editor-row">
          <label for="fallback-content">Isi catatan</label>
          <textarea id="fallback-content" class="note-editor-area" maxlength="400" required></textarea>
        </div>
        <div class="note-editor-actions">
          <button type="button" class="btn-ghost" data-action="cancel">Tutup</button>
          <button type="submit" class="btn-blue">Simpan</button>
        </div>
      </form>
    </div>
  `;
  const form = overlay.querySelector('form');
  const close = () => {
    document.body.classList.remove('modal-open');
    overlay.remove();
  };
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('.editor-close').onclick = close;
  form.querySelector('[data-action="cancel"]').onclick = close;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = sanitizeText(form.querySelector('#fallback-title').value.trim());
    const markdown = sanitizeText(form.querySelector('#fallback-content').value.trim());
    if (!title || !markdown) return;
    group.notes.push({ title, markdown });
    renderGroups();
    close();
  });
  document.body.classList.add('modal-open');
  document.body.appendChild(overlay);
  form.querySelector('#fallback-title').focus();
}

document.getElementById('add-group-btn').onclick = function() {
  openGroupForm();
};

document.getElementById('add-note-btn').onclick = function() {
  if(groups.length === 0) {
    openGroupForm();
    return;
  }
  openGroupPicker((idx) => {
    const group = groups[idx];
    if (!group) return;
    if (!NoteEditor || typeof NoteEditor.open !== 'function') {
      openFallbackNoteModal(group, idx);
      return;
    }
    NoteEditor.open({
      mode: 'create',
      draftKey: `group-${idx}-note`,
      onSave: (payload) => {
        group.notes.push({ title: payload.title, markdown: payload.contentMarkdown });
        renderGroups();
      }
    });
  });
};

renderGroups();
