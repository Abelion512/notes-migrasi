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
  async function saveNotes(notes, onlyDirty = false) { await Storage.setNotes(notes, { onlyDirty }); }

  function renderMissingState() {
    const container = document.querySelector('.main-content');
    if (container) {
      container.innerHTML = `
        <div class="section-card" style="padding: 40px; text-align: center;">
          <p style="margin-bottom: 20px; color: var(--text-secondary);">Catatan tidak ditemukan atau telah dihapus.</p>
          <a href="../index.html" class="btn-blue" style="text-decoration: none; display: inline-flex;">Kembali ke Beranda</a>
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
    const iconTrigger = document.getElementById('edit-icon-trigger');
    const titleEl = document.getElementById('edit-title');
    const contentEl = document.getElementById('edit-content');
    const labelEl = document.getElementById('edit-label');
    if (!iconEl || !titleEl || !contentEl || !labelEl) return;

    iconEl.value = note.icon || '📁';
    if (iconTrigger) iconTrigger.textContent = note.icon || '📁';
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
    const iconTrigger = document.getElementById('edit-icon-trigger');
    const iconInput = document.getElementById('edit-icon');

    if (iconTrigger && iconInput) {
      iconTrigger.onclick = (e) => {
        e.stopPropagation();
        let pickerContainer = document.getElementById('emoji-picker-container');
        if (pickerContainer) {
          pickerContainer.classList.toggle('hidden');
          return;
        }

        pickerContainer = document.createElement('div');
        pickerContainer.id = 'emoji-picker-container';
        pickerContainer.style = `
          position: absolute; top: 100%; left: 0; z-index: 1000;
          background: var(--surface); border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          border: 0.5px solid var(--border-subtle);
          margin-top: 8px; overflow: hidden;
        `;

        const picker = document.createElement('emoji-picker');
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
          picker.classList.add('dark');
        }

        pickerContainer.appendChild(picker);
        iconTrigger.parentElement.appendChild(pickerContainer);

        picker.addEventListener('emoji-click', event => {
          const emoji = event.detail.unicode;
          iconTrigger.textContent = emoji;
          iconInput.value = emoji;
          pickerContainer.classList.add('hidden');
        });

        const closePicker = (ev) => {
          if (!pickerContainer.contains(ev.target) && ev.target !== iconTrigger) {
            pickerContainer.classList.add('hidden');
            document.removeEventListener('click', closePicker);
          }
        };
        document.addEventListener('click', closePicker);
      };
    }

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
        note._dirty = true;
        const updatedAt = new Date().toISOString();
        note.updatedAt = updatedAt;
        await saveNotes(notes, true);

        if (Gamification && note?.id) {
          Gamification.recordNoteUpdated({
            id: note.id,
            updatedAt,
            createdAt: note.createdAt || note.date,
            charDiff: content.length
          });
        }

        alert('Catatan telah disimpan!');
        window.location.href = '../index.html';
      };
    }

    const cancelEditBtn = document.getElementById('cancel-edit');
    if (cancelEditBtn) {
      cancelEditBtn.onclick = function() {
        if (confirm('Batal edit?')) window.location.href = '../index.html';
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
