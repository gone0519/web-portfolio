(function () {
  if (window.__kanadeMotion) return; window.__kanadeMotion = 1;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const E = 'cubic-bezier(.2,.8,.2,1)';
  const seen = new WeakSet(); const paras = []; const fine = matchMedia('(pointer: fine)').matches;
  const isOrange = (c) => /221, 100, 39|240, 138, 75/.test(c || '');

  // progress bar
  const bar = document.createElement('div');
  Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, height: '4px', width: '100%', background: '#f3b23a', transformOrigin: '0 50%', transform: 'scaleX(0)', zIndex: 60, pointerEvents: 'none' });
  document.body.appendChild(bar);

  if (reduce) { addEventListener('scroll', () => { const h = document.documentElement; bar.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - innerHeight)})`; }, { passive: true }); return; }

  // page curtain in / out
  const curtain = document.createElement('div');
  Object.assign(curtain.style, { position: 'fixed', inset: 0, background: '#23897a', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' });
  curtain.innerHTML = '<div style="width:56px;height:56px;border-radius:50%;border:5px solid #fff;display:flex;align-items:center;justify-content:center"><div style="width:16px;height:16px;border-radius:50%;background:#f08a4b"></div></div>';
  document.body.appendChild(curtain);
  const logo = curtain.firstChild;
  logo.animate([{ transform: 'scale(.6) rotate(-90deg)', opacity: 0 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 420, easing: E, fill: 'both' });
  setTimeout(() => {
    curtain.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 700, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' }).onfinish = () => curtain.remove();
  }, 380);
  setTimeout(() => curtain.remove(), 1500);
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || !/\.dc\.html/.test(href)) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault(); e.stopPropagation();
    document.body.appendChild(curtain); setTimeout(() => { location.href = url.href; }, 900);
    curtain.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 520, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'both' }).onfinish = () => { location.href = url.href; };
  }, true);

  // reveal
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); const a = en.target.__rev; if (a) a.play(); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function reveal(el, i) {
    const s = el.style; const tag = el.tagName;
    let kf, dur = 820;
    if (s.writingMode === 'vertical-rl') { kf = [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }]; dur = 1100; }
    else if ((s.backgroundImage || s.background || '').includes('repeating')) { kf = [{ clipPath: 'inset(0 100% 0 0 round 6px)', filter: 'saturate(.3)' }, { clipPath: 'inset(0 0 0 0 round 0px)', filter: 'saturate(1)' }]; dur = 1000; }
    else if (tag === 'H1' || tag === 'H2') { kf = [{ opacity: 0, transform: 'translateY(30px)', letterSpacing: '0.3em', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', letterSpacing: s.letterSpacing || 'normal', filter: 'blur(0)' }]; dur = 1000; }
    else if (tag === 'ARTICLE' || isOrange(s.backgroundColor)) { kf = [{ opacity: 0, transform: 'translateY(48px) scale(.94) rotate(-1.5deg)' }, { opacity: 1, transform: 'none' }]; dur = 900; }
    else if (tag === 'LI' || tag === 'SPAN' || tag === 'LABEL') { kf = [{ opacity: 0, transform: 'translateX(-20px)' }, { opacity: 1, transform: 'none' }]; dur = 600; }
    else { kf = [{ opacity: 0, transform: 'translateY(36px)' }, { opacity: 1, transform: 'none' }]; }
    const a = el.animate(kf, { duration: dur, delay: (i % 6) * 90, easing: E, fill: 'both' });
    a.onfinish = () => a.cancel(); a.pause(); a.currentTime = 0; el.__rev = a; io.observe(el);
  }

  function ambient(el) {
    const s = el.style;
    const big = el.offsetHeight > 200;
    if ((s.backgroundImage || s.background || '').includes('repeating') && big) {
      el.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '79px 0' }], { duration: 4000, iterations: Infinity });
      if (getComputedStyle(el).position !== 'static' && !el.__shapes) {
        el.__shapes = 1;
        const cols = ['#ffffff', '#f3b23a', '#23897a', '#dd6427'];
        const n = el.offsetHeight > 450 ? 9 : 5;
        for (let k = 0; k < n; k++) {
          const sh = document.createElement('span'); const sz = 10 + Math.random() * 34; const type = k % 4;
          Object.assign(sh.style, { position: 'absolute', left: (5 + Math.random() * 90) + '%', top: (8 + Math.random() * 80) + '%', width: sz + 'px', height: sz + 'px', pointerEvents: 'none', opacity: '.85',
            background: type === 1 ? 'transparent' : cols[k % 4], border: type === 1 ? '4px solid ' + cols[(k + 1) % 4] : 'none',
            borderRadius: type === 2 ? '3px' : '50%', transform: type === 3 ? 'rotate(45deg)' : '' });
          if (type === 3) sh.style.borderRadius = '2px';
          el.appendChild(sh);
          const dx = (Math.random() - 0.5) * 80, dy = -20 - Math.random() * 60;
          sh.animate([{ translate: '0 0', rotate: '0deg', scale: 1 }, { translate: dx + 'px ' + dy + 'px', rotate: (Math.random() > .5 ? 180 : -180) + 'deg', scale: 1.25 }], { duration: 4000 + Math.random() * 5000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', delay: -Math.random() * 4000 });
          sh.animate([{ opacity: 0, scale: 0 }, { opacity: .85, scale: 1 }], { duration: 700, delay: 600 + k * 120, easing: 'cubic-bezier(.3,1.6,.5,1)', fill: 'backwards', composite: 'add' });
        }
      }
    }
    if (s.writingMode === 'vertical-rl') {
      el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }], { duration: 2600 + Math.random() * 800, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out', delay: 1100 });
      el.__para = 0.08; paras.push(el);
    }
    if (s.position === 'absolute' && s.top === '-12px') {
      el.animate([{ transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }], { duration: 1400, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
    }
    if (s.clipPath && s.clipPath.includes('polygon')) { el.__para = -0.15; paras.push(el); }
    if (s.borderRadius === '50%' && isOrange(s.backgroundColor) && parseInt(s.width) <= 16) {
      el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 1800, iterations: Infinity, easing: 'ease-in-out' });
    }
    if (s.position === 'fixed' && s.right === '18px') {
      el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(0)' }], { duration: 2400, iterations: Infinity, easing: 'ease-in-out' });
    }
  }

  function hover(el) {
    const tag = el.tagName;
    if (tag === 'ARTICLE' && fine) {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = 'transform .15s ease-out, box-shadow .3s';
        el.style.transform = `perspective(900px) rotateX(${(-y * 9).toFixed(2)}deg) rotateY(${(x * 11).toFixed(2)}deg) translateY(-6px)`;
        el.style.boxShadow = `${(-x * 20).toFixed(0)}px ${(18 - y * 10).toFixed(0)}px 34px rgba(20,70,62,.22)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s'; el.style.transform = ''; el.style.boxShadow = ''; });
    }
    if ((tag === 'A' || tag === 'BUTTON') && fine && el.style.borderRadius === '999px' && el.style.minHeight) {
      el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px`; });
      el.addEventListener('mouseleave', () => { el.animate([{ translate: el.style.translate || '0 0' }, { translate: '0 0' }], { duration: 500, easing: 'cubic-bezier(.3,1.6,.5,1)' }); el.style.translate = ''; });
    }
    if ((tag === 'A' || tag === 'BUTTON') && el.style.borderRadius === '999px') {
      el.addEventListener('pointerdown', (e) => {
        const r = el.getBoundingClientRect(); const d = Math.max(r.width, r.height) * 2.2; const rp = document.createElement('span');
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
        el.style.overflow = 'hidden';
        Object.assign(rp.style, { position: 'absolute', left: (e.clientX - r.left - d / 2) + 'px', top: (e.clientY - r.top - d / 2) + 'px', width: d + 'px', height: d + 'px', borderRadius: '50%', background: 'rgba(243,178,58,.45)', pointerEvents: 'none' });
        el.appendChild(rp);
        rp.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 650, easing: 'ease-out' }).onfinish = () => rp.remove();
      });
    }
    if (tag === 'A' || tag === 'BUTTON') {
      const arrow = [...el.children].find((c) => c.tagName === 'SPAN' && c.style.borderRadius === '50%' && /[→↓]/.test(c.textContent));
      if (arrow) {
        let h; const down = arrow.textContent.includes('↓');
        el.addEventListener('mouseenter', () => { h = arrow.animate([{ transform: 'none' }, { transform: down ? 'translateY(4px)' : 'translateX(4px)' }], { duration: 380, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' }); el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 360, easing: E }); });
        el.addEventListener('mouseleave', () => { h && h.cancel(); });
      }
    }
  }

  function scan() {
    const set = [];
    const add = (el) => { if (el && el.nodeType === 1 && !seen.has(el)) set.push(el); };
    document.querySelectorAll('main section, main footer').forEach((sec) => {
      if (!seen.has(sec) && (sec.style.backgroundImage || sec.style.background || '').includes('repeating')) { seen.add(sec); ambient(sec); }
      [...sec.children].forEach(add);
      sec.querySelectorAll('*').forEach((el) => {
        const s = el.style;
        if (s.display === 'grid' || s.flexWrap === 'wrap') [...el.children].forEach(add);
        if (/^(H1|H2|LI|ARTICLE)$/.test(el.tagName)) add(el);
        if ((s.backgroundImage || s.background || '').includes('repeating') || s.writingMode === 'vertical-rl' || (s.position === 'absolute' && s.top === '-12px')) add(el);
      });
    });
    document.querySelectorAll('main a, main button, aside *, body > * [style*="fixed"]').forEach((el) => { if (!seen.has(el) && (el.tagName === 'A' || el.tagName === 'BUTTON' || el.style.borderRadius === '50%' || el.style.position === 'fixed')) { seen.add(el); hover(el); ambient(el); } });
    let i = 0;
    [...new Set(set)].forEach((el) => {
      if (seen.has(el)) return; seen.add(el);
      if (!el.closest('main')) { ambient(el); return; }
      reveal(el, i++); ambient(el); hover(el);
    });
  }

  let raf = 0;
  const queue = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; scan(); }); };
  new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
  addEventListener('load', scan);
  document.addEventListener('DOMContentLoaded', scan);
  queue();

  // scroll: progress + parallax
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - innerHeight)})`;
    paras.forEach((el) => {
      if (!el.isConnected) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const d = (r.top + r.height / 2 - innerHeight / 2) * el.__para;
      el.style.translate = `0 ${d.toFixed(1)}px`;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });

  if (fine) {
    const dot = document.createElement('div'); const ring = document.createElement('div');
    Object.assign(dot.style, { position: 'fixed', left: 0, top: 0, width: '8px', height: '8px', margin: '-4px 0 0 -4px', borderRadius: '50%', background: '#dd6427', zIndex: 90, pointerEvents: 'none' });
    Object.assign(ring.style, { position: 'fixed', left: 0, top: 0, width: '36px', height: '36px', margin: '-18px 0 0 -18px', borderRadius: '50%', border: '2px solid #23897a', zIndex: 90, pointerEvents: 'none', transition: 'width .25s, height .25s, margin .25s, background .25s, border-color .25s' });
    document.body.append(dot, ring);
    let mx = -100, my = -100, rx = -100, ry = -100;
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; dot.style.translate = mx + 'px ' + my + 'px';
      const hot = e.target.closest && e.target.closest('a, button, label, article');
      const b = hot ? 60 : 36; ring.style.width = ring.style.height = b + 'px'; ring.style.margin = (-b / 2) + 'px 0 0 ' + (-b / 2) + 'px';
      ring.style.background = hot ? 'rgba(243,178,58,.25)' : 'transparent'; ring.style.borderColor = hot ? '#f3b23a' : '#23897a'; });
    (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.translate = rx.toFixed(1) + 'px ' + ry.toFixed(1) + 'px'; requestAnimationFrame(loop); })();
  }

  let lastY = scrollY, boost = 1; const mqs = [];
  function setupMarquees() {
    document.querySelectorAll('[data-marquee]').forEach((m) => {
      if (m.__mq) return; const track = m.firstElementChild; if (!track) return; m.__mq = 1;
      const a = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 28000, iterations: Infinity });
      mqs.push(a);
    });
  }
  addEventListener('scroll', () => { const v = Math.abs(scrollY - lastY); lastY = scrollY; boost = Math.min(6, 1 + v / 12); }, { passive: true });
  (function decay() { boost += (1 - boost) * 0.06; mqs.forEach((a) => { a.playbackRate = boost; }); requestAnimationFrame(decay); })();
  new MutationObserver(() => setupMarquees()).observe(document.body, { childList: true, subtree: true });
  setupMarquees();

  let railDone = false;
  function railIn() {
    const items = document.querySelectorAll('aside nav a, aside > a, aside > div > a');
    if (!items.length || railDone) return; railDone = true;
    items.forEach((a, i) => a.animate([{ opacity: 0, transform: 'translateX(-30px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 700 + i * 70, easing: E, fill: 'backwards' }));
  }
  new MutationObserver(railIn).observe(document.body, { childList: true, subtree: true });
  railIn();
})();
