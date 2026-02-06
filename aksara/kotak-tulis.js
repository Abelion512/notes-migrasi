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
    if (typeof marked !== 'undefined') {
      // Use marked if available
      const renderer = new marked.Renderer();
      renderer.listitem = (item) => {
        // Strip GFM task list markers if marked left them in item.text
        const textClean = item.text.replace(/^\[[ xX]\]\s+/, '');
        if (item.task) {
           const checked = item.checked;
           return `<li class="checkbox-line" style="list-style:none; margin-left:-20px;"><input type="checkbox" ${checked ? 'checked' : ''} disabled> <span>${textClean}</span></li>\n`;
        }
        return `<li>${item.text}</li>\n`;
      };

      let html = marked.parse(String(markdown || ''), { renderer });
      // Support WikiLinks: [[Target]] -> <a href="#" class="wiki-link" data-target="Target">[[Target]]</a>
      html = html.replace(/\[\[(.+?)\]\]/g, '<a href="#" class="wiki-link" data-target="$1">[[$1]]</a>');
      return sanitizeRichContent(html);
    }
    // Fallback to basic
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
        htmlParts.push(`<div class="checkbox-line" style="display:flex; align-items:center; gap:8px; margin-bottom:4px;"><input type="checkbox" ${checked ? 'checked' : ''} disabled style="width:18px; height:18px;"> <span>${inlineMarkdown(checkMatch[2])}</span></div>`);
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
          <div class="editor-tabs" style="display: flex; border-bottom: 0.5px solid var(--border-subtle); margin-bottom: 12px;">
            <button type="button" class="editor-tab active" data-tab="write" style="flex: 1; padding: 10px; background: none; border: none; font-size: 14px; font-weight: 600; color: var(--primary);">Tulis</button>
            <button type="button" class="editor-tab" data-tab="preview" style="flex: 1; padding: 10px; background: none; border: none; font-size: 14px; color: var(--text-secondary);">Pratinjau</button>
          </div>
          <form id="editor-form" class="note-editor-form">
            <input name="title" class="editor-title-input" placeholder="Judul" autocomplete="off" required />
            <div id="editor-input-area">
              <textarea name="content" class="editor-textarea" placeholder="Mulai menulis..." autocomplete="off"></textarea>
            </div>
            <div id="editor-preview-area" class="hidden" style="min-height: 200px; padding: 12px; font-size: 17px; line-height: 1.6; overflow-y: auto;"></div>

            <div id="editor-details" class="hidden" style="margin-top: 20px; border-top: 0.5px solid var(--border-subtle); padding-top: 20px;">
              <div class="list-header">Detail Catatan</div>
              <div class="section-card" style="padding: 0;">
                <div style="display: flex; align-items: center; padding: 12px 16px; border-bottom: 0.5px solid var(--border-subtle);">
                   <span style="flex: 1; font-size: 17px;">Ikon</span>
                   <div style="position: relative;">
                     <button type="button" id="emoji-trigger" style="font-size: 20px; background: none; border: none; cursor: pointer;">📁</button>
                     <input type="hidden" name="icon" value="📁">
                   </div>
                </div>
                <div style="display: flex; align-items: center; padding: 12px 16px; border-bottom: 0.5px solid var(--border-subtle);">
                   <span style="flex: 1; font-size: 17px;">Folder</span>
                   <select name="folderId" style="border: none; background: transparent; font-size: 17px; text-align: right;">
                     <option value="">(Folder Utama)</option>
                   </select>
                </div>
                <div style="display: flex; align-items: center; padding: 12px 16px;">
                   <span style="flex: 1; font-size: 17px;">Catatan Rahasia</span>
                   <input type="checkbox" name="isSecret" style="width: 20px; height: 20px;">
                </div>
              </div>
            </div>
          </form>
          <div style="display: flex; justify-content: center; margin-top: 20px;">
            <button type="button" id="toggle-details-btn" class="ghost-btn" style="font-size: 15px;">Tampilkan Detail</button>
          </div>
        </div>
        <div class="editor-toolbar" style="padding: 10px; background: var(--frosted); border-top: 0.5px solid var(--border-subtle); display: flex; justify-content: center; gap: 15px; overflow-x: auto;">
           <button type="button" class="toolbar-btn-ios" data-cmd="bold" title="Tebal"><b>B</b></button>
           <button type="button" class="toolbar-btn-ios" data-cmd="italic" title="Miring"><i>I</i></button>
           <button type="button" class="toolbar-btn-ios" data-cmd="heading" title="Judul">H</button>
           <button type="button" class="toolbar-btn-ios" data-cmd="list" title="Daftar"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg></button>
           <button type="button" class="toolbar-btn-ios" data-cmd="todo" title="Tugas"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></button>
           <button type="button" class="toolbar-btn-ios" data-cmd="link" title="Wiki Link"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></button>
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
    const previewArea = overlay.querySelector('#editor-preview-area');
    const inputArea = overlay.querySelector('#editor-input-area');
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

    let slashMenu = null;
    let slashIndex = 0;
    const slashCommands = [
      { id: 'h2', label: 'Heading 1', icon: 'H1', syntax: '\n## ' },
      { id: 'h3', label: 'Heading 2', icon: 'H2', syntax: '\n### ' },
      { id: 'bullet', label: 'Bulleted List', icon: '•', syntax: '\n- ' },
      { id: 'todo', label: 'To-do List', icon: '☐', syntax: '\n- [ ] ' },
      { id: 'code', label: 'Code Block', icon: '</>', syntax: '\n```\n\n```' },
      { id: 'quote', label: 'Quote', icon: '"', syntax: '\n> ' }
    ];

    function showSlashMenu(x, y) {
      if (slashMenu) slashMenu.remove();
      slashMenu = document.createElement('div');
      slashMenu.className = 'slash-menu';
      slashMenu.style.left = x + 'px';
      slashMenu.style.top = y + 'px';

      slashCommands.forEach((cmd, i) => {
        const item = document.createElement('div');
        item.className = 'slash-item' + (i === slashIndex ? ' active' : '');
        item.innerHTML = `<div class="slash-item-icon">${cmd.icon}</div> <div>${cmd.label}</div>`;
        item.onclick = () => applySlashCommand(cmd);
        slashMenu.appendChild(item);
      });
      overlay.appendChild(slashMenu);
    }

    function applySlashCommand(cmd) {
      const val = textarea.value;
      const pos = textarea.selectionStart;
      const before = val.slice(0, pos).replace(/\/$/, '');
      const after = val.slice(pos);
      textarea.value = before + cmd.syntax + after;
      textarea.focus();
      const newPos = (before + cmd.syntax).length;
      textarea.setSelectionRange(newPos, newPos);
      if (slashMenu) {
        slashMenu.remove();
        slashMenu = null;
      }
      saveDraft();
    }

    textarea.addEventListener('keydown', (e) => {
      if (slashMenu) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          slashIndex = (slashIndex + 1) % slashCommands.length;
          renderSlashMenuContent();
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          slashIndex = (slashIndex - 1 + slashCommands.length) % slashCommands.length;
          renderSlashMenuContent();
          return;
        } else if (e.key === 'Enter') {
          e.preventDefault();
          applySlashCommand(slashCommands[slashIndex]);
          return;
        } else if (e.key === 'Escape') {
          slashMenu.remove();
          slashMenu = null;
          return;
        }
      }

      // Block Reordering (Alt + Up/Down)
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
          e.preventDefault();
          const val = textarea.value;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;

          const lines = val.split('\n');
          const currentLineIndex = val.slice(0, start).split('\n').length - 1;

          if (e.key === 'ArrowUp' && currentLineIndex > 0) {
              [lines[currentLineIndex], lines[currentLineIndex - 1]] = [lines[currentLineIndex - 1], lines[currentLineIndex]];
              textarea.value = lines.join('\n');
              // Maintain focus (approximate)
              textarea.setSelectionRange(start - lines[currentLineIndex].length - 1, start - lines[currentLineIndex].length - 1);
          } else if (e.key === 'ArrowDown' && currentLineIndex < lines.length - 1) {
              [lines[currentLineIndex], lines[currentLineIndex + 1]] = [lines[currentLineIndex + 1], lines[currentLineIndex]];
              textarea.value = lines.join('\n');
              textarea.setSelectionRange(start + lines[currentLineIndex].length + 1, start + lines[currentLineIndex].length + 1);
          }
          saveDraft();
      }
    });

    function renderSlashMenuContent() {
      if (!slashMenu) return;
      slashMenu.querySelectorAll('.slash-item').forEach((item, i) => {
        item.className = 'slash-item' + (i === slashIndex ? ' active' : '');
      });
    }

    textarea.addEventListener('input', (e) => {
      saveDraft();
      if (!previewArea.classList.contains('hidden')) {
        previewArea.innerHTML = markdownToHtml(textarea.value);
      }

      const val = textarea.value;
      const pos = textarea.selectionStart;
      if (val[pos - 1] === '/') {
        // Get cursor coordinates (simplified for textarea)
        const { offsetLeft, offsetTop } = textarea;
        const lines = val.slice(0, pos).split('\n');
        const lineCount = lines.length;
        const x = 20;
        const y = offsetTop + (lineCount * 28); // Approximate line height
        slashIndex = 0;
        showSlashMenu(x, Math.min(y, textarea.offsetHeight + offsetTop - 100));
      } else if (slashMenu) {
        slashMenu.remove();
        slashMenu = null;
      }
    });
    const emojiTrigger = overlay.querySelector('#emoji-trigger');
    if (initialValue.icon) {
      emojiTrigger.textContent = initialValue.icon;
      form.querySelector('input[name="icon"]').value = initialValue.icon;
    }

    emojiTrigger.onclick = (e) => {
      e.stopPropagation();
      let pickerContainer = overlay.querySelector('#emoji-picker-container');
      if (pickerContainer) {
        pickerContainer.classList.toggle('hidden');
        return;
      }

      pickerContainer = document.createElement('div');
      pickerContainer.id = 'emoji-picker-container';
      pickerContainer.style = `
        position: absolute; bottom: 100%; right: 0; z-index: 10000;
        background: var(--surface); border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        border: 0.5px solid var(--border-subtle);
        margin-bottom: 8px; overflow: hidden;
      `;

      const picker = document.createElement('emoji-picker');
      picker.classList.add('light'); // default
      if (document.documentElement.getAttribute('data-theme') === 'dark') {
          picker.classList.add('dark');
          picker.classList.remove('light');
      }

      pickerContainer.appendChild(picker);
      emojiTrigger.parentElement.appendChild(pickerContainer);

      picker.addEventListener('emoji-click', event => {
        const emoji = event.detail.unicode;
        emojiTrigger.textContent = emoji;
        form.querySelector('input[name="icon"]').value = emoji;
        pickerContainer.classList.add('hidden');
        saveDraft();
      });

      // Close when clicking outside
      const closePicker = (ev) => {
        if (!pickerContainer.contains(ev.target) && ev.target !== emojiTrigger) {
          pickerContainer.classList.add('hidden');
          document.removeEventListener('click', closePicker);
        }
      };
      document.addEventListener('click', closePicker);
    };

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
        if (window.initCustomSelects) window.initCustomSelects();
      });
    }

    toggleDetailsBtn.onclick = () => {
      detailsDiv.classList.toggle('hidden');
      toggleDetailsBtn.textContent = detailsDiv.classList.contains('hidden') ? 'Tampilkan Detail' : 'Sembunyikan Detail';
    };

    const tabs = overlay.querySelectorAll('.editor-tab');
    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.style.color = 'var(--text-secondary)';
          t.style.fontWeight = '400';
          t.style.borderBottom = 'none';
        });
        tab.classList.add('active');
        tab.style.color = 'var(--primary)';
        tab.style.fontWeight = '600';
        tab.style.borderBottom = '2px solid var(--primary)';

        if (tab.dataset.tab === 'preview') {
          inputArea.style.opacity = '0';
          setTimeout(() => {
              inputArea.classList.add('hidden');
              previewArea.classList.remove('hidden');
              previewArea.style.opacity = '0';
              previewArea.innerHTML = markdownToHtml(textarea.value);
              requestAnimationFrame(() => {
                  previewArea.style.transition = 'opacity 0.2s';
                  previewArea.style.opacity = '1';
              });
          }, 100);
        } else {
          previewArea.style.opacity = '0';
          setTimeout(() => {
              previewArea.classList.add('hidden');
              inputArea.classList.remove('hidden');
              inputArea.style.opacity = '0';
              requestAnimationFrame(() => {
                  inputArea.style.transition = 'opacity 0.2s';
                  inputArea.style.opacity = '1';
                  textarea.focus();
              });
          }, 100);
        }
      };
    });

    const close = () => {
      if (ModalManager) {
        ModalManager.close('note-editor-modal');
      } else {
        overlay.classList.remove('show');
        document.body.classList.remove('modal-open');
      }
      setTimeout(() => overlay.remove(), 300);
    };

    const clearDraft = () => {
      const currentDrafts = readDrafts();
      delete currentDrafts[draftKey];
      writeDrafts(currentDrafts);
    };

    overlay.querySelector('[data-action="cancel"]').onclick = async () => {
      if (textarea.value.trim() || titleInput.value.trim()) {
        const ok = await AbelionUtils.confirmAction('Simpan Draft', 'Apakah Anda ingin menyimpan perubahan sebagai draf?', 'Simpan', 'Buang');
        if (ok) {
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
            else if (cmd === 'italic') next = val.slice(0, start) + '*' + val.slice(start, end) + '*' + val.slice(end);
            else if (cmd === 'heading') next = val.slice(0, start) + '\n### ' + val.slice(start);
            else if (cmd === 'list') next = val.slice(0, start) + '\n- ' + val.slice(start);
            else if (cmd === 'todo') next = val.slice(0, start) + '\n- [ ] ' + val.slice(start);
            else if (cmd === 'link') next = val.slice(0, start) + '[[' + val.slice(start, end) + ']]' + val.slice(end);

            textarea.value = next;
            textarea.focus();
        };
    });

    document.body.appendChild(overlay);
    if (ModalManager) {
      ModalManager.open('note-editor-modal', overlay);
    } else {
      document.body.classList.add('modal-open');
      setTimeout(() => overlay.classList.add('show'), 10);
    }
    titleInput.focus();

    return { close };
  }

  global.NoteEditorModal = {
    open: openModalEditor,
    toHtml: markdownToHtml,
    toMarkdown: htmlToMarkdown
  };
})(window);
