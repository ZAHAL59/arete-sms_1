// Runs before the page paints, so a saved dark-mode choice never flashes white. (External file → works with a strict CSP.)
(function () {
  try {
    var p = localStorage.getItem('ARETE_THEME');
    var d = p === 'dark' || (p === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) { document.documentElement.classList.add('dark'); document.documentElement.style.colorScheme = 'dark'; }
  } catch (e) { /* storage blocked: stay light */ }
})();
