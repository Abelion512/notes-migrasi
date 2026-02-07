(function() {
  const { _STORAGE_KEYS, sanitizeText, sanitizeRichContent, formatTanggal } = AbelionUtils;
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
    const blockArea = document.getElementById('edit-content-blocks');
    const labelEl = document.getElementById('edit-label');

    const coverArea = document.getElementById('note-cover-area');
    const coverImg = document.getElementById('note-cover-img');

    if (!iconEl || !titleEl || !blockArea || !labelEl) return;

    iconEl.value = note.icon || '📝';
    if (iconTrigger) iconTrigger.textContent = note.icon || '📝';
    titleEl.value = note.title;

    if (note.cover) {
       coverArea.style.display = 'block';
       coverImg.src = note.cover;
    }

    if (NoteEditor && typeof NoteEditor.toHtml === 'function') {
      blockArea.innerHTML = NoteEditor.toHtml(toMarkdown(note));
    } else {
      blockArea.innerText = toMarkdown(note);
    }

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

    const coverArea = document.getElementById('note-cover-area');
    const coverImg = document.getElementById('note-cover-img');
    const changeCoverBtn = document.getElementById('change-cover-btn');

    if (changeCoverBtn) {
      changeCoverBtn.onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              coverArea.style.display = 'block';
              coverImg.src = ev.target.result;
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      };
    }

    // --- Slash Menu & Toolbar for Dedicated Page ---
    const blockArea = document.getElementById('edit-content-blocks');
    const slashMenuEl = document.getElementById('slash-menu');
    let slashIndex = 0;
    let slashQuery = '';

    const slashCommands = [
      { id: 'h1', label: 'Heading 1', icon: 'H1', keywords: ['h1', 'heading', 'judul', 'besar'], action: () => document.execCommand('formatBlock', false, 'h1') },
      { id: 'h2', label: 'Heading 2', icon: 'H2', keywords: ['h2', 'heading', 'subjudul'], action: () => document.execCommand('formatBlock', false, 'h2') },
      { id: 'h3', label: 'Heading 3', icon: 'H3', keywords: ['h3', 'heading', 'kecil'], action: () => document.execCommand('formatBlock', false, 'h3') },
      { id: 'todo', label: 'To-do List', icon: '☐', keywords: ['todo', 'check', 'tugas', 'daftar'], action: () => insertCheckbox() },
      { id: 'bullet', label: 'Bulleted List', icon: '•', keywords: ['list', 'bullet', 'poin'], action: () => document.execCommand('insertUnorderedList') },
      { id: 'quote', label: 'Quote', icon: '"', keywords: ['quote', 'kutipan'], action: () => document.execCommand('formatBlock', false, 'blockquote') },
      { id: 'toggle', label: 'Toggle List', icon: '▶', keywords: ['toggle', 'lipat', 'dropdown'], action: () => insertToggle() },
      { id: 'code', label: 'Code Block', icon: '</>', keywords: ['code', 'kode', 'pre'], action: () => document.execCommand('formatBlock', false, 'pre') },
      { id: 'img', label: 'Image', icon: '🖼️', keywords: ['image', 'gambar', 'foto', 'upload'], action: () => triggerImageUpload() }
    ];

    function insertToggle() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const details = document.createElement('details');
      details.className = 'notion-toggle';
      details.innerHTML = '<summary>Toggle</summary><div class="toggle-content">Mulai menulis...</div>';
      range.deleteContents();
      range.insertNode(details);
      range.setStart(details.querySelector('summary'), 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function insertCheckbox() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const div = document.createElement('div');
      div.className = 'checkbox-line';
      div.innerHTML = '<input type="checkbox"> <span>&nbsp;</span>';
      range.deleteContents();
      range.insertNode(div);
      const span = div.querySelector('span');
      range.setStart(span, 0);
      range.setEnd(span, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function triggerImageUpload() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => insertImage(ev.target.result);
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }

    function insertImage(src) {
      const img = document.createElement('img');
      img.src = src;
      img.style.maxWidth = '100%';
      img.style.borderRadius = '12px';
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      range.insertNode(img);
      range.setStartAfter(img);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    function getFilteredCommands() {
      if (!slashQuery) return slashCommands;
      const q = slashQuery.toLowerCase();
      return slashCommands.filter(cmd =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords.some(k => k.includes(q))
      );
    }

    function renderSlashMenu() {
      if (!slashMenuEl) return;
      const filtered = getFilteredCommands();
      slashMenuEl.classList.remove('hidden');

      if (filtered.length === 0) {
        slashMenuEl.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 13px;">Tidak ada perintah</div>';
        return;
      }

      slashMenuEl.innerHTML = '';
      filtered.forEach((cmd, i) => {
        const item = document.createElement('div');
        item.className = 'slash-item' + (i === slashIndex ? ' active' : '');
        item.innerHTML = `<div class="slash-item-icon">${cmd.icon}</div> <div>${cmd.label}</div>`;
        item.onclick = () => {
          removeSlashFromEditor();
          cmd.action();
          hideSlashMenu();
          blockArea.focus();
        };
        slashMenuEl.appendChild(item);
      });
    }

    function hideSlashMenu() {
      if (slashMenuEl) slashMenuEl.classList.add('hidden');
      slashQuery = '';
      slashIndex = 0;
    }

    function removeSlashFromEditor() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      const offset = range.startOffset;
      const text = node.textContent;
      const slashPos = text.lastIndexOf('/', offset - 1);
      if (slashPos !== -1) {
        node.textContent = text.slice(0, slashPos) + text.slice(offset);
        range.setStart(node, slashPos);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    blockArea.addEventListener('input', (_e) => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;
        const textContent = node.textContent || '';
        const textBefore = textContent.slice(0, offset);

        const lastSlash = textBefore.lastIndexOf('/');
        if (lastSlash !== -1 && !textBefore.slice(lastSlash + 1).includes(' ')) {
          slashQuery = textBefore.slice(lastSlash + 1);
          const rect = range.getBoundingClientRect();
          slashMenuEl.style.left = rect.left + 'px';
          slashMenuEl.style.top = (rect.bottom + window.scrollY + 5) + 'px';
          renderSlashMenu();
        } else {
          hideSlashMenu();
        }
      }
    });

    blockArea.addEventListener('keydown', (e) => {
      if (!slashMenuEl.classList.contains('hidden')) {
        const filtered = getFilteredCommands();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          slashIndex = (slashIndex + 1) % (filtered.length || 1);
          renderSlashMenu();
        }
        else if (e.key === 'ArrowUp') {
          e.preventDefault();
          slashIndex = (slashIndex - 1 + (filtered.length || 1)) % (filtered.length || 1);
          renderSlashMenu();
        }
        else if (e.key === 'Enter') {
          if (filtered.length > 0) {
            e.preventDefault();
            removeSlashFromEditor();
            filtered[slashIndex].action();
            hideSlashMenu();
          }
        }
        else if (e.key === 'Escape') { hideSlashMenu(); }
      }
    });

    // Toolbar actions
    document.querySelectorAll('.toolbar-btn-ios').forEach(btn => {
      btn.onclick = () => {
        const cmd = btn.dataset.command;
        if (cmd === 'bold') document.execCommand('bold');
        else if (cmd === 'italic') document.execCommand('italic');
        else if (cmd === 'h1') document.execCommand('formatBlock', false, 'h1');
        else if (cmd === 'h2') document.execCommand('formatBlock', false, 'h2');
        else if (cmd === 'list') document.execCommand('insertUnorderedList');
        else if (cmd === 'check') insertCheckbox();
        else if (cmd === 'img') triggerImageUpload();
        blockArea.focus();
      };
    });

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
        const icon = document.getElementById('edit-icon').value.trim();
        const title = sanitizeText(document.getElementById('edit-title').value.trim());
        const blockArea = document.getElementById('edit-content-blocks');
        const coverImg = document.getElementById('note-cover-img');
        const coverArea = document.getElementById('note-cover-area');

        const contentHtml = blockArea.innerHTML;
        const contentMarkdown = NoteEditor && typeof NoteEditor.toMarkdown === 'function'
          ? NoteEditor.toMarkdown(contentHtml)
          : blockArea.innerText;

        const label = sanitizeText(document.getElementById('edit-label').value.trim());

        note.icon = icon;
        note.cover = coverArea.style.display !== 'none' ? coverImg.src : null;
        note.title = title;
        note.content = sanitizeRichContent(contentHtml);
        note.contentMarkdown = contentMarkdown;
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
      cancelEditBtn.onclick = async function() {
        const ok = await AbelionUtils.confirmAction('Batal Edit', 'Apakah Anda yakin ingin membatalkan perubahan?');
        if (ok) window.location.href = '../index.html';
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
