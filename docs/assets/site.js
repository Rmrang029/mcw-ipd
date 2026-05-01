// MCW IPD site — shared JS
// Mobile nav toggle + filter logic for the experience grid

(function () {
  // ---- Mobile nav ----
  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('nav.primary');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }
  });

  // ---- Experience filter ----
  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.querySelector('[data-filter-bar]');
    if (!bar) return;
    var cards = document.querySelectorAll('[data-project]');
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      bar.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split(/\s+/);
        var show = (f === 'all') || tags.indexOf(f) >= 0;
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();
