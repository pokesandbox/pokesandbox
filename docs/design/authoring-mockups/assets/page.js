/* Theme toggle for the standalone mockups. Frames that pin their own theme (the light/dark pairs) keep it. */
(function () {
  var root = document.documentElement,
    btn = document.getElementById('mk-theme');
  function set(t) {
    root.setAttribute('data-theme', t);
    if (btn) btn.textContent = t === 'dark' ? 'Light mode' : 'Dark mode';
    try {
      localStorage.setItem('ps-mockups-theme', t);
    } catch (e) {}
  }
  var saved = null;
  try {
    saved = localStorage.getItem('ps-mockups-theme');
  } catch (e) {}
  set(saved === 'dark' ? 'dark' : 'light');
  if (btn)
    btn.addEventListener('click', function () {
      set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
})();
