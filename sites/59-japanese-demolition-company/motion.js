(function () {
  if (window.__kaitaiMotion) return;
  window.__kaitaiMotion = true;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var E = 'cubic-bezier(.2,.7,.2,1)', E2 = 'cubic-bezier(.76,0,.24,1)';
  var readyAt = performance.now() + (reduce ? 0 : 1250);
  function since() { return Math.max(0, readyAt - performance.now()); }

  function init() {
    var st = document.createElement('style');
    st.textContent = '[data-m-wait]{opacity:0!important}';
    document.head.appendChild(st);

    // ---- curtain (page load / page transition)
    var cur = document.createElement('div');
    cur.setAttribute('aria-hidden', 'true');
    cur.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;overflow:hidden';
    function panel(bg) {
      var d = document.createElement('div');
      d.style.cssText = 'position:absolute;top:0;bottom:0;left:-30%;width:160%;background:' + bg + ';transform:skewX(-16deg)';
      cur.appendChild(d); return d;
    }
    var red = panel('#c4161f'), dark = panel('#0e0e0e');
    var logo = document.createElement('div');
    logo.style.cssText = 'position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border:6px solid #c4161f;transform:rotate(45deg)';
    cur.appendChild(logo);
    document.body.appendChild(cur);
    function clear(el) { el.getAnimations().forEach(function (a) { a.cancel(); }); }
    function openCurtain() {
      if (reduce) { cur.style.display = 'none'; return; }
      [red, dark, logo].forEach(clear);
      cur.style.display = 'block';
      logo.animate([{ transform: 'rotate(-135deg) scale(0)', opacity: 1 }, { transform: 'rotate(45deg) scale(1)', opacity: 1 }], { duration: 650, easing: E, fill: 'both' });
      logo.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 700, fill: 'forwards', composite: 'replace' });
      dark.animate([{ translate: '0 0' }, { translate: '115% 0' }], { duration: 850, delay: 720, easing: E2, fill: 'forwards' });
      red.animate([{ translate: '0 0' }, { translate: '115% 0' }], { duration: 850, delay: 860, easing: E2, fill: 'forwards' })
        .onfinish = function () { cur.style.display = 'none'; };
    }
    openCurtain();
    window.addEventListener('pageshow', function (e) { if (e.persisted) { readyAt = performance.now(); cur.style.display = 'none'; } });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || reduce) return;
      var href = a.getAttribute('href');
      if (!/\.dc\.html/.test(href)) return;
      var url = new URL(href, location.href);
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      [red, dark, logo].forEach(clear);
      logo.style.opacity = '0';
      cur.style.display = 'block';
      red.animate([{ translate: '-115% 0' }, { translate: '0 0' }], { duration: 600, easing: E2, fill: 'both' });
      dark.animate([{ translate: '-115% 0' }, { translate: '0 0' }], { duration: 600, delay: 130, easing: E2, fill: 'both' })
        .onfinish = function () { location.href = url.href; };
    }, true);

    // ---- scroll progress
    var bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:linear-gradient(90deg,#8e0c12,#ff2a33);transform-origin:0 50%;transform:scaleX(0);z-index:70;pointer-events:none';
    document.body.appendChild(bar);

    if (reduce) return;

    // ---- effects
    function anim(el, k, o) { return el.animate(k, Object.assign({ easing: E, fill: 'backwards' }, o)); }
    var FX = {
      up: function (el, d) { anim(el, [{ opacity: 0, translate: '0 48px' }, { opacity: 1, translate: '0 0' }], { duration: 1000, delay: d }); },
      left: function (el, d) { anim(el, [{ opacity: 0, translate: '-56px 0' }, { opacity: 1, translate: '0 0' }], { duration: 900, delay: d }); },
      right: function (el, d) { anim(el, [{ opacity: 0, translate: '72px 0' }, { opacity: 1, translate: '0 0' }], { duration: 900, delay: d }); },
      zoom: function (el, d) { anim(el, [{ opacity: 0, scale: '.9' }, { opacity: 1, scale: '1' }], { duration: 1000, delay: d }); },
      pop: function (el, d) { anim(el, [{ opacity: 0, scale: '.6' }, { opacity: 1, scale: '1.04', offset: .7 }, { opacity: 1, scale: '1' }], { duration: 800, delay: d }); },
      wipe: function (el, d) { anim(el, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 950, delay: d, easing: E2 }); },
      clip: function (el, d) { anim(el, [{ clipPath: 'inset(-20% 100% -20% 0)', translate: '-40px 0' }, { clipPath: 'inset(-20% -5% -20% 0)', translate: '0 0' }], { duration: 1100, delay: d, easing: E2 }); },
      rise: function (el, d) { anim(el, [{ clipPath: 'inset(0 0 100% 0)', translate: '0 40px' }, { clipPath: 'inset(0 0 -10% 0)', translate: '0 0' }], { duration: 1100, delay: d + 120 }); },
      tri: function (el, d) { anim(el, [{ translate: '-100% -100%' }, { translate: '0 0' }], { duration: 1200, delay: d, easing: E2 }); },
      frame: function (el, d) {
        anim(el, [{ clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)' }], { duration: 1150, delay: d, easing: E2 });
      },
      spin: function (el, d) { anim(el, [{ transform: 'rotate(-315deg) scale(0)' }, { transform: 'rotate(45deg) scale(1)' }], { duration: 950, delay: d }); },
      stroke: function (el, d) { anim(el, [{ opacity: 0, translate: '0 24px', filter: 'blur(6px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0)' }], { duration: 900, delay: d }); }
    };
    function zoomSlots(el, d) {
      var s = el.tagName === 'IMAGE-SLOT' ? [el] : el.querySelectorAll('image-slot');
      for (var i = 0; i < s.length && i < 4; i++) anim(s[i], [{ scale: '1.25' }, { scale: '1' }], { duration: 1700, delay: d });
    }

    var io = new IntersectionObserver(function (entries) {
      var vis = entries.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left); });
      vis.forEach(function (e, i) {
        var el = e.target; io.unobserve(el);
        var d = since() + Math.min(i * 90, 720);
        el.removeAttribute('data-m-wait');
        FX[el.__mfx](el, d);
        zoomSlots(el, d);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    function reg(el, fx) {
      if (el.__mfx || el.closest('[data-m-skip]')) return;
      el.__mfx = fx; el.setAttribute('data-m-wait', ''); io.observe(el);
    }
    var para = [];
    function scan() {
      var main = document.querySelector('main') || document.body;
      // hero intro sequence
      document.querySelectorAll('[data-intro]').forEach(function (el) {
        if (el.__mfx) return;
        el.__mfx = 'intro'; el.setAttribute('data-m-wait', '');
        var n = +el.getAttribute('data-intro') || 0, fx = FX[el.getAttribute('data-intro-fx') || 'up'] || FX.up;
        requestAnimationFrame(function () { el.removeAttribute('data-m-wait'); fx(el, since() + n * 150); });
      });
      document.querySelectorAll('[data-hero-img]').forEach(function (el) {
        if (el.__mh) return; el.__mh = 1;
        el.animate([{ scale: '1.2' }, { scale: '1' }], { duration: 2800, easing: E, fill: 'backwards', delay: Math.max(0, since() - 500) });
      });
      var hd = document.querySelector('header');
      if (hd && !hd.__mh) { hd.__mh = 1; hd.animate([{ translate: '0 -100%' }, { translate: '0 0' }], { duration: 900, delay: since() + 200, easing: E, fill: 'backwards' }); }
      main.querySelectorAll('[data-reveal]').forEach(function (el) { reg(el, FX[el.getAttribute('data-reveal')] ? el.getAttribute('data-reveal') : 'up'); });
      main.querySelectorAll('h2').forEach(function (el) { reg(el, 'rise'); });
      document.querySelectorAll('[style*="rgb(122, 8, 13)"]').forEach(function (el) { if (!el.closest('header')) reg(el, 'wipe'); });
      document.querySelectorAll('image-slot').forEach(function (s) {
        var p = s.parentElement; if (!p || p.__mfx || p.closest('[data-intro],[data-hero-img]')) return;
        if (getComputedStyle(p).position === 'absolute') return;
        reg(p, 'frame');
        var card = s.closest('a,article');
        if (card && !card.__mhov) {
          card.__mhov = 1;
          card.addEventListener('mouseenter', function () { s.animate([{ scale: '1' }, { scale: '1.08' }], { duration: 700, easing: E, fill: 'forwards' }); });
          card.addEventListener('mouseleave', function () { s.animate([{ scale: '1.08' }, { scale: '1' }], { duration: 700, easing: E, fill: 'forwards' }); });
        }
      });
      main.querySelectorAll('[style*="rotate(45deg)"]').forEach(function (el) { if (el.offsetWidth && el.offsetWidth <= 20) reg(el, 'spin'); });
      main.querySelectorAll('li').forEach(function (el) { reg(el, 'left'); });
      document.querySelectorAll('[style*="text-stroke"]').forEach(function (el) {
        if (getComputedStyle(el).writingMode.indexOf('vertical') === 0) {
          if (!el.__mp) { el.__mp = 1; para.push({ el: el, ax: 'y', f: -0.25 }); }
        } else reg(el, 'stroke');
      });
      document.querySelectorAll('[aria-hidden="true"][style*="polygon"]').forEach(function (el) {
        if (!el.__mp && el.parentElement) { el.__mp = 1; para.push({ el: el, ax: 'x', f: 0.18 }); }
      });
      document.querySelectorAll('[data-marquee]').forEach(function (el) {
        if (el.__mq) return; el.__mq = 1;
        el.animate([{ translate: '0 0' }, { translate: '-50% 0' }], { duration: (+el.getAttribute('data-marquee') || 40) * 1000, iterations: Infinity });
      });
      document.querySelectorAll('[data-scrollcue]').forEach(function (el) {
        if (el.__mq) return; el.__mq = 1;
        el.animate([{ translate: '0 -100%' }, { translate: '0 300%' }], { duration: 1800, iterations: Infinity, easing: E2 });
      });
      tick();
    }

    var raf = 0;
    function tick() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var h = innerHeight, max = Math.max(1, document.documentElement.scrollHeight - h);
        bar.style.transform = 'scaleX(' + Math.min(1, scrollY / max) + ')';
        para.forEach(function (p) {
          if (!p.el.isConnected) return;
          var r = p.el.parentElement.getBoundingClientRect();
          if (r.bottom < -200 || r.top > h + 200) return;
          var c = (r.top + r.height / 2 - h / 2) * p.f;
          p.el.style.translate = p.ax === 'x' ? c + 'px 0' : '0 ' + c + 'px';
        });
      });
    }
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);

    var queued = false;
    new MutationObserver(function () {
      if (queued) return; queued = true;
      queueMicrotask(function () { queued = false; scan(); });
    }).observe(document.body, { childList: true, subtree: true });
    scan();
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
