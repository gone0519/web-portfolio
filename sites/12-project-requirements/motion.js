const EASE = 'cubic-bezier(.16,.84,.24,1)';

function countUp(sec) {
  sec.querySelectorAll('[data-count]').forEach(el => {
    if (el.dataset.counted) return;
    const node = Array.from(el.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
    if (!node) return;
    const target = parseInt(node.textContent.replace(/[^\d]/g, ''), 10);
    if (!target) return;
    el.dataset.counted = '1';
    const t0 = performance.now(), dur = 1500;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      node.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function parts(sec) {
  const out = [];
  sec.querySelectorAll('[data-stagger]').forEach(g => out.push(...Array.from(g.children)));
  return out;
}

export function initMotion() {
  const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!nodes.length) return;

  const hide = sec => {
    const wipe = sec.dataset.motion === 'wipe';
    sec.style.transition = `opacity 1s ${EASE}, transform 1.1s ${EASE}, clip-path 1.2s ${EASE}, filter .9s ease`;
    sec.style.opacity = '0';
    sec.style.willChange = 'opacity, transform, clip-path';
    if (wipe) {
      sec.style.clipPath = 'inset(0 0 100% 0)';
    } else {
      sec.style.transform = 'translateY(46px) scale(0.985)';
      sec.style.filter = 'blur(6px)';
    }
    parts(sec).forEach((c, i) => {
      const d = 0.12 + i * 0.09;
      c.style.transition = `opacity .85s ${EASE} ${d}s, transform .95s ${EASE} ${d}s, filter .8s ease ${d}s`;
      c.style.opacity = '0';
      c.style.transform = 'translateY(52px) scale(0.94)';
      c.style.filter = 'blur(7px)';
    });
    sec.dataset.hidden = '1';
  };

  const show = sec => {
    if (!sec.dataset.hidden) { countUp(sec); return; }
    sec.style.opacity = '1';
    sec.style.transform = 'none';
    sec.style.filter = 'none';
    sec.style.clipPath = 'inset(0 0 0 0)';
    parts(sec).forEach(c => {
      c.style.opacity = '1';
      c.style.transform = 'none';
      c.style.filter = 'none';
    });
    delete sec.dataset.hidden;
    setTimeout(() => { sec.style.willChange = 'auto'; sec.style.clipPath = 'none'; }, 1400);
    setTimeout(() => countUp(sec), 400);
  };

  nodes.forEach(n => {
    if (n.getBoundingClientRect().top < window.innerHeight * 1.05) show(n);
    else hide(n);
  });

  const px = Array.from(document.querySelectorAll('[data-parallax]'));
  const tick = () => {
    const y = window.scrollY || 0;
    px.forEach(el => { el.style.transform = `translate3d(0, ${(y * parseFloat(el.dataset.parallax)).toFixed(1)}px, 0)`; });
    let pending = false;
    nodes.forEach(n => {
      if (!n.dataset.hidden) return;
      if (n.getBoundingClientRect().top < window.innerHeight * 0.86) show(n);
      else pending = true;
    });
    if (!pending && !px.length) window.removeEventListener('scroll', tick);
  };
  window.addEventListener('scroll', tick, { passive: true });
  setTimeout(tick, 300);
  setTimeout(() => nodes.forEach(show), 3000);
}
