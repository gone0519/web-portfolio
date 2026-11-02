(() => {
  if (window.__hkAnim) return; window.__hkAnim = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const E = 'cubic-bezier(.2,.7,.2,1)';
  const done = new WeakSet();
  const KF = {
    up: () => [{ opacity: 0, transform: 'translateY(36px)' }, { opacity: 1, transform: 'none' }],
    left: () => [{ opacity: 0, transform: 'translateX(-28px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
    clip: () => [{ clipPath: 'inset(0 100% 0 0)', transform: 'scale(1.04)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }],
    mincho: (el) => { const ls = getComputedStyle(el).letterSpacing; return [{ opacity: 0, filter: 'blur(10px)', letterSpacing: '.32em' }, { opacity: 1, filter: 'blur(0)', letterSpacing: ls }]; },
    pop: () => [{ opacity: 0, transform: 'scale(.86) rotate(-4deg)' }, { opacity: 1, transform: 'none' }]
  };
  const DUR = { up: 900, left: 1000, clip: 1300, mincho: 1500, pop: 1100 };
  // IntersectionObserver missed targets whose own clip-path/opacity start hidden,
  // so reveal by checking rects on scroll instead (also reveals anything already scrolled past).
  const pending = new Set();
  const reveal = () => {
    const vh = innerHeight * 0.94;
    pending.forEach(el => {
      if (!el.isConnected) { pending.delete(el); return; }
      if (el.getBoundingClientRect().top < vh) { pending.delete(el); (el.__as || []).forEach(a => a.play()); }
    });
  };
  let rq = 0;
  const queueReveal = () => { if (!rq) rq = requestAnimationFrame(() => { rq = 0; reveal(); }); };
  const io = reduce ? null : { observe: (el) => { pending.add(el); queueReveal(); }, unobserve: (el) => pending.delete(el) };
  if (!reduce) { addEventListener('scroll', queueReveal, { passive: true }); addEventListener('resize', queueReveal); }

  function prep(el, kind, delay = 0, now = false) {
    if (done.has(el)) return; done.add(el);
    if (reduce) return;
    const a = el.animate(KF[kind](el), { duration: DUR[kind], delay, easing: E, fill: 'both' });
    a.onfinish = () => a.cancel();
    if (now) return;
    a.pause(); a.currentTime = 0; (el.__as = el.__as || []).push(a); io.observe(el);
  }
  const inDone = (el) => { for (let p = el.parentElement; p; p = p.parentElement) if (done.has(p)) return true; return false; };
  const isHero = (el) => !!el.closest('#hero, section[data-screen-label="Page Hero"]');

  function hover(el) {
    if (el.__h || reduce) return; el.__h = true;
    let a;
    el.addEventListener('mouseenter', () => { a = el.animate([{ transform: 'none', boxShadow: '0 0 0 rgba(150,60,90,0)' }, { transform: 'translateY(-6px)', boxShadow: '0 18px 36px rgba(150,60,90,.18)' }], { duration: 280, easing: E, fill: 'forwards' }); });
    el.addEventListener('mouseleave', () => { if (a) a.reverse(); });
  }
  function arrow(span) {
    const host = span.closest('a,button'); if (!host || host.__ar || reduce) return; host.__ar = true;
    let a;
    host.addEventListener('mouseenter', () => { a = span.animate([{ transform: 'none' }, { transform: 'rotate(45deg) scale(1.12)' }], { duration: 300, easing: E, fill: 'forwards' }); });
    host.addEventListener('mouseleave', () => { if (a) a.reverse(); });
  }

  function heroIntro() {
    const top = document.getElementById('hero');
    if (top && !top.__in) {
      const h1 = top.querySelector('h1'); if (!h1) return; top.__in = true;
      const img = top.querySelector('image-slot');
      if (img && !reduce) img.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.09)' }], { duration: 22000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
      const lead = h1.previousElementSibling; if (lead) prep(lead, 'up', 200, true);
      prep(h1, 'mincho', 450, true);
      const btns = h1.nextElementSibling; if (btns) [...btns.children].forEach((b, i) => prep(b, 'up', 1200 + i * 140, true));
      const banner = [...top.querySelectorAll('div')].find(d => d.style.aspectRatio && d.style.position === 'absolute');
      if (banner) prep(banner, 'pop', 700, true);
      const grid = top.children[1]; if (grid) [...grid.children].forEach((c, i) => prep(c, 'up', 1400 + i * 120, true));
      if (img) parallax.push(img.parentElement);
    }
    document.querySelectorAll('section[data-screen-label="Page Hero"]').forEach(s => {
      if (s.__in) return; const h1 = s.querySelector('h1'); if (!h1) return; s.__in = true;
      const img = s.querySelector('image-slot');
      if (img && !reduce) img.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 2600, easing: E, fill: 'both' });
      if (img) parallax.push(img.parentElement);
      [...h1.parentElement.children].forEach((c, i) => prep(c, c === h1 ? 'left' : (c.style.fontFamily.includes('Mincho') ? 'mincho' : 'up'), 250 + i * 180, true));
    });
    document.querySelectorAll('#hero div, section[data-screen-label="Page Hero"] div').forEach(d => {
      if (d.__ring || d.style.borderLeftColor !== 'transparent' || reduce) return; d.__ring = true;
      d.animate([{ transform: 'rotate(-26deg)' }, { transform: 'rotate(-12deg)' }], { duration: 9000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    });
  }

  const parallax = [];
  function onScroll() {
    const y = scrollY;
    parallax.forEach(el => { el.style.transform = `translate3d(0,${Math.min(y, 1200) * 0.28}px,0)`; });
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
  }
  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  bar.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;z-index:80;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#d06a86,#f4bccd,#9a6bb8);pointer-events:none';

  function marquee() {
    document.querySelectorAll('footer div[aria-hidden="true"]').forEach(m => {
      if (m.__mq || reduce || m.children.length < 2) return;
      const w = m.children[1].offsetLeft - m.children[0].offsetLeft; if (!w) return; m.__mq = true;
      m.animate([{ transform: 'translateX(0)' }, { transform: `translateX(-${w}px)` }], { duration: 14000, iterations: Infinity });
    });
  }
  function pulse() {
    document.querySelectorAll('main a, main button[type="submit"]').forEach(a => {
      if (a.__p || reduce) return;
      const t = a.textContent;
      if (!/参加する|予約内容を送信|インターネット出願サイト/.test(t)) return; a.__p = true;
      a.animate([{ outline: '0px solid rgba(255,255,255,.0)', outlineOffset: '0px' }, { outline: '2px solid rgba(255,255,255,.7)', outlineOffset: '6px', offset: .5 }, { outline: '2px solid rgba(255,255,255,0)', outlineOffset: '14px' }], { duration: 2200, iterations: Infinity, easing: 'ease-out' });
    });
  }

  function scan() {
    const main = document.querySelector('main'); if (!main) return;
    heroIntro(); marquee(); pulse();
    const all = [...main.querySelectorAll('*'), ...document.querySelectorAll('footer *')];
    const groups = new Map();
    all.forEach(el => {
      if (done.has(el) || isHero(el) || el.closest('[role=dialog]')) return;
      const p = el.parentElement; if (!p) return;
      const cs = getComputedStyle(p);
      if (cs.display === 'grid' || el.tagName === 'LI' || el.tagName === 'ARTICLE') {
        if (inDone(el)) return;
        if (!groups.has(p)) groups.set(p, []);
        groups.get(p).push(el);
      }
    });
    groups.forEach((kids) => kids.forEach((k, i) => prep(k, 'up', Math.min(i, 6) * 110)));
    all.forEach(el => {
      if (done.has(el) || isHero(el) || inDone(el)) return;
      const t = el.tagName;
      if (t === 'H2') prep(el, 'left');
      else if ((t === 'P' || t === 'H3') && !el.closest('a,button,label,dl,form')) prep(el, el.style.fontFamily.includes('Mincho') ? 'mincho' : 'up', 80);
    });
    main.querySelectorAll('image-slot').forEach(s => {
      const w = s.parentElement; if (!w || isHero(w) || w.__clip) return; w.__clip = true;
      if (!reduce) { const a = w.animate(KF.clip(), { duration: DUR.clip, easing: E, fill: 'both' }); a.onfinish = () => a.cancel(); a.pause(); a.currentTime = 0; (w.__as = w.__as || []).push(a); io.unobserve(w); io.observe(w); }
    });
    main.querySelectorAll('article, a').forEach(el => {
      if (isHero(el)) return;
      if (el.tagName === 'ARTICLE' || el.querySelector('image-slot') || el.style.borderRadius) hover(el);
    });
    document.querySelectorAll('main span, footer span').forEach(s => { if (s.textContent.trim() === '↗') arrow(s); });
  }

  // ---- extras ----
  const PINKS = ['#f7b6c9', '#f3a0ba', '#fcd3df', '#e7a3d0', '#ffc7b8'];
  const mk = (css) => { const d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = css; return d; };

  function petals() {
    const layer = mk('position:fixed;inset:0;z-index:45;pointer-events:none;overflow:hidden');
    document.body.appendChild(layer);
    for (let i = 0; i < 16; i++) {
      const s = 8 + Math.random() * 12;
      const p = mk(`position:absolute;top:-30px;left:${Math.random() * 100}%;width:${s}px;height:${s * 0.75}px;border-radius:80% 10% 80% 10%;background:${PINKS[i % PINKS.length]};opacity:.75`);
      layer.appendChild(p);
      const dx = (Math.random() - .5) * 260;
      p.animate([
        { transform: 'translate(0,0) rotate(0deg)' },
        { transform: `translate(${dx * .5}px,50vh) rotate(${180 + Math.random() * 180}deg)` },
        { transform: `translate(${dx}px,105vh) rotate(${360 + Math.random() * 360}deg)` }
      ], { duration: 12000 + Math.random() * 10000, delay: -Math.random() * 20000, iterations: Infinity, easing: 'linear' });
    }
  }

  function cursor() {
    if (!matchMedia('(pointer:fine)').matches) return;
    const c = mk('position:fixed;left:0;top:0;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;border:1.5px solid #d0628a;background:rgba(247,182,201,.25);z-index:90;pointer-events:none;transition:width .25s,height .25s,margin .25s,background .25s;mix-blend-mode:multiply');
    const dot = mk('position:fixed;left:0;top:0;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#c24d76;z-index:91;pointer-events:none');
    document.body.append(c, dot);
    let x = -100, y = -100, cx = x, cy = y;
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`;
      const on = e.target.closest && e.target.closest('a,button,label,select,input');
      c.style.width = c.style.height = on ? '56px' : '28px'; c.style.margin = on ? '-28px 0 0 -28px' : '-14px 0 0 -14px'; c.style.background = on ? 'rgba(247,182,201,.45)' : 'rgba(247,182,201,.25)'; });
    (function loop() { cx += (x - cx) * .18; cy += (y - cy) * .18; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  }

  function burst(e) {
    for (let i = 0; i < 10; i++) {
      const s = 5 + Math.random() * 6, a = (Math.PI * 2 * i) / 10, r = 36 + Math.random() * 30;
      const p = mk(`position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px;margin:${-s / 2}px;border-radius:${i % 2 ? '50%' : '2px'};background:${PINKS[i % PINKS.length]};z-index:92;pointer-events:none`);
      document.body.appendChild(p);
      p.animate([{ transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) scale(.2) rotate(180deg)`, opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.1,.7,.3,1)' }).onfinish = () => p.remove();
    }
  }

  function ripple(e) {
    const host = e.target.closest && e.target.closest('main a, main button, footer a'); if (!host) return;
    const r = host.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
    const w = mk(`position:fixed;left:${e.clientX - s / 2}px;top:${e.clientY - s / 2}px;width:${s}px;height:${s}px;border-radius:50%;background:rgba(255,255,255,.45);pointer-events:none;z-index:89;clip-path:inset(${r.top - e.clientY + s / 2}px ${e.clientX + s / 2 - r.right}px ${e.clientY + s / 2 - r.bottom}px ${r.left - e.clientX + s / 2}px)`);
    document.body.appendChild(w);
    w.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 650, easing: 'ease-out' }).onfinish = () => w.remove();
  }

  function magnetic() {
    document.querySelectorAll('main a, main button').forEach(b => {
      if (b.__mg) return; const t = b.textContent;
      if (!/→/.test(t) || b.querySelector('image-slot')) return; b.__mg = true;
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .3}px`; });
      b.addEventListener('mouseleave', () => { b.animate([{ translate: b.style.translate || '0 0' }, { translate: '0 0' }], { duration: 400, easing: E }); b.style.translate = '0 0'; });
    });
  }

  function tilt() {
    document.querySelectorAll('main image-slot').forEach(s => {
      const w = s.parentElement; if (!w || w.__tl || isHero(w)) return; w.__tl = true;
      w.addEventListener('mousemove', e => { const r = w.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        s.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) scale(1.05)`; s.style.transition = 'transform .15s'; });
      w.addEventListener('mouseleave', () => { s.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1)'; s.style.transform = 'none'; });
    });
  }

  function splitH2() {
    document.querySelectorAll('main h2').forEach(h => {
      if (h.__sp || isHero(h) || h.childNodes.length !== 1 || h.firstChild.nodeType !== 3) return;
      const txt = h.textContent; if (!/^[\x20-\x7e]+$/.test(txt)) return; h.__sp = true;
      h.setAttribute('aria-label', txt);
      const frag = document.createDocumentFragment(); const spans = [];
      [...txt].forEach(ch => { const s = document.createElement('span'); s.setAttribute('aria-hidden', 'true'); s.textContent = ch; s.style.display = 'inline-block'; s.style.whiteSpace = 'pre'; frag.appendChild(s); spans.push(s); });
      h.firstChild.replaceWith(frag);
      const anims = spans.map((s, i) => { const a = s.animate([{ opacity: 0, transform: 'translateY(.7em) rotate(8deg)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: i * 40, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'both' }); a.pause(); a.currentTime = 0; return a; });
      const ob = new IntersectionObserver(es => { if (es[0].isIntersecting) { anims.forEach(a => a.play()); ob.disconnect(); } }, { threshold: .4 });
      ob.observe(h);
      h.addEventListener('mouseenter', () => spans.forEach((s, i) => s.animate([{ transform: 'none' }, { transform: 'translateY(-.18em)', color: '#d0628a' }, { transform: 'none' }], { duration: 500, delay: i * 25, easing: 'ease-in-out' })));
    });
  }

  let hdrBg, toTop, lastY = 0, hdrHidden = false;
  function chrome() {
    hdrBg = mk('position:fixed;left:0;right:0;top:0;height:76px;z-index:48;pointer-events:none;background:linear-gradient(90deg,rgba(208,98,138,.94),rgba(224,128,159,.9));box-shadow:0 6px 24px rgba(150,60,90,.18);opacity:0;transform:translateY(-100%);transition:opacity .4s,transform .4s cubic-bezier(.2,.7,.2,1)');
    toTop = mk('position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:50%;background:#d0628a;color:#fff;display:grid;place-items:center;font:700 20px Montserrat,sans-serif;z-index:70;cursor:pointer;box-shadow:0 8px 20px rgba(150,60,90,.3);opacity:0;transform:scale(.4);transition:opacity .3s,transform .4s cubic-bezier(.3,1.6,.5,1);pointer-events:none');
    toTop.removeAttribute('aria-hidden'); toTop.setAttribute('role', 'button'); toTop.setAttribute('aria-label', 'ページの先頭へ'); toTop.tabIndex = 0; toTop.textContent = '↑';
    toTop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
    toTop.onkeydown = e => { if (e.key === 'Enter') toTop.onclick(); };
    document.body.append(hdrBg, toTop);
    toTop.animate([{ translate: '0 0' }, { translate: '0 -6px' }, { translate: '0 0' }], { duration: 1800, iterations: Infinity, easing: 'ease-in-out' });
  }
  function chromeScroll() {
    const y = scrollY, past = y > 120;
    hdrBg.style.opacity = past ? '1' : '0';
    const header = document.querySelector('header');
    const hide = past && y > lastY + 4 && y > 500;
    const show = y < lastY - 4 || !past;
    if (header && hide && !hdrHidden) { hdrHidden = true; header.style.transition = 'transform .4s cubic-bezier(.2,.7,.2,1)'; header.style.transform = 'translateY(-110%)'; }
    if (header && show && hdrHidden) { hdrHidden = false; header.style.transform = 'none'; }
    hdrBg.style.transform = past && !hdrHidden ? 'none' : 'translateY(-100%)';
    toTop.style.opacity = y > 600 ? '1' : '0'; toTop.style.transform = y > 600 ? 'scale(1)' : 'scale(.4)'; toTop.style.pointerEvents = y > 600 ? 'auto' : 'none';
    lastY = y;
  }

  let t;
  const queue = () => { clearTimeout(t); t = setTimeout(() => { scan(); if (!reduce) { splitH2(); magnetic(); tilt(); } }, 120); };
  function start() {
    document.body.appendChild(bar);
    addEventListener('scroll', onScroll, { passive: true });
    chrome();
    addEventListener('scroll', chromeScroll, { passive: true });
    if (!reduce) { petals(); cursor(); addEventListener('click', e => { burst(e); ripple(e); }); }
    new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
    queue(); setTimeout(scan, 900);
  }
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);
})();
