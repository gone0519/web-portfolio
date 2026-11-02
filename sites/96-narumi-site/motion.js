(function () {
  if (window.__nwuMotion) return; window.__nwuMotion = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = `
@keyframes mFloat{0%,100%{translate:0 0;scale:1}50%{translate:0 18px;scale:1.02}}
@keyframes mDriftUp{from{translate:0 0}to{translate:0 -60px}}
@keyframes mDriftDown{from{translate:0 -60px}to{translate:0 0}}
@keyframes mBob{0%,100%{translate:0 0;rotate:0deg}50%{translate:0 -6px;rotate:-2deg}}
@keyframes mWobble{0%,80%,100%{rotate:0deg;scale:1}85%{rotate:-14deg;scale:1.12}90%{rotate:10deg}95%{rotate:-5deg}}
@keyframes mPop{0%{scale:0;rotate:-120deg}70%{scale:1.15}100%{scale:1;rotate:0deg}}
@keyframes mPulse{0%{box-shadow:0 0 0 0 rgba(255,225,0,.7)}100%{box-shadow:0 0 0 26px rgba(255,225,0,0)}}
@keyframes mTitle{from{opacity:0;letter-spacing:.45em;filter:blur(8px)}to{opacity:1;filter:blur(0)}}
@keyframes mCircleIn{from{scale:.6;opacity:0}to{scale:1;opacity:1}}
@keyframes mLine{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}50.1%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
@keyframes mArc{from{scale:1 .2}to{scale:1 1}}`;
  document.head.appendChild(css);
  if (reduce) return;

  const bar = document.createElement('div');
  bar.setAttribute('aria-hidden', 'true');
  Object.assign(bar.style, { position: 'fixed', left: 0, top: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg,#FFE100,#0A6FB8)', transformOrigin: 'left', transform: 'scaleX(0)', zIndex: 70, pointerEvents: 'none' });
  document.body.appendChild(bar);

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el);
    const k = el.dataset.mk;
    if (k === 'v') el.style.clipPath = 'inset(0 0 0 0)';
    else if (k === 'pop') el.style.animation = `mPop .7s cubic-bezier(.3,1.6,.5,1) ${el.dataset.md || 0}ms both` + (el.dataset.loop ? `, mWobble 4s ease-in-out ${1 + Math.random() * 2}s infinite` : '');
    else if (k === 'arc') el.style.animation = 'mArc 1s cubic-bezier(.2,.8,.2,1) both';
    else { el.style.opacity = 1; el.style.transform = 'none'; }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  const cs = el => getComputedStyle(el);
  const isYellow = b => b === 'rgb(255, 225, 0)';
  const stagger = el => {
    const sibs = Array.from(el.parentElement ? el.parentElement.children : []).filter(s => s.dataset.m);
    return (sibs.indexOf(el) % 8) * 90;
  };

  function scan() {
    document.querySelectorAll('main *, footer *').forEach(el => {
      if (el.dataset.m || el.closest('header,[role="dialog"]')) return;
      const s = cs(el);
      if (el.getAttribute('aria-hidden') === 'true' && el.tagName === 'DIV') {
        el.dataset.m = 'deco';
        if (s.borderRadius.includes('50%') && isYellow(s.backgroundColor) && el.offsetWidth > 300) {
          el.style.animation = 'mCircleIn 1.2s cubic-bezier(.2,.8,.2,1) both, mFloat 9s ease-in-out 1.2s infinite';
          el.dataset.par = '1';
        } else if (s.borderRadius.includes('50%') && s.backgroundColor === 'rgb(10, 111, 184)') {
          el.dataset.mk = 'arc'; el.style.transformOrigin = 'bottom'; io.observe(el);
        } else if (s.display === 'flex' && el.children[0] && cs(el.children[0]).writingMode.startsWith('vertical')) {
          Array.from(el.children).forEach((c, i) => { c.style.animation = `${i % 2 ? 'mDriftDown' : 'mDriftUp'} ${14 + (i % 3) * 4}s ease-in-out infinite alternate`; });
        } else if (s.width === '2px') {
          el.style.animation = 'mLine 2.2s ease-in-out infinite';
        }
        return;
      }
      if (el.closest('[data-m="r"],[data-m="v"]')) return;
      const tag = el.tagName;
      if ((tag === 'H1' || tag === 'H2') && s.writingMode.startsWith('vertical')) {
        el.dataset.m = 'v'; el.dataset.mk = 'v';
        el.style.clipPath = 'inset(0 0 100% 0)'; el.style.transition = 'clip-path 1.1s cubic-bezier(.7,0,.2,1)';
        io.observe(el); return;
      }
      if (tag === 'SPAN' && s.borderRadius.includes('50%') && isYellow(s.backgroundColor) && el.offsetWidth >= 36 && el.offsetWidth <= 62 && el.textContent.trim()) {
        el.dataset.m = 'pop'; el.dataset.mk = 'pop'; el.dataset.md = stagger(el);
        if (/NEW/.test(el.textContent)) el.dataset.loop = '1';
        io.observe(el); return;
      }
      if (tag === 'P' && s.fontFamily.includes('Montserrat') && parseFloat(s.fontSize) >= 36) {
        el.dataset.m = 'r'; el.style.animation = 'mTitle 1.2s cubic-bezier(.2,.8,.2,1) .2s both'; return;
      }
      if (s.borderTopWidth === '2px' && s.borderRadius === '14px' && s.position !== 'static' && tag === 'DIV') {
        el.dataset.m = 'r'; el.style.animation = `mBob 3.2s ease-in-out ${Math.random()}s infinite`; return;
      }
      if (tag === 'A' && s.borderRadius === '50%' && isYellow(s.backgroundColor)) {
        el.dataset.m = 'r'; el.style.animation = 'mPulse 1.8s ease-out infinite'; return;
      }
      if (/^(H1|H2|H3|P|ARTICLE|LI|DETAILS|FORM|TABLE|UL|OL|IMG)$/.test(tag) || (tag === 'A' && s.display === 'flex' && el.parentElement && cs(el.parentElement).display === 'grid')) {
        if (tag === 'UL' || tag === 'OL') { if (s.display !== 'grid' && s.display !== 'flex') { el.dataset.m = 'r'; } else return; }
        el.dataset.m = 'r'; el.dataset.mk = 'r';
        el.style.opacity = 0; el.style.transform = 'translateY(36px)';
        el.style.transition = `opacity .8s ease ${stagger(el)}ms, transform .9s cubic-bezier(.2,.8,.2,1) ${stagger(el)}ms, translate .3s ease, box-shadow .3s ease`;
        io.observe(el);
      }
    });
  }

  let t; const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 120); });
  const start = () => { scan(); mo.observe(document.body, { childList: true, subtree: true }); };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
  setTimeout(scan, 600); setTimeout(scan, 1500);

  document.addEventListener('pointerover', e => {
    const el = e.target.closest('a,button,article'); if (!el || el.closest('[role="dialog"]')) return;
    if (!el.dataset.hv) { el.dataset.hv = 1; el.style.transition = (el.style.transition ? el.style.transition + ', ' : '') + 'translate .25s ease, box-shadow .25s ease, scale .25s ease'; }
    if (el.tagName === 'ARTICLE') { el.style.translate = '0 -6px'; el.style.boxShadow = '0 14px 30px rgba(0,0,0,.12)'; }
    else if (cs(el).borderRadius === '50%') el.style.scale = '1.08';
    else el.style.translate = '0 -3px';
    el.addEventListener('pointerleave', function off() { el.style.translate = ''; el.style.scale = ''; if (el.tagName === 'ARTICLE') el.style.boxShadow = ''; el.removeEventListener('pointerleave', off); });
  });

  let lastY = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      const hd = document.querySelector('header');
      if (hd) { hd.style.transition = 'translate .35s ease'; hd.style.translate = y > 240 && y > lastY ? '0 -110%' : '0 0'; }
      const top = document.querySelector('a[aria-label="ページの先頭へ"]');
      if (top) { top.style.transition = 'opacity .3s, scale .3s'; top.style.opacity = y > 400 ? 1 : 0; top.style.scale = y > 400 ? '1' : '.6'; top.style.pointerEvents = y > 400 ? 'auto' : 'none'; }
      document.querySelectorAll('[data-par]').forEach(c => { c.style.marginTop = Math.min(y, 900) * 0.25 + 'px'; });
      lastY = y; ticking = false;
    });
  }, { passive: true });
  dispatchEvent(new Event('scroll'));
})();
