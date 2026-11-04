// Use the school logo as the tab icon when public/arete-logo.png (or arete_logo.png) exists; otherwise keep the default.
(function () {
  var link = document.getElementById('app-icon'), names = ['/arete-logo.png', '/arete_logo.png'];
  (function tryNext(i) {
    if (!link || i >= names.length) return;
    var img = new Image();
    img.onload = function () { link.type = 'image/png'; link.href = names[i]; };
    img.onerror = function () { tryNext(i + 1); };
    img.src = names[i];
  })(0);
})();
