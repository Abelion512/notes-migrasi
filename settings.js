(function(){
  const { getVersionMeta } = AbelionUtils;
  const back = document.getElementById('settings-back');
  if (back) back.addEventListener('click', () => {
    sessionStorage.setItem('skipIntro', '1');
    window.location.href = 'index.html';
  });
  const versionBtn = document.getElementById('settings-version');
  if (versionBtn) versionBtn.addEventListener('click', () => {
    window.location.href = 'version-info.html';
  });
  const meta = getVersionMeta();
  const label = document.getElementById('settings-version-label');
  if (meta?.version && label) {
    label.textContent = `${meta.version} (${meta.codename})`;
  }
})();
