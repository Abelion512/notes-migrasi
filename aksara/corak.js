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
  window.AbelionTheme = {
    applyTheme,
    applyAccent,
    getTheme: () => localStorage.getItem(THEME_KEY) || 'light',
    getAccent: () => localStorage.getItem(ACCENT_KEY) || '#007AFF'
  };
})();
