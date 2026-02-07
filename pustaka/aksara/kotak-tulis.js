(function (global) {
  const {
    STORAGE_KEYS,
    sanitizeText,
    sanitizeRichContent,
    safeGetItem,
    safeSetItem,
    debounce,
    ModalManager,
    generateId
  } = global.AbelionUtils || {};

  if (!STORAGE_KEYS || !sanitizeText || !sanitizeRichContent) {
    console.warn('Modal editor memerlukan AbelionUtils.');
    return;
  }

  const DRAFT_KEY = STORAGE_KEYS.NOTE_DRAFTS || 'abelion-note-drafts';
  const readDrafts = () => safeGetItem(DRAFT_KEY, {});
  const writeDrafts = (drafts) => safeSetItem(DRAFT_KEY, drafts || {});

  // --- MD Parser & Generator ---
  function markdownToHtml(markdown) {
    if (typeof marked !== 'undefined') {
      const renderer = new marked.Renderer();

      // Custom renderer for tasks
      renderer.listitem = (item) => {
        const text = item.text;
        if (item.task) {
          const checked = item.checked;
          const cleanText = text.replace(/^\[[ xX]\]\s*/, '');
          return `<div class="checkbox-line"><input type="checkbox" ${checked ? 'checked' : ''}> <span>${cleanText}</span></div>`;
        }
        return `<li>${text}</li>`;
      };

      // Custom renderer for blockquote
      renderer.blockquote = (quote) => {
        return `<blockquote class="notion-quote">${quote}</blockquote>`;
      };

      // Custom renderer for codespan
      renderer.codespan = (code) => {
        return `<code class="notion-inline-code">${code}</code>`;
      };

      let html = marked.parse(String(markdown || ''), { renderer });
      // WikiLinks support
      html = html.replace(/\[\[(.+?)\]\]/g, '<a href="#" class="wiki-link" data-target="$1">[[$1]]</a>');

      // Toggle support (minimalist)
      html = html.replace(/<p>!toggle (.*?)<\/p>/g, '<details class="notion-toggle"><summary>$1</summary><div class="toggle-content">...</div></details>');

      return sanitizeRichContent(html);
    }

    // Fallback parser
    const lines = String(markdown || '').split('\n');
    let html = '';
    lines.forEach(line => {
      if (line.startsWith('# ')) html += `<h1>${line.slice(2)}</h1>`;
      else if (line.startsWith('## ')) html += `<h2>${line.slice(3)}</h2>`;
      else if (line.startsWith('### ')) html += `<h3>${line.slice(4)}</h3>`;
      else if (line.startsWith('- [ ] ')) html += `<div class="checkbox-line"><input type="checkbox"> <span>${line.slice(6)}</span></div>`;
      else if (line.startsWith('- [x] ')) html += `<div class="checkbox-line"><input type="checkbox" checked> <span>${line.slice(6)}</span></div>`;
      else if (line.startsWith('- ')) html += `<li>${line.slice(2)}</li>`;
      else if (line.trim()) html += `<p>${line}</p>`;
    });
    return html;
  }

  function htmlToMarkdown(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    let md = '';
    const walk = (nodes) => {
      nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          md += node.textContent;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = node.tagName;
          if (tag === 'H1') { md += '\n# '; walk(node.childNodes); md += '\n'; }
          else if (tag === 'H2') { md += '\n## '; walk(node.childNodes); md += '\n'; }
          else if (tag === 'H3') { md += '\n### '; walk(node.childNodes); md += '\n'; }
          else if (tag === 'P') { md += '\n'; walk(node.childNodes); md += '\n'; }
          else if (tag === 'DIV' && node.classList.contains('checkbox-line')) {
            const cb = node.querySelector('input[type="checkbox"]');
            const span = node.querySelector('span');
            md += `\n- [${cb && cb.checked ? 'x' : ' '}] ${span ? span.textContent : ''}\n`;
          }
          else if (tag === 'LI') { md += '\n- '; walk(node.childNodes); md += '\n'; }
          else if (tag === 'UL') { walk(node.childNodes); }
          else if (tag === 'IMG') { md += `\n![image](${node.src})\n`; }
          else if (tag === 'A' && node.classList.contains('wiki-link')) { md += `[[${node.dataset.target}]]`; }
          else if (tag === 'STRONG' || tag === 'B') { md += '**'; walk(node.childNodes); md += '**'; }
          else if (tag === 'EM' || tag === 'I') { md += '*'; walk(node.childNodes); md += '*'; }
          else if (tag === 'BR') { md += '\n'; }
          else { walk(node.childNodes); }
        }
      });
    };

    walk(Array.from(temp.childNodes));
    return md.trim().replace(/\n{3,}/g, '\n\n');
  }

  function buildModalShell() {
    const overlay = document.createElement('div');
    overlay.className = 'note-editor-modal';
    overlay.innerHTML = `
      <div class="note-editor-dialog" role="dialog" aria-modal="true">
        <div class="note-editor-header">
          <button type="button" class="ghost-btn" data-action="cancel" style="font-size: 15px; color: var(--pro-text-secondary);">Tutup</button>
          <div style="flex: 1;"></div>
          <button type="button" id="toggle-details-btn" class="ghost-btn" style="font-size: 13px; opacity: 0.6; margin-right: 12px;">Properti</button>
          <button type="button" class="btn-blue" id="save-btn" style="padding: 6px 16px; font-size: 14px; border-radius: 6px;">Simpan</button>
        </div>
        <div class="note-editor-content">
          <div id="editor-details" class="hidden" style="margin-bottom: 40px; border-bottom: 1px solid var(--pro-border); padding-bottom: 24px;">
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center;">
                 <span style="width: 100px; font-size: 14px; color: var(--pro-text-secondary);">Ikon</span>
                 <button type="button" id="emoji-trigger" style="font-size: 18px; background: var(--pro-surface); border: 1px solid var(--pro-border); border-radius: 6px; padding: 4px 8px; cursor: pointer;">📁</button>
                 <input type="hidden" id="icon-input" value="📁">
              </div>
              <div style="display: flex; align-items: center;">
                 <span style="width: 100px; font-size: 14px; color: var(--pro-text-secondary);">Folder</span>
                 <select id="folder-select" style="background: var(--pro-surface); border: 1px solid var(--pro-border); border-radius: 6px; padding: 4px 8px; font-size: 14px; color: var(--pro-text);">
                   <option value="">(Tanpa Folder)</option>
                 </select>
              </div>
              <div style="display: flex; align-items: center;">
                 <span style="width: 100px; font-size: 14px; color: var(--pro-text-secondary);">Privasi</span>
                 <label class="ios-switch" style="transform: scale(0.8); transform-origin: left;">
                   <input type="checkbox" id="is-secret-input">
                   <span class="ios-slider"></span>
                 </label>
                 <span style="font-size: 12px; color: var(--text-muted); margin-left: -4px;">Sembunyikan dari daftar utama</span>
              </div>
            </div>
          </div>

          <input id="editor-title" class="editor-title-input" placeholder="Judul Catatan" autocomplete="off" />
          <div id="editor-block-area" class="editor-block-area" contenteditable="true" placeholder="Mulai menulis atau ketik '/' untuk perintah..."></div>
        </div>

        <div class="editor-toolbar">
           <button type="button" class="toolbar-btn-ios" data-cmd="bold" title="Tebal"><b>B</b></button>
           <button type="button" class="toolbar-btn-ios" data-cmd="italic" title="Miring"><i>I</i></button>
           <div style="width:1px; height:20px; background:var(--pro-border); margin: 0 4px;"></div>
           <button type="button" class="toolbar-btn-ios" data-cmd="h2" title="H1">H1</button>
           <button type="button" class="toolbar-btn-ios" data-cmd="h3" title="H2">H2</button>
           <button type="button" class="toolbar-btn-ios" data-cmd="todo" title="Tugas">☐</button>
           <button type="button" class="toolbar-btn-ios" data-cmd="img" title="Gambar">🖼️</button>
        </div>
      </div>
    `;
    return overlay;
  }

  function openModalEditor(options = {}) {
    if (document.querySelector('.note-editor-modal')) return;
    const { mode = 'create', initialValue = {}, onSave, draftKey = 'new' } = options;

    const overlay = buildModalShell();
    const titleInput = overlay.querySelector('#editor-title');
    const blockArea = overlay.querySelector('#editor-block-area');
    const iconInput = overlay.querySelector('#icon-input');
    const emojiTrigger = overlay.querySelector('#emoji-trigger');
    const folderSelect = overlay.querySelector('#folder-select');
    const secretInput = overlay.querySelector('#is-secret-input');
    const toggleDetailsBtn = overlay.querySelector('#toggle-details-btn');
    const detailsDiv = overlay.querySelector('#editor-details');
    const saveBtn = overlay.querySelector('#save-btn');

    // Populate Initial State
    titleInput.value = initialValue.title || '';
    blockArea.innerHTML = markdownToHtml(initialValue.content || '');
    iconInput.value = initialValue.icon || '📁';
    emojiTrigger.textContent = iconInput.value;
    secretInput.checked = Boolean(initialValue.isSecret);

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

    // --- Slash Menu Logic ---
    let slashMenu = null;
    let slashIndex = 0;
    const slashCommands = [
      { id: 'h1', label: 'Heading 1', icon: 'H1', action: () => document.execCommand('formatBlock', false, 'h1') },
      { id: 'h2', label: 'Heading 2', icon: 'H2', action: () => document.execCommand('formatBlock', false, 'h2') },
      { id: 'h3', label: 'Heading 3', icon: 'H3', action: () => document.execCommand('formatBlock', false, 'h3') },
      { id: 'todo', label: 'To-do List', icon: '☐', action: () => insertCheckbox() },
      { id: 'bullet', label: 'Bulleted List', icon: '•', action: () => document.execCommand('insertUnorderedList') },
      { id: 'quote', label: 'Quote', icon: '"', action: () => document.execCommand('formatBlock', false, 'blockquote') },
      { id: 'toggle', label: 'Toggle List', icon: '▶', action: () => insertToggle() },
      { id: 'code', label: 'Code Block', icon: '</>', action: () => document.execCommand('formatBlock', false, 'pre') },
      { id: 'img', label: 'Image', icon: '🖼️', action: () => triggerImageUpload() }
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

    function showSlashMenu(x, y) {
      if (slashMenu) slashMenu.remove();
      slashMenu = document.createElement('div');
      slashMenu.className = 'slash-menu';
      slashMenu.style.position = 'absolute';
      slashMenu.style.left = x + 'px';
      slashMenu.style.top = y + 'px';
      slashMenu.style.zIndex = '10000';

      slashCommands.forEach((cmd, i) => {
        const item = document.createElement('div');
        item.className = 'slash-item' + (i === slashIndex ? ' active' : '');
        item.innerHTML = `<div class="slash-item-icon">${cmd.icon}</div> <div>${cmd.label}</div>`;
        item.onclick = () => { cmd.action(); hideSlashMenu(); };
        slashMenu.appendChild(item);
      });
      overlay.appendChild(slashMenu);
    }

    function hideSlashMenu() {
      if (slashMenu) { slashMenu.remove(); slashMenu = null; }
    }

    blockArea.addEventListener('input', (e) => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;
        const textBefore = node.textContent.slice(0, offset);

        // --- Slash Menu ---
        if (textBefore.endsWith('/')) {
          const rect = range.getBoundingClientRect();
          const overlayRect = overlay.getBoundingClientRect();
          showSlashMenu(rect.left - overlayRect.left, rect.bottom - overlayRect.top + 5);
        } else {
          hideSlashMenu();
        }

        // --- Live Preview Transformations ---
        if (e.inputType === 'insertText') {
          const lineText = textBefore;
          if (lineText === '# ') {
            document.execCommand('delete', false);
            document.execCommand('delete', false);
            document.execCommand('formatBlock', false, 'h1');
          } else if (lineText === '## ') {
            document.execCommand('delete', false);
            document.execCommand('delete', false);
            document.execCommand('delete', false);
            document.execCommand('formatBlock', false, 'h2');
          } else if (lineText === '### ') {
            document.execCommand('delete', false);
            document.execCommand('delete', false);
            document.execCommand('delete', false);
            document.execCommand('delete', false);
            document.execCommand('formatBlock', false, 'h3');
          } else if (lineText === '- [ ] ') {
            for (let i = 0; i < 6; i++) document.execCommand('delete', false);
            insertCheckbox();
          } else if (lineText === '> ') {
            document.execCommand('delete', false);
            document.execCommand('delete', false);
            document.execCommand('formatBlock', false, 'blockquote');
          }
        }
      }
    });

    blockArea.addEventListener('keydown', (e) => {
      if (slashMenu) {
        if (e.key === 'ArrowDown') { e.preventDefault(); slashIndex = (slashIndex + 1) % slashCommands.length; renderSlashMenu(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); slashIndex = (slashIndex - 1 + slashCommands.length) % slashCommands.length; renderSlashMenu(); }
        else if (e.key === 'Enter') { e.preventDefault(); slashCommands[slashIndex].action(); hideSlashMenu(); }
        else if (e.key === 'Escape') { hideSlashMenu(); }
      }
    });

    function renderSlashMenu() {
      if (!slashMenu) return;
      slashMenu.querySelectorAll('.slash-item').forEach((item, i) => {
        item.classList.toggle('active', i === slashIndex);
      });
    }

    // --- Image Paste ---
    blockArea.addEventListener('paste', (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (ev) => insertImage(ev.target.result);
          reader.readAsDataURL(file);
        }
      }
    });

    // --- Toolbar ---
    overlay.querySelectorAll('.toolbar-btn-ios').forEach(btn => {
      btn.onclick = () => {
        const cmd = btn.dataset.cmd;
        if (cmd === 'bold') document.execCommand('bold');
        else if (cmd === 'italic') document.execCommand('italic');
        else if (cmd === 'h2') document.execCommand('formatBlock', false, 'h2');
        else if (cmd === 'h3') document.execCommand('formatBlock', false, 'h3');
        else if (cmd === 'todo') insertCheckbox();
        else if (cmd === 'img') triggerImageUpload();
        blockArea.focus();
      };
    });

    // --- UI Logic ---
    toggleDetailsBtn.onclick = () => {
      detailsDiv.classList.toggle('hidden');
      toggleDetailsBtn.textContent = detailsDiv.classList.contains('hidden') ? 'Opsi Lanjutan' : 'Tutup Opsi';
    };

    emojiTrigger.onclick = (e) => {
      e.stopPropagation();
      let pc = document.getElementById('emoji-picker-container');

      const updatePosition = () => {
        const rect = emojiTrigger.getBoundingClientRect();
        // Position above the trigger, aligned right. Width ~340px, Height ~400px
        // If closer to top, show below.
        const spaceAbove = rect.top;
        const pickerHeight = 420;
        const pickerWidth = 350;

        let top = rect.top - pickerHeight - 10;
        if (top < 10) top = rect.bottom + 10; // Flip to bottom if no space top

        let left = rect.right - pickerWidth;
        if (left < 10) left = 10; // Keep on screen

        pc.style.top = top + 'px';
        pc.style.left = left + 'px';
      };

      if (pc) {
        const isHidden = pc.style.display === 'none';
        pc.style.display = isHidden ? 'block' : 'none';
        if (isHidden) updatePosition();
        return;
      }

      pc = document.createElement('div');
      pc.id = 'emoji-picker-container';
      pc.style.cssText = `
        position: fixed; 
        z-index: 11000; 
        background: var(--surface); 
        border-radius: 12px; 
        box-shadow: 0 10px 40px rgba(0,0,0,0.3); 
        border: 0.5px solid var(--border-subtle); 
        margin-bottom: 8px; 
        overflow: hidden;
        display: block;
      `;

      const picker = document.createElement('emoji-picker');
      if (document.documentElement.getAttribute('data-theme') === 'dark') picker.classList.add('dark');
      picker.style.width = '100%';
      picker.style.height = '400px';

      pc.appendChild(picker);
      document.body.appendChild(pc);

      updatePosition();

      picker.addEventListener('emoji-click', ev => {
        const emoji = ev.detail.unicode;
        emojiTrigger.textContent = emoji;
        iconInput.value = emoji;
        pc.style.display = 'none';
      });

      // Close on click outside
      setTimeout(() => {
        document.addEventListener('click', (ev) => {
          if (pc && pc.style.display !== 'none' && !pc.contains(ev.target) && ev.target !== emojiTrigger) {
            pc.style.display = 'none';
          }
        });
      }, 0);
    };

    const close = () => {
      if (ModalManager) ModalManager.close('note-editor-modal');
      setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('[data-action="cancel"]').onclick = () => close();

    saveBtn.onclick = async () => {
      const payload = {
        title: titleInput.value.trim(),
        contentHtml: blockArea.innerHTML,
        contentMarkdown: htmlToMarkdown(blockArea.innerHTML),
        icon: iconInput.value.trim(),
        folderId: folderSelect.value,
        isSecret: secretInput.checked
      };
      if (onSave) await onSave(payload);
      close();
    };

    document.body.appendChild(overlay);
    if (ModalManager) ModalManager.open('note-editor-modal', overlay);

    // Auto-focus title if empty, else content
    if (!titleInput.value) titleInput.focus();
    else blockArea.focus();

    return { close };
  }

  global.NoteEditorModal = {
    open: openModalEditor,
    toHtml: markdownToHtml,
    toMarkdown: htmlToMarkdown
  };
})(window);
