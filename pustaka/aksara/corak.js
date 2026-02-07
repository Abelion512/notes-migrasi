(function() {
  const THEME_KEY = 'abelion-theme';
  const ACCENT_KEY = 'abelion-accent-color';

  function applyTheme(theme) {
    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function applyAccent(color) {
    if (color) {
      document.documentElement.style.setProperty('--primary', color);
      document.documentElement.style.setProperty('--accent', color);
      localStorage.setItem(ACCENT_KEY, color);
    }
  }

  // Initial load
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  const savedAccent = localStorage.getItem(ACCENT_KEY);

  applyTheme(savedTheme);
  if (savedAccent) applyAccent(savedAccent);

  // Listen for system theme changes if set to auto
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem(THEME_KEY) === 'auto') {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  // Export to global
  function initCustomSelects() {
    const selects = document.querySelectorAll('select:not(.no-custom)');
    selects.forEach(select => {
      if (select.dataset.customInit) return;
      select.dataset.customInit = "true";
      select.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';

      const trigger = document.createElement('div');
      trigger.className = 'custom-select-trigger';
      trigger.innerHTML = `<span>${select.options[select.selectedIndex]?.text || ''}</span> <svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1L5 5L9 1"/></svg>`;

      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'custom-select-options';

      const overlay = document.createElement('div');
      overlay.className = 'custom-select-overlay';

      Array.from(select.options).forEach((opt, i) => {
        const o = document.createElement('div');
        o.className = 'custom-select-option' + (i === select.selectedIndex ? ' selected' : '');
        o.textContent = opt.text;
        o.onclick = (e) => {
          e.stopPropagation();
          select.selectedIndex = i;
          select.dispatchEvent(new Event('change'));
          trigger.querySelector('span').textContent = opt.text;
          optionsContainer.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('selected'));
          o.classList.add('selected');
          hideOptions();
        };
        optionsContainer.appendChild(o);
      });

      function showOptions() {
        optionsContainer.classList.add('show');
        overlay.classList.add('show');
        document.body.appendChild(overlay);
      }

      function hideOptions() {
        optionsContainer.classList.remove('show');
        overlay.classList.remove('show');
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }

      trigger.onclick = (e) => {
        e.stopPropagation();
        if (optionsContainer.classList.contains('show')) hideOptions();
        else showOptions();
      };

      overlay.onclick = hideOptions;

      wrapper.appendChild(trigger);
      wrapper.appendChild(optionsContainer);
      select.parentNode.insertBefore(wrapper, select);

      // Listen for changes on original select if updated externally
      select.addEventListener('change', () => {
          trigger.querySelector('span').textContent = select.options[select.selectedIndex]?.text || '';
          optionsContainer.querySelectorAll('.custom-select-option').forEach((el, i) => {
              if (i === select.selectedIndex) el.classList.add('selected');
              else el.classList.remove('selected');
          });
      });
    });
  }

  // Initial load
  document.addEventListener('DOMContentLoaded', initCustomSelects);
  // Also expose to window
  window.initCustomSelects = initCustomSelects;

  window.AbelionTheme = {
    applyTheme,
    applyAccent,
    getTheme: () => localStorage.getItem(THEME_KEY) || 'light',
    getAccent: () => localStorage.getItem(ACCENT_KEY) || '#007AFF'
  };
})();
