(function () {
  if (window.__miraiAnim) return; window.__miraiAnim = true;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const seen = new WeakSet();
  const hiddenAnims = new WeakMap();
  const cs = (el) => getComputedStyle(el);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const a = hiddenAnims.get(e.target);
      if (a) a.play();
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function reveal(el, kind, delay) {
    let frames;
    if (kind === 'pop') frames = [{ opacity: 0, scale: '.82' }, { opacity: 1, scale: '1.03', offset: .7 }, { opacity: 1, scale: '1' }];
    else if (kind === 'badge') frames = [{ opacity: 0, scale: '0', rotate: '-30deg' }, { opacity: 1, scale: '1.12', rotate: '6deg', offset: .7 }, { opacity: 1, scale: '1', rotate: '0deg' }];
    else if (kind === 'write') frames = [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }];
    else if (kind === 'blur') frames = [{ opacity: 0, translate: '0 24px', filter: 'blur(8px)' }, { opacity: 1, translate: '0 0', filter: 'blur(0)' }];
    else if (kind === 'left') frames = [{ opacity: 0, translate: '-40px 0' }, { opacity: 1, translate: '0 0' }];
    else if (kind === 'right') frames = [{ opacity: 0, translate: '40px 0' }, { opacity: 1, translate: '0 0' }];
    else frames = [{ opacity: 0, translate: '0 36px' }, { opacity: 1, translate: '0 0' }];
    const a = el.animate(frames, { duration: kind === 'write' ? 1100 : 800, delay: delay || 0, easing: EASE, fill: 'backwards' });
    a.pause();
    hiddenAnims.set(el, a);
    io.observe(el);
  }

  function loop(el, frames, opts) {
    el.animate(frames, Object.assign({ iterations: Infinity, easing: 'ease-in-out' }, opts));
  }

  function ancestorSeen(el) {
    let p = el.parentElement, n = 0;
    while (p && n < 8) { if (seen.has(p)) return true; p = p.parentElement; n++; }
    return false;
  }
  const idx = (el) => Array.prototype.indexOf.call(el.parentElement.children, el);

  function handle(el) {
    if (seen.has(el) || !el.isConnected) return;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'OPTION') return;
    const s = cs(el);

    // continuous effects
    if (s.backgroundImage.indexOf('repeating-linear-gradient') > -1) {
      const px = (s.backgroundImage.match(/([\d.]+)px/g) || []).map(parseFloat);
      const period = Math.max.apply(null, px.concat([16]));
      loop(el, [{ backgroundPosition: '0px 0px' }, { backgroundPosition: (period * 1.41421 * 2).toFixed(2) + 'px 0px' }], { duration: 9000, easing: 'linear' });
    }
    if (s.borderTopStyle === 'double') {
      seen.add(el);
      reveal(el, 'badge', 300 + idx(el) * 160);
      loop(el, [{ translate: '0 0' }, { translate: '0 -7px' }, { translate: '0 0' }], { duration: 3200, delay: idx(el) * 400 });
      return;
    }
    const bg = s.backgroundColor;
    if (/^rgba\(255, 255, 255, 0\.1/.test(bg) && s.borderRadius.indexOf('50%') > -1) {
      loop(el, [{ translate: '0 0', scale: '1' }, { translate: '20px -18px', scale: '1.08' }, { translate: '0 0', scale: '1' }], { duration: 9000 + Math.random() * 3000 });
      return;
    }
    if (s.position === 'absolute' && s.borderRadius.indexOf('100%') > -1 && el.offsetWidth > window.innerWidth) {
      loop(el, [{ translate: '-1.5% 0' }, { translate: '1.5% 0' }], { duration: 7000, direction: 'alternate' });
      return;
    }
    if ((tag === 'A' || tag === 'BUTTON') && bg === 'rgb(240, 145, 58)' && s.borderTopLeftRadius === '40px') {
      loop(el, [{ scale: '1' }, { scale: '1.045' }, { scale: '1' }, { scale: '1' }], { duration: 2800 });
    }
    if (el.closest('header') && bg === 'rgb(141, 186, 67)' && s.borderRadius.indexOf('50%') > -1) {
      loop(el, [{ rotate: '0deg' }, { rotate: '0deg', offset: .86 }, { rotate: '-10deg', offset: .9 }, { rotate: '8deg', offset: .94 }, { rotate: '0deg' }], { duration: 5000 });
      return;
    }

    if (!el.closest('section, footer, [data-screen-label]')) return;
    if (ancestorSeen(el)) return;

    // reveals
    if (/^rgba\(255, 255, 255, 0\.9/.test(bg) && s.borderRadius.indexOf('%') > -1) { seen.add(el); reveal(el, 'pop', 150); return; }
    if (s.fontFamily.indexOf('Caveat') > -1 && s.display === 'block') { seen.add(el); reveal(el, 'write', 250); return; }
    if (tag === 'H1') { seen.add(el); reveal(el, 'blur', 200); return; }
    if (tag === 'H2' || tag === 'H3' || tag === 'H4') { seen.add(el); reveal(el, 'blur', 0); return; }
    const parent = el.parentElement;
    if (parent && cs(parent).display === 'grid' && parent.children.length > 1 && !parent.closest('header')) {
      seen.add(el); reveal(el, 'up', (idx(el) % 8) * 90); return;
    }
    if (parent && cs(parent).flexWrap === 'wrap' && cs(parent).flexDirection === 'row' && parent.children.length === 2 && el.offsetWidth > 300) {
      seen.add(el); reveal(el, idx(el) === 0 ? 'left' : 'right', idx(el) * 140); return;
    }
    if (parent && cs(parent).flexWrap === 'wrap' && parent.children.length === 2 && cs(parent).flexDirection === 'row-reverse' && el.offsetWidth > 300) {
      seen.add(el); reveal(el, idx(el) === 0 ? 'right' : 'left', idx(el) * 140); return;
    }
    if (tag === 'ARTICLE' || tag === 'TABLE' || tag === 'FORM' || tag === 'ASIDE' || (tag === 'TR' && el.closest('tbody'))) {
      seen.add(el); reveal(el, 'up', tag === 'TR' ? idx(el) * 120 : 0); return;
    }
    if (tag === 'P' && el.textContent.length > 20) { seen.add(el); reveal(el, 'up', 120); return; }
    if (parent && cs(parent).flexDirection === 'column' && parent.children.length >= 3 && (s.borderBottomStyle !== 'none' || s.boxShadow !== 'none' || s.borderTopStyle !== 'none') && el.offsetHeight > 30) {
      seen.add(el); reveal(el, 'up', (idx(el) % 8) * 70); return;
    }
    if (s.boxShadow !== 'none' && tag !== 'A' && tag !== 'BUTTON' && el.offsetWidth > 200) { seen.add(el); reveal(el, 'up', 0); }
  }

  function scan(root) {
    if (root.nodeType !== 1) return;
    handle(root);
    const all = root.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) handle(all[i]);
  }

  let pending = [], raf = 0;
  const mo = new MutationObserver((muts) => {
    muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) pending.push(n); }));
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; const p = pending; pending = []; p.forEach(scan); });
  });

  function chrome() {
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#8dba43,#f0913a);transform-origin:0 50%;transform:scaleX(0);z-index:1000;pointer-events:none';
    const top = document.createElement('button');
    top.setAttribute('aria-label', 'ページ上部へ');
    top.textContent = '▲';
    top.style.cssText = 'position:fixed;right:20px;bottom:20px;width:52px;height:52px;border-radius:50%;border:3px solid #fff;background:#8dba43;color:#fff;font-size:16px;cursor:pointer;box-shadow:0 6px 16px rgba(60,90,20,.3);z-index:1000;opacity:0;transform:translateY(20px) scale(.8);transition:opacity .35s,transform .35s;pointer-events:none';
    top.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(bar); document.body.appendChild(top);
    let heroGrid = null;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
      const show = window.scrollY > 500;
      top.style.opacity = show ? '1' : '0';
      top.style.transform = show ? 'none' : 'translateY(20px) scale(.8)';
      top.style.pointerEvents = show ? 'auto' : 'none';
      if (!heroGrid || !heroGrid.isConnected) heroGrid = document.querySelector('#top > div > div:first-child');
      if (heroGrid && window.scrollY < 900) heroGrid.style.translate = '0 ' + (window.scrollY * 0.3).toFixed(1) + 'px';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === '_blank') return;
      const href = a.getAttribute('href');
      if (!/\.dc\.html/.test(href)) return;
      e.preventDefault();
      document.body.animate([{ opacity: 1 }, { opacity: 0, translate: '0 -12px' }], { duration: 280, easing: 'ease-in', fill: 'forwards' })
        .onfinish = () => { window.location.href = href; };
    });
  }

  function start() {
    document.body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
    chrome();
    scan(document.body);
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      const h = document.querySelector('header');
      if (h) h.animate([{ translate: '0 -100%', opacity: 0 }, { translate: '0 0', opacity: 1 }], { duration: 700, easing: EASE });
    }, 50);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
