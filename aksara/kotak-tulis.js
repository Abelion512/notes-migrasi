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

      let html = marked.parse(String(markdown || ''), { renderer });
      // WikiLinks support
      html = html.replace(/\[\[(.+?)\]\]/g, '<a href="#" class="wiki-link" data-target="$1">[[$1]]</a>');
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
          <button type="button" class="done-btn" data-action="cancel">Batal</button>
          <div style="font-weight: 600; font-size: 17px;">Catatan</div>
          <button type="button" class="done-btn" id="save-btn" style="font-weight: 700; color: var(--primary);">Selesai</button>
        </div>
        <div class="note-editor-content" style="padding: 20px;">
          <input id="editor-title" class="editor-title-input" placeholder="Judul" autocomplete="off" style="border:none; width:100%; font-size:28px; font-weight:700; margin-bottom:10px; background:transparent; outline:none; color:var(--text-primary);" />

          <div id="editor-block-area" class="editor-block-area" contenteditable="true" placeholder="Mulai menulis atau ketik '/' untuk perintah..."></div>

          <div id="editor-details" class="hidden" style="margin-top: 30px; border-top: 0.5px solid var(--border-subtle); padding-top: 20px;">
            <div class="list-header">Atribut Arsip</div>
            <div class="section-card" style="padding: 0;">
              <div style="display: flex; align-items: center; padding: 12px 16px; border-bottom: 0.5px solid var(--border-subtle);">
                 <span style="flex: 1; font-size: 17px;">Ikon</span>
                 <button type="button" id="emoji-trigger" style="font-size: 20px; background: none; border: none; cursor: pointer;">📁</button>
                 <input type="hidden" id="icon-input" value="📁">
              </div>
              <div style="display: flex; align-items: center; padding: 12px 16px; border-bottom: 0.5px solid var(--border-subtle);">
                 <span style="flex: 1; font-size: 17px;">Folder</span>
                 <select id="folder-select" style="border: none; background: transparent; font-size: 17px; text-align: right; color: var(--primary); font-weight: 500;">
                   <option value="">(Tanpa Folder)</option>
                 </select>
              </div>
              <div style="display: flex; align-items: center; padding: 12px 16px;">
                 <span style="flex: 1; font-size: 17px;">Sembunyikan Catatan</span>
                 <label class="ios-switch">
                   <input type="checkbox" id="is-secret-input">
                   <span class="ios-slider"></span>
                 </label>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: center; margin: 30px 0;">
            <button type="button" id="toggle-details-btn" class="ghost-btn" style="font-size: 14px; opacity: 0.6;">Opsi Lanjutan</button>
          </div>
        </div>

        <div class="editor-toolbar" style="padding: 12px; background: var(--frosted); border-top: 0.5px solid var(--border-subtle); display: flex; justify-content: space-around; gap: 10px; overflow-x: auto;">
           <button type="button" class="toolbar-btn-ios" data-cmd="bold" title="Tebal"><b>B</b></button>
           <button type="button" class="toolbar-btn-ios" data-cmd="italic" title="Miring"><i>I</i></button>
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
      { id: 'todo', label: 'To-do List', icon: '☐', action: () => insertCheckbox() },
      { id: 'bullet', label: 'Bulleted List', icon: '•', action: () => document.execCommand('insertUnorderedList') },
      { id: 'img', label: 'Image', icon: '🖼️', action: () => triggerImageUpload() }
    ];

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
        const textBefore = range.startContainer.textContent.slice(0, range.startOffset);
        if (textBefore.endsWith('/')) {
          const rect = range.getBoundingClientRect();
          const overlayRect = overlay.getBoundingClientRect();
          showSlashMenu(rect.left - overlayRect.left, rect.bottom - overlayRect.top + 5);
        } else {
          hideSlashMenu();
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
      let pc = overlay.querySelector('#emoji-picker-container');
      if (pc) { pc.classList.toggle('hidden'); return; }
      pc = document.createElement('div');
      pc.id = 'emoji-picker-container';
      pc.style = `position: absolute; bottom: 100%; right: 0; z-index: 10001; background: var(--surface); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); border: 0.5px solid var(--border-subtle); margin-bottom: 8px; overflow: hidden;`;
      const picker = document.createElement('emoji-picker');
      if (document.documentElement.getAttribute('data-theme') === 'dark') picker.classList.add('dark');
      pc.appendChild(picker);
      emojiTrigger.parentElement.appendChild(pc);
      picker.addEventListener('emoji-click', ev => {
        const emoji = ev.detail.unicode;
        emojiTrigger.textContent = emoji;
        iconInput.value = emoji;
        pc.classList.add('hidden');
      });
      document.addEventListener('click', (ev) => { if (!pc.contains(ev.target) && ev.target !== emojiTrigger) pc.classList.add('hidden'); }, { once: true });
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
