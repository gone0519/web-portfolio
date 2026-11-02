(function () {
  if (window.__koyoMotion) return; window.__koyoMotion = true;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.8,.2,1)', BOUNCE = 'cubic-bezier(.34,1.56,.64,1)';
  var seen = new WeakSet(), ambient = new WeakSet(), queue = new Map(), anims = new WeakMap();
  function flushAll() { queue.forEach(function (a, el) { try { a.play(); a.finish(); } catch (e) {} io.unobserve(el); }); queue.clear(); }

  function cs(el) { return getComputedStyle(el); }
  function baseT(el) { var t = cs(el).transform; return t && t !== 'none' ? t + ' ' : ''; }
  function isPill(el) { return parseFloat(cs(el).borderTopLeftRadius) >= 100; }
  function white(bg) { return bg === 'rgb(255, 255, 255)'; }

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var a = queue.get(e.target); io.unobserve(e.target); queue.delete(e.target);
      if (a) a.play();
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function reveal(el, kind, delay) {
    if (seen.has(el)) return anims.get(el); seen.add(el);
    var s = cs(el); if (s.opacity !== '1' || s.display === 'none') return;
    var b = baseT(el), from, dur = 900, ease = EASE;
    switch (kind) {
      case 'pop': from = { opacity: 0, transform: b + 'translateY(30px) scale(.7) rotate(-6deg)' }; ease = BOUNCE; dur = 1000; break;
      case 'left': from = { opacity: 0, transform: b + 'translateX(-120px)' }; dur = 1100; break;
      case 'right': from = { opacity: 0, transform: b + 'translateX(120px)' }; dur = 1100; break;
      case 'zoom': from = { opacity: 0, transform: b + 'scale(.88)' }; ease = BOUNCE; break;
      case 'clip': from = { clipPath: 'inset(100% 0 0 0)', transform: b + 'scale(1.15)' }; dur = 1200; break;
      case 'spin': from = { opacity: 0, transform: b + 'scale(0) rotate(-200deg)' }; ease = BOUNCE; dur = 1100; break;
      case 'btn': from = { opacity: 0, transform: b + 'translateY(24px) scale(.9)' }; ease = BOUNCE; break;
      case 'soft': from = { opacity: 0, transform: b + 'translateY(16px)' }; dur = 800; break;
      default: from = { opacity: 0, transform: b + 'translateY(44px)' };
    }
    var to = {}; Object.keys(from).forEach(function (k) { to[k] = k === 'opacity' ? 1 : k === 'clipPath' ? 'inset(0 0 0 0)' : (b || 'none'); });
    var a = el.animate([from, to], { duration: dur, easing: ease, delay: delay || 0, fill: 'backwards' });
    anims.set(el, a);
    var r = el.getBoundingClientRect();
    if (document.visibilityState !== 'visible') { a.finish(); return a; }
    if (r.top < innerHeight * 0.95 && r.bottom > 0) return a;
    a.pause(); a.currentTime = 0;
    queue.set(el, a); io.observe(el);
    return a;
  }

  function after(a, fn) { if (!a) return; if (a.playState === 'finished') fn(); else a.finished.then(fn).catch(function () {}); }
  function bob(el, amp, dur) {
    if (ambient.has(el)) return; ambient.add(el);
    var b = baseT(el);
    el.animate([{ transform: b + 'translateY(0) rotate(0)' }, { transform: b + 'translateY(' + -amp + 'px) rotate(' + (amp / 3) + 'deg)' }],
      { duration: dur, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', delay: Math.random() * -dur });
  }

  var parallax = [];
  function scan() {
    var main = document.querySelector('main'); if (!main) return;

    main.querySelectorAll('h1, h2').forEach(function (h) {
      var big = parseFloat(cs(h).fontSize) >= 36;
      var a = reveal(h, big ? 'pop' : 'up');
      if (h.tagName === 'H1' && /rotate|matrix/.test(cs(h).transform) && h.closest('#hero')) after(a, function () { bob(h, 6, 2600); });
    });
    main.querySelectorAll('p').forEach(function (p) {
      var t = (p.textContent || '').trim();
      reveal(p, t.charAt(0) === '【' ? 'zoom' : 'soft', t.charAt(0) === '【' ? 180 : 80);
    });
    main.querySelectorAll('section > div, section > div > div').forEach(function (d) {
      var s = cs(d);
      if (!white(s.backgroundColor)) return;
      var rL = parseFloat(s.borderTopLeftRadius), rR = parseFloat(s.borderTopRightRadius);
      if (rL < 24 && rR < 24) return;
      var ml = parseFloat(s.marginLeft), mr = parseFloat(s.marginRight);
      reveal(d, Math.abs(ml - mr) < 4 ? 'zoom' : ml > mr ? 'right' : 'left');
    });
    main.querySelectorAll('*').forEach(function (g) {
      var s = cs(g);
      if (s.display !== 'grid' && !(g.tagName === 'OL' || g.tagName === 'UL')) return;
      if (g.closest('nav')) return;
      Array.prototype.forEach.call(g.children, function (c, i) { reveal(c, 'up', (i % 6) * 90); });
    });
    main.querySelectorAll('image-slot').forEach(function (im) {
      var a = reveal(im, 'clip', 120);
      if (/^hero-main|^oc-hero/.test(im.id) && !ambient.has(im)) {
        after(a, function () {
          if (ambient.has(im)) return; ambient.add(im);
          im.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }], { duration: 9000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
        });
      }
    });
    main.querySelectorAll('a, button').forEach(function (b) {
      if (b.closest('nav')) return;
      var s = cs(b);
      if (s.clipPath && s.clipPath.indexOf('polygon') === 0) return;
      if (isPill(b) || parseFloat(s.boxShadow ? 1 : 0)) reveal(b, isPill(b) ? 'btn' : 'up', 120);
    });
    main.querySelectorAll('span').forEach(function (sp) {
      var s = cs(sp);
      if (s.clipPath && s.clipPath.indexOf('polygon') === 0 && sp.offsetWidth > 40) {
        var a = reveal(sp, 'spin', 250); after(a, function () { bob(sp, 7, 1800); });
      } else if (sp.getAttribute('aria-hidden') === 'true' && s.position === 'absolute' && parseFloat(s.borderTopLeftRadius) > 5 && sp.offsetWidth < 40) {
        bob(sp, 14 + Math.random() * 14, 2600 + Math.random() * 2400);
      }
    });
    main.querySelectorAll('svg[aria-hidden="true"]').forEach(function (sv) {
      if (ambient.has(sv)) return; ambient.add(sv);
      var s = cs(sv), atBottom = s.bottom === '0px', atTop = s.top === '0px';
      if (atBottom || atTop) {
        sv.style.transformOrigin = atBottom ? 'bottom' : 'top';
        sv.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(1.22)' }], { duration: 3800 + Math.random() * 1500, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
      } else {
        sv.animate([{ transform: 'scaleX(1.06) translateX(-1.5%)' }, { transform: 'scaleX(1.06) translateX(1.5%)' }], { duration: 7000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', composite: 'add' });
        parallax.push(sv);
      }
    });
    main.querySelectorAll('[aria-hidden="true"]').forEach(function (pk) {
      if (pk.tagName !== 'DIV' || !pk.querySelector('image-slot') || ambient.has(pk)) return;
      bob(pk, 12, 3200 + Math.random() * 1200);
    });
    document.querySelectorAll('[data-marquee]').forEach(function (m) {
      if (ambient.has(m)) return; ambient.add(m);
      m.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: (parseFloat(m.getAttribute('data-marquee')) || 30) * 1000, iterations: Infinity });
    });
    var foot = document.querySelector('footer');
    if (foot) Array.prototype.slice.call(foot.children, 0, 3).forEach(function (z, i) {
      if (ambient.has(z) || cs(z).backgroundImage.indexOf('conic') < 0) return; ambient.add(z);
      z.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: (i ? '-' : '') + '16px 0' }], { duration: 900, iterations: Infinity });
    });
  }

  var t; function schedule() { clearTimeout(t); t = setTimeout(scan, 120); }

  function hover() {
    document.addEventListener('mouseover', function (e) {
      var a = e.target.closest && e.target.closest('a, button');
      if (a && !a.contains(e.relatedTarget) && isPill(a) && a.lastElementChild) {
        a.lastElementChild.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 520, iterations: 2, easing: 'ease-in-out' });
      }
      var art = e.target.closest && e.target.closest('article');
      if (art && !art.contains(e.relatedTarget)) {
        art.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }], { duration: 300, fill: 'forwards', easing: EASE });
        var im = art.querySelector('image-slot');
        if (im) im.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }], { duration: 600, fill: 'forwards', easing: EASE });
      }
    });
    document.addEventListener('mouseout', function (e) {
      var art = e.target.closest && e.target.closest('article');
      if (art && !art.contains(e.relatedTarget)) {
        art.getAnimations().forEach(function (x) { x.cancel(); });
        art.animate([{ transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 300, easing: EASE });
        var im = art.querySelector('image-slot');
        if (im) im.getAnimations().forEach(function (x) { if (x.effect && x.effect.getTiming().iterations !== Infinity) x.cancel(); });
      }
    });
  }

  function chrome() {
    var bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    bar.style.cssText = 'position:fixed;left:0;top:0;height:4px;width:100%;background:#F2A10C;transform-origin:left;transform:scaleX(0);z-index:200;pointer-events:none';
    document.body.appendChild(bar);
    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
      parallax.forEach(function (sv) { sv.style.transform = 'translateY(' + ((sv.getBoundingClientRect().top - innerHeight / 2) * -0.12).toFixed(1) + 'px)'; });
      var hd = document.querySelector('header');
      if (hd && !hd.querySelector('#mobile-menu')) {
        hd.style.transition = 'transform .35s ' + EASE;
        hd.style.transform = y > 320 && y > lastY ? 'translateY(-100%)' : 'translateY(0)';
      }
      lastY = y;
    }, { passive: true });
  }

  function intro() {
    try { if (sessionStorage.getItem('koyo-intro')) return; sessionStorage.setItem('koyo-intro', '1'); } catch (e) {}
    var c = document.createElement('div');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;inset:0;z-index:300;background:#FFE24A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;pointer-events:none;font-family:"Dela Gothic One",sans-serif';
    c.innerHTML = '<span style="width:70px;height:70px;background:#141414;display:grid;place-items:center;border-radius:4px"><span style="width:32px;height:32px;border-radius:50%;background:#FFE24A"></span></span><span style="font-size:30px;color:#141414;letter-spacing:.08em">光葉女子大学</span>';
    document.body.appendChild(c);
    var mark = c.firstChild, txt = c.lastChild;
    mark.animate([{ transform: 'scale(0) rotate(-180deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 700, easing: BOUNCE, fill: 'both' });
    txt.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 300, easing: EASE, fill: 'both' });
    c.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 800, delay: 1300, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' }).finished.then(function () { c.remove(); });
  }

  function start() {
    if (reduce) return;
    intro(); chrome(); hover(); scan();
    setTimeout(function () { if (!document.timeline || (document.timeline.currentTime || 0) < 1000) flushAll(); }, 2500);
    window.addEventListener('beforeprint', flushAll);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState !== 'visible') flushAll(); });
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('load', schedule);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
