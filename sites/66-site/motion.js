(() => {
  if (window.__asagiMotion) return; window.__asagiMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = `
  [data-arrow]{transition:transform .35s cubic-bezier(.3,1.6,.5,1)}
  a:hover [data-arrow],button:hover [data-arrow]{transform:translateX(4px) rotate(-8deg)}
  a,button{transition:transform .25s ease,background-color .25s ease,color .25s ease,box-shadow .25s ease,border-color .25s ease}
  a:active,button:active{transform:scale(.97)}
  #am-progress{position:fixed;left:0;top:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#e6f23c,#22b3bb);z-index:200;pointer-events:none}
  #am-curtain{position:fixed;inset:0;z-index:300;background:#22b3bb;pointer-events:none;display:flex;align-items:center;justify-content:center}
  #am-curtain span{font-family:'Josefin Sans',sans-serif;font-weight:700;letter-spacing:.3em;color:#fff;font-size:18px}
  #am-curtain i{position:absolute;right:0;bottom:0;width:40vw;height:40vw;border-radius:50%;background:#e6f23c;transform:translate(30%,30%)}
  #am-cursor{position:fixed;left:0;top:0;width:28px;height:28px;margin:-14px 0 0 -14px;border:1.5px solid #22b3bb;border-radius:50%;pointer-events:none;z-index:250;transition:width .25s,height .25s,margin .25s,background-color .25s,border-color .25s;mix-blend-mode:multiply}
  #am-cursor.on{width:56px;height:56px;margin:-28px 0 0 -28px;background:rgba(230,242,60,.6);border-color:transparent}
  `;
  document.head.appendChild(css);
  if (reduce) return;

  const E = 'cubic-bezier(.2,.8,.2,1)';
  // page curtain
  const curtain = document.createElement('div');
  curtain.id = 'am-curtain'; curtain.innerHTML = '<i></i><span>ASAGI</span>';
  const mountUI = () => {
    document.body.appendChild(curtain);
    curtain.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 900, delay: 250, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' });
    curtain.querySelector('span').animate([{ opacity: 0, letterSpacing: '.6em' }, { opacity: 1, letterSpacing: '.3em' }], { duration: 400, fill: 'both' });
    const bar = document.createElement('div'); bar.id = 'am-progress'; document.body.appendChild(bar);
    if (matchMedia('(pointer:fine)').matches) {
      const cur = document.createElement('div'); cur.id = 'am-cursor'; document.body.appendChild(cur);
      let x = -100, y = -100, cx = x, cy = y;
      addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cur.classList.toggle('on', !!e.target.closest('a,button')); });
      (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
    }
  };
  if (document.body) mountUI(); else addEventListener('DOMContentLoaded', mountUI);

  // leave transition for internal pages
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href');
    if (!/\.dc\.html/.test(href) || a.target) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    curtain.getAnimations().forEach(x => x.cancel());
    curtain.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 500, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' })
      .onfinish = () => { location.href = url.href; };
  }, true);
  addEventListener('pageshow', e => { if (e.persisted) curtain.getAnimations().forEach(x => x.cancel()), curtain.style.clipPath = 'inset(0 0 100% 0)'; });

  const seen = new WeakSet();
  const pending = new Map();
  const io = new IntersectionObserver(entries => {
    let i = 0;
    entries.filter(en => en.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach(en => {
        const anims = pending.get(en.target); if (!anims) return;
        const d = Math.min(i++, 8) * 90;
        anims.forEach(an => { an.effect.updateTiming({ delay: d + (an.__extra || 0) }); an.play(); });
        pending.delete(en.target); io.unobserve(en.target);
      });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  const st = el => el.getAttribute('style') || '';
  const isPh = el => /repeating-linear-gradient/.test(st(el)) && el.tagName === 'DIV';
  const isLime = el => /border-radius:\s*50%/.test(st(el)) && /230,\s*242,\s*60|#e6f23c/i.test(st(el)) && /background-size/.test(st(el));
  const hasLimeShadow = el => /box-shadow:[^;]*(#e6f23c|230,\s*242,\s*60)/i.test(st(el));
  const reveal = (el, kf, opt = {}, extra) => {
    const an = el.animate(kf, { duration: opt.duration || 900, easing: opt.easing || E, fill: 'both' });
    an.pause(); an.__extra = extra || 0;
    const list = pending.get(el) || []; list.push(an); pending.set(el, list); io.observe(el);
  };
  const parallax = [];

  function scan() {
    const main = document.querySelector('main'); if (!main) return;
    // arrow circles
    main.parentElement.querySelectorAll('span').forEach(s => {
      if (seen.has(s)) return;
      if (/^[→↓]$/.test(s.textContent.trim()) && /border-radius:\s*50%/.test(st(s))) { s.setAttribute('data-arrow', ''); seen.add(s); }
    });
    // hero lines
    main.querySelectorAll('h1').forEach(h => {
      if (seen.has(h)) return; seen.add(h);
      [...h.children].forEach((c, i) => { seen.add(c); c.animate([{ opacity: 0, transform: 'translateY(60%)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: 900 + i * 140, easing: E, fill: 'both' }); });
      if (!h.children.length) h.animate([{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 900, easing: E, fill: 'both' });
    });
    // marquee & spin
    main.querySelectorAll('[data-marquee]').forEach(m => { if (seen.has(m)) return; seen.add(m); m.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 28000, iterations: Infinity }); });
    main.querySelectorAll('[data-spin]').forEach(m => { if (seen.has(m)) return; seen.add(m); m.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 16000, iterations: Infinity }); });
    // decorative layers
    main.querySelectorAll('[aria-hidden="true"]').forEach(el => {
      if (seen.has(el)) return; seen.add(el);
      const s = st(el);
      if (isLime(el)) {
        reveal(el, [{ transform: 'scale(.4) rotate(-40deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1200, easing: 'cubic-bezier(.3,1.4,.5,1)' });
        el.animate([{ translate: '0 0' }, { translate: '0 -10px' }, { translate: '0 0' }], { duration: 5000 + Math.random() * 2000, iterations: Infinity, easing: 'ease-in-out' });
      } else if (/120deg/.test(s)) {
        reveal(el, [{ clipPath: /right:\s*0/.test(s) ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1300, easing: 'cubic-bezier(.7,0,.2,1)' });
        parallax.push([el, .12]);
      } else if (/162deg/.test(s)) {
        reveal(el, [{ transform: 'translateX(-40%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1600 });
        parallax.push([el, -.06]);
      } else if (isPh(el)) {
        reveal(el, [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 1200 });
      }
    });
    // content
    main.querySelectorAll('h2, h3, p, article, figure, li, form, blockquote, [role="tablist"], nav, dl, a, div').forEach(el => {
      if (seen.has(el)) return;
      if (el.tagName === 'DIV' && !isPh(el) && !hasLimeShadow(el)) return;
      if (el.tagName === 'A' && !/padding/.test(st(el))) return;
      let p = el.parentElement, skip = false;
      while (p && p !== main) { if (pending.has(p) || p.__rev) { skip = true; break; } p = p.parentElement; }
      seen.add(el); if (skip) return;
      el.__rev = true;
      if (isPh(el)) {
        reveal(el, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, easing: 'cubic-bezier(.7,0,.2,1)' });
        el.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '90px 0' }], { duration: 9000, iterations: Infinity });
      } else if (hasLimeShadow(el)) {
        const sh = getComputedStyle(el).boxShadow;
        reveal(el, [{ opacity: 0, transform: 'translateY(40px)', boxShadow: '0 0 0 #e6f23c' }, { opacity: 1, transform: 'none', boxShadow: sh }], { duration: 1200 });
      } else if (el.tagName === 'H2') {
        reveal(el, [{ opacity: 0, transform: 'translateX(-40px)', letterSpacing: '.3em' }, { opacity: 1, transform: 'none', letterSpacing: 'normal' }], { duration: 1000 });
      } else if (el.tagName === 'LI') {
        reveal(el, [{ opacity: 0, transform: 'translateX(30px)' }, { opacity: 1, transform: 'none' }], { duration: 700 });
      } else if (el.tagName === 'ARTICLE' || el.tagName === 'FIGURE') {
        reveal(el, [{ opacity: 0, transform: 'translateY(50px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 1000 });
      } else {
        reveal(el, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 800 });
      }
    });
  }

  let t; const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 60); });
  const start = () => { mo.observe(document.body, { childList: true, subtree: true }); scan(); };
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const h = document.documentElement, max = h.scrollHeight - innerHeight;
      const bar = document.getElementById('am-progress'); if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      const hd = document.querySelector('header'); if (hd) hd.style.boxShadow = scrollY > 10 ? '0 6px 24px rgba(42,59,69,.08)' : 'none';
      parallax.forEach(([el, k]) => { const r = el.parentElement.getBoundingClientRect(); el.style.translate = `0 ${(r.top + r.height / 2 - innerHeight / 2) * -k}px`; });
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
})();
