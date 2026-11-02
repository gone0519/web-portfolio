(function () {
  const STAR = '50,4 62,38 98,38 69,59 80,94 50,73 20,94 31,59 2,38 38,38';
  const SPARK = '50,0 58,42 100,50 58,58 50,100 42,58 0,50 42,42';
  function field(h, n, seed, kind) {
    let x = seed; const r = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    const star = kind === 'star';
    const colors = star ? ['#f9d77e', '#f9d77e', '#fff'] : ['#f15a24', '#f9d77e', '#c1272d'];
    const min = star ? 8 : 18, max = star ? 30 : 54;
    return h('div', { style: { position: 'absolute', inset: 0, pointerEvents: 'none' } }, Array.from({ length: n }, (_, i) => {
      const sz = min + r() * (max - min), c = colors[i % colors.length];
      return h('svg', { key: i, viewBox: '0 0 100 100', style: { position: 'absolute', overflow: 'visible', left: (r() * 97) + '%', top: (r() * 95) + '%', width: sz, height: sz,
        filter: star ? 'drop-shadow(0 0 4px ' + c + ') drop-shadow(0 0 10px ' + c + ') drop-shadow(0 0 22px rgba(255,236,170,.8))' : 'none',
        animation: 'twinkle ' + (2 + r() * 3).toFixed(2) + 's ease-in-out ' + (r() * 3).toFixed(2) + 's infinite' } },
        h('polygon', { points: star ? STAR : SPARK, fill: c }));
    }));
  }
  function setup() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const from = { up: 'translateY(60px)', left: 'translateX(-60px)', right: 'translateX(60px)', zoom: 'scale(.82)', pop: 'scale(.6) rotate(-4deg)', spin: 'scale(.5) rotate(-90deg)' };
    const els = [...document.querySelectorAll('[data-reveal]')].filter(el => !el._ready);
    const rise = [...document.querySelectorAll('[data-anim="rise"]')].filter(el => !el._ready);
    els.forEach(el => { el._ready = 1; el._base = el.style.transform || '';
      const sib = [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
      el._delay = Math.min(sib.indexOf(el), 6) * 120; });
    const show = el => { if (el._shown) return; el._shown = 1;
      const ease = el.dataset.reveal === 'pop' || el.dataset.reveal === 'spin' ? 'cubic-bezier(.34,1.56,.64,1)' : 'cubic-bezier(.2,.8,.2,1)';
      el.animate([{ opacity: 0, transform: (el._base + ' ' + from[el.dataset.reveal]).trim() }, { opacity: 1, transform: el._base || 'none' }], { duration: 900, delay: el._delay, easing: ease, fill: 'backwards' }); };
    const grow = (el, k) => { if (el._shown) return; el._shown = 1; el.style.transformOrigin = 'bottom';
      el.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1.08)' }, { transform: 'scaleY(1)' }], { duration: 900, delay: k * 110, easing: 'cubic-bezier(.3,1.4,.6,1)', fill: 'backwards' }); };
    rise.forEach(el => el._ready = 1);
    let t = 0;
    const check = () => { t = 0; const vh = window.innerHeight;
      els.forEach(el => { if (el._shown) return; const b = el.getBoundingClientRect(); if (b.top < vh * .92 && b.bottom > 0) show(el); });
      rise.forEach((el, k) => { if (el._shown) return; const b = el.getBoundingClientRect(); if (b.top < vh && b.bottom > 0) grow(el, k); }); };
    const sched = () => { if (!t) t = setTimeout(check, 60); };
    window.addEventListener('scroll', sched, { passive: true });
    window.addEventListener('resize', sched);
    setTimeout(() => { els.forEach(show); rise.forEach(grow); }, 4000);
    check();
    const loop = { iterations: Infinity, easing: 'ease-in-out', direction: 'alternate' };
    document.querySelectorAll('[data-anim]').forEach((el, i) => {
      if (el._anim) return; el._anim = 1;
      const b = el.style.transform || '';
      switch (el.dataset.anim) {
        case 'float': el.animate([{ transform: b + ' translateY(0)' }, { transform: b + ' translateY(-16px) rotate(-1deg)' }], { ...loop, duration: 3200 }); break;
        case 'bounce': el.animate([{ transform: 'translateY(0) rotate(-6deg)' }, { transform: 'translateY(-18px) rotate(6deg)' }], { ...loop, duration: 1400 }); break;
        case 'sway': el.animate([{ transform: 'rotate(-28deg) translateY(0)' }, { transform: 'rotate(-8deg) translateY(-12px)' }], { ...loop, duration: 4000 }); break;
        case 'wiggle': el.animate([{ transform: 'rotate(-6deg) scale(1)' }, { transform: 'rotate(6deg) scale(1.15)' }], { ...loop, duration: 900 }); break;
        case 'spin': el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { iterations: Infinity, duration: 6000 }); break;
        case 'spinslow': el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { iterations: Infinity, duration: 40000 }); break;
        case 'wobble': el.animate([{ transform: 'rotate(-14deg) scale(1)' }, { transform: 'rotate(14deg) scale(1.2)' }], { ...loop, duration: 1100 + (i % 4) * 150 }); break;
        case 'pulse': el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }], { ...loop, duration: 800 }); break;
        case 'drift': el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6vw)' }], { ...loop, duration: 9000 }); break;
        case 'wave': [...el.children].forEach((c, k) => { c.style.display = 'inline-block'; c.animate([{ transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(-16px) rotate(20deg)' }], { ...loop, duration: 700, delay: k * 120 }); }); break;
      }
    });
  }
  function marquee(h, text, bg, color, rot) {
    return h('div', { style: { position: 'relative', zIndex: 3, background: bg, overflow: 'hidden', padding: '18px 0', transform: 'rotate(' + rot + 'deg)', margin: '-14px -20px', boxShadow: '0 6px 0 rgba(0,0,0,.12)' } },
      h('div', { style: { display: 'flex', width: 'max-content', animation: 'marquee 28s linear infinite' } },
        [0, 1].map(k => h('div', { key: k, style: { display: 'flex', gap: 40, paddingRight: 40, whiteSpace: 'nowrap', fontFamily: '"M PLUS Rounded 1c", sans-serif', fontWeight: 800, fontSize: 'clamp(26px,3.2vw,48px)', color, letterSpacing: '.06em' } },
          Array.from({ length: 4 }, (_, i) => h('span', { key: i }, text))))));
  }
  window.SiteMotion = { field, setup, marquee };
})();
