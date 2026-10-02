/* =========================================================
   株式会社アクセラ — スクリプト（依存なし・バニラJS）
   1. スクロールイン  2. 数字カウントアップ
   3. パララックス／進捗バー  4. FAQ  5. モバイルメニュー
   ========================================================= */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 1. スクロールイン ---------- */
  var targets = $$('[data-reveal],[data-stagger]');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
    // 保険：2.6秒後に未表示のものを強制表示
    setTimeout(function () { targets.forEach(function (el) { el.classList.add('is-in'); }); }, 2600);
  }

  /* ---------- 2. 数字カウントアップ ---------- */
  var counters = $$('[data-count]');
  function runCount() {
    if (reduce) { return; }
    var t0 = performance.now(), dur = 1500;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      counters.forEach(function (el) {
        el.textContent = String(Math.round(parseFloat(el.dataset.count) * eased));
      });
      if (p < 1) { requestAnimationFrame(step); }
    })(performance.now());
  }
  var numbersEl = $('[data-acl="numbers"]');
  if (numbersEl && !reduce && 'IntersectionObserver' in window) {
    var numIo = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { runCount(); numIo.disconnect(); }
    }, { threshold: 0.3 });
    numIo.observe(numbersEl);
  }

  /* ---------- 3. パララックス／進捗バー ---------- */
  var bar = $('[data-acl="bar"]');
  var heroBg = $('[data-acl="hero-bg"]');
  var heroWord = $('[data-acl="hero-word"]');
  var hex = $('[data-acl="hex"]');
  var raf = null;

  function onScroll() {
    if (raf) { return; }
    raf = requestAnimationFrame(function () {
      raf = null;
      var y = window.scrollY || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) { bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%'; }
      if (reduce) { return; }
      if (heroBg) { heroBg.style.transform = 'translateY(' + (y * 0.16).toFixed(1) + 'px) scale(1.04)'; }
      if (heroWord) { heroWord.style.opacity = String(Math.max(0, 1 - y / 620)); }
      if (hex) {
        var r = hex.getBoundingClientRect();
        var p = (window.innerHeight - r.top) / (window.innerHeight + r.height) - 0.5;
        hex.style.transform = 'translateY(' + (-p * 46).toFixed(1) + 'px)';
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 4. FAQ アコーディオン（同時に1つ開く） ---------- */
  $$('.qa').forEach(function (qa) {
    var btn = $('.qa__q', qa);
    if (!btn) { return; }
    btn.addEventListener('click', function () {
      var willOpen = !qa.classList.contains('is-open');
      $$('.qa').forEach(function (other) {
        other.classList.remove('is-open');
        var b = $('.qa__q', other), s = $('.qa__sign', other);
        if (b) { b.setAttribute('aria-expanded', 'false'); }
        if (s) { s.textContent = '+'; }
      });
      if (willOpen) {
        qa.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        $('.qa__sign', qa).textContent = '−';
      }
    });
  });

  /* ---------- 5. モバイルメニュー ---------- */
  var burger = $('[data-acl="burger"]');
  var nav = $('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
