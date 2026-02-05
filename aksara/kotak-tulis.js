(function (global) {
  const {
    STORAGE_KEYS,
    sanitizeText,
    sanitizeRichContent,
    safeGetItem,
    safeSetItem,
    debounce,
    ModalManager
  } = global.AbelionUtils || {};

  if (!STORAGE_KEYS || !sanitizeText || !sanitizeRichContent) {
    console.warn('Modal editor requires AbelionUtils to be loaded.');
    return;
  }

  const DRAFT_KEY = STORAGE_KEYS.NOTE_DRAFTS || 'abelion-note-drafts';

  const readDrafts = () => safeGetItem(DRAFT_KEY, {});
  const writeDrafts = (drafts) => safeSetItem(DRAFT_KEY, drafts || {});

  function inlineMarkdown(input) {
    const escapeHTML = (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };
    const escaped = escapeHTML(String(input || ''));
    let text = escaped.replace(/\u00A0/g, ' ');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\[\[(.+?)\]\]/g, '<a href="#" class="wiki-link" data-target="$1">[[$1]]</a>');
    return text;
  }

  function markdownToHtml(markdown) {
    const lines = String(markdown || '').split(/\n/);
    const htmlParts = [];
    let inList = false;
    lines.forEach((line) => {
      const headingMatch = line.match(/^(#{1,3})\s+(.*)/);
      if (headingMatch) {
        if (inList) { htmlParts.push('</ul>'); inList = false; }
        const level = headingMatch[1].length;
        htmlParts.push(`<h${level + 1}>${inlineMarkdown(headingMatch[2])}</h${level + 1}>`);
        return;
      }
      const checkMatch = line.match(/^\s*\[([ xX])\]\s+(.*)/);
      if (checkMatch) {
        if (inList) { htmlParts.push('</ul>'); inList = false; }
        const checked = checkMatch[1].toLowerCase() === 'x';
        htmlParts.push(`<div class="checkbox-line"><input type="checkbox" ${checked ? 'checked' : ''} disabled> ${inlineMarkdown(checkMatch[2])}</div>`);
        return;
      }
      const listMatch = line.match(/^\s*[-*]\s+(.*)/);
      if (listMatch) {
        if (!inList) htmlParts.push('<ul>');
        inList = true;
        htmlParts.push(`<li>${inlineMarkdown(listMatch[1])}</li>`);
        return;
      }
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      if (line.trim().length) {
        htmlParts.push(`<p>${inlineMarkdown(line)}</p>`);
      }
    });
    if (inList) htmlParts.push('</ul>');
    return sanitizeRichContent(htmlParts.join(''));
  }

  function htmlToMarkdown(html) {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const container = doc.body;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const tag = node.tagName;
      const childrenText = Array.from(node.childNodes).map(walk).join('');
      switch (tag) {
        case 'LI': return `- ${childrenText}\n`;
        case 'UL': return Array.from(node.children).map(walk).join('');
        case 'STRONG': return `**${childrenText}**`;
        case 'EM': return `*${childrenText}*`;
        case 'CODE': return `\`${childrenText}\``;
        case 'P': return `${childrenText}\n`;
        case 'BR': return '\n';
        default: return childrenText;
      }
    };
    return walk(container).trim();
  }

  function buildModalShell() {
    const overlay = document.createElement('div');
    overlay.className = 'note-editor-modal';
    overlay.innerHTML = `
      <div class="note-editor-dialog" role="dialog" aria-modal="true">
        <div class="note-editor-header">
          <button type="button" class="done-btn" data-action="cancel">Batal</button>
          <div style="font-weight: 600; font-size: 17px;">Catatan</div>
          <button type="submit" form="editor-form" class="done-btn">Selesai</button>
        </div>
        <div class="note-editor-content">
          <form id="editor-form" class="note-editor-form">
            <input name="title" class="editor-title-input" placeholder="Judul" autocomplete="off" required />
            <textarea name="content" class="editor-textarea" placeholder="Mulai menulis..." autocomplete="off"></textarea>

            <div id="editor-details" class="hidden" style="margin-top: 20px; border-top: 0.5px solid var(--border-subtle); padding-top: 20px;">
              <div class="list-header">Detail Catatan</div>
              <div class="section-card" style="padding: 0;">
                <div style="display: flex; align-items: center; padding: 12px 16px; border-bottom: 0.5px solid var(--border-subtle);">
                   <span style="flex: 1; font-size: 17px;">Ikon</span>
                   <input name="icon" maxlength="2" style="width: 40px; border: none; text-align: right; background: transparent; font-size: 17px;" placeholder="📄">
                </div>
                <div style="display: flex; align-items: center; padding: 12px 16px; border-bottom: 0.5px solid var(--border-subtle);">
                   <span style="flex: 1; font-size: 17px;">Folder</span>
                   <select name="folderId" style="border: none; background: transparent; font-size: 17px; text-align: right;">
                     <option value="">(Tanpa Folder)</option>
                   </select>
                </div>
                <div style="display: flex; align-items: center; padding: 12px 16px;">
                   <span style="flex: 1; font-size: 17px;">Rahasia (Secret)</span>
                   <input type="checkbox" name="isSecret" style="width: 20px; height: 20px;">
                </div>
              </div>
            </div>
          </form>
          <div style="display: flex; justify-content: center; margin-top: 20px;">
            <button type="button" id="toggle-details-btn" class="ghost-btn" style="font-size: 15px;">Tampilkan Detail</button>
          </div>
        </div>
        <div class="editor-toolbar" style="padding: 10px; background: var(--frosted); border-top: 0.5px solid var(--border-subtle); display: flex; justify-content: center; gap: 20px;">
           <button type="button" class="toolbar-btn-ios" data-cmd="bold"><b>B</b></button>
           <button type="button" class="toolbar-btn-ios" data-cmd="italic"><i>I</i></button>
           <button type="button" class="toolbar-btn-ios" data-cmd="heading">H</button>
           <button type="button" class="toolbar-btn-ios" data-cmd="list">•</button>
        </div>
      </div>
    `;
    return overlay;
  }

  function openModalEditor(options = {}) {
    if (document.querySelector('.note-editor-modal')) return;
    const { mode = 'create', initialValue = {}, onSave, draftKey = 'new' } = options;

    const overlay = buildModalShell();
    const form = overlay.querySelector('#editor-form');
    const titleInput = form.querySelector('input[name="title"]');
    const textarea = form.querySelector('textarea[name="content"]');
    const iconInput = form.querySelector('input[name="icon"]');
    const folderSelect = form.querySelector('select[name="folderId"]');
    const secretInput = form.querySelector('input[name="isSecret"]');
    const toggleDetailsBtn = overlay.querySelector('#toggle-details-btn');
    const detailsDiv = overlay.querySelector('#editor-details');

    // Populate data
    const drafts = readDrafts();
    const draft = drafts[draftKey];

    if (draft && mode === 'create') {
      titleInput.value = draft.title || '';
      textarea.value = draft.content || '';
      iconInput.value = draft.icon || '';
      secretInput.checked = Boolean(draft.isSecret);
    } else {
      titleInput.value = initialValue.title || '';
      textarea.value = initialValue.content || '';
      iconInput.value = initialValue.icon || '';
      secretInput.checked = Boolean(initialValue.isSecret);
    }

    const saveDraft = debounce(() => {
      const currentDrafts = readDrafts();
      currentDrafts[draftKey] = {
        title: titleInput.value,
        content: textarea.value,
        icon: iconInput.value,
        isSecret: secretInput.checked,
        updatedAt: new Date().toISOString()
      };
      writeDrafts(currentDrafts);
    }, 1000);

    titleInput.addEventListener('input', saveDraft);
    textarea.addEventListener('input', saveDraft);
    iconInput.addEventListener('input', saveDraft);
    secretInput.addEventListener('change', saveDraft);

    if (global.AbelionStorage) {
      global.AbelionStorage.getFolders().then(folders => {
        folders.forEach(f => {
          const opt = document.createElement('option');
          opt.value = f.id;
          opt.textContent = f.name;
          folderSelect.appendChild(opt);
        });
        folderSelect.value = initialValue.folderId || '';
      });
    }

    toggleDetailsBtn.onclick = () => {
      detailsDiv.classList.toggle('hidden');
      toggleDetailsBtn.textContent = detailsDiv.classList.contains('hidden') ? 'Tampilkan Detail' : 'Sembunyikan Detail';
    };

    const close = () => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
      document.body.classList.remove('modal-open');
    };

    const clearDraft = () => {
      const currentDrafts = readDrafts();
      delete currentDrafts[draftKey];
      writeDrafts(currentDrafts);
    };

    overlay.querySelector('[data-action="cancel"]').onclick = () => {
      if (textarea.value.trim() || titleInput.value.trim()) {
        if (confirm('Simpan sebagai draft?')) {
          saveDraft();
        } else {
          clearDraft();
        }
      }
      close();
    };

    form.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        title: titleInput.value.trim(),
        contentMarkdown: textarea.value.trim(),
        icon: iconInput.value.trim(),
        folderId: folderSelect.value,
        isSecret: secretInput.checked,
        contentHtml: markdownToHtml(textarea.value)
      };
      if (!payload.title && !payload.contentMarkdown) {
          clearDraft();
          close();
          return;
      }
      if (typeof onSave === 'function') await onSave(payload);
      clearDraft();
      close();
    };

    // Toolbar actions
    overlay.querySelectorAll('.toolbar-btn-ios').forEach(btn => {
        btn.onclick = () => {
            const cmd = btn.dataset.cmd;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            let next = val;
            if (cmd === 'bold') next = val.slice(0, start) + '**' + val.slice(start, end) + '**' + val.slice(end);
            if (cmd === 'italic') next = val.slice(0, start) + '*' + val.slice(start, end) + '*' + val.slice(end);
            if (cmd === 'heading') next = val.slice(0, start) + '# ' + val.slice(start);
            if (cmd === 'list') next = val.slice(0, start) + '- ' + val.slice(start);
            textarea.value = next;
            textarea.focus();
        };
    });

    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');
    setTimeout(() => overlay.classList.add('show'), 10);
    titleInput.focus();

    return { close };
  }

  global.NoteEditorModal = {
    open: openModalEditor,
    toHtml: markdownToHtml,
    toMarkdown: htmlToMarkdown
  };
})(window);
