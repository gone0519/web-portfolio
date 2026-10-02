export function init() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const once = (sel, fn) => document.querySelectorAll(sel).forEach(el => { if (el.__fx) return; el.__fx = 1; fn(el); });
  if (!reduce && document.body.animate) {
    once('[data-anim="zoom"]', el => el.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 16000, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'forwards' }));
    once('[data-anim="marquee"]', el => el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 45000, iterations: Infinity }));
    once('[data-anim="scroll"]', el => el.animate([{ transform: 'translateY(-24px)' }, { transform: 'translateY(40px)' }], { duration: 2000, iterations: Infinity, easing: 'ease-in-out' }));
  }
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = window.__siteIO || (window.__siteIO = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const t = e.target;
    t.style.opacity = '1'; t.style.transform = 'none'; t.style.clipPath = 'inset(0 0 0 0)';
    window.__siteIO.unobserve(t);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }));
  once('[data-reveal]', el => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    if (el.hasAttribute('data-img')) { el.style.clipPath = 'inset(0 100% 0 0)'; el.style.transition = 'clip-path 1.4s cubic-bezier(.7,0,.2,1)'; }
    else { el.style.opacity = '0'; el.style.transform = 'translateY(24px)'; el.style.transition = 'opacity .9s ease, transform .9s ease'; }
    io.observe(el);
  });
}
