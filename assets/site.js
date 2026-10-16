// MCW IPD site — shared JS
// Mobile nav, experience filter, scroll-reveal, counter animations,
// project page sticky-nav active state, image lightbox.

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  // Supports multiple filter bars (e.g. sector + delivery model) combined with
  // AND logic. A card is visible only if every bar's active filter is "all"
  // or matches a tag on the card.
  document.addEventListener('DOMContentLoaded', function () {
    var bars = document.querySelectorAll('[data-filter-bar]');
    if (!bars.length) return;
    var cards = document.querySelectorAll('[data-project]');

    function applyFilters() {
      // Collect active filter from each bar
      var active = [];
      bars.forEach(function (bar) {
        var btn = bar.querySelector('button.active');
        if (btn) active.push(btn.getAttribute('data-filter'));
      });
      cards.forEach(function (card) {
        var tags = (card.getAttribute('data-tags') || '').split(/\s+/);
        var visible = active.every(function (f) {
          return f === 'all' || tags.indexOf(f) >= 0;
        });
        card.style.display = visible ? '' : 'none';
      });
    }

    bars.forEach(function (bar) {
      bar.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-filter]');
        if (!btn) return;
        bar.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        applyFilters();
      });
    });
  });

  // ---- Scroll-reveal: add .is-visible to .reveal elements as they enter viewport ----
  document.addEventListener('DOMContentLoaded', function () {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      // Show everything immediately for accessibility / older browsers
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  });

  // ---- Stat counters: count up from 0 to data-target when first visible ----
  document.addEventListener('DOMContentLoaded', function () {
    var nums = document.querySelectorAll('.stat .num[data-target]');
    if (!nums.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      nums.forEach(function (el) {
        el.textContent = el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
      });
      return;
    }

    function animate(el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1400;
      var start = performance.now();
      function step(now) {
        var elapsed = now - start;
        var t = Math.min(1, elapsed / duration);
        // ease-out cubic
        var eased = 1 - Math.pow(1 - t, 3);
        var v = Math.round(target * eased);
        el.textContent = v + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  });

  // ---- Sticky in-page nav active state on project pages ----
  document.addEventListener('DOMContentLoaded', function () {
    var toc = document.querySelector('.project-toc');
    if (!toc || !('IntersectionObserver' in window)) return;
    var links = toc.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    var sectionMap = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) sectionMap[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var a = sectionMap[entry.target.id];
        if (!a) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          a.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0 });
    Object.keys(sectionMap).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) io.observe(section);
    });
  });

  // ---- Image lightbox ----
  document.addEventListener('DOMContentLoaded', function () {
    var lightboxable = document.querySelectorAll('.lightboxable img, .feature-image img, .project-hero .hero-image img');
    if (!lightboxable.length) return;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<button class="lb-close" aria-label="Close">✕</button><img alt="" />';
    document.body.appendChild(box);

    var bImg = box.querySelector('img');
    var bClose = box.querySelector('.lb-close');

    function open(src, alt) {
      bImg.src = src;
      bImg.alt = alt || '';
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      bImg.src = '';
    }

    box.addEventListener('click', function (e) {
      if (e.target === box || e.target === bClose) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });

    lightboxable.forEach(function (img) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () {
        open(img.currentSrc || img.src, img.alt);
      });
    });
  });

})();
