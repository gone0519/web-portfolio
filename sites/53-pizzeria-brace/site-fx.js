// Pizzeria Brace — site-wide motion (intro, reveals, parallax, steam, tilt, marquee, header, progress)
const EASE = 'cubic-bezier(.2,.7,.2,1)';
const WIPE = 'cubic-bezier(.7,0,.2,1)';

function injectCSS() {
  if (document.getElementById('bx-fx')) return;
  const s = document.createElement('style');
  s.id = 'bx-fx';
  s.textContent = `
@keyframes bxSteam{0%{transform:translate(0,40px) scale(.6);opacity:0}25%{opacity:.55}100%{transform:translate(var(--dx),-240px) scale(1.5);opacity:0}}
@keyframes bxGlow{0%,100%{opacity:.35}50%{opacity:.75}}
@keyframes bxFlicker{0%,100%{transform:scaleY(1) translateY(0)}30%{transform:scaleY(1.06) translateY(-2px)}60%{transform:scaleY(.97) translateY(1px)}}
@keyframes bxBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes bxSpin{to{transform:rotate(360deg)}}`;
  document.head.appendChild(s);
}

function intro(reduce) {
  let seen = false;
  try { seen = sessionStorage.getItem('bx-intro') === '1'; sessionStorage.setItem('bx-intro', '1'); } catch (e) {}
  const ov = document.createElement('div');
  ov.setAttribute('aria-hidden', 'true');
  ov.style.cssText = 'position:fixed;inset:0;z-index:100;background:#AF1B30;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;pointer-events:none';
  const logo = document.createElement('div');
  logo.style.cssText = "width:150px;height:150px;border-radius:50%;background:#E5C65B;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Kaushan Script',cursive;color:#AF1B30;font-size:46px;line-height:1";
  logo.innerHTML = 'Brace<span style="font-family:\'Noto Sans JP\',sans-serif;font-size:10px;font-weight:700;letter-spacing:.3em;color:#3A2E1F;margin-top:6px">PIZZERIA</span>';
  ov.appendChild(logo);
  document.body.appendChild(ov);
  if (reduce) { ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).onfinish = () => ov.remove(); return 0; }
  if (seen) {
    logo.style.display = 'none';
    ov.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 650, easing: WIPE, fill: 'forwards' }).onfinish = () => ov.remove();
    return 250;
  }
  logo.animate([{ transform: 'scale(.4) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.08) rotate(4deg)', opacity: 1, offset: .7 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 700, easing: EASE, fill: 'both' });
  logo.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-30px)' }], { duration: 400, delay: 1000, easing: EASE, fill: 'forwards' });
  ov.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 900, delay: 1150, easing: WIPE, fill: 'forwards' }).onfinish = () => ov.remove();
  return 1350;
}

function classify(el) {
  if (el.dataset.reveal === 'img') return 'img';
  if (el.dataset.fx) return el.dataset.fx;
  const bg = el.style.background || el.style.backgroundColor || '';
  if (/#(AF1B30|C9580A|E5C65B|3A2E1F)/i.test(bg)) return 'box';
  return 'up';
}

const FROM = {
  up: { opacity: '0', transform: 'translateY(44px)' },
  box: { opacity: '0', transform: 'translateX(-50px)', clipPath: 'inset(0 100% 0 0)' },
  text: { opacity: '0', transform: 'translateY(0.6em)', clipPath: 'inset(0 0 100% 0)' },
  script: { opacity: '0', clipPath: 'inset(-20% 100% -20% 0)' },
  vert: { opacity: '0', clipPath: 'inset(0 0 100% 0)' },
  tag: { opacity: '0', transform: 'translateX(-24px)', clipPath: 'inset(0 100% 0 0)' },
  img: { clipPath: 'inset(0 100% 0 0)' }
};
const TO = { opacity: '1', transform: 'none', clipPath: 'inset(-20% -20% -20% -20%)' };
const DUR = {
  up: `opacity 1s ${EASE}, transform 1.2s ${EASE}`,
  box: `opacity .6s ease, transform 1.1s ${EASE}, clip-path 1.1s ${WIPE}`,
  text: `opacity .8s ease, transform 1.1s ${EASE}, clip-path 1.1s ${WIPE}`,
  script: `opacity .3s ease, clip-path 1.6s ${WIPE}`,
  vert: `opacity .3s ease, clip-path 1.4s ${WIPE}`,
  tag: `opacity .5s ease, transform .9s ${EASE}, clip-path .9s ${WIPE}`,
  img: `clip-path 1.5s ${WIPE}`
};

export function start(host) {
  injectCSS();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const introDelay = intro(reduce);
  const vh = () => window.innerHeight;
  const cleanups = [];
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); cleanups.push(() => t.removeEventListener(ev, fn, o)); };
  const main = document.querySelector('main');

  // auto-tag headings, script titles, vertical labels, yellow tags
  if (main) {
    main.querySelectorAll('h1, h2').forEach(h => { if (!h.dataset.reveal) h.dataset.reveal = ''; h.dataset.fx = 'text'; });
    main.querySelectorAll('p, span, div').forEach(p => {
      const st = p.getAttribute('style') || '';
      if (p.closest('[aria-hidden="true"]')) return;
      if (/Kaushan/.test(st) && p.tagName === 'P' && !p.dataset.reveal) { p.dataset.reveal = ''; p.dataset.fx = 'script'; }
      if (/writing-mode:\s*vertical-rl/.test(st) && /position:\s*absolute/.test(st) && !p.dataset.reveal) { p.dataset.reveal = ''; p.dataset.fx = 'vert'; }
      if (p.tagName === 'SPAN' && /background:\s*#E5C65B/i.test(st) && /padding:\s*5px/.test(st)) { p.dataset.reveal = ''; p.dataset.fx = 'tag'; }
    });
  }

  const els = [...document.querySelectorAll('[data-reveal]')];
  if (reduce) return () => {};

  // guide lines draw down
  if (main) {
    const lines = main.querySelectorAll(':scope > div[aria-hidden="true"] > div');
    lines.forEach((l, i) => l.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 2200, delay: introDelay + i * 180, easing: WIPE, fill: 'both' }).onfinish = function () { this.cancel(); });
    lines.forEach(l => { l.style.transformOrigin = 'top'; });
  }

  const reveal = (el, delay = 0) => {
    if (el.__bxShown) return;
    el.__bxShown = true;
    el.style.transitionDelay = delay + 'ms';
    Object.assign(el.style, TO);
    if (el.dataset.reveal === 'img') {
      el.style.clipPath = 'inset(0 0 0 0)';
      const s = el.querySelector('image-slot');
      if (s) { s.style.transition = `transform 2.2s ${EASE} ${delay}ms`; s.style.transform = 'scale(1.1)'; el.__bxSlot = s; }
    }
    setTimeout(() => { el.style.transitionDelay = '0ms'; if (el.dataset.fx !== 'script' && el.dataset.fx !== 'text') el.style.clipPath = el.dataset.reveal === 'img' ? 'inset(0 0 0 0)' : 'none'; }, delay + 1800);
  };

  els.forEach(el => {
    const type = classify(el);
    el.dataset.bxType = type;
    const r = el.getBoundingClientRect();
    el.style.transition = DUR[type];
    Object.assign(el.style, FROM[type]);
    if (type === 'img') { const s = el.querySelector('image-slot'); if (s) s.style.transform = 'scale(1.35)'; }
    el.__bxAbove = r.top < vh() * 0.95;
  });

  const nestDelay = el => { let d = 0, p = el.parentElement; while (p) { if (p.hasAttribute && p.hasAttribute('data-reveal')) d += 220; p = p.parentElement; } return d; };
  const batch = new Set();
  let flushT = null;
  const flush = () => {
    const list = [...batch].sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return (ra.top - rb.top) || (ra.left - rb.left); });
    batch.clear();
    list.forEach((el, i) => reveal(el, Math.min(i, 6) * 110 + nestDelay(el)));
  };
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { batch.add(e.target); io.unobserve(e.target); } });
    clearTimeout(flushT); flushT = setTimeout(flush, 30);
  }, { rootMargin: '0px 0px -10% 0px' });
  setTimeout(() => els.forEach(el => io.observe(el)), introDelay);
  cleanups.push(() => io.disconnect());

  const fb = setTimeout(() => els.forEach(el => { if (el.getBoundingClientRect().top < vh()) reveal(el); }), introDelay + 1600);
  cleanups.push(() => clearTimeout(fb));
  const revealAll = () => els.forEach(el => reveal(el));
  on(document, 'visibilitychange', () => { if (document.visibilityState !== 'visible') revealAll(); });
  on(window, 'beforeprint', revealAll);

  // steam + oven glow
  document.querySelectorAll('[data-steam]').forEach(box => {
    const glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;left:-10%;right:-10%;bottom:-30%;height:60%;background:radial-gradient(ellipse at 50% 100%,rgba(238,123,16,.55),rgba(238,123,16,0) 70%);pointer-events:none;z-index:2;animation:bxGlow 3.2s ease-in-out infinite,bxFlicker 1.6s ease-in-out infinite;transform-origin:bottom;mix-blend-mode:screen';
    box.appendChild(glow);
    for (let i = 0; i < 5; i++) {
      const p = document.createElement('div');
      const size = 90 + Math.random() * 90;
      p.style.cssText = `position:absolute;bottom:18%;left:${18 + i * 15 + Math.random() * 6}%;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,.7);filter:blur(28px);pointer-events:none;z-index:3;--dx:${(Math.random() * 60 - 30).toFixed(0)}px;animation:bxSteam ${6 + Math.random() * 3}s ease-out ${i * 1.3}s infinite;opacity:0`;
      box.appendChild(p);
    }
  });

  // marquee
  document.querySelectorAll('[data-marquee]').forEach(m => {
    const inner = m.firstElementChild; if (!inner) return;
    const dir = m.dataset.marquee === 'rev' ? -1 : 1;
    const a = inner.animate([{ transform: `translateX(${dir > 0 ? 0 : -50}%)` }, { transform: `translateX(${dir > 0 ? -50 : 0}%)` }], { duration: 38000, iterations: Infinity });
    on(m, 'mouseenter', () => a.updatePlaybackRate(0.25));
    on(m, 'mouseleave', () => a.updatePlaybackRate(1));
    cleanups.push(() => a.cancel());
  });

  // floating yellow logo in header
  const hdr = document.querySelector('header');
  const logoA = hdr && hdr.querySelector('a');
  if (logoA) { logoA.style.transition = `transform .6s ${EASE}`; on(logoA, 'mouseenter', () => { logoA.style.transform = 'rotate(-12deg) scale(1.06)'; }); on(logoA, 'mouseleave', () => { logoA.style.transform = ''; }); }

  // arrow nudge + press on buttons
  const arrowOf = t => { const a = t.closest && t.closest('a, button'); if (!a) return null; const s = [...a.children].find(c => c.tagName === 'SPAN' && c.textContent.trim() === '›'); return s ? { a, s } : null; };
  on(document, 'mouseover', e => { const r = arrowOf(e.target); if (r) { r.s.style.transition = `transform .45s ${EASE}`; r.s.style.transform = 'translateX(8px)'; } });
  on(document, 'mouseout', e => { const r = arrowOf(e.target); if (r && !r.a.contains(e.relatedTarget)) r.s.style.transform = ''; });
  on(document, 'pointerdown', e => { const a = e.target.closest && e.target.closest('a[style*="padding"], button'); if (a && !a.closest('header')) a.animate([{ transform: 'scale(1)' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 300, easing: EASE }); });

  // tilt cards
  on(document, 'pointermove', e => {
    const c = e.target.closest && e.target.closest('[data-tilt]');
    document.querySelectorAll('[data-tilt]').forEach(t => { if (t !== c && t.__bxTilt) { t.__bxTilt = false; t.style.transform = t.__bxShown ? 'none' : t.style.transform; t.style.boxShadow = ''; } });
    if (!c || !c.__bxShown) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.__bxTilt = true;
    c.style.transition = `transform .5s ${EASE}, box-shadow .5s ${EASE}`;
    c.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
  }, { passive: true });

  // progress bar
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:3px;background:#AF1B30;transform-origin:left;transform:scaleX(0);z-index:70;pointer-events:none';
  document.body.appendChild(bar);
  cleanups.push(() => bar.remove());

  // scroll: parallax (watermarks, images), header hide/show, progress
  let lastY = window.scrollY, ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY, H = vh();
      const max = document.documentElement.scrollHeight - H;
      bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      document.querySelectorAll('[data-parallax]').forEach(el => {
        const k = parseFloat(el.dataset.parallax) || 0;
        const r = el.parentElement.getBoundingClientRect();
        el.style.transform = `translateX(${(r.top - H / 2) * k}px)`;
      });
      els.forEach(el => {
        if (!el.__bxSlot || !el.__bxShown) return;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > H) return;
        const p = ((r.top + r.height / 2) - H / 2) / H;
        el.__bxSlot.style.transition = 'transform .2s linear';
        el.__bxSlot.style.transform = `scale(1.1) translateY(${(p * -5).toFixed(2)}%)`;
      });
      if (hdr) {
        hdr.style.transition = `transform .5s ${EASE}`;
        const menuOpen = !!document.querySelector('[aria-label="メニューを閉じる"]');
        hdr.style.transform = (y > lastY && y > 400 && !menuOpen) ? 'translateY(-110%)' : 'none';
      }
      lastY = y;
    });
  };
  on(window, 'scroll', onScroll, { passive: true });
  onScroll();

  return () => cleanups.forEach(f => f());
}
