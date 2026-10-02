/* =========================================================
   SORA — 共通スクリプト（バニラJS / フレームワーク不要）
   ========================================================= */
(function () {
  'use strict';

  /* ---------- モバイルメニュー ---------- */
  function initMenu() {
    var burger = document.querySelector('.burger');
    var menu = document.querySelector('.mobile-menu');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }

  /* ---------- FAQ アコーディオン（1つずつ開く） ---------- */
  function initFaq() {
    var items = document.querySelectorAll('.faq');
    items.forEach(function (item) {
      var btn = item.querySelector('button');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');
        items.forEach(function (i) { i.classList.remove('open'); });
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  /* ---------- 数字カウントアップ ---------- */
  function animateCount(el) {
    if (el.__done) return; el.__done = true;
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var dur = 1500, start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      var v = target * ease;
      el.textContent = (dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US')) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- スクロール表示（reveal） ---------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal, [data-count]'));
    function show(el) {
      if (el.__shown) return; el.__shown = true;
      var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(function () { el.classList.add('shown'); }, delay);
      if (el.hasAttribute('data-count')) animateCount(el);
    }
    function check() {
      var h = window.innerHeight || 800;
      els.forEach(function (el) {
        if (el.__shown) return;
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > 0) show(el);
      });
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
    // 保険：JSが動けば必ず表示する
    setTimeout(function () { els.forEach(show); }, 1800);
  }

  /* ---------- 実績カテゴリフィルター ---------- */
  function initFilter() {
    var buttons = document.querySelectorAll('.filter');
    var cards = document.querySelectorAll('[data-cat]');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        cards.forEach(function (c) {
          var show = (f === 'all' || c.getAttribute('data-cat') === f);
          c.style.display = show ? '' : 'none';
        });
      });
    });
  }

  function init() {
    initMenu();
    initFaq();
    initReveal();
    initFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
