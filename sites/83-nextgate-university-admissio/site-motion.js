(function () {
  if (window.NGMotion) return;
  var ez = 'cubic-bezier(.2,.7,.2,1)';
  var io = null;
  function reduced() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function scan() {
    if (reduced() || typeof IntersectionObserver === 'undefined') return;
    if (!io) io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.style.opacity = '1'; el.style.translate = '0 0'; el.style.clipPath = 'inset(0 0 0 0)';
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.__rv) return; el.__rv = 1;
      var k = el.getAttribute('data-reveal');
      var sib = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-reveal'); });
      var d = Math.min(Math.max(sib.indexOf(el), 0), 6) * 90;
      var base = el.style.transition;
      el.style.transition = (base ? base + ',' : '') + 'opacity .9s ' + ez + ' ' + d + 'ms,translate .9s ' + ez + ' ' + d + 'ms,clip-path 1.3s cubic-bezier(.77,0,.18,1) ' + d + 'ms';
      if (k === 'mask') el.style.clipPath = 'inset(0 100% 0 0)';
      else { el.style.opacity = '0'; el.style.translate = k === 'left' ? '-44px 0' : '0 44px'; }
      io.observe(el);
    });
    document.querySelectorAll('[data-intro]').forEach(function (el) {
      if (el.__in) return; el.__in = 1;
      el.style.animation = 'ng-up 1.1s ' + ez + ' ' + (150 + (+el.getAttribute('data-intro')) * 140) + 'ms both';
    });
    document.querySelectorAll('[data-float]').forEach(function (el, i) {
      if (el.__fl) return; el.__fl = 1;
      el.style.animation = 'ng-float ' + (4 + (i % 4)) + 's ease-in-out ' + (-i * 0.7) + 's infinite alternate';
    });
    document.querySelectorAll('[data-spin]').forEach(function (el) {
      if (el.__sp) return; el.__sp = 1; el.style.animation = 'ng-rot 24s linear infinite';
    });
    onScroll();
  }
  var raf = 0;
  function onScroll() {
    if (reduced()) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var vh = window.innerHeight;
      document.querySelectorAll('[data-parallax]').forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.translate = ((r.top + r.height / 2 - vh / 2) * 0.18).toFixed(1) + 'px 0';
      });
    });
  }
  var t = 0;
  function start() {
    new MutationObserver(function () { clearTimeout(t); t = setTimeout(scan, 60); })
      .observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    scan();
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  window.NGMotion = { scan: scan };
})();
