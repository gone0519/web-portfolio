// Shared scroll/entrance motion engine for all pages.
const EASE = "cubic-bezier(.2,.7,.2,1)";
const VARIANTS = {
  up: "translateY(28px)",
  down: "translateY(-24px)",
  left: "translateX(-36px)",
  right: "translateX(36px)",
  zoom: "scale(.93)",
  rise: "translateY(48px) scale(.97)"
};

export function initMotion() {
  if (window.__axelMotion) { window.__axelMotion(); return; }

  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.opacity = 1;
      e.target.style.transform = "none";
      e.target.style.filter = "none";
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      runCount(e.target);
    });
  }, { threshold: 0.4 });

  function runCount(el) {
    const raw = el.dataset.countRaw;
    const m = raw.match(/^([^\d\-]*)(-?[\d.,]+)(.*)$/);
    if (!m) { el.textContent = raw; return; }
    const pre = m[1], suf = m[3];
    const target = parseFloat(m[2].replace(/,/g, ""));
    const decimals = (m[2].split(".")[1] || "").length;
    const dur = 1300, t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      const v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = pre + (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("ja-JP")) + suf;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = raw;
    };
    requestAnimationFrame(tick);
  }

  const parallax = [];

  function scan() {
    document.querySelectorAll("[data-reveal]:not([data-m])").forEach((el, i) => {
      el.dataset.m = "1";
      const v = VARIANTS[el.getAttribute("data-reveal")] || VARIANTS.up;
      el.style.opacity = 0;
      el.style.transform = v;
      el.style.transition = "opacity .9s " + EASE + ", transform .9s " + EASE + ", filter .9s " + EASE;
      el.style.transitionDelay = (el.dataset.delay || (i % 4) * 80) + "ms";
      if (el.hasAttribute("data-blur")) el.style.filter = "blur(6px)";
      revealIO.observe(el);
    });
    document.querySelectorAll("[data-count]:not([data-mc])").forEach(el => {
      el.dataset.mc = "1";
      el.dataset.countRaw = el.textContent.trim();
      countIO.observe(el);
    });
    document.querySelectorAll("[data-parallax]:not([data-mp])").forEach(el => {
      el.dataset.mp = "1";
      parallax.push(el);
    });
    onScroll();
  }

  function onScroll() {
    const y = window.scrollY || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, (y / max) * 100);
    document.querySelectorAll("[data-progress]").forEach(el => { el.style.width = pct + "%"; });
    document.querySelectorAll("[data-pagetop]").forEach(el => {
      const on = y > 420;
      el.style.opacity = on ? 1 : 0;
      el.style.transform = on ? "none" : "translateY(16px)";
      el.style.pointerEvents = on ? "auto" : "none";
    });
    parallax.forEach(el => {
      const rate = parseFloat(el.getAttribute("data-parallax")) || 0.2;
      const box = el.getBoundingClientRect();
      const mid = box.top + box.height / 2 - window.innerHeight / 2;
      el.style.transform = "translate3d(0," + (-mid * rate).toFixed(1) + "px,0)";
    });
  }

  document.addEventListener("click", e => {
    const t = e.target.closest && e.target.closest("[data-pagetop]");
    if (t) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });

  window.addEventListener("scroll", () => requestAnimationFrame(onScroll), { passive: true });
  window.addEventListener("resize", onScroll);
  window.__axelMotion = scan;
  scan();
  setTimeout(scan, 400);
  setTimeout(scan, 1400);
}
