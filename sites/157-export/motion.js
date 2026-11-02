(function () {
  if (window.__miokaMotion) return; window.__miokaMotion = true;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var css = document.createElement('style');
  css.textContent =
    '@keyframes m-kenburns{from{transform:scale(1.14)}to{transform:scale(1)}}' +
    '@keyframes m-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.045)}}' +
    '@keyframes m-float{0%,100%{transform:translate(0,0)}50%{transform:translate(6px,-22px)}}' +
    '@keyframes m-drift{0%{transform:translate(0,0) rotate(-10deg)}100%{transform:translate(8%,26px) rotate(-3deg)}}' +
    '@keyframes m-shine{0%{transform:translateX(-160%) skewX(-20deg)}55%,100%{transform:translateX(360%) skewX(-20deg)}}' +
    '@keyframes m-ring{0%{box-shadow:0 0 0 0 rgba(251,106,48,.55)}100%{box-shadow:0 0 0 18px rgba(251,106,48,0)}}' +
    '@keyframes m-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '@keyframes m-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}' +
    '@keyframes m-spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(css);

  var seen = new WeakSet();
  // 表示待ちの要素。IntersectionObserver は使わない：
  // clip-path で隠した要素（wipe / circle / rise）は、画面内にあっても
  // isIntersecting=false / ratio=0 と報告されるため、表示のきっかけが
  // 永久に来ず、画像が出てこなくなる。位置は clip-path の影響を受けない
  // getBoundingClientRect() で判定する。
  var waiting = [];
  function sweep() {
    if (!waiting.length) return;
    var h = window.innerHeight || 0;
    for (var i = waiting.length - 1; i >= 0; i--) {
      var el = waiting[i];
      if (!el.isConnected) { waiting.splice(i, 1); continue; }
      // 画面の下端付近まで来たもの＋すでに上へ通り過ぎたもの（#anchor 直リンク対策）
      if (el.getBoundingClientRect().top < h * 0.94) { waiting.splice(i, 1); show(el); }
    }
  }

  var START = {
    up: { opacity: '0', transform: 'translateY(40px)' },
    blur: { opacity: '0', transform: 'translateY(18px)', filter: 'blur(10px)' },
    pop: { opacity: '0', transform: 'scale(.6) rotate(-8deg)' },
    rise: { opacity: '0', transform: 'translateY(60%)', clipPath: 'inset(0 0 100% 0)' },
    wipe: { clipPath: 'inset(0 100% 0 0)' },
    wipeL: { clipPath: 'inset(0 0 0 100%)' },
    circle: { clipPath: 'circle(0% at 50% 50%)', transform: 'rotate(-20deg) scale(.9)' },
    left: { opacity: '0', transform: 'translateX(-50px)' },
    right: { opacity: '0', transform: 'translateX(50px)' }
  };
  var END = { opacity: '1', transform: 'none', filter: 'none', clipPath: 'inset(0 0 0 0)' };
  var DUR = { up: 1000, blur: 1100, pop: 800, rise: 1000, wipe: 1400, wipeL: 1600, circle: 1300, left: 1000, right: 1000 };

  function prep(el, kind, delay) {
    if (seen.has(el)) return; seen.add(el);
    if (RM) return;
    var s = el.style, st = START[kind];
    el.__m = { kind: kind, delay: delay || 0, orig: { transition: s.transition, transform: s.transform, opacity: s.opacity, filter: s.filter, clipPath: s.clipPath } };
    s.transition = 'none';
    for (var k in st) s[k] = st[k];
    waiting.push(el);
  }
  function show(el) {
    var m = el.__m; if (!m) return;
    var d = DUR[m.kind], s = el.style;
    void el.offsetWidth;
    s.transition = ['opacity', 'transform', 'filter', 'clip-path'].map(function (p) { return p + ' ' + d + 'ms ' + EASE + ' ' + m.delay + 'ms'; }).join(',');
    var st = START[m.kind];
    for (var k in st) s[k] = k === 'clipPath' && m.kind === 'circle' ? 'circle(75% at 50% 50%)' : END[k];
    setTimeout(function () { for (var k in m.orig) s[k] = m.orig[k]; if (m.after) m.after(); }, d + m.delay + 60);
  }
  function sibIndex(el) { var i = 0, n = el; while ((n = n.previousElementSibling)) i++; return i; }

  function heroEntrance(hero) {
    if (seen.has(hero)) return; seen.add(hero);
    var t = 150;
    hero.querySelectorAll(PHOTO).forEach(function (img) {
      if (RM) return;
      img.style.animation = 'm-kenburns 2.6s ' + EASE + ' both, m-breathe 18s ease-in-out 2.6s infinite';
    });
    hero.querySelectorAll('[data-reveal-img]').forEach(function (w) { prep(w, 'wipeL', 0); });
    var items = hero.querySelectorAll('[data-reveal]');
    if (!items.length) items = hero.querySelectorAll('h1, p');
    items.forEach(function (el) {
      if (el.hasAttribute('data-badges')) {
        seen.add(el);
        Array.prototype.forEach.call(el.children, function (b, i) {
          prep(b, 'pop', t + i * 110);
          ring(b, i);
        });
        t += 500;
      } else if (el.tagName === 'H1') {
        seen.add(el);
        Array.prototype.forEach.call(el.children, function (sp, i) { sp.style.display = 'block'; prep(sp, 'rise', t + i * 220); });
        t += 480;
      } else { prep(el, 'up', t); t += 160; }
    });
    if (hero.hasAttribute('data-bubbles')) bubbles(hero);
  }
  function ring(b, i) {
    if (RM) return;
    b.style.position = 'relative'; b.style.borderColor = 'transparent';
    var r = document.createElement('span');
    r.setAttribute('aria-hidden', 'true');
    r.style.cssText = 'position:absolute;inset:-1px;border-radius:50%;border:1px dashed #ee6a17;pointer-events:none;animation:m-spin ' + (16 + i * 3) + 's linear infinite' + (i % 2 ? ' reverse' : '');
    b.appendChild(r);
    b.__m.after = function () { b.style.animation = 'm-bob 4.5s ease-in-out ' + (i * 0.35) + 's infinite'; };
  }
  function bubbles(host) {
    if (RM) return;
    var spots = [[52, 58, 64], [56, 44, 20], [49, 30, 12], [60, 76, 34], [88, 22, 26], [94, 60, 14], [70, 10, 10], [45, 84, 40]];
    spots.forEach(function (p, i) {
      var b = document.createElement('span');
      b.setAttribute('aria-hidden', 'true');
      b.style.cssText = 'position:absolute;left:' + p[0] + '%;top:' + p[1] + '%;width:' + p[2] + 'px;height:' + p[2] + 'px;border-radius:50%;background:#fff;opacity:' + (0.55 + (i % 3) * 0.15) + ';pointer-events:none;z-index:3;box-shadow:0 0 24px rgba(255,255,255,.8);animation:m-float ' + (6 + i * 1.3) + 's ease-in-out ' + (i * 0.4) + 's infinite';
      host.appendChild(b);
    });
  }
  function shine(el) {
    if (seen.has(el) || RM) return; seen.add(el);
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    var s = document.createElement('span');
    s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:0;bottom:0;left:0;width:36%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);pointer-events:none;animation:m-shine 3.8s ease-in-out ' + (Math.random() * 2).toFixed(2) + 's infinite';
    el.appendChild(s);
  }
  function zoom(img) {
    if (img.__z || RM) return; img.__z = true;
    var p = img.parentElement; if (!p || getComputedStyle(p).overflow !== 'hidden') return;
    var card = img.closest('a, article, figure') || p;
    img.style.transition = (img.style.transition ? img.style.transition + ',' : '') + 'transform .9s ' + EASE;
    card.addEventListener('mouseenter', function () { img.style.transform = 'scale(1.07)'; });
    card.addEventListener('mouseleave', function () { img.style.transform = ''; });
  }

  // 画像枠：<image-slot>（仮の枠）と、差し替え済みの <img data-photo> の両方
  var PHOTO = 'image-slot, img[data-photo]';
  var AUTO = 'h2, article, figure, blockquote, li, table, form, dl, [data-reveal], [data-reveal-img]';
  var UNIT = 'article, figure, blockquote, li, table, form, dl';
  function scan() {
    var hero = document.querySelector('[data-hero]');
    if (hero) heroEntrance(hero);
    var main = document.querySelector('main');
    if (main) {
      main.querySelectorAll(AUTO).forEach(function (el) {
        if (seen.has(el) || (hero && hero.contains(el))) return;
        var par = el.parentElement && el.parentElement.closest(UNIT);
        if (par && main.contains(par)) return;
        if (el.hasAttribute('data-reveal-img')) return prep(el, 'wipe', 0);
        if (el.tagName === 'H2') return prep(el, 'blur', 0);
        var i = sibIndex(el) % 6;
        var grid = el.parentElement && getComputedStyle(el.parentElement).display.indexOf('grid') > -1;
        // 横スライド演出は「本文幅いっぱいでない要素」だけに使う。
        // 全幅ブロックを translateX すると横スクロールバーが出るため。
        var fullWidth = el.getBoundingClientRect().width > main.clientWidth - 60;
        var side = el.tagName === 'ARTICLE' && i % 2 && !fullWidth;
        prep(el, grid ? 'up' : (side ? 'right' : 'up'), i * 110);
      });
      main.querySelectorAll(PHOTO).forEach(function (img) {
        if (hero && hero.contains(img)) return;
        zoom(img);
        if (img.closest('[data-reveal-img]')) return;
        var round = img.getAttribute('shape') === 'circle' || img.getAttribute('data-shape') === 'circle';
        prep(img, round ? 'circle' : 'wipe', 200);
      });
    }
    document.querySelectorAll('footer > div > *').forEach(function (el, i) { prep(el, 'up', (i % 4) * 120); });
    document.querySelectorAll('a, button').forEach(function (el) {
      var st = el.getAttribute('style') || '';
      if (/f25c05|242,\s*92,\s*5/i.test(st)) shine(el);
    });
    document.querySelectorAll('[data-drift]').forEach(function (el) {
      if (seen.has(el) || RM) return; seen.add(el);
      el.style.animation = 'm-drift ' + (12 + Math.random() * 6).toFixed(1) + 's ease-in-out infinite alternate';
    });
    document.querySelectorAll('[data-marquee-track]').forEach(function (el) {
      if (seen.has(el) || RM) return; seen.add(el);
      el.style.animation = 'm-marquee ' + (el.getAttribute('data-marquee-track') || 40) + 's linear infinite';
    });
    document.querySelectorAll('[data-side-btn]').forEach(function (el) {
      if (seen.has(el) || RM) return; seen.add(el);
      el.style.animation = 'm-ring 2.2s ease-out infinite';
    });
    sweep();
    onScroll();
  }

  var bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;z-index:9999;background:linear-gradient(90deg,#f7931e,#f25c05);transform-origin:0 50%;transform:scaleX(0);pointer-events:none';
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      sweep();
      var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      if (!RM) document.querySelectorAll('[data-parallax]').forEach(function (el) {
        el.style.translate = '0 ' + (y * parseFloat(el.getAttribute('data-parallax') || 0.1)).toFixed(1) + 'px';
      });
      document.querySelectorAll('[data-totop]').forEach(function (el) {
        var on = y > 400;
        el.style.opacity = on ? '1' : '0'; el.style.transform = on ? 'none' : 'translateY(16px)';
        el.style.pointerEvents = on ? 'auto' : 'none'; el.style.transition = 'opacity .4s, transform .4s';
      });
    });
  }
  // sweep() は requestAnimationFrame を待たずその場で走らせる。
  // 表示判定を遅らせると「画面内にあるのに出てこない」時間ができるため。
  function onView() { sweep(); onScroll(); }
  window.addEventListener('scroll', onView, { passive: true });
  window.addEventListener('resize', onView);
  // 画像の読み込みなどでページの高さが変わると、要素の位置もずれる。
  // その後に再判定しないと「画面内なのに出てこない」要素が残るので、
  // レイアウトが動いたら必ずもう一度判定する。
  window.addEventListener('load', sweep);
  if (window.ResizeObserver) {
    new ResizeObserver(function () { sweep(); }).observe(document.documentElement);
  }

  var pending = null;
  function queue() { if (pending) return; pending = setTimeout(function () { pending = null; scan(); }, 60); }
  function boot() {
    document.body.appendChild(bar);
    scan();
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
