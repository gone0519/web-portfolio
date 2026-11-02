(function () {
  if (window.__yuriAnim) return;
  window.__yuriAnim = true;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const EASE = 'cubic-bezier(.22,.9,.3,1)';
  const RADII = ['22px', '24px', '28px', '32px', '36px', '40px', '48px'];
  const seen = new WeakSet();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      pending.delete(e.target);
      (e.target.__anims || []).forEach((a) => a.play());
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  const pending = new Set();
  let revealAll = document.hidden;
  function queue(el, frames, opts) {
    if (revealAll) return;
    const a = el.animate(frames, Object.assign({ duration: 800, easing: EASE, fill: 'both' }, opts));
    (el.__anims = el.__anims || []).push(a);
    if (el.getBoundingClientRect().top < innerHeight) return;
    a.pause(); a.currentTime = 0;
    pending.add(el);
    io.observe(el);
  }
  function flush(all) {
    pending.forEach((el) => {
      if (all || el.getBoundingClientRect().top < innerHeight) {
        (el.__anims || []).forEach((a) => (all ? a.finish() : a.play()));
        pending.delete(el); io.unobserve(el);
      }
    });
  }
  setInterval(() => flush(false), 1500);
  addEventListener('beforeprint', () => { revealAll = true; flush(true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { revealAll = true; flush(true); } });
  function loop(el, frames, opts) {
    el.animate(frames, Object.assign({ iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }, opts));
  }
  function staggerIndex(el) {
    let i = 0, s = el.previousElementSibling;
    while (s && i < 8) { if (s.dataset.rv) i++; s = s.previousElementSibling; }
    return i;
  }
  const isTarget = (el) => {
    const t = el.tagName, st = el.style;
    if (st.position === 'absolute') return false;
    if (t === 'H2' || t === 'H3' || t === 'P' || t === 'ARTICLE' || t === 'LI' || t === 'OL' && false) return true;
    if (st.writingMode === 'vertical-rl') return true;
    if (RADII.includes(st.borderRadius) || st.borderRadius.startsWith('46%')) return true;
    if (t === 'A' && st.borderRadius === '999px') return true;
    return false;
  };

  function scan() {
    const main = document.querySelector('main');
    if (main) main.querySelectorAll('*').forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      const st = el.style, t = el.tagName;
      // decorative illustrations: gentle sway
      if (t === 'IMG' && el.classList.contains('deco')) {
        loop(el, [{ rotate: '-2deg' }, { rotate: '2deg' }], { duration: 5000 + Math.random() * 2000 });
        return;
      }
      // floating name badges
      if (st.position === 'absolute' && st.borderRadius === '999px' && st.border.includes('1.5px')) {
        loop(el, [{ translate: '0 0', rotate: '-2deg' }, { translate: '0 -8px', rotate: '2deg' }], { duration: 2400 + Math.random() * 1200 });
        return;
      }
      // decorative circles
      if (st.position === 'absolute' && st.borderRadius === '50%') {
        loop(el, [{ scale: '1' }, { scale: '1.12' }], { duration: 2600 });
      }
      // sun
      if (el.getAttribute('aria-hidden') === 'true' && st.width === '110px') {
        el.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 40000, iterations: Infinity });
        const core = el.firstElementChild;
        if (core) loop(core, [{ scale: '1' }, { scale: '1.08' }], { duration: 1800 });
        queue(el, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 1100, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        return;
      }
      // striped placeholders: slow drift
      if (st.backgroundImage.includes('repeating-linear-gradient')) {
        el.animate([{ backgroundPosition: '0 0' }, { backgroundPosition: '56.57px 0' }], { duration: 9000, iterations: Infinity });
      }
      // blob morph + parallax
      if (st.borderRadius.startsWith('46%')) {
        loop(el, [
          { borderRadius: '46% 54% 42% 58% / 52% 44% 56% 48%' },
          { borderRadius: '56% 44% 54% 46% / 44% 56% 46% 54%' }
        ], { duration: 6000 });
        parallax.push(el);
      }
      // highlighted words pop
      if (t === 'SPAN' && st.borderRadius === '999px' && el.parentElement && /^(H2|P)$/.test(el.parentElement.tagName)) {
        queue(el, [{ transform: 'scale(.6) rotate(-6deg)', opacity: 0 }, { transform: 'scale(1.15) rotate(3deg)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 900, delay: 500 });
        el.style.display = 'inline-block';
      }
      // primary CTA bounce
      if ((t === 'A' || t === 'BUTTON') && /rgb\(246, 213, 74\)|rgb\(156, 196, 106\)/.test(st.background)) {
        el.animate([
          { translate: '0 0' }, { translate: '0 -5px', offset: .08 }, { translate: '0 0', offset: .16 },
          { translate: '0 -3px', offset: .22 }, { translate: '0 0', offset: .28 }, { translate: '0 0' }
        ], { duration: 4000, iterations: Infinity, delay: 1500 });
      }
      // h1 bracket lines
      if (el.parentElement && el.parentElement.tagName === 'H1') {
        el.dataset.rv = '1';
        const i = [...el.parentElement.children].indexOf(el);
        queue(el, [{ opacity: 0, transform: 'translateX(-28px)', clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: 900, delay: 200 + i * 220 });
        return;
      }
      if (!isTarget(el)) return;
      if (el.parentElement && el.parentElement.closest('[data-rv]')) return;
      el.dataset.rv = '1';
      const d = staggerIndex(el) * 90;
      if (st.writingMode === 'vertical-rl') {
        queue(el, [{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }], { duration: 1200, delay: d + 150 });
      } else if (t === 'ARTICLE' || RADII.includes(st.borderRadius)) {
        queue(el, [{ opacity: 0, transform: 'translateY(40px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: d });
        hoverLift(el);
      } else {
        queue(el, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { delay: d });
      }
    });

    // waves breathe
    document.querySelectorAll('svg[preserveAspectRatio="none"] path').forEach((p, i) => {
      if (seen.has(p)) return; seen.add(p);
      p.style.transformBox = 'fill-box'; p.style.transformOrigin = '50% 100%';
      loop(p, [{ transform: 'scaleY(1) translateX(0)' }, { transform: 'scaleY(1.22) translateX(-1.5%)' }], { duration: 3800 + (i % 3) * 700 });
    });

    // header
    const header = document.querySelector('header');
    if (header && !seen.has(header)) {
      seen.add(header);
      header.animate([{ transform: 'translateY(-100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, easing: EASE });
      header.querySelectorAll('span').forEach((s, i) => {
        if (s.style.borderRadius === '50%' || s.style.borderRadius.includes('8px 0')) {
          loop(s, [{ translate: '0 0' }, { translate: '0 -3px' }], { duration: 1200 + i * 250 });
        }
      });
    }
  }

  function hoverLift(el) {
    let a;
    el.addEventListener('mouseenter', () => { a && a.cancel(); a = el.animate([{ translate: '0 0' }, { translate: '0 -6px' }], { duration: 260, easing: EASE, fill: 'forwards' }); });
    el.addEventListener('mouseleave', () => { a && a.cancel(); a = el.animate([{ translate: '0 -6px' }, { translate: '0 0' }], { duration: 300, easing: EASE, fill: 'forwards' }); });
  }

  const parallax = [];
  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, { position: 'fixed', top: 0, left: 0, height: '4px', width: '100%', background: '#e89a3c', transformOrigin: '0 50%', transform: 'scaleX(0)', zIndex: 100, borderRadius: '0 4px 4px 0' });
  document.body.appendChild(bar);
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
      parallax.forEach((el) => { el.style.translate = '0 ' + (scrollY * -0.08).toFixed(1) + 'px'; });
      flush(false);
      ticking = false;
    });
  }, { passive: true });

  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 60); }).observe(document.body, { childList: true, subtree: true });
  scan();
})();
