(function () {
  if (window.__mo) return; window.__mo = true;
  var css = "\
[data-mo]{transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform .9s cubic-bezier(.2,.7,.2,1),clip-path 1.3s cubic-bezier(.7,0,.2,1),filter .9s ease;transition-delay:var(--d,0ms)}\
[data-mo=up]:not([data-in]){opacity:0;transform:translateY(28px)}\
[data-mo=hero]:not([data-in]){opacity:0;transform:translateY(40px);filter:blur(10px)}\
[data-mo=wipe]{clip-path:inset(0 0 0 0)}[data-mo=wipe]:not([data-in]){clip-path:inset(0 0 100% 0)}\
[data-mo=draw]{clip-path:inset(0 0 0 0)}[data-mo=draw]:not([data-in]){clip-path:inset(0 0 100% 100%)}\
[data-mo=line]{transform-origin:center}[data-mo=line]:not([data-in]){transform:scaleX(0)}\
[data-mo=pop]:not([data-in]){opacity:0;transform:scale(.4) rotate(-45deg)}\
[data-mo-tw]{animation:mo-tw var(--tw,3.4s) ease-in-out infinite;animation-delay:var(--twd,0s);transform-origin:center}\
@keyframes mo-tw{0%,100%{opacity:1;transform:scale(1) rotate(0)}50%{opacity:.35;transform:scale(.62) rotate(22deg)}}\
[data-mo-spin]{animation:mo-spin var(--sp,40s) linear infinite}\
@keyframes mo-spin{to{transform:rotate(360deg)}}\
[data-mo-float]{animation:mo-float 6.5s ease-in-out infinite}\
@keyframes mo-float{50%{transform:translateY(-7px) rotate(-8deg)}}\
[data-mo-par]{transform:translate3d(0,var(--par,0px),0)}\
header{transition:box-shadow .4s ease}header[data-scrolled]{box-shadow:0 10px 28px -18px rgba(31,44,79,.45)}\
@media (prefers-reduced-motion:reduce){[data-mo]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important;transition:none!important}[data-mo-tw],[data-mo-spin],[data-mo-float]{animation:none!important}[data-mo-par]{transform:none!important}}";
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  var counts = new WeakMap();
  function mark(el, kind) {
    if (el.hasAttribute('data-mo')) return;
    var p = el.parentElement, n = counts.get(p) || 0; counts.set(p, n + 1);
    el.style.setProperty('--d', Math.min(n, 6) * 90 + 'ms');
    el.setAttribute('data-mo', kind); io.observe(el);
  }
  var UP = 'main h1, main h2, main h3, main blockquote, main article, main figure, main li, main dl > div, main form, main p, main nav, main a, main [role="status"], footer h2, footer nav, footer address, footer section a';
  function scan() {
    document.querySelectorAll('[role="img"]').forEach(function (el) { if (!el.closest('header')) mark(el, 'wipe'); });
    document.querySelectorAll(UP).forEach(function (el) {
      if (el.hasAttribute('data-mo') || el.closest('header,[aria-hidden="true"]')) return;
      if (el.parentElement && el.parentElement.closest('[data-mo="up"],[data-mo="hero"]')) return;
      mark(el, el.tagName === 'H1' ? 'hero' : 'up');
    });
    document.querySelectorAll('[aria-hidden="true"]').forEach(function (el) {
      if (el.hasAttribute('data-mo-seen')) return; el.setAttribute('data-mo-seen', '');
      var s = el.style;
      if (s.position === 'absolute' && s.borderTopStyle && s.borderRightStyle && !s.borderRadius) mark(el, 'draw');
    });
    document.querySelectorAll('span').forEach(function (el) {
      if (el.hasAttribute('data-mo-seen')) return; el.setAttribute('data-mo-seen', '');
      var s = el.style;
      if (s.flex && s.flex.indexOf('1') === 0 && (s.borderTopStyle === 'dotted' || (s.height === '1px' && s.background.indexOf('gradient') > -1))) mark(el, 'line');
      if (s.borderRadius === '50%' && s.borderStyle === 'dotted') el.setAttribute('data-mo-spin', '');
    });
    document.querySelectorAll('div').forEach(function (el) {
      if (el.hasAttribute('data-mo-cr')) return;
      var s = el.style;
      if (s.borderRadius === '50%' && s.boxShadow.indexOf('inset') > -1) { el.setAttribute('data-mo-cr', ''); el.setAttribute('data-mo-float', ''); el.style.animationDelay = (-Math.random() * 6).toFixed(2) + 's'; }
    });
    document.querySelectorAll('svg').forEach(function (svg) {
      if (svg.hasAttribute('data-mo-tw')) return;
      var p = svg.querySelector('path'); if (!p || (p.getAttribute('d') || '').indexOf('M12 0C12.9') !== 0) return;
      svg.setAttribute('data-mo-tw', '');
      svg.style.setProperty('--tw', (2.6 + Math.random() * 2.4).toFixed(2) + 's');
      svg.style.setProperty('--twd', (-Math.random() * 4).toFixed(2) + 's');
    });
    var hero = document.getElementById('top');
    if (hero) hero.querySelectorAll('[role="img"]').forEach(function (el, i) { if (!el.hasAttribute('data-mo-par')) { el.setAttribute('data-mo-par', i === 0 ? '0.06' : '-0.05'); } });
  }
  var pend = false;
  function schedule() { if (pend) return; pend = true; requestAnimationFrame(function () { pend = false; scan(); }); }
  function onScroll() {
    var y = window.scrollY, h = document.querySelector('header');
    if (h) { if (y > 8) h.setAttribute('data-scrolled', ''); else h.removeAttribute('data-scrolled'); }
    if (y < 1200) document.querySelectorAll('[data-mo-par]').forEach(function (el) { el.style.setProperty('--par', (y * parseFloat(el.getAttribute('data-mo-par'))).toFixed(1) + 'px'); });
  }
  function start() {
    scan();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
