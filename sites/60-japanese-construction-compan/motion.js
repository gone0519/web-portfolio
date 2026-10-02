// KANAME motion engine — data属性で動きを付与します
// data-reveal="1|left|right|scale|mask|slide|slide-r"  スクロールで表示（画像枠は自動でmask）
// data-reveal-children   直下の子要素を順番に表示
// data-intro="line|up|down|track|fade"  読み込み時に順番に再生
// data-count="1500"      数字のカウントアップ
// data-parallax="0.15"   視差スクロール
// data-kenburns          ゆっくりズームアウト
// data-marquee           横に流れるテキスト（中身を2回書く）
// data-loop="drop"       スクロール誘導線のループ
// data-scrollfade        スクロールでフェードアウト
(function () {
  if (window.KanameMotion) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.19,1,.22,1)';
  const BLUE = '#2446e6';
  let io, countIO, introIndex = 0, introT0 = 0;
  const parallax = new Set(), marquees = new Set(), fades = new Set();

  const variantOf = el => {
    let v = el.dataset.reveal || '1';
    if (v === '1' && el.querySelector('image-slot') && !el.querySelector('h1,h2,h3,p,dl,ul')) v = 'mask';
    return v;
  };
  const FROM = {
    '1': { opacity: 0, translate: '0 48px' },
    left: { opacity: 0, translate: '-72px 0' },
    right: { opacity: 0, translate: '72px 0' },
    scale: { opacity: 0, scale: '.92' },
    slide: { translate: '-100% 0' },
    'slide-r': { translate: '100% 0' },
  };
  const TO = { opacity: 1, translate: '0 0', scale: '1' };

  function hide(el) {
    const v = variantOf(el);
    el.dataset.rvV = v;
    if (v === 'mask') [...el.children].forEach(c => { c.style.opacity = '0'; });
    else Object.assign(el.style, FROM[v] || FROM['1']);
  }
  function clear(el, keys) { keys.forEach(k => { el.style[k] = ''; }); }
  function play(el, delay) {
    const v = el.dataset.rvV;
    if (v === 'mask') {
      const kids = [...el.children];
      const cs = getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'relative';
      const bar = document.createElement('div');
      bar.setAttribute('aria-hidden', 'true');
      bar.style.cssText = `position:absolute;inset:0;z-index:6;background:${BLUE};pointer-events:none;clip-path:inset(0 100% 0 0)`;
      el.appendChild(bar);
      bar.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)', offset: .45 }, { clipPath: 'inset(0 0 0 100%)' }],
        { duration: 1300, delay, easing: 'cubic-bezier(.77,0,.18,1)', fill: 'both' }).onfinish = () => bar.remove();
      kids.forEach(c => {
        c.animate([{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: 1, offset: .46 }, { opacity: 1 }],
          { duration: 1300, delay, fill: 'both' }).onfinish = function () { c.style.opacity = ''; this.cancel(); };
        const img = c.tagName === 'IMAGE-SLOT' ? c : c.querySelector && c.querySelector('image-slot');
        if (img) img.animate([{ scale: '1.18' }, { scale: '1' }], { duration: 1900, delay: delay + 500, easing: EASE });
      });
      return;
    }
    const from = FROM[v] || FROM['1'];
    const keys = Object.keys(from);
    const to = {}; keys.forEach(k => { to[k] = TO[k]; });
    const a = el.animate([from, to], { duration: v.startsWith('slide') ? 1200 : 1100, delay, easing: EASE, fill: 'both' });
    a.onfinish = () => { clear(el, keys); a.cancel(); };
  }

  function onIntersect(entries) {
    const hits = entries.filter(e => e.isIntersecting).map(e => e.target)
      .sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
    hits.forEach((el, i) => { io.unobserve(el); play(el, Math.min(i, 8) * 110); });
  }

  function countUp(el) {
    const target = parseFloat(el.dataset.count.replace(/,/g, ''));
    const useComma = /,/.test(el.dataset.count) || target >= 1000;
    const t0 = performance.now(), dur = 1800;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      const n = Math.round(target * e);
      el.textContent = useComma ? n.toLocaleString('ja-JP') : String(n);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function playIntro(el) {
    const v = el.dataset.intro || 'up';
    if (!introT0) introT0 = performance.now();
    const delay = 250 + (introIndex++) * 130;
    let kf;
    if (v === 'line') kf = [{ translate: '0 110%' }, { translate: '0 0' }];
    else if (v === 'down') kf = [{ translate: '0 -100%' }, { translate: '0 0' }];
    else if (v === 'fade') kf = [{ opacity: 0 }, { opacity: 1 }];
    else if (v === 'track') {
      const ls = getComputedStyle(el).letterSpacing;
      kf = [{ opacity: 0, letterSpacing: '.6em', filter: 'blur(6px)' }, { opacity: 1, letterSpacing: ls, filter: 'blur(0)' }];
    } else kf = [{ opacity: 0, translate: '0 32px' }, { opacity: 1, translate: '0 0' }];
    el.animate(kf, { duration: v === 'track' ? 1600 : 1200, delay: v === 'down' ? 0 : delay, easing: EASE, fill: 'backwards' });
  }

  function scan() {
    document.querySelectorAll('[data-reveal-children]').forEach(p => {
      [...p.children].forEach(c => { if (!c.hasAttribute('data-reveal') && !c.hasAttribute('data-rv')) c.setAttribute('data-reveal', p.dataset.revealChildren || '1'); });
    });
    document.querySelectorAll('[data-reveal]:not([data-rv])').forEach(el => { el.setAttribute('data-rv', '1'); hide(el); io.observe(el); });
    document.querySelectorAll('[data-intro]:not([data-rv])').forEach(el => { el.setAttribute('data-rv', '1'); playIntro(el); });
    document.querySelectorAll('[data-count]:not([data-rv])').forEach(el => { el.setAttribute('data-rv', '1'); el.textContent = '0'; countIO.observe(el); });
    document.querySelectorAll('[data-parallax]:not([data-rv])').forEach(el => { el.setAttribute('data-rv', '1'); parallax.add(el); });
    document.querySelectorAll('[data-scrollfade]:not([data-rv])').forEach(el => { el.setAttribute('data-rv', '1'); fades.add(el); });
    document.querySelectorAll('[data-kenburns]:not([data-rv])').forEach(el => {
      el.setAttribute('data-rv', '1');
      el.animate([{ scale: '1.16' }, { scale: '1' }], { duration: 3200, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' });
    });
    document.querySelectorAll('[data-marquee]:not([data-rv])').forEach(el => {
      el.setAttribute('data-rv', '1');
      const a = el.animate([{ translate: '0 0' }, { translate: '-50% 0' }], { duration: 48000, iterations: Infinity });
      marquees.add(a);
    });
    document.querySelectorAll('[data-loop="drop"]:not([data-rv])').forEach(el => {
      el.setAttribute('data-rv', '1');
      el.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)', offset: .5 }, { clipPath: 'inset(100% 0 0 0)' }],
        { duration: 2200, iterations: Infinity, easing: 'cubic-bezier(.77,0,.18,1)' });
    });
    tick();
  }

  let lastY = window.scrollY, vel = 0, raf = 0;
  function tick() {
    raf = 0;
    const vh = window.innerHeight, y = window.scrollY;
    parallax.forEach(el => {
      if (!el.isConnected) { parallax.delete(el); return; }
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const f = parseFloat(el.dataset.parallax) || .15;
      el.style.translate = `0 ${((r.top + r.height / 2) - vh / 2) * -f}px`;
    });
    fades.forEach(el => {
      const p = Math.min(1, y / (vh * .7));
      el.style.opacity = String(1 - p * .9);
      el.style.translate = `0 ${p * -60}px`;
    });
  }
  function onScroll() {
    const y = window.scrollY; vel = Math.min(8, Math.abs(y - lastY) / 6); lastY = y;
    marquees.forEach(a => { a.playbackRate = 1 + vel * 3; });
    clearTimeout(onScroll.t); onScroll.t = setTimeout(() => marquees.forEach(a => { a.playbackRate = 1; }), 160);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // hover: arrow slide-through & image zoom
  function arrowOf(root) {
    const spans = root.querySelectorAll('span');
    for (let i = spans.length - 1; i >= 0; i--) { const t = spans[i].textContent.trim(); if ((t === '→' || t === '←' || t === '↓') && !spans[i].children.length) return spans[i]; }
    return null;
  }
  function onOver(e) {
    const a = e.target.closest && e.target.closest('a,button');
    if (a && !(e.relatedTarget && a.contains(e.relatedTarget))) {
      const ar = arrowOf(a);
      if (ar && !ar._anim) {
        const t = ar.textContent.trim(), d = t === '←' ? -1 : 1;
        const k = t === '↓' ? ['0 0', '0 18px', '0 -18px', '0 0'] : ['0 0', `${18 * d}px 0`, `${-18 * d}px 0`, '0 0'];
        ar._anim = ar.animate([{ translate: k[0], opacity: 1 }, { translate: k[1], opacity: 0, offset: .45 }, { translate: k[2], opacity: 0, offset: .46 }, { translate: k[3], opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)' });
        ar._anim.onfinish = () => { ar._anim = null; };
      }
    }
    const card = e.target.closest && e.target.closest('article, a');
    if (card && !(e.relatedTarget && card.contains(e.relatedTarget))) {
      const img = card.querySelector('image-slot');
      if (img && card.querySelector('h2,h3')) { img.style.transition = 'scale 1.2s cubic-bezier(.19,1,.22,1)'; img.style.scale = '1.07'; }
    }
  }
  function onOut(e) {
    const card = e.target.closest && e.target.closest('article, a');
    if (card && !(e.relatedTarget && card.contains(e.relatedTarget))) {
      const img = card.querySelector('image-slot');
      if (img) img.style.scale = '1';
    }
  }

  function init() {
    if (reduce || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
    io = new IntersectionObserver(onIntersect, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    countIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countIO.unobserve(e.target); countUp(e.target); } }), { threshold: .6 });
    scan();
    let t; new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 50); }).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(tick); });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
  }
  window.KanameMotion = { init, scan };
})();
