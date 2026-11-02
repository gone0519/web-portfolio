(function () {
  if (window.__shiomiMotion) return;
  window.__shiomiMotion = 1;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.22,.8,.12,1)';

  // ---- page transition overlay ----
  var ov = document.createElement('div');
  ov.setAttribute('aria-hidden', 'true');
  Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: '1000', background: '#7ccbcd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bodoni Moda',serif", fontStyle: 'italic', fontSize: 'clamp(40px,5vw,88px)', color: '#10302f', pointerEvents: 'none' });
  ov.textContent = 'Shiomi';
  var bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, { position: 'fixed', top: '0', left: '0', right: '0', height: '2px', background: '#7ccbcd', transformOrigin: 'left', transform: 'scaleX(0)', zIndex: '250', pointerEvents: 'none' });
  function hideOv() { ov.getAnimations().forEach(function (a) { a.cancel(); }); ov.style.display = 'none'; }
  function mountChrome() {
    if (!document.body) return requestAnimationFrame(mountChrome);
    document.body.appendChild(bar);
    document.body.appendChild(ov);
    if (reduce) return hideOv();
    setTimeout(function () {
      ov.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 1000, easing: EASE, fill: 'forwards' }).finished.then(hideOv, hideOv);
    }, 350);
  }
  mountChrome();
  addEventListener('pageshow', function (e) { if (e.persisted) hideOv(); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    var href = a.getAttribute('href') || '';
    if (!/\.dc\.html/.test(href)) return;
    var url = new URL(href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    ov.getAnimations().forEach(function (x) { x.cancel(); });
    ov.style.display = 'flex';
    var go = function () { location.href = url.href; };
    ov.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 550, easing: EASE, fill: 'forwards' }).finished.then(go, go);
  }, true);

  if (reduce) return;

  // ---- reveal system ----
  var seen = new WeakSet();
  var pending = new Map();
  var parallax = [];
  var heroIdx = 0;
  var io = new IntersectionObserver(function (entries) {
    var vis = entries.filter(function (en) { return en.isIntersecting; })
      .sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left; });
    vis.forEach(function (en, i) { play(en.target, Math.min(i, 7) * 90); });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  function prep(el, kf, opts, immediateDelay) {
    if (seen.has(el)) return;
    seen.add(el);
    var o = Object.assign({ duration: 1100, easing: EASE, fill: 'both' }, opts);
    var a = el.animate(kf, o);
    a.pause();
    a.__base = o.delay || 0;
    pending.set(el, a);
    if (immediateDelay != null) play(el, immediateDelay);
    else io.observe(el);
  }
  function play(el, extra) {
    var a = pending.get(el);
    if (!a) return;
    pending.delete(el);
    io.unobserve(el);
    a.effect.updateTiming({ delay: a.__base + (extra || 0) });
    a.play();
    a.finished.then(function () { a.cancel(); }, function () {});
  }
  function ancestorSeen(el) {
    for (var p = el.parentElement; p; p = p.parentElement) if (seen.has(p)) return true;
    return false;
  }
  function excluded(el) { return el.closest('header,[role="dialog"],[data-marquee]'); }

  var FADE = [{ opacity: 0, translate: '0 32px' }, { opacity: 1, translate: '0 0' }];
  var HEAD = [{ opacity: 0, translate: '0 .45em', clipPath: 'inset(0 -10% 100% -10%)' }, { opacity: 1, translate: '0 0', clipPath: 'inset(-30% -10% -30% -10%)' }];
  var WIPES = ['inset(0 100% 0 0)', 'inset(100% 0 0 0)', 'inset(0 0 0 100%)', 'inset(0 0 100% 0)'];
  var SPEEDS = [0.07, -0.05, 0.11, -0.08, 0.05, -0.1];
  var BLOCKS = ['main h2', 'main h3', 'main h4', 'main p', 'main li', 'main figure', 'main blockquote', 'main dl > div', 'main thead tr', 'main tbody tr', 'main article > div:not(:has(image-slot))', 'main form > *', 'main nav > a', 'main a:has(image-slot)', 'footer address', 'footer ul', 'footer nav > div', 'footer p', 'footer a', 'footer div[style*="display: grid"] > div'].join(',');

  var wipeN = 0, plxN = 0, didHeader = false;
  function scan() {
    var main = document.querySelector('main');
    if (!main) return;
    var hero = main.querySelector('section');
    var heroDelay = function () { return 250 + (heroIdx++) * 110; };

    // grid lines
    document.querySelectorAll('[aria-hidden="true"]').forEach(function (g) {
      if (seen.has(g) || getComputedStyle(g).position !== 'fixed' || g === ov || g === bar) return;
      seen.add(g);
      Array.prototype.forEach.call(g.children, function (l, i) {
        l.animate([{ scale: '1 0', transformOrigin: 'top' }, { scale: '1 1', transformOrigin: 'top' }], { duration: 2200, delay: 400 + i * 220, easing: EASE, fill: 'backwards' });
      });
    });

    // header + fixed rails
    var header = document.querySelector('header');
    if (header && !didHeader && header.children.length) {
      didHeader = true;
      Array.prototype.forEach.call(header.children, function (c, i) { prep(c, [{ opacity: 0, translate: '0 -16px' }, { opacity: 1, translate: '0 0' }], { duration: 1000 }, 500 + i * 140); });
      header.querySelectorAll('nav a').forEach(function (a, i) { prep(a, [{ opacity: 0, translate: '0 -10px' }, { opacity: 1, translate: '0 0' }], { duration: 800 }, 800 + i * 70); });
    }
    document.querySelectorAll('a[style*="position: fixed"], div[style*="position: fixed"]').forEach(function (el) {
      if (seen.has(el) || el.closest('main,header,footer,[role="dialog"]') || el === ov || el === bar) return;
      if (getComputedStyle(el).position !== 'fixed' || el.getAttribute('aria-hidden') === 'true') return;
      var isCta = el.getAttribute('aria-label') === 'オープンキャンパスを予約する';
      prep(el, [{ opacity: 0, scale: isCta ? '.6' : '1' }, { opacity: 1, scale: '1' }], { duration: 1200, easing: isCta ? 'cubic-bezier(.34,1.56,.64,1)' : EASE }, 1300);
      if (isCta) {
        el.animate([{ borderRadius: '52% 48% 44% 56% / 58% 46% 54% 42%' }, { borderRadius: '44% 56% 58% 42% / 46% 58% 42% 54%' }, { borderRadius: '58% 42% 48% 52% / 52% 44% 56% 48%' }], { duration: 9000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        el.animate([{ translate: '0 0' }, { translate: '0 -8px' }], { duration: 2600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: 2500 });
      }
    });

    // menu dialog
    document.querySelectorAll('[role="dialog"]').forEach(function (d) {
      if (seen.has(d)) return;
      seen.add(d);
      d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: EASE });
      d.querySelectorAll('li, nav > div > a').forEach(function (x, i) {
        x.animate([{ opacity: 0, translate: '-40px 0' }, { opacity: 1, translate: '0 0' }], { duration: 900, delay: 120 + i * 70, easing: EASE, fill: 'backwards' });
      });
    });

    // marquee
    document.querySelectorAll('[data-marquee]').forEach(function (m) {
      if (seen.has(m) || !m.firstElementChild) return;
      seen.add(m);
      m.firstElementChild.animate([{ translate: '0 0' }, { translate: '-50% 0' }], { duration: 48000, iterations: Infinity, easing: 'linear' });
    });

    // hero headline lines
    var h1 = main.querySelector('h1');
    if (h1 && !seen.has(h1) && h1.textContent.trim()) {
      var lines = Array.prototype.filter.call(h1.children, function (s) { return getComputedStyle(s).position !== 'absolute'; });
      if (lines.length) {
        seen.add(h1);
        lines.forEach(function (s, i) { prep(s, [{ translate: '0 70%', opacity: 0, clipPath: 'inset(0 -10% 100% -10%)' }, { translate: '0 0', opacity: 1, clipPath: 'inset(-30% -10% -30% -10%)' }], { duration: 1400 }, 900 + i * 150); });
      }
    }

    // solid colour panels
    main.querySelectorAll('div').forEach(function (d) {
      if (seen.has(d) || d.childElementCount || excluded(d)) return;
      var cs = getComputedStyle(d);
      var bg = cs.backgroundColor;
      if ((bg !== 'rgb(124, 203, 205)' && bg !== 'rgb(236, 241, 239)') || cs.clipPath !== 'none' || d.offsetWidth < 60) return;
      prep(d, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 1500 }, hero && hero.contains(d) ? heroDelay() : null);
    });

    // images
    main.querySelectorAll('image-slot').forEach(function (img) {
      var w = img.parentElement;
      if (!w || seen.has(w) || excluded(w)) return;
      var p = w.parentElement;
      var fullInParent = p && w.offsetWidth >= p.offsetWidth - 1 && w.offsetHeight >= p.offsetHeight - 1 && getComputedStyle(w).position === 'absolute';
      var inHero = hero && hero.contains(w);
      if (fullInParent && inHero && getComputedStyle(p).overflow === 'hidden') {
        // hero slideshow: Ken Burns, reveal the frame instead
        seen.add(w);
        img.animate([{ scale: '1' }, { scale: '1.09' }], { duration: 14000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
        if (!seen.has(p)) prep(p, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 1600 }, heroDelay());
        return;
      }
      var wipe = WIPES[wipeN++ % WIPES.length];
      var d = inHero ? heroDelay() : null;
      prep(w, [{ clipPath: wipe }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1500 }, d);
      prep(img, [{ scale: '1.28' }, { scale: '1' }], { duration: 2000 }, d);
      if (!fullInParent && getComputedStyle(w).position === 'absolute') {
        w.__spd = SPEEDS[plxN++ % SPEEDS.length];
        parallax.push(w);
      }
    });

    // diagonal hairlines
    main.querySelectorAll('span[aria-hidden="true"]').forEach(function (s) {
      if (seen.has(s) || !/rotate\(45deg\)/.test(s.style.transform)) return;
      prep(s, [{ scale: '1 0' }, { scale: '1 1' }], { duration: 1300, delay: 350 }, hero && hero.contains(s) ? heroDelay() : null);
    });

    // text & blocks
    document.querySelectorAll(BLOCKS).forEach(function (el) {
      if (seen.has(el) || excluded(el) || ancestorSeen(el) || !el.offsetParent) return;
      var isHead = /^H[1-3]$/.test(el.tagName) && /Bodoni/.test(getComputedStyle(el).fontFamily);
      prep(el, isHead ? HEAD : FADE, { duration: isHead ? 1300 : 1000 }, hero && hero.contains(el) ? heroDelay() + 300 : null);
    });

    // hover: image zoom on cards, arrow nudge on buttons
    main.querySelectorAll('a').forEach(function (a) {
      if (a.__hov) return;
      a.__hov = 1;
      var img = a.querySelector('image-slot');
      var arrow = Array.prototype.find.call(a.querySelectorAll('span[aria-hidden="true"]'), function (s) { return /[→↓]/.test(s.textContent); });
      var anims = [];
      a.addEventListener('mouseenter', function () {
        anims.forEach(function (x) { x.cancel(); });
        anims = [];
        if (img) anims.push(img.animate([{ scale: '1' }, { scale: '1.06' }], { duration: 900, easing: EASE, fill: 'forwards' }));
        if (arrow) anims.push(arrow.animate([{ translate: '0 0' }, { translate: /↓/.test(arrow.textContent) ? '0 5px' : '8px 0' }], { duration: 500, easing: EASE, fill: 'forwards' }));
      });
      a.addEventListener('mouseleave', function () { anims.forEach(function (x) { x.reverse(); }); });
    });
  }

  var queued = false;
  function queue() { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; scan(); }); }
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('load', queue);
  queue();

  // ---- scroll: progress + parallax ----
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
      var vh = innerHeight;
      parallax = parallax.filter(function (el) { return el.isConnected; });
      parallax.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var off = (r.top + r.height / 2 - vh / 2) * el.__spd;
        el.style.translate = '0 ' + (-off).toFixed(1) + 'px';
      });
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  setTimeout(onScroll, 500);
  addEventListener('beforeprint', function () { pending.forEach(function (a) { a.finish(); }); });
})();
