(function () {
  if (window.__aobaAnimLoaded) return;
  window.__aobaAnimLoaded = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const E = 'cubic-bezier(.2,.7,.2,1)';
  const css = `
[data-anim]:not([data-done]){transition:opacity .9s ${E} var(--d,0ms),transform 1s ${E} var(--d,0ms),clip-path 1.3s cubic-bezier(.77,0,.18,1) var(--d,0ms)!important}
[data-anim="up"]:not([data-in]){opacity:0!important;transform:translateY(36px)!important}
[data-anim="left"]:not([data-in]){opacity:0!important;transform:translateX(-48px)!important}
[data-anim="right"]:not([data-in]){opacity:0!important;transform:translateX(56px)!important}
[data-anim="pop"]:not([data-in]){opacity:0!important;transform:scale(0)!important}
[data-anim="zoom"]:not([data-in]){opacity:0!important;transform:scale(.86)!important}
[data-anim="line"]:not([data-in]){opacity:0!important;transform:scaleX(0)!important}
[data-anim="fade"]:not([data-in]){opacity:0!important}
[data-anim="wipe"]:not([data-in]){clip-path:inset(0 100% 0 0)!important}
[data-anim="wipe"][data-in]:not([data-done]){clip-path:inset(0 0 0 0)!important}
[data-anim="wipe"] > image-slot{transition:transform 1.8s ${E} var(--d,0ms)}
[data-anim="wipe"]:not([data-in]) > image-slot{transform:scale(1.18)}
[data-anim] [data-diamond]{opacity:0}
[data-in] [data-diamond]{animation:aobaSpin 1s cubic-bezier(.3,1.5,.5,1) calc(var(--d,0ms) + 250ms) both}
@keyframes aobaSpin{from{opacity:0;transform:rotate(-315deg) scale(0)}to{opacity:1;transform:rotate(45deg) scale(1)}}
@keyframes aobaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes aobaKen{from{transform:scale(1.3)}to{transform:scale(1.12)}}
@keyframes aobaPulse{0%{box-shadow:0 0 0 0 rgba(43,69,201,.45)}70%{box-shadow:0 0 0 14px rgba(43,69,201,0)}100%{box-shadow:0 0 0 0 rgba(43,69,201,0)}}
[data-float]{animation:aobaFloat 4.5s ease-in-out infinite;display:inline-block}
[data-ken]{animation:aobaKen 2.6s ${E} both}
[data-arrow]{transition:transform .35s ${E}}
a:hover [data-arrow],button:hover [data-arrow]{transform:translateX(5px)}
[data-arrow-circle]{animation:aobaPulse 2.6s ease-out infinite}
[data-shine]{position:relative;overflow:hidden}
[data-shine]::after{content:"";position:absolute;top:0;left:-70%;width:45%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg);transition:left .75s ease;pointer-events:none}
[data-shine]:hover::after{left:140%}
[data-icon]{transition:transform .5s cubic-bezier(.3,1.6,.5,1),background-color .3s!important}
[data-card]:hover [data-icon]{transform:rotate(-12deg) scale(1.12);background-color:#dfe5fb!important}
[data-imgzoom]{overflow:hidden}
[data-imgzoom] > image-slot{transition:transform 1.2s ${E}}
[data-imgzoom]:hover > image-slot{transform:scale(1.06)}
#aoba-progress{position:fixed;top:0;left:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#6b9fdc,#2b45c9,#1a2170);z-index:100;pointer-events:none}
#aoba-top{position:fixed;right:20px;bottom:24px;width:52px;height:52px;border-radius:50%;border:0;background:#1a2170;color:#fff;cursor:pointer;z-index:60;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Rounded';font-size:26px;box-shadow:0 8px 20px rgba(26,33,112,.25);opacity:0;transform:translateY(20px) scale(.8);pointer-events:none;transition:opacity .4s,transform .4s ${E},background .25s}
#aoba-top.on{opacity:1;transform:none;pointer-events:auto}
#aoba-top:hover{background:#2b45c9;transform:translateY(-4px)}
@media (max-width:1119px){#aoba-top{bottom:76px;right:14px;width:46px;height:46px}}
`;
  const st = document.createElement('style');
  st.textContent = reduce ? css.split('\n').filter(l => /aoba-top|aoba-progress|data-arrow\]|data-shine|@media/.test(l)).join('\n') : css;
  document.head.appendChild(st);

  const done = new WeakSet();
  // observed element → elements to reveal. A "wipe" element starts fully
  // clipped (clip-path), which Chrome's IntersectionObserver treats as never
  // intersecting — so wipes are observed through their parent instead.
  const watch = new Map();
  const reveal = el => {
    el.setAttribute('data-in', '');
    const d = parseInt(el.style.getPropertyValue('--d')) || 0;
    setTimeout(() => el.setAttribute('data-done', ''), d + 1900);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    (watch.get(e.target) || []).forEach(reveal);
    watch.delete(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function mark(el, type, delay) {
    if (!el || done.has(el) || el.hasAttribute('data-anim')) return;
    done.add(el);
    el.setAttribute('data-anim', type);
    if (delay) el.style.setProperty('--d', delay + 'ms');
    const target = (type === 'wipe' && el.parentElement) || el;
    if (!watch.has(target)) { watch.set(target, []); io.observe(target); }
    watch.get(target).push(el);
  }
  const anc = el => el.parentElement && el.parentElement.closest('[data-anim]');
  const bg = el => getComputedStyle(el).backgroundColor;

  function scan() {
    // non-motion enhancements (always)
    document.querySelectorAll('span').forEach(s => {
      if (s.hasAttribute('data-arrow') || s.children.length) return;
      if (s.textContent === 'chevron_right') {
        s.setAttribute('data-arrow', '');
        if (s.style.borderRadius === '50%' && s.closest('main')) s.setAttribute('data-arrow-circle', '');
      }
    });
    document.querySelectorAll('a,button').forEach(a => {
      if (a.hasAttribute('data-shine')) return;
      const r = a.style.borderRadius, b = bg(a);
      if ((r === '999px' || a.type === 'submit' || (a.style.width === '80px' && a.style.height === '72px')) && b !== 'rgb(255, 255, 255)' && b !== 'rgba(0, 0, 0, 0)') a.setAttribute('data-shine', '');
    });
    if (reduce || window.__aobaNoAnim) return;
    const main = document.querySelector('main');
    if (!main) return;

    // hero (top page)
    const hero = main.querySelector('[data-screen-label="01 Hero"]');
    if (hero) {
      const wrap = hero.querySelector('image-slot')?.parentElement;
      mark(wrap, 'fade', 0);
      const slot = hero.querySelector('image-slot');
      if (slot && !slot.hasAttribute('data-ken')) slot.setAttribute('data-ken', '');
      hero.querySelectorAll('h1 > span').forEach((s, i) => mark(s, 'left', 350 + i * 220));
      const lbl = hero.querySelector('h1')?.parentElement?.parentElement?.firstElementChild;
      if (lbl && lbl.tagName === 'SPAN') mark(lbl, 'up', 200);
      hero.querySelectorAll('p').forEach(p => { if (p.closest('[data-anim="fade"]')) mark(p, 'up', 900); });
      [...hero.querySelectorAll('div')].filter(d => d.style.aspectRatio === '1').forEach((d, i) => {
        mark(d, 'pop', 900 + i * 160);
        const ic = d.firstElementChild;
        if (ic && !ic.hasAttribute('data-float')) { ic.setAttribute('data-float', ''); ic.style.animationDelay = (i * 0.7) + 's'; }
      });
      const card = hero.children[1];
      mark(card, 'up', 600);
    }
    // sub-page heroes
    main.querySelectorAll('[data-screen-label$="Hero"]').forEach(h => {
      if (h === hero) return;
      const box = h.firstElementChild;
      const imgBox = box?.firstElementChild;
      mark(imgBox, 'fade', 100);
      const slot = imgBox?.querySelector('image-slot');
      if (slot && !slot.hasAttribute('data-ken')) slot.setAttribute('data-ken', '');
      const txt = box?.children[1];
      if (txt) [...txt.children].forEach((c, i) => mark(c, i ? 'up' : 'left', 250 + i * 220));
      mark(h.children[1], 'fade', 700);
    });

    // image wipes
    main.querySelectorAll('image-slot').forEach(s => {
      const w = s.parentElement;
      if (!w || w.closest('[data-screen-label$="Hero"]')) return;
      if (w.style.clipPath) return mark(w, 'fade');
      mark(w, 'wipe', anc(w) ? 200 : 0);
      if (w.closest('article')) w.setAttribute('data-imgzoom', '');
    });

    // heading markers
    main.querySelectorAll('span').forEach(s => {
      if (s.children.length === 3 && s.children[1].style.transform.includes('rotate')) {
        s.children[1].setAttribute('data-diamond', '');
        mark(s, 'line');
      }
    });

    // big English display words
    main.querySelectorAll('span').forEach(s => {
      if (s.children.length || !/Outfit/.test(s.style.fontFamily)) return;
      if (parseFloat(getComputedStyle(s).fontSize) >= 38 && !s.closest('[data-screen-label$="Hero"]')) mark(s, 'right', 150);
    });

    // grids & lists → staggered children
    main.querySelectorAll('div,ul,ol,nav,form').forEach(g => {
      const cs = getComputedStyle(g);
      const kids = [...g.children];
      if (kids.length < 2) return;
      const isGrid = cs.display === 'grid';
      const cardKids = kids.every(k => /^(ARTICLE|FIGURE|LI|DIV|A|LABEL)$/.test(k.tagName) && k.offsetHeight > 44);
      if (!cardKids) return;
      if (!isGrid && !(cs.display === 'flex' && kids.every(k => /^(ARTICLE|FIGURE|LI)$/.test(k.tagName) || k.hasAttribute('data-reveal')))) return;
      const cols = isGrid ? Math.max(1, cs.gridTemplateColumns.split(' ').length) : 1;
      kids.forEach((k, i) => {
        if (k.hasAttribute('data-anim')) return;
        mark(k, 'up', (i % cols) * 140 + (isGrid ? 0 : 60));
        if (k.tagName === 'ARTICLE') k.setAttribute('data-card', '');
      });
    });

    // card icons
    main.querySelectorAll('span').forEach(s => {
      if (s.style.borderRadius === '50%' && bg(s) === 'rgb(241, 243, 250)' && s.closest('article,li')) {
        s.setAttribute('data-icon', '');
        const c = s.closest('article,li'); if (c) c.setAttribute('data-card', '');
      }
    });

    // schedule dots
    let n = 0;
    main.querySelectorAll('span').forEach(s => {
      if (s.style.width === '14px' && s.style.borderRadius === '50%') mark(s, 'pop', 200 + (n++ % 12) * 55);
    });

    // concept list items
    main.querySelectorAll('ol > li').forEach((li, i) => { if (!anc(li)) mark(li, 'left', (i % 3) * 160); });

    // remaining blocks
    main.querySelectorAll('[data-reveal],h1,h2,h3,p,dl,blockquote,address,form,figure,article,table').forEach(el => {
      if (anc(el) || el.closest('[data-screen-label$="Hero"]') || el.closest('[data-screen-label="01 Hero"]')) return;
      mark(el, 'up', el.tagName === 'P' ? 120 : 0);
    });
    // slanted bands
    main.querySelectorAll('div').forEach(d => {
      if (d.style.clipPath && d.style.background.includes('gradient') && !d.children.length) mark(d, 'left');
    });
  }

  let t;
  const queue = () => { clearTimeout(t); t = setTimeout(scan, 120); };
  const mo = new MutationObserver(queue);
  function boot() {
    mo.observe(document.body, { childList: true, subtree: true });
    queue();
    const bar = document.createElement('div'); bar.id = 'aoba-progress'; document.body.appendChild(bar);
    const top = document.createElement('button'); top.id = 'aoba-top'; top.setAttribute('aria-label', 'ページの先頭へ'); top.textContent = 'arrow_upward';
    top.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(top);
    let ticking = false;
    const onScroll = () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
        top.classList.toggle('on', y > 600);
        if (!reduce) document.querySelectorAll('[data-ken]').forEach(s => {
          if (s.getAnimations && s.getAnimations().some(a => a.playState === 'running')) return;
          s.style.transform = `translateY(${Math.min(y, 900) * 0.18}px) scale(1.12)`;
        });
        ticking = false;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (document.body) boot(); else addEventListener('DOMContentLoaded', boot);
})();
