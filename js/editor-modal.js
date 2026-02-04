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

    // Wiki-links [[Link]]
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
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      if (line.trim().length) {
        htmlParts.push(`<p>${inlineMarkdown(line)}</p>`);
      }
    });
    if (inList) htmlParts.push('</ul>');
    if (!htmlParts.length) return '';
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
        case 'LI':
          return `- ${childrenText}\n`;
        case 'UL':
          return Array.from(node.children).map(walk).join('');
        case 'STRONG':
          return `**${childrenText}**`;
        case 'EM':
          return `*${childrenText}*`;
        case 'CODE':
          return `\`${childrenText}\``;
        case 'P':
          return `${childrenText}\n`;
        case 'BR':
          return '\n';
        default:
          return childrenText;
      }
    };
    return walk(container).trim();
  }

  function createUndoManager(target) {
    const history = [target.value];
    let index = 0;
    const push = (value) => {
      if (history[index] === value) return;
      history.splice(index + 1);
      history.push(value);
      if (history.length > 50) history.shift();
      index = history.length - 1;
    };
    const undo = () => {
      if (index === 0) return;
      index -= 1;
      target.value = history[index];
      target.dispatchEvent(new Event('input'));
    };
    const redo = () => {
      if (index >= history.length - 1) return;
      index += 1;
      target.value = history[index];
      target.dispatchEvent(new Event('input'));
    };
    target.addEventListener('input', () => push(target.value));
    target.addEventListener('keydown', (event) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;
      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      } else if (key === 'y') {
        event.preventDefault();
        redo();
      }
    });
    return { undo, redo, push };
  }

  function surroundSelection(textarea, wrapperStart, wrapperEnd = wrapperStart) {
    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.slice(0, selectionStart);
    const selected = value.slice(selectionStart, selectionEnd);
    const after = value.slice(selectionEnd);
    const next = `${before}${wrapperStart}${selected || ''}${wrapperEnd}${after}`;
    textarea.value = next;
    const cursor = selectionStart + wrapperStart.length + (selected ? selected.length : 0) + wrapperEnd.length;
    textarea.setSelectionRange(cursor, cursor);
    textarea.focus();
    textarea.dispatchEvent(new Event('input'));
  }

  function toggleList(textarea) {
    const { selectionStart, selectionEnd, value } = textarea;
    const before = value.slice(0, selectionStart);
    const selected = value.slice(selectionStart, selectionEnd);
    const after = value.slice(selectionEnd);
    const lines = (selected || '').split(/\n/);
    const listified = lines.map(line => line.startsWith('- ') ? line : `- ${line}`.trimEnd()).join('\n');
    const next = `${before}${listified}${after}`;
    textarea.value = next;
    const cursor = selectionStart + listified.length;
    textarea.setSelectionRange(cursor, cursor);
    textarea.focus();
    textarea.dispatchEvent(new Event('input'));
  }

  function createToolbar(textarea, undoManager) {
    const bar = document.createElement('div');
    bar.className = 'editor-toolbar';
    const buttons = [
      { label: 'B', title: 'Bold (Ctrl/Cmd+B)', action: () => surroundSelection(textarea, '**', '**') },
      { label: 'I', title: 'Italic (Ctrl/Cmd+I)', action: () => surroundSelection(textarea, '*', '*') },
      { label: 'H', title: 'Heading', action: () => surroundSelection(textarea, '# ', '') },
      { label: '☑', title: 'Task', action: () => surroundSelection(textarea, '[ ] ', '') },
      { label: '</>', title: 'Code (Ctrl/Cmd+E)', action: () => surroundSelection(textarea, '`', '`') },
      { label: '•', title: 'List (Ctrl/Cmd+L)', action: () => toggleList(textarea) },
      { label: '↶', title: 'Undo', action: () => undoManager.undo() },
      { label: '↷', title: 'Redo', action: () => undoManager.redo() }
    ];

    buttons.forEach(btn => {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = btn.label;
      el.className = 'toolbar-btn';
      el.title = btn.title;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        btn.action();
      });
      bar.appendChild(el);
    });
    return bar;
  }

  function buildModalShell() {
    const overlay = document.createElement('div');
    overlay.className = 'note-editor-modal';
    overlay.innerHTML = `
      <div class="note-editor-dialog" role="dialog" aria-modal="true" aria-label="Editor catatan">
        <div class="note-editor-header">
          <div>
            <p class="note-editor-subtitle"></p>
            <h3 class="note-editor-title">Catatan</h3>
          </div>
          <button type="button" class="editor-close">×</button>
        </div>
        <form class="note-editor-form">
          <div class="note-editor-row icon-row">
            <label>Ikon</label>
            <input name="icon" maxlength="2" autocomplete="off" />
          </div>
          <div class="note-editor-row">
            <label>Judul</label>
            <input name="title" maxlength="100" autocomplete="off" required />
          </div>
          <div class="note-editor-row">
            <label>Folder</label>
            <select name="folderId" class="input-control">
              <option value="">(Tanpa Folder)</option>
            </select>
          </div>
          <div class="note-editor-row">
             <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
               <input type="checkbox" name="isSecret" style="width: auto;" />
               <span>Simpan sebagai Catatan Rahasia (Secret)</span>
             </label>
          </div>
          <div class="note-editor-row">
            <label>Isi (Markdown ringan)</label>
            <div class="editor-area-wrapper"></div>
          </div>
          <div class="note-editor-actions">
            <div class="export-actions-mini" style="margin-right: auto; display: flex; gap: 8px;">
               <button type="button" class="ghost-btn" data-action="export-md" style="padding: 6px 12px; font-size: 0.85em;">MD</button>
               <button type="button" class="ghost-btn" data-action="export-txt" style="padding: 6px 12px; font-size: 0.85em;">TXT</button>
            </div>
            <button type="button" class="btn-ghost" data-action="cancel">Tutup</button>
            <button type="submit" class="btn-blue">Simpan</button>
          </div>
        </form>
        <div class="note-editor-preview">
          <div class="preview-title">Pratinjau</div>
          <div class="preview-body"></div>
        </div>
      </div>
    `;
    return overlay;
  }

  function setupShortcuts(textarea) {
    textarea.addEventListener('keydown', (event) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;
      const key = event.key.toLowerCase();
      if (key === 'b') { event.preventDefault(); surroundSelection(textarea, '**', '**'); }
      if (key === 'i') { event.preventDefault(); surroundSelection(textarea, '*', '*'); }
      if (key === 'e') { event.preventDefault(); surroundSelection(textarea, '`', '`'); }
      if (key === 'l') { event.preventDefault(); toggleList(textarea); }
    });
  }

  function openModalEditor(options = {}) {
    if (document.querySelector('.note-editor-modal')) return;
    const { mode = 'create', initialValue = {}, onSave, draftKey = 'new' } = options;
    const drafts = readDrafts();
    const draftData = drafts[draftKey] || {};

    const overlay = buildModalShell();
    const dialog = overlay.querySelector('.note-editor-dialog');
    const subtitle = overlay.querySelector('.note-editor-subtitle');
    const titleEl = overlay.querySelector('.note-editor-title');
    const form = overlay.querySelector('.note-editor-form');
    const iconInput = form.querySelector('input[name="icon"]');
    const titleInput = form.querySelector('input[name="title"]');
    const folderSelect = form.querySelector('select[name="folderId"]');
    const secretInput = form.querySelector('input[name="isSecret"]');
    const areaWrapper = form.querySelector('.editor-area-wrapper');
    const previewBody = overlay.querySelector('.preview-body');

    const textarea = document.createElement('textarea');
    textarea.name = 'content';
    textarea.maxLength = 3000;
    textarea.className = 'note-editor-area';
    areaWrapper.appendChild(textarea);

    const undoManager = createUndoManager(textarea);
    const toolbar = createToolbar(textarea, undoManager);
    areaWrapper.prepend(toolbar);
    setupShortcuts(textarea);

    const merged = { ...initialValue, ...draftData };
    iconInput.value = merged.icon || '';
    titleInput.value = merged.title || '';
    textarea.value = merged.content || '';
    secretInput.checked = Boolean(merged.isSecret);
    folderSelect.value = merged.folderId || '';

    // Populate folders
    if (global.AbelionStorage) {
      global.AbelionStorage.getFolders().then(folders => {
        while (folderSelect.options.length > 1) folderSelect.remove(1);
        folders.forEach(f => {
          const opt = document.createElement('option');
          opt.value = f.id;
          opt.textContent = f.name;
          folderSelect.appendChild(opt);
        });
        folderSelect.value = merged.folderId || '';
      });
    }

    const setPreview = () => {
      const text = textarea.value;
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      const charCount = text.length;
      const readTime = Math.ceil(wordCount / 200); // Avg 200 wpm

      subtitle.textContent = `${mode === 'edit' ? 'Edit' : 'Baru'} • ${wordCount} kata • ${readTime} mnt baca`;

      previewBody.innerHTML = markdownToHtml(text);
    };

    const debouncedDraft = debounce(() => {
      const nextDrafts = readDrafts();
      nextDrafts[draftKey] = {
        icon: iconInput.value,
        title: titleInput.value,
        content: textarea.value,
        isSecret: secretInput.checked,
        folderId: folderSelect.value
      };
      writeDrafts(nextDrafts);
      setPreview();
    }, 400);

    form.addEventListener('input', debouncedDraft);
    setPreview();

    subtitle.textContent = mode === 'edit' ? 'Edit catatan' : 'Catatan baru';
    titleEl.textContent = mode === 'edit' ? 'Edit Catatan' : 'Catatan Baru';

    let closeModalToken = () => { };

    const close = () => {
      if (ModalManager) {
        closeModalToken();
      } else {
        document.body.classList.remove('modal-open');
      }
      overlay.remove();
    };

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });

    document.body.appendChild(overlay);
    if (ModalManager) {
      closeModalToken = ModalManager.open('editor-modal', overlay);
    } else {
      document.body.classList.add('modal-open');
    }

    overlay.querySelector('.editor-close').addEventListener('click', close);
    form.querySelector('[data-action="cancel"]').addEventListener('click', close);

    const downloadFile = (content, filename, type) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    form.querySelector('[data-action="export-md"]').onclick = () => {
      const title = titleInput.value.trim() || 'Untitled';
      const filename = title.replace(/[/\\?%*:|"<>]/g, '-') + '.md';
      const content = `---\ntitle: ${title}\ndate: ${new Date().toISOString().split('T')[0]}\n---\n\n${textarea.value}`;
      downloadFile(content, filename, 'text/markdown');
    };

    form.querySelector('[data-action="export-txt"]').onclick = () => {
      const title = titleInput.value.trim() || 'Untitled';
      const filename = title.replace(/[/\\?%*:|"<>]/g, '-') + '.txt';
      const content = `${title}\n${new Date().toLocaleString()}\n\n${textarea.value}`;
      downloadFile(content, filename, 'text/plain');
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const payload = {
        icon: sanitizeText(iconInput.value.trim()).slice(0, 2),
        title: sanitizeText(titleInput.value.trim()),
        folderId: folderSelect.value,
        contentMarkdown: textarea.value.trim(),
        isSecret: secretInput.checked
      };
      if (!payload.title || !payload.contentMarkdown) return;
      payload.contentHtml = markdownToHtml(payload.contentMarkdown);

      try {
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        if (typeof onSave === 'function') await onSave(payload, { close });

        const nextDrafts = readDrafts();
        delete nextDrafts[draftKey];
        writeDrafts(nextDrafts);
        close();
      } catch (e) {
        console.error('Save error', e);
        alert('Gagal menyimpan: ' + (e.message || 'Error tidak diketahui'));
        const btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = false;
      }
    });

    titleInput.focus();

    return {
      close,
      updatePreview: setPreview
    };
  }

  global.NoteEditorModal = {
    open: openModalEditor,
    toHtml: markdownToHtml,
    toMarkdown: htmlToMarkdown,
    readDraft: (key) => readDrafts()[key] || null,
    clearDraft: (key) => {
      const drafts = readDrafts();
      delete drafts[key];
      writeDrafts(drafts);
    }
  };
})(window);
