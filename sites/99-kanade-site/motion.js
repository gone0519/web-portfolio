(function () {
  if (window.__kanadeMotion) return;
  window.__kanadeMotion = true;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var ORANGE = 'rgb(226, 80, 47)';
  var hidden = function () { return document.visibilityState === 'hidden'; };

  /* ---------- reveal core ---------- */
  function show(el) {
    if (el.__shown) return;
    el.__shown = true;
    var d = +el.dataset.rvDelay || 0;
    el.style.opacity = '1';
    el.style.transform = 'none';
    if (el.dataset.ls) el.style.letterSpacing = el.dataset.ls;
    if (el.style.clipPath) el.style.clipPath = 'inset(0 0 0 0)';
    if (el.__onShow) el.__onShow();
    if (io) io.unobserve(el);
    setTimeout(function () { el.style.transition = 'transform .35s ' + EASE + ', box-shadow .35s ' + EASE; }, d + 1200);
  }
  function showAll() { document.querySelectorAll('[data-rv],[data-pop]').forEach(show); }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) show(e.target); });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }) : null;
  addEventListener('beforeprint', showAll);
  setInterval(function () { if (hidden()) showAll(); }, 1000);

  function prep(el, delay, from, opt) {
    opt = opt || {};
    var attr = opt.pop ? 'data-pop' : 'data-rv';
    if (el.hasAttribute(attr)) return false;
    el.setAttribute(attr, '');
    if (reduce || !io || hidden()) return false;
    el.dataset.rvDelay = delay;
    var dur = opt.dur || 1000;
    el.style.opacity = '0';
    el.style.transform = from;
    var props = ['opacity ' + dur * .9 + 'ms', 'transform ' + dur + 'ms'];
    if (opt.clip) { el.style.clipPath = opt.clip; props.push('clip-path ' + dur * 1.15 + 'ms'); }
    if (opt.ls) { el.dataset.ls = getComputedStyle(el).letterSpacing; el.style.letterSpacing = opt.ls; props.push('letter-spacing ' + dur * 1.3 + 'ms'); }
    el.style.transition = props.map(function (p) { return p + ' ' + EASE + ' ' + delay + 'ms'; }).join(',');
    io.observe(el);
    var r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) setTimeout(function () { show(el); }, 40);
    setTimeout(function () { if (el.getBoundingClientRect().top < innerHeight) show(el); }, 1600 + delay);
    return true;
  }

  /* ---------- hover helpers ---------- */
  function lift(el) {
    if (el.__lift || reduce) return;
    el.__lift = true;
    el.addEventListener('mouseenter', function () { if (el.style.opacity !== '0') { el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 18px 30px -20px rgba(120,60,30,.4)'; } });
    el.addEventListener('mouseleave', function () { if (el.style.opacity !== '0') { el.style.transform = 'none'; el.style.boxShadow = ''; } });
  }
  function tilt(img) {
    if (img.__tilt || reduce || !fine) return;
    img.__tilt = true;
    var host = img.closest('article,a') || img;
    host.addEventListener('mousemove', function (e) {
      var r = img.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      img.style.transition = 'transform .2s ease-out';
      img.style.transform = 'perspective(700px) rotateY(' + x * 8 + 'deg) rotateX(' + -y * 8 + 'deg) scale(1.02)';
    });
    host.addEventListener('mouseleave', function () { img.style.transition = 'transform .6s ' + EASE; img.style.transform = 'none'; });
  }
  function drift(img, always) {
    if (img.__drift || reduce) return;
    if (!/repeating-linear-gradient/.test(getComputedStyle(img).backgroundImage)) return;
    img.__drift = true;
    var a = img.animate([{ backgroundPosition: '0px 0px' }, { backgroundPosition: '22.627px 0px' }], { duration: 2600, iterations: Infinity, easing: 'linear' });
    if (!always) {
      a.pause();
      var host = img.closest('article,a,button') || img;
      host.addEventListener('mouseenter', function () { a.play(); });
      host.addEventListener('mouseleave', function () { a.pause(); });
    }
  }
  function magnet(el) {
    if (el.__mag || reduce || !fine) return;
    el.__mag = true;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.transition = 'transform .15s ease-out';
      el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .18 + 'px,' + (e.clientY - r.top - r.height / 2) * .3 + 'px)';
    });
    el.addEventListener('mouseleave', function () { el.style.transition = 'transform .5s cubic-bezier(.3,1.6,.5,1)'; el.style.transform = 'none'; });
  }
  function arrow(el) {
    if (el.__arrow || reduce) return;
    el.__arrow = true;
    var host = el.closest('a') || el.parentElement;
    el.style.transition = 'transform .45s ' + EASE;
    host.addEventListener('mouseenter', function () { el.style.transform = 'translateX(12px)'; });
    host.addEventListener('mouseleave', function () { el.style.transform = 'none'; });
  }
  function spinIcon(tile) {
    if (tile.__spin || reduce) return;
    tile.__spin = true;
    var icon = tile.firstElementChild;
    if (!icon) return;
    icon.style.transition = 'transform .6s cubic-bezier(.3,1.6,.5,1)';
    tile.addEventListener('mouseenter', function () { icon.style.transform = 'rotate(-10deg) scale(1.08)'; });
    tile.addEventListener('mouseleave', function () { icon.style.transform = 'none'; });
  }

  /* ---------- scan ---------- */
  var words = [], heroImgs = [];
  function scan() {
    var main = document.querySelector('main');
    if (!main) return;
    var sel = 'h1,h2,h3,p,article,[role=img],li,form,dl,nav[aria-label],[role=tablist]';
    var firstSection = main.querySelector('section');
    main.querySelectorAll('*').forEach(function (el) {
      if (el.hasAttribute('data-rv') || el.hasAttribute('data-anim')) return;
      var cs = getComputedStyle(el);
      // full-width orange CTA banners: wipe in from left
      if (el.tagName === 'A' && el.parentElement === main && cs.backgroundColor === ORANGE) {
        prep(el, 0, 'none', { clip: 'inset(0 100% 0 0)', dur: 1300 });
        el.querySelectorAll('span > span').forEach(function (s, i) { if (!s.hasAttribute('data-arrow')) prep(s, 350 + i * 120, 'translateX(-30px)', { pop: true }); });
        return;
      }
      var parent = el.parentElement;
      if (!parent || parent.closest('[data-rv],[data-anim]')) return;
      var ps = getComputedStyle(parent);
      var inGrid = (ps.display === 'grid' || (ps.display === 'flex' && ps.flexDirection === 'column')) && parent.children.length > 1;
      if (!inGrid && !el.matches(sel)) return;
      if (el.closest('[role=list]') && el.getAttribute('role') !== 'listitem') return;
      var idx = Array.prototype.indexOf.call(parent.children, el);
      var delay = inGrid ? Math.min(idx, 7) * 90 : 0;
      var isImg = el.getAttribute('role') === 'img';
      if (/^H[12]$/.test(el.tagName)) prep(el, delay, 'translateY(18px)', { ls: '.6em', dur: 1100 });
      else if (isImg) prep(el, delay, 'scale(.96) translateY(18px)', { clip: 'inset(0 0 100% 0)' });
      else prep(el, delay, 'translateY(28px)');
      if (el.tagName === 'ARTICLE' || (inGrid && cs.backgroundColor === 'rgb(255, 255, 255)' && el.tagName !== 'FORM')) lift(el);
    });

    // eyebrow labels: underline draws in
    main.querySelectorAll('div').forEach(function (el) {
      if (el.__eb) return;
      var cs = getComputedStyle(el);
      if (cs.fontSize !== '11px' || cs.color !== ORANGE || el.children.length || el.textContent.length > 30) return;
      el.__eb = true;
      if (reduce) return;
      el.style.backgroundImage = 'linear-gradient(#E2502F,#E2502F)';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = '0 100%';
      el.style.backgroundSize = '0px 1px';
      el.style.paddingBottom = '6px';
      el.style.transition = 'background-size 1s ' + EASE + ' .25s';
      var go = function () { el.style.backgroundSize = '28px 1px'; };
      var host = el.closest('[data-rv]');
      if (host && !host.__shown) host.__onShow = go; else setTimeout(go, 60);
    });

    // pills pop in
    main.querySelectorAll('span,button').forEach(function (el) {
      if (el.hasAttribute('data-pop')) return;
      var cs = getComputedStyle(el);
      if (parseFloat(cs.borderTopLeftRadius) < 100 || cs.borderTopStyle === 'none') return;
      var sib = Array.prototype.indexOf.call(el.parentElement.children, el);
      prep(el, 200 + Math.min(sib, 8) * 60, 'scale(.6)', { pop: true, dur: 700 });
      el.style.transformOrigin = 'left center';
    });

    main.querySelectorAll('[role=img]').forEach(function (img) {
      var inHero = firstSection && firstSection.contains(img);
      drift(img, inHero);
      if (inHero) { if (heroImgs.indexOf(img) < 0) heroImgs.push(img); }
      else if (img.closest('article')) tilt(img);
    });
    main.querySelectorAll('a,button').forEach(function (el) {
      var cs = getComputedStyle(el);
      if (cs.backgroundColor === ORANGE && el.offsetHeight <= 60 && el.offsetHeight > 0) magnet(el);
    });
    main.querySelectorAll('[role=listitem]').forEach(spinIcon);
    document.querySelectorAll('[data-anim]').forEach(hero);
    document.querySelectorAll('[data-arrow]').forEach(arrow);

    // sidebar items slide in
    document.querySelectorAll('aside nav > a').forEach(function (a, i) {
      if (a.__nav) return;
      a.__nav = true;
      if (reduce || hidden()) return;
      a.animate([{ opacity: 0, transform: 'translateX(-16px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 200 + i * 70, easing: EASE, fill: 'backwards' });
    });
  }

  /* ---------- hero pieces ---------- */
  function hero(el) {
    if (el.__anim) return;
    el.__anim = true;
    if (reduce) return;
    var kind = el.dataset.anim;
    if (kind === 'word') {
      var i = words.length; words.push(el);
      el.animate([{ transform: 'translateY(55%)', opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { transform: 'none', opacity: 1, clipPath: 'inset(-20% 0 -20% 0)' }],
        { duration: 1300, delay: 150 + i * 220, easing: EASE, fill: 'backwards' });
    } else if (kind === 'sun') {
      el.animate([{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'none' }], { duration: 1100, delay: 500, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' })
        .finished.then(function () {
          el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-7px)' }], { duration: 2400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
          el.animate([{ boxShadow: '0 0 0 10px #FCF8F3,0 0 0 11px #F3B9A6' }, { boxShadow: '0 0 0 16px #FCF8F3,0 0 0 17px rgba(243,185,166,0)' }], { duration: 2200, iterations: Infinity, easing: 'ease-out' });
        });
    } else if (kind === 'scroll-line') {
      el.style.transformOrigin = 'top';
      el.animate([{ transform: 'scaleY(0)', opacity: 1, offset: 0 }, { transform: 'scaleY(1)', opacity: 1, offset: .6 }, { transform: 'scaleY(1)', opacity: 0, offset: 1 }],
        { duration: 2000, iterations: Infinity, easing: 'ease-in-out' });
    } else if (kind === 'marquee') {
      el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 38000, iterations: Infinity, easing: 'linear' });
    } else if (kind === 'marker') {
      el.style.backgroundImage = 'linear-gradient(transparent 64%, #FBDCCF 64%)';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundSize = '0% 100%';
      el.style.transition = 'background-size 1.1s ' + EASE + ' 1.1s';
      setTimeout(function () { el.style.backgroundSize = '100% 100%'; }, 60);
    }
  }

  /* ---------- scroll: progress + parallax ---------- */
  var bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:3px;background:#E2502F;transform-origin:left;transform:scaleX(0);z-index:50;pointer-events:none';
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    if (reduce) return;
    var y = Math.min(scrollY, 1000);
    words.forEach(function (w, i) { w.style.transform = 'translateX(' + ((i % 2 ? 1 : -1) * y * 0.12) + 'px)'; });
    heroImgs.forEach(function (im, i) { im.style.transform = 'translateY(' + y * [0.06, 0.12, -0.05][i % 3] + 'px)'; });
  }
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- cursor follower ---------- */
  function cursor() {
    if (reduce || !fine) return;
    var c = document.createElement('div');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;left:0;top:0;width:30px;height:30px;margin:-15px 0 0 -15px;border:1px solid #E2502F;border-radius:50%;pointer-events:none;z-index:60;opacity:0;transition:width .3s,height .3s,margin .3s,background .3s,opacity .3s';
    document.body.appendChild(c);
    var tx = 0, ty = 0, x = 0, y = 0;
    addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY; c.style.opacity = '1';
      var hot = e.target.closest && e.target.closest('a,button,[role=tab]');
      var s = hot ? 56 : 30;
      c.style.width = c.style.height = s + 'px';
      c.style.margin = (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px';
      c.style.background = hot ? 'rgba(226,80,47,.12)' : 'transparent';
    });
    document.addEventListener('mouseleave', function () { c.style.opacity = '0'; });
    (function loop() { x += (tx - x) * .18; y += (ty - y) * .18; c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; requestAnimationFrame(loop); })();
  }

  /* ---------- page transitions ---------- */
  var curtain = document.createElement('div');
  curtain.setAttribute('aria-hidden', 'true');
  curtain.style.cssText = 'position:fixed;inset:0;background:#E2502F;z-index:70;pointer-events:none;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Jost,sans-serif;font-weight:700;font-size:clamp(40px,7vw,96px);letter-spacing:.04em;transform:translateY(100%);visibility:hidden';
  curtain.textContent = 'KANADE';
  function pageIn() {
    if (reduce || hidden() || !sessionStorage.getItem('kanade-nav')) return;
    sessionStorage.removeItem('kanade-nav');
    curtain.style.transform = 'none';
    curtain.style.visibility = 'visible';
    curtain.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], { duration: 800, delay: 150, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' })
      .finished.then(function () { curtain.style.transform = 'translateY(100%)'; curtain.style.visibility = 'hidden'; curtain.getAnimations().forEach(function (a) { a.cancel(); }); });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
    var href = a.getAttribute('href');
    if (!/\.dc\.html/.test(href)) return;
    var url = new URL(href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    try { sessionStorage.setItem('kanade-nav', '1'); } catch (_) {}
    curtain.style.visibility = 'visible';
    curtain.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' })
      .finished.then(function () { location.href = url.href; });
  });

  var t;
  function queue() { clearTimeout(t); t = setTimeout(scan, 60); }
  function start() {
    document.body.appendChild(bar);
    document.body.appendChild(curtain);
    pageIn();
    cursor();
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
    queue(); onScroll();
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
