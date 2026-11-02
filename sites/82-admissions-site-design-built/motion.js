(function () {
  if (window.__aobanoMotion) return;
  window.__aobanoMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = 'cubic-bezier(.2,.7,.2,1)';
  const css = document.createElement('style');
  css.textContent = `
[data-mo]{opacity:0;transform:translateY(42px);transition:opacity 1s ${ease},transform 1s ${ease},clip-path 1.3s cubic-bezier(.7,0,.2,1),box-shadow .4s;transition-delay:var(--d,0s)}
[data-mo="zoom"]{transform:scale(.9)}
[data-mo="left"]{transform:translateX(-56px)}
[data-mo="right"]{transform:translateX(56px)}
[data-mo="clip"]{opacity:1;transform:none;clip-path:inset(100% 0 0 0 round 22px)}
[data-mo].mo-in{opacity:1;transform:none;clip-path:inset(0 0 0 0 round 0)}
figure[data-mo].mo-in:hover,article[data-mo].mo-in:hover,li[data-mo].mo-in:hover{transform:translateY(-6px)}
image-slot{transition:transform 1.4s ${ease}}
[data-mo-img]:hover > image-slot{transform:scale(1.06)}
[data-mo-btn]{transition:transform .35s ${ease},background .3s}
[data-mo-btn]:hover{transform:translateY(-3px)}
[data-mo-btn] > span:last-child{transition:transform .35s ${ease}}
[data-mo-btn]:hover > span:last-child{transform:translateX(6px)}
@keyframes moUp{from{opacity:0;transform:translateY(70%) rotate(3deg)}to{opacity:1;transform:none}}
@keyframes moFade{from{opacity:0}to{opacity:1}}
@keyframes moDown{from{opacity:0;transform:translateY(-24px)}to{opacity:1;transform:none}}
@keyframes moSide{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}
@keyframes moKen{from{transform:scale(1.14)}to{transform:scale(1)}}
@keyframes moPop{0%{opacity:0;transform:scale(.4) rotate(-40deg)}70%{transform:scale(1.08)}100%{opacity:1;transform:none}}
@keyframes moFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes moWave{to{background-position-x:46px}}
@keyframes moDots{to{background-position:22px 22px}}
@keyframes moLine{from{border-bottom-color:transparent;clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
#mo-progress{position:fixed;left:0;top:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#E8A6B9,#6E2A47);z-index:100;pointer-events:none}
`;
  document.head.appendChild(css);
  if (reduce) { css.textContent += '[data-mo]{opacity:1!important;transform:none!important;clip-path:none!important}'; }

  const bar = document.createElement('div');
  bar.id = 'mo-progress';
  document.body.appendChild(bar);

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('mo-in');
      io.unobserve(el);
      setTimeout(() => el.style.setProperty('--d', '0s'), 1600);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }) : null;

  const anim = (el, v) => { if (!reduce && !el.dataset.moA) { el.dataset.moA = '1'; el.style.animation = v; } };
  const heroBox = () => document.querySelector('section > div:first-child image-slot')?.parentElement;

  function tagHero() {
    const box = heroBox();
    if (!box || box.dataset.moHero) return;
    box.dataset.moHero = '1';
    const img = box.querySelector(':scope > image-slot');
    if (img) anim(img, `moKen 9s ${ease} both`);
    const h1 = box.querySelector('h1');
    if (h1) {
      const spans = h1.querySelectorAll(':scope > span');
      if (spans.length) spans.forEach((s, i) => anim(s, `moUp 1.1s ${ease} ${0.3 + i * 0.22}s both`));
      else {
        const p = h1.previousElementSibling;
        if (p) anim(p, `moUp 1.1s ${ease} .2s both`);
        anim(h1, `moUp 1.1s ${ease} .45s both`);
      }
    }
    box.querySelectorAll(':scope > div').forEach(d => {
      if (d.querySelector('svg')) anim(d, `moPop 1.2s ${ease} 1.1s both`);
      else if (d.querySelector('a')) anim(d, `moDown 1s ${ease} 1.2s both`);
    });
  }

  function tagChrome() {
    const side = document.querySelector('nav[aria-label="サイドナビゲーション"]');
    if (side) anim(side, `moSide 1s ${ease} .1s both`);
    const top = document.querySelector('button[aria-label="メニューを開く"]')?.parentElement;
    if (top) anim(top, `moDown .9s ${ease} .3s both`);
  }

  function tagContent() {
    const box = heroBox();
    const sel = 'h2,h3,p,figure,article,li,details,dl,form,blockquote,div[role="status"]';
    const counts = new Map();
    document.querySelectorAll('section, footer').forEach(sec => {
      sec.querySelectorAll(sel + ',div').forEach(el => {
        if (el.dataset.mo !== undefined || el.dataset.moSkip) return;
        if (box && box.contains(el)) return;
        if (el.closest('[aria-hidden="true"]') || el.closest('.sk-deco')) return;
        const p = el.parentElement && el.parentElement.closest('[data-mo]');
        if (p) return;
        let mode = null;
        const st = el.getAttribute('style') || '';
        if (el.tagName === 'DIV') {
          if (el.querySelector(':scope > image-slot')) {
            el.dataset.moImg = '1';
            mode = st.includes('border-radius:50%') ? 'zoom' : 'clip';
          } else return;
        } else if (/^H[23]$/.test(el.tagName)) mode = 'up';
        else if (el.tagName === 'ARTICLE') mode = (counts.get('art') || 0) % 2 ? 'right' : 'left', counts.set('art', (counts.get('art') || 0) + 1);
        else mode = 'up';
        el.dataset.mo = mode === 'up' ? '' : mode;
        const par = el.parentElement;
        const n = counts.get(par) || 0;
        counts.set(par, n + 1);
        el.style.setProperty('--d', Math.min(n * 0.09, 0.6) + 's');
        if (io) io.observe(el); else el.classList.add('mo-in');
      });
    });
    document.querySelectorAll('[data-mo-img] image-slot').forEach(s => {
      const w = s.parentElement;
      if ((w.getAttribute('style') || '').includes('border-radius:50%') && !(w.closest('figure'))) {
        anim(s, `moFloat ${5 + Math.random() * 2}s ease-in-out ${Math.random()}s infinite`);
      }
    });
    document.querySelectorAll('a, button').forEach(a => {
      if (a.dataset.moBtn) return;
      const last = a.lastElementChild;
      if ((a.getAttribute('style') || '').includes('border-radius:999px') && last && /[→↓]/.test(last.textContent)) a.dataset.moBtn = '1';
    });
    document.querySelectorAll('div[aria-hidden="true"]').forEach(d => {
      const st = d.getAttribute('style') || '';
      if (st.includes('radial-gradient(circle at 50%')) anim(d, 'moWave 3.5s linear infinite');
    });
    document.querySelectorAll('section').forEach(s => {
      if ((s.getAttribute('style') || '').includes('background-size:22px 22px')) anim(s, 'moDots 14s linear infinite');
    });
    document.querySelectorAll('[aria-hidden="true"]').forEach(d => {
      const st = d.getAttribute('style') || '';
      if (/font-size:clamp\(1[12]0px/.test(st) && !d.dataset.moPar) { d.dataset.moPar = (Math.random() > .5 ? 1 : -1) * (0.08 + Math.random() * 0.06); }
    });
  }

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      if (reduce) return;
      document.querySelectorAll('[data-mo-par]').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const k = parseFloat(el.dataset.moPar);
        el.style.transform = `translateX(${(r.top + r.height / 2 - innerHeight / 2) * k}px)`;
      });
    });
  }
  addEventListener('scroll', onScroll, { passive: true });

  const PETAL = 'M0 0 C-8 -8 -10 -18 -6 -25 C-4 -28 -2 -27 0 -23 C2 -27 4 -28 6 -25 C10 -18 8 -8 0 0Z';
  const COLORS = [['#F6C3D1', '#E8A6B9'], ['#FBD9E2', '#EDB3C3'], ['#FFFFFF', '#F1CAD4'], ['#F2B1C4', '#DB8FA6']];
  const flowerSVG = (fill, stroke, opts = {}) => {
    let s = `<svg viewBox="-34 -34 68 68" width="100%" height="100%" style="overflow:visible">`;
    for (let i = 0; i < 5; i++) s += `<path d="${PETAL}" transform="rotate(${i * 72})" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
    s += `<circle r="5" fill="#F7EBD4" stroke="${stroke}" stroke-width=".8"/>`;
    for (let i = 0; i < 5; i++) { const a = (i * 72 + 36) * Math.PI / 180; s += `<line x1="0" y1="0" x2="${Math.cos(a) * 10}" y2="${Math.sin(a) * 10}" stroke="#B4587C" stroke-width=".7"/><circle cx="${Math.cos(a) * 11}" cy="${Math.sin(a) * 11}" r="1.4" fill="#B4587C"/>`; }
    return s + '</svg>';
  };
  const petalSVG = (fill, stroke) => `<svg viewBox="-11 -29 22 30" width="100%" height="100%"><path d="${PETAL}" fill="${fill}" stroke="${stroke}" stroke-width=".8"/></svg>`;
  css.textContent += `
@keyframes skFall{0%{transform:translate3d(0,-10vh,0) rotate(0)}100%{transform:translate3d(var(--dx),110vh,0) rotate(var(--rot))}}
@keyframes skSway{0%,100%{transform:translateX(0) rotateY(0)}50%{transform:translateX(26px) rotateY(180deg)}}
@keyframes skSpin{to{transform:rotate(360deg)}}
@keyframes skBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-10px) rotate(12deg)}}
.sk-deco{position:absolute;pointer-events:none;z-index:-1}
.sk-deco > i{display:block;width:100%;height:100%;animation:skBob var(--bd,7s) ease-in-out infinite}
.sk-deco > i > svg{animation:skSpin var(--sd,40s) linear infinite}`;
  function sakuraRain() {
    if (reduce || document.getElementById('sk-rain')) return;
    const wrap = document.createElement('div');
    wrap.id = 'sk-rain';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:35;overflow:hidden';
    const n = innerWidth < 700 ? 14 : 26;
    for (let i = 0; i < n; i++) {
      const [f, s] = COLORS[i % COLORS.length];
      const sz = 10 + Math.random() * 14;
      const p = document.createElement('div');
      p.style.cssText = `position:absolute;top:0;left:${Math.random() * 100}%;width:${sz}px;height:${sz * 1.35}px;--dx:${(Math.random() * 30 - 10)}vw;--rot:${Math.random() * 720 - 360}deg;animation:skFall ${9 + Math.random() * 10}s linear ${-Math.random() * 18}s infinite;opacity:${.55 + Math.random() * .4}`;
      p.innerHTML = `<div style="width:100%;height:100%;animation:skSway ${2.5 + Math.random() * 2.5}s ease-in-out infinite">${petalSVG(f, s)}</div>`;
      wrap.appendChild(p);
    }
    document.body.appendChild(wrap);
  }
  const SPOTS = [[-3, 4], [92, 2], [88, 70], [-2, 82], [46, -2], [96, 38]];
  function sakuraDeco() {
    let idx = 0;
    document.querySelectorAll('section, footer').forEach(sec => {
      if (sec.dataset.sk) return;
      sec.dataset.sk = '1';
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      sec.style.isolation = 'isolate';
      const count = 3 + (idx % 2);
      for (let k = 0; k < count; k++) {
        const [x, y] = SPOTS[(idx + k * 2) % SPOTS.length];
        const [f, s] = COLORS[(idx + k) % COLORS.length];
        const big = k === 0;
        const sz = big ? 70 + Math.random() * 60 : 22 + Math.random() * 30;
        const d = document.createElement('div');
        d.className = 'sk-deco';
        d.setAttribute('aria-hidden', 'true');
        d.style.cssText = `left:${x + Math.random() * 3}%;top:${y + Math.random() * 6}%;width:${sz}px;height:${sz}px;opacity:${big ? .85 : .95};--bd:${5 + Math.random() * 4}s;--sd:${30 + Math.random() * 30}s`;
        d.innerHTML = `<i>${k === count - 1 && !big ? petalSVG(f, s) : flowerSVG(f, s)}</i>`;
        sec.appendChild(d);
      }
      idx++;
    });
    const box = heroBox();
    if (box && !box.dataset.sk) {
      box.dataset.sk = '1';
      [[2, 5, 120], [14, 3, 46], [5, 26, 30], [28, 7, 36], [21, 28, 22], [42, 4, 26]].forEach(([x, y, sz], i) => {
        const [f, s] = COLORS[(i + 2) % COLORS.length];
        const d = document.createElement('div');
        d.className = 'sk-deco';
        d.setAttribute('aria-hidden', 'true');
        d.style.cssText = `left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;z-index:1;--bd:${5 + i}s;--sd:${28 + i * 6}s;filter:drop-shadow(0 4px 10px rgba(110,42,71,.2))`;
        d.innerHTML = `<i>${flowerSVG(f, s)}</i>`;
        box.appendChild(d);
      });
    }
  }

  let t = 0;
  function run() { tagChrome(); tagHero(); tagContent(); sakuraDeco(); sakuraRain(); onScroll(); }
  const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(run, 120); });
  mo.observe(document.body, { childList: true, subtree: true });
  run();
  setTimeout(run, 400);
})();
