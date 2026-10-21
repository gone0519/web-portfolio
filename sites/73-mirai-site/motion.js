(function () {
  if (window.__motionInit) return; window.__motionInit = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var AUTO = 'section > div > div, section article, section h1, section h2, section > p, section table, [data-reveal]';
  var seen = new WeakSet(), queue = [], flushT = null, pending = new Set();

  var MODES = {
    up: { from: function (el) { el.style.opacity = '0'; el.style.transform = 'translateY(28px)'; }, to: function (el) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, props: 'opacity .9s ' + EASE + ' {d}, transform .9s ' + EASE + ' {d}', dur: 900 },
    fade: { from: function (el) { el.style.opacity = '0'; }, to: function (el) { el.style.opacity = '1'; }, props: 'opacity 1.2s ease {d}', dur: 1200 },
    clip: { from: function (el) { el.style.clipPath = 'inset(0 0 100% 0)'; }, to: function (el) { el.style.clipPath = 'inset(0 0 0 0)'; }, props: 'clip-path 1.4s ' + EASE + ' {d}', dur: 1400 },
    wipe: { from: function (el) { el.style.clipPath = 'inset(0 100% 0 0)'; }, to: function (el) { el.style.clipPath = 'inset(0 0 0 0)'; }, props: 'clip-path 1s ' + EASE + ' {d}', dur: 1000 }
  };

  var io = reduce ? null : new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target); pending.delete(e.target); queue.push(e.target);
    });
    if (!flushT) flushT = requestAnimationFrame(flush);
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  function flush() {
    flushT = null;
    var byParent = new Map();
    queue.splice(0).forEach(function (el) {
      var p = el.parentElement, n = byParent.get(p) || 0; byParent.set(p, n + 1);
      var m = MODES[el.getAttribute('data-reveal')] || MODES.up, d = Math.min(n * 90, 450);
      el.style.transition = m.props.split('{d}').join(d + 'ms');
      m.to(el);
      setTimeout(function () { el.style.transition = ''; el.style.transform = ''; el.style.opacity = ''; el.style.clipPath = ''; }, m.dur + d + 60);
    });
  }

  function scan() {
    if (reduce) return;
    var list = Array.prototype.slice.call(document.querySelectorAll(AUTO)).filter(function (el) {
      if (seen.has(el) || el.closest('header, footer')) return false;
      var cs = getComputedStyle(el);
      return cs.position !== 'absolute' && cs.position !== 'fixed';
    });
    var set = new Set(list);
    list.forEach(function (el) {
      for (var a = el.parentElement; a; a = a.parentElement) if (set.has(a) || (seen.has(a) && !a.hasAttribute('data-reveal'))) { if (!el.hasAttribute('data-reveal')) return; }
      seen.add(el);
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.92 && r.bottom > 0) {
        (MODES[el.getAttribute('data-reveal')] || MODES.up).from(el);
        el.getBoundingClientRect();
        queue.push(el);
        if (!flushT) flushT = requestAnimationFrame(function () { requestAnimationFrame(flush); flushT = null; });
        return;
      }
      (MODES[el.getAttribute('data-reveal')] || MODES.up).from(el);
      pending.add(el);
      io.observe(el);
    });
  }

  var fx = new WeakSet();
  function decor() {
    if (reduce) return;
    document.querySelectorAll('[data-marquee]').forEach(function (el) {
      if (fx.has(el)) return; fx.add(el);
      el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: (parseFloat(el.getAttribute('data-marquee')) || 40) * 1000, iterations: Infinity, direction: el.hasAttribute('data-marquee-reverse') ? 'reverse' : 'normal' });
    });
    document.querySelectorAll('[data-spin]').forEach(function (el) {
      if (fx.has(el)) return; fx.add(el);
      el.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: (parseFloat(el.getAttribute('data-spin')) || 24) * 1000, iterations: Infinity });
    });
    document.querySelectorAll('[data-sakura]').forEach(function (host) {
      if (fx.has(host) || host.offsetHeight < 50) return; fx.add(host);
      var layer = document.createElement('div');
      layer.setAttribute('aria-hidden', 'true');
      layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:4';
      var n = parseInt(host.getAttribute('data-sakura'), 10) || 14, H = host.offsetHeight + 60;
      var cols = ['#f7c3cc', '#f3a9b7', '#fbd8de', '#ee8d9f'];
      for (var i = 0; i < n; i++) {
        var p = document.createElement('span'), s = 7 + Math.random() * 14, dur = 7000 + Math.random() * 8000, drift = (Math.random() - 0.3) * 260, rot = 300 + Math.random() * 420;
        p.style.cssText = 'position:absolute;top:-24px;left:' + (Math.random() * 100).toFixed(1) + '%;width:' + s.toFixed(1) + 'px;height:' + (s * 0.72).toFixed(1) + 'px;background:' + cols[i % cols.length] + ';border-radius:100% 0 100% 0;opacity:0';
        layer.appendChild(p);
        var kf = [], steps = 8, amp = 30 + Math.random() * 50, ph = Math.random() * 6.28;
        for (var k = 0; k <= steps; k++) {
          var t = k / steps, x = drift * t + Math.sin(ph + t * 9) * amp, y = H * t;
          kf.push({ offset: t, transform: 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px) rotate(' + (rot * t).toFixed(0) + 'deg) rotateX(' + (rot * 1.8 * t).toFixed(0) + 'deg) rotateY(' + (rot * 0.9 * t).toFixed(0) + 'deg)', opacity: k === 0 || k === steps ? 0 : 0.92 });
        }
        p.animate(kf, { duration: dur, delay: -Math.random() * dur, iterations: Infinity, easing: 'linear' });
      }
      host.appendChild(layer);
    });
  }
  var scanT = null;
  function schedule() { clearTimeout(scanT); scanT = setTimeout(function () { scan(); decor(); }, 60); }
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });

  // parallax backgrounds
  var ticking = false;
  function parallax() {
    ticking = false;
    var vh = innerHeight;
    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.25;
      var y = Math.max(-120, Math.min(220, -r.top * k));
      el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    });
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    top.style.opacity = h.scrollTop > 600 ? '1' : '0';
    top.style.pointerEvents = h.scrollTop > 600 ? 'auto' : 'none';
    top.style.transform = h.scrollTop > 600 ? 'translateY(0)' : 'translateY(12px)';
  }
  function sweep(all) {
    var vh = innerHeight, hit = false;
    pending.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (all || (r.top < vh && r.bottom > 0)) { io.unobserve(el); pending.delete(el); queue.push(el); hit = true; }
    });
    if (hit) flush();
  }
  setInterval(function () { sweep(false); }, 800);
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }

  // progress bar + back to top
  var bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:#d8343b;transform-origin:0 50%;transform:scaleX(0);z-index:100;pointer-events:none';
  var top = document.createElement('button');
  top.setAttribute('aria-label', 'ページの先頭へ');
  top.textContent = '↑';
  top.style.cssText = 'position:fixed;right:20px;bottom:24px;width:52px;height:52px;border-radius:50%;border:0;background:#d8343b;color:#fff;font-size:18px;cursor:pointer;z-index:60;opacity:0;pointer-events:none;transform:translateY(12px);transition:opacity .4s,transform .4s,background .2s;box-shadow:0 6px 16px rgba(216,52,59,.3)';
  top.onclick = function () { scrollTo({ top: 0, behavior: 'smooth' }); };
  top.onmouseenter = function () { top.style.background = '#b3262d'; };
  top.onmouseleave = function () { top.style.background = '#d8343b'; };

  // hover: image zoom inside cards, arrow nudge on buttons
  function setHover(card, on) {
    card.querySelectorAll('image-slot').forEach(function (s, i) {
      if (i > 1) return;
      s.style.transition = 'transform .9s ' + EASE;
      s.style.transform = on ? 'scale(1.05)' : '';
    });
    Array.prototype.forEach.call(card.querySelectorAll('span'), function (sp) {
      if (sp.textContent.trim() === '›' && sp.children.length === 0) {
        sp.style.transition = 'transform .3s ' + EASE; sp.style.display = 'inline-block';
        sp.style.transform = on ? 'translateX(5px)' : '';
      }
    });
  }
  document.addEventListener('mouseover', function (e) {
    var c = e.target.closest && e.target.closest('article, a, button, [data-card]');
    if (c && !c.contains(e.relatedTarget)) setHover(c, true);
  });
  document.addEventListener('mouseout', function (e) {
    var c = e.target.closest && e.target.closest('article, a, button, [data-card]');
    if (c && !c.contains(e.relatedTarget)) setHover(c, false);
  });

  function boot() {
    document.body.appendChild(bar); document.body.appendChild(top);
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
    scan(); decor(); parallax();
    setTimeout(function () { sweep(false); }, 3000);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
