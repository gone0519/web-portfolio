(function () {
  if (window.__meiyoMotion) return;
  window.__meiyoMotion = true;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var seen = new WeakSet();
  var pending = new Map();

  var KF = {
    up: [{ opacity: 0, translate: '0 48px' }, { opacity: 1, translate: '0 0' }],
    down: [{ opacity: 0, translate: '0 -40px' }, { opacity: 1, translate: '0 0' }],
    left: [{ opacity: 0, translate: '-70px 0' }, { opacity: 1, translate: '0 0' }],
    right: [{ opacity: 0, translate: '70px 0' }, { opacity: 1, translate: '0 0' }],
    fade: [{ opacity: 0 }, { opacity: 1 }],
    zoom: [{ opacity: 0, scale: '.86' }, { opacity: 1, scale: '1' }],
    pop: [{ opacity: 0, scale: '.4' }, { opacity: 1, scale: '1.06', offset: .7 }, { opacity: 1, scale: '1' }],
    clip: [{ clipPath: 'inset(0 0 100% 0)', translate: '0 30px' }, { clipPath: 'inset(0 0 0% 0)', translate: '0 0' }],
    wipe: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
    wipeR: [{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)' }],
    blur: [{ opacity: 0, filter: 'blur(12px)', translate: '0 20px' }, { opacity: 1, filter: 'blur(0)', translate: '0 0' }]
  };

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var list = pending.get(e.target);
      if (list) { list.forEach(function (a) { a.play(); }); pending.delete(e.target); }
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function reveal(el, type, delay, dur) {
    if (seen.has(el)) return;
    seen.add(el);
    if (reduce) return;
    if ((type === 'wipe' || type === 'wipeR' || type === 'clip') && getComputedStyle(el).clipPath !== 'none') type = 'zoom';
    var a = el.animate(KF[type] || KF.up, { duration: dur || 1000, delay: delay || 0, easing: EASE, fill: 'both' });
    a.pause(); a.currentTime = 0;
    // clip/wipe 系は開始時に要素自身が面積0に切り抜かれ、交差判定が起きないため親要素で監視する
    var target = (type === 'wipe' || type === 'wipeR' || type === 'clip') && el.parentElement ? el.parentElement : el;
    var list = pending.get(target);
    if (list) list.push(a); else { pending.set(target, [a]); io.observe(target); }
  }

  function loop(el) {
    if (seen.has(el)) return;
    seen.add(el);
    if (reduce) return;
    var d = el.dataset;
    if (d.float) {
      var amp = parseFloat(d.float) || 14;
      el.animate([{ translate: '0 0' }, { translate: (amp * .4) + 'px ' + (-amp) + 'px' }], { duration: 2600 + amp * 120, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', delay: -Math.random() * 3000 });
    }
    if (d.spin) el.animate([{ rotate: '0deg' }, { rotate: (d.spinDir === 'ccw' ? '-' : '') + '360deg' }], { duration: parseFloat(d.spin) * 1000, iterations: Infinity });
    if (d.drift) el.animate([{ translate: '0 0' }, { translate: d.drift + 'px 0' }], { duration: 5000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    if (d.marquee) el.animate([{ translate: '0 0' }, { translate: (d.marquee === 'right' ? '' : '-') + '50% 0' }], { duration: (parseFloat(d.speed) || 40) * 1000, iterations: Infinity, direction: d.marquee === 'right' ? 'reverse' : 'normal' });
    if (d.pulse !== undefined) el.animate([{ scale: '1 0', transformOrigin: 'top' }, { scale: '1 1', offset: .5 }, { scale: '1 0', transformOrigin: 'bottom' }], { duration: 1800, iterations: Infinity, easing: 'ease-in-out' });
    if (d.breathe !== undefined) el.animate([{ scale: '1' }, { scale: '1.08' }], { duration: 3200, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
  }

  function scan() {
    document.querySelectorAll('[data-anim]').forEach(function (el) {
      reveal(el, el.dataset.anim, parseFloat(el.dataset.delay) || 0, parseFloat(el.dataset.dur) || 0);
    });
    document.querySelectorAll('[data-stagger]').forEach(function (p) {
      var type = p.dataset.stagger || 'up', step = parseFloat(p.dataset.step) || 90, i = 0;
      Array.prototype.forEach.call(p.children, function (c) {
        if (seen.has(c) || c.tagName === 'TEMPLATE' || c.tagName === 'SCRIPT') return;
        reveal(c, type, Math.min(i++, 8) * step, 0);
      });
    });
    document.querySelectorAll('[data-float],[data-spin],[data-drift],[data-marquee],[data-pulse],[data-breathe]').forEach(loop);
    var par = document.querySelectorAll('[data-parallax]');
    parallaxEls = Array.prototype.slice.call(par);
  }

  // IntersectionObserver の取りこぼし対策：切り抜かれた親の中の要素・画面下端の固定要素・
  // ページ最下部の要素は交差判定が起きないことがあるため、実際の位置でも判定して再生する
  function checkPending() {
    if (!pending.size) return;
    var vh = window.innerHeight;
    var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    pending.forEach(function (list, target) {
      if (!target.isConnected) { pending.delete(target); return; }
      var r = target.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= vh) return;
      var fixed = getComputedStyle(target).position === 'fixed';
      if (r.top < vh * 0.92 || fixed || atBottom) {
        list.forEach(function (a) { a.play(); });
        pending.delete(target);
        io.unobserve(target);
      }
    });
  }

  var parallaxEls = [];
  var ticking = false;
  function onScroll() {
    if (ticking || reduce) return;
    ticking = true;
    requestAnimationFrame(function () {
      checkPending();
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var off = (r.top + r.height / 2 - vh / 2) * (parseFloat(el.dataset.parallax) || .1);
        el.style.translate = '0 ' + (-off).toFixed(1) + 'px';
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; scan(); onScroll(); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  // page transition curtain
  function curtain() {
    var c = document.createElement('div');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#ffdb3d;display:flex;align-items:center;justify-content:center;pointer-events:none;font-family:"Bebas Neue",sans-serif;font-size:clamp(60px,10vw,180px);color:#1e1e1e;letter-spacing:.04em';
    c.textContent = 'MEIYO';
    document.body.appendChild(c);
    return c;
  }
  function start() {
    scan(); onScroll();
    // 親の切り抜きアニメーションが終わったあとに中の要素を拾えるよう、しばらく定期的に確認する
    var n = 0, timer = setInterval(function () { checkPending(); if (++n > 40) clearInterval(timer); }, 250);
    if (reduce) return;
    var c = curtain();
    c.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 800, delay: 250, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = function () { c.remove(); };
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || !/\.dc\.html(#|$)/.test(href)) return;
    var url = new URL(href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    var c = curtain();
    c.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 550, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = function () { location.href = url.href; };
  });
})();
