(function() {
  const { STORAGE_KEYS, sanitizeText, sanitizeRichContent, formatTanggal } = AbelionUtils;
  const Storage = window.AbelionStorage;
  const Gamification = window.AbelionGamification || null;
  const NoteEditor = window.NoteEditorModal;

  function updateTime() {
    const el = document.getElementById('top-time');
    if (!el) return;
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  async function loadNotes() { await Storage.ready; return Storage.getNotes({ sortByUpdatedAt: true }); }
  async function saveNotes(notes) { await Storage.setNotes(notes); }

  function renderMissingState() {
    const container = document.querySelector('.note-detail-container');
    if (container) {
      container.innerHTML = `
        <div class="note-empty-card">
          <p>Catatan tidak ditemukan.</p>
          <div class="note-empty-actions">
            <a href="index.html" class="back-link">&larr; Kembali ke beranda</a>
          </div>
        </div>
      `;
    }
    const timeEl = document.getElementById('top-time');
    if (timeEl) {
      timeEl.textContent = '—';
    }
  }

  function toMarkdown(note) {
    if (note.contentMarkdown) return note.contentMarkdown;
    if (NoteEditor && typeof NoteEditor.toMarkdown === 'function') {
      return NoteEditor.toMarkdown(note.content || '') || '';
    }
    if (typeof note.content === 'string' && note.content.match(/^<ul>/)) {
      const temp = document.createElement('div');
      temp.innerHTML = note.content;
      return Array.from(temp.querySelectorAll('li')).map(li => li.textContent).join('\n');
    }
    return note.content || '';
  }

  async function populateForm(note, notes) {
    const iconEl = document.getElementById('edit-icon');
    const titleEl = document.getElementById('edit-title');
    const contentEl = document.getElementById('edit-content');
    const labelEl = document.getElementById('edit-label');
    if (!iconEl || !titleEl || !contentEl || !labelEl) return;

    iconEl.value = note.icon || '';
    titleEl.value = note.title;

    contentEl.value = toMarkdown(note);

    if (!note.createdAt) {
      let fallbackDate = note.date ? new Date(`${note.date}T12:00:00`) : new Date();
      if (Number.isNaN(fallbackDate.getTime())) {
        fallbackDate = new Date();
      }
      note.createdAt = fallbackDate.toISOString();
      await saveNotes(notes);
    }

    labelEl.value = note.label || '';

    const dateEl = document.getElementById('note-detail-date');
    if (dateEl) {
      dateEl.textContent = `Ditulis: ${formatTanggal(note.date) || ''}`;
    }
  }

  function bindActions(note, notes) {
    const form = document.getElementById('note-edit-form');
    if (form) {
      form.onsubmit = async function(e) {
        e.preventDefault();
        const icon = sanitizeText(document.getElementById('edit-icon').value.trim()).slice(0, 2);
        const title = sanitizeText(document.getElementById('edit-title').value.trim());
        const content = document.getElementById('edit-content').value.trim();
        const label = sanitizeText(document.getElementById('edit-label').value.trim());
        const htmlContent = NoteEditor && typeof NoteEditor.toHtml === 'function'
          ? NoteEditor.toHtml(content)
          : (content.includes('\n')
            ? '<ul>' + content.split('\n').map(x => `<li>${sanitizeText(x)}</li>`).join('') + '</ul>'
            : sanitizeText(content));

        note.icon = icon;
        note.title = title;
        note.content = sanitizeRichContent(htmlContent);
        note.contentMarkdown = content;
        note.label = label;
        const updatedAt = new Date().toISOString();
        note.updatedAt = updatedAt;
        await saveNotes(notes);

        if (Gamification && note?.id) {
          Gamification.recordNoteUpdated({
            id: note.id,
            updatedAt,
            createdAt: note.createdAt || note.date
          });
        }

        alert('Catatan telah disimpan!');
        window.location.href = 'index.html';
      };
    }

    const cancelEditBtn = document.getElementById('cancel-edit');
    if (cancelEditBtn) {
      cancelEditBtn.onclick = function() {
        if (confirm('Batal edit?')) window.location.href = 'index.html';
      };
    }

    const backLink = document.getElementById('back-link');
    if (backLink) {
      backLink.onclick = function() {
        sessionStorage.setItem('skipIntro', '1');
      };
    }
  }

  async function init() {
    await Storage.ready;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const notes = await loadNotes();
    const note = notes.find((n) => n.id === id);

    if (!note) {
      renderMissingState();
      return;
    }

    updateTime();
    setInterval(updateTime, 1000);

    await populateForm(note, notes);
    bindActions(note, notes);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
