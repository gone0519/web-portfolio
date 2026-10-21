// Site-wide motion: page transitions, scroll reveals, hover, ambient loops. Uses Web Animations API so React-owned inline styles are untouched.
(function () {
  if (window.__msAnim) return; window.__msAnim = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const BLUE = '#1873c9';
  const done = new WeakSet();
  let loaded = false;

  // ---------- page transition overlay ----------
  const ov = document.createElement('div');
  ov.style.cssText = `position:fixed;inset:0;z-index:9999;background:${BLUE};display:flex;align-items:center;justify-content:center;pointer-events:none`;
  ov.innerHTML = '<div style="width:64px;height:64px;background:#fff;color:#1873c9;font:900 26px Outfit,sans-serif;display:flex;align-items:center;justify-content:center;transform:skewX(-8deg)">MS</div>';
  const mountOv = () => document.body && !ov.isConnected && document.body.appendChild(ov);
  mountOv(); document.addEventListener('DOMContentLoaded', mountOv);
  const reveal = () => {
    mountOv();
    ov.firstChild.animate([{ transform: 'skewX(-8deg) scale(1)' }, { transform: 'skewX(-8deg) scale(.6)', opacity: 0 }], { duration: 400, easing: EASE, fill: 'forwards' });
    ov.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 700, delay: 250, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
  };
  setTimeout(reveal, 350);

  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || !/\.dc\.html$/.test(url.pathname) || url.pathname === location.pathname) return;
    e.preventDefault();
    ov.firstChild.animate([{ transform: 'skewX(-8deg) scale(.6)', opacity: 0 }, { transform: 'skewX(-8deg) scale(1)', opacity: 1 }], { duration: 350, delay: 250, easing: EASE, fill: 'forwards' });
    ov.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 550, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' })
      .onfinish = () => { location.href = url.href; };
  }, true);
  addEventListener('pageshow', ev => { if (ev.persisted) reveal(); });

  // ---------- chrome: progress bar, back-to-top, header shadow ----------
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:4px;background:#17a673;transform-origin:0 50%;transform:scaleX(0);z-index:200;pointer-events:none';
  const top = document.createElement('button');
  top.setAttribute('aria-label', 'ページの先頭へ');
  top.textContent = '↑';
  top.style.cssText = `position:fixed;right:20px;bottom:20px;z-index:150;width:52px;height:52px;border-radius:50%;border:2px solid #141a22;background:${BLUE};color:#fff;font:900 20px Outfit,sans-serif;cursor:pointer;box-shadow:0 3px 0 #141a22;opacity:0;transform:translateY(20px) scale(.8);transition:opacity .3s,transform .3s;pointer-events:none`;
  top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  const mountChrome = () => { if (document.body && !bar.isConnected) { document.body.appendChild(bar); document.body.appendChild(top); } };
  let hdr;
  const onScroll = () => {
    mountChrome();
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    const show = scrollY > 600;
    top.style.opacity = show ? 1 : 0; top.style.pointerEvents = show ? 'auto' : 'none';
    top.style.transform = show ? 'none' : 'translateY(20px) scale(.8)';
    if (!hdr || !hdr.isConnected) hdr = [...document.querySelectorAll('div')].find(d => getComputedStyle(d).position === 'sticky');
    if (hdr) { hdr.style.transition = 'box-shadow .3s'; hdr.style.boxShadow = scrollY > 10 ? '0 6px 20px rgba(20,26,34,.08)' : 'none'; }
  };
  addEventListener('scroll', onScroll, { passive: true });

  // ---------- #hash links ----------
  // Pages render after load, so the browser's own jump to #contact / #faq finds nothing. Retry until the target exists.
  const HEADER_H = 68;
  const jumpTo = (hash, smooth) => {
    const t0 = Date.now();
    const tick = () => {
      const el = hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - HEADER_H, behavior: smooth ? 'smooth' : 'instant' });
      else if (Date.now() - t0 < 5000) setTimeout(tick, 100);
    };
    tick();
  };
  if (location.hash) setTimeout(() => jumpTo(location.hash, false), 400);
  // Same-page anchor while the mobile menu or a section link is used
  addEventListener('hashchange', () => jumpTo(location.hash, true));

  // ---------- scroll reveal ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { const list = en.target.__anims || []; en.target.__anims = []; io.unobserve(en.target); list.forEach(a => a.play()); } });
  }, { rootMargin: '0px 0px -8% 0px' });

  function prep(el, frames, opts) {
    if (done.has(el)) return; done.add(el);
    if (reduce) return;
    const a = el.animate(frames, Object.assign({ duration: 800, easing: EASE, fill: 'both' }, opts));
    a.pause(); a.currentTime = 0;
    // A clip-path start frame gives the element zero visible area, so IntersectionObserver never reports it; watch the parent instead.
    const target = frames[0].clipPath && el.parentElement ? el.parentElement : el;
    (target.__anims = target.__anims || []).push(a);
    io.observe(target);
  }
  const hasBgStripe = el => (el.getAttribute('style') || '').includes('repeating-linear-gradient');
  const isHex = el => (el.getAttribute('style') || '').includes('polygon(50% 0');
  const isPill = el => { const s = el.getAttribute('style') || ''; return s.includes('box-shadow: 0px 3px 0px') || s.includes('box-shadow:0 3px 0'); };

  function scan() {
    document.querySelectorAll('section').forEach(sec => {
      sec.querySelectorAll('h1').forEach(el => prep(el, [{ clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-30px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'none' }], { duration: 1100, delay: 500 }));
      sec.querySelectorAll('h2').forEach(el => prep(el, [{ clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-24px)' }, { clipPath: 'inset(0 0 -20% 0)', transform: 'none' }], { duration: 1000 }));
      sec.querySelectorAll('h3, p').forEach(el => prep(el, [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { delay: 120 }));
      sec.querySelectorAll('div, form').forEach(g => {
        const cs = getComputedStyle(g);
        const kids = [...g.children].filter(k => getComputedStyle(k).display !== 'none' && k.tagName !== 'BUTTON');
        const cardRow = cs.display === 'grid' || g.classList.contains('fill-row');
        if (cardRow && kids.length >= 2 && !g.closest('form')) {
          kids.forEach((k, i) => prep(k, [{ opacity: 0, transform: 'translateY(50px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: (i % 6) * 90 }));
        } else if (cs.display === 'flex' && cs.flexWrap === 'wrap' && kids.length >= 3) {
          kids.forEach((k, i) => prep(k, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: i * 60, easing: 'cubic-bezier(.3,1.6,.5,1)' }));
        } else if (cs.display === 'flex' && cs.flexDirection === 'column' && kids.length >= 3 && kids.length <= 12) {
          kids.forEach((k, i) => prep(k, [{ opacity: 0, transform: 'translateX(-30px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: i * 70 }));
        }
        if (hasBgStripe(g) && !cs.clipPath.includes('polygon')) prep(g, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1100, delay: 150, easing: 'cubic-bezier(.7,0,.2,1)' });
        if (isHex(g)) prep(g, [{ transform: 'rotate(-180deg) scale(0)' }, { transform: 'none' }], { duration: 900, delay: 300, easing: 'cubic-bezier(.3,1.5,.5,1)' });
      });
      sec.querySelectorAll('a, button').forEach(b => { if (isPill(b)) prep(b, [{ opacity: 0, transform: 'translateY(16px) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 250, easing: 'cubic-bezier(.3,1.5,.5,1)' }); });
    });
    ambient(); hovers();
  }

  // ---------- ambient loops ----------
  function ambient() {
    if (reduce) return;
    document.querySelectorAll('section div').forEach(el => {
      if (el.__amb) return;
      const s = el.getAttribute('style') || '';
      if (s.includes('46% 54% 40% 60%')) {
        el.__amb = 1;
        el.animate([
          { transform: 'rotate(-6deg)', borderRadius: '46% 54% 40% 60% / 52% 44% 56% 48%' },
          { transform: 'rotate(4deg) scale(1.03)', borderRadius: '58% 42% 55% 45% / 45% 58% 42% 55%' },
          { transform: 'rotate(-6deg)', borderRadius: '46% 54% 40% 60% / 52% 44% 56% 48%' }
        ], { duration: 9000, iterations: Infinity, easing: 'ease-in-out' });
      } else if (s.includes('44% 56% 48% 52%')) {
        el.__amb = 1;
        el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], { duration: 6000, iterations: Infinity, easing: 'ease-in-out' });
      } else if (s.includes('position: absolute') && isPill(el) && s.includes('999px')) {
        el.__amb = 1;
        el.animate([{ transform: 'translateY(0) rotate(-2deg)' }, { transform: 'translateY(-10px) rotate(2deg)' }, { transform: 'translateY(0) rotate(-2deg)' }], { duration: 3200, iterations: Infinity, easing: 'ease-in-out' });
      } else if (s.includes('right: 2%') && s.includes('aspect-ratio: 4 / 3')) {
        el.__amb = 1;
        el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(10px) rotate(1deg)' }, { transform: 'translateY(0)' }], { duration: 5000, iterations: Infinity, easing: 'ease-in-out' });
      } else if (s.includes('rotate(-2deg)') && getComputedStyle(el).display === 'grid') {
        el.__amb = 1;
        el.animate([{ transform: 'rotate(-2deg) translateY(0)' }, { transform: 'rotate(-1deg) translateY(-8px)' }, { transform: 'rotate(-2deg) translateY(0)' }], { duration: 7000, iterations: Infinity, easing: 'ease-in-out' });
      }
    });
    document.querySelectorAll('h1 span').forEach(el => {
      if (el.__amb || el.textContent.trim() !== '!') return; el.__amb = 1;
      el.style.display = 'inline-block';
      el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(14deg) translateY(-6px)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(0)' }], { duration: 1400, delay: 1600, iterations: Infinity, iterationStart: 0, easing: 'ease-in-out', endDelay: 1600 });
    });
  }

  // ---------- hover micro-interactions ----------
  function hovers() {
    // Touch screens fire mouseenter on tap and never mouseleave, which leaves cards stuck in the lifted state
    if (reduce || !matchMedia('(hover: hover)').matches) return;
    document.querySelectorAll('a, button').forEach(b => {
      if (b.__hov || !isPill(b)) return; b.__hov = 1;
      const dot = [...b.querySelectorAll('span')].pop();
      if (!dot) return;
      b.addEventListener('mouseenter', () => dot.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }, { transform: 'translateX(5px)' }], { duration: 600, easing: 'ease-in-out', fill: 'forwards' }));
      b.addEventListener('mouseleave', () => dot.animate([{ transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 200, fill: 'forwards' }));
    });
    document.querySelectorAll('section div').forEach(c => {
      if (c.__hov) return;
      const s = c.getAttribute('style') || '';
      if (!(s.includes('border: 2px solid') && s.includes('border-radius: 16px')) && !(s.includes('border-right: 1px solid') && s.includes('border-bottom: 1px solid'))) return;
      c.__hov = 1;
      let h;
      c.addEventListener('mouseenter', () => { h && h.cancel(); h = c.animate([{ transform: 'none', boxShadow: '0 0 0 rgba(0,0,0,0)' }, { transform: 'translateY(-6px)', boxShadow: '0 14px 28px rgba(24,115,201,.18)' }], { duration: 300, easing: EASE, fill: 'forwards' }); });
      c.addEventListener('mouseleave', () => { h && h.cancel(); h = c.animate([{ transform: 'translateY(-6px)', boxShadow: '0 14px 28px rgba(24,115,201,.18)' }, { transform: 'none', boxShadow: '0 0 0 rgba(0,0,0,0)' }], { duration: 300, easing: EASE, fill: 'forwards' }); });
      const ph = [...c.querySelectorAll('div')].find(hasBgStripe);
      if (ph) {
        ph.style.overflow = 'hidden';
        c.addEventListener('mouseenter', () => ph.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '40px 0' }], { duration: 1200, iterations: 2 }));
      }
    });
  }

  // ---------- tab switches & toggles ----------
  document.addEventListener('click', e => {
    if (reduce) return;
    const btn = e.target.closest && e.target.closest('button');
    if (!btn) return;
    const sibs = btn.parentElement ? [...btn.parentElement.children].filter(x => x.tagName === 'BUTTON') : [];
    btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(.93)' }, { transform: 'scale(1)' }], { duration: 250 });
    if (sibs.length >= 3) {
      const sec = btn.closest('section');
      setTimeout(() => sec && sec.querySelectorAll('div').forEach(g => {
        if ((getComputedStyle(g).display !== 'grid' && !g.classList.contains('fill-row')) || g.contains(btn)) return;
        [...g.children].forEach((k, i) => k.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: i * 50, easing: EASE, fill: 'backwards' }));
      }), 20);
    }
  }, true);

  // ---------- watch DOM ----------
  let t;
  const mo = new MutationObserver(muts => {
    if (loaded && !reduce) muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1 && n.closest('section') && !done.has(n)) { done.add(n); n.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: EASE }); }
    }));
    clearTimeout(t); t = setTimeout(scan, 60);
  });
  const start = () => { mo.observe(document.body, { childList: true, subtree: true }); scan(); onScroll(); setTimeout(() => { loaded = true; }, 2500); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
