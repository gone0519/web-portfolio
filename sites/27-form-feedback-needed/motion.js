(function () {
  var EASE = 'cubic-bezier(0.22,0.8,0.2,1)';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pending = false, bound = false, io = null;

  function countable(el) {
    if (el.tagName === 'A' || el.children.length) return false;
    var t = (el.textContent || '').trim();
    if (!t || t.length > 10 || !/[0-9]/.test(t)) return false;
    if (/[-:\/]/.test(t) || /^(19|20)[0-9]{2}$/.test(t)) return false;
    return /Quicksand/.test(el.style.fontFamily || '');
  }

  function countUp(el) {
    var raw = (el.textContent || '').trim();
    var m = raw.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
    if (!m) return;
    var target = parseFloat(m[2].replace(/,/g, ''));
    if (!isFinite(target)) return;
    var dec = (m[2].split('.')[1] || '').length;
    var grouped = m[2].indexOf(',') > -1;
    var t0 = performance.now(), dur = 1200;
    function tick(t) {
      var p = Math.min(1, (t - t0) / dur);
      var v = target * (1 - Math.pow(1 - p, 3));
      var num = dec ? v.toFixed(dec) : (grouped ? Math.round(v).toLocaleString('en-US') : String(Math.round(v)));
      el.textContent = m[1] + num + m[3];
      if (p < 1) requestAnimationFrame(tick); else el.textContent = raw;
    }
    requestAnimationFrame(tick);
  }

  function revealNode(t, i) {
    var kind = t.getAttribute('data-reveal') === 'slide' ? 'nm-slide' : 'nm-rise';
    t.removeAttribute('data-nm-hide');
    t.style.opacity = '';
    t.style.animation = kind + ' 0.85s ' + EASE + ' ' + (i * 80) + 'ms both';
    Array.prototype.forEach.call(t.querySelectorAll('*'), function (n) { if (countable(n)) countUp(n); });
  }

  function sweep(force) {
    var vh = window.innerHeight || 800;
    var i = 0;
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (t) {
      if (t.dataset.nmDone) return;
      var r = t.getBoundingClientRect();
      var below = r.top > vh * 0.9;
      if (force || !below) {
        t.dataset.nmDone = '1';
        revealNode(t, i++);
      } else if (!t.dataset.nmHide) {
        t.dataset.nmHide = '1';
        t.style.opacity = '0';
      }
    });
  }

  function onScroll() {
    sweep(false);
    var y = window.scrollY || 0;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var pb = document.getElementById('nm-progress');
    if (pb) pb.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    var hd = document.querySelector('header');
    var tb = hd && hd.firstElementChild;
    if (tb && tb.dataset.nmTop) {
      var past = y > 40;
      tb.style.maxHeight = past ? '0px' : '60px';
      tb.style.opacity = past ? '0' : '1';
      tb.style.paddingTop = past ? '0px' : '8px';
    }
    if (hd) hd.style.boxShadow = y > 40 ? '0 6px 20px rgba(75,64,56,0.10)' : 'none';
    if (!reduced) Array.prototype.forEach.call(document.querySelectorAll('[data-parallax]'), function (p) {
      p.style.transform = 'translateY(' + (y * 0.1).toFixed(1) + 'px)';
    });
  }

  function setup() {
    pending = false;
    if (!document.body) return;
    sweep(false);

    var hero = document.querySelector('section');
    if (hero && !hero.dataset.nmHero) {
      hero.dataset.nmHero = '1';
      var banner = hero.firstElementChild;
      if (banner && /repeating-linear-gradient/.test(banner.style.backgroundImage || '')) {
        banner.style.animation = 'nm-drift 30s linear infinite';
      }
      var kids = hero.querySelectorAll(':scope > div > div > *');
      if (!kids.length) kids = hero.querySelectorAll(':scope > div > *');
      Array.prototype.forEach.call(kids, function (k, n) {
        k.style.animation = 'nm-pop 0.9s ' + EASE + ' ' + (120 + n * 110) + 'ms both';
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll('header nav a'), function (a, n) {
      if (a.dataset.nmNav) return;
      a.dataset.nmNav = '1';
      a.style.animation = 'nm-pop 0.6s ' + EASE + ' ' + (n * 55) + 'ms both';
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-float]'), function (n, k) {
      if (n.dataset.nmFloat) return;
      n.dataset.nmFloat = '1';
      n.style.animation = 'nm-float ' + (6 + k * 1.4) + 's ease-in-out ' + (k * 0.6) + 's infinite';
    });

    if (!document.getElementById('nm-progress')) {
      var bar = document.createElement('div');
      bar.id = 'nm-progress';
      bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;width:0;background:#ee8b2e;z-index:200;transition:width 0.12s linear;pointer-events:none';
      document.body.appendChild(bar);
    }

    var header = document.querySelector('header');
    var topBar = header && header.firstElementChild;
    if (topBar && !topBar.dataset.nmTop) {
      topBar.dataset.nmTop = '1';
      topBar.style.transition = 'opacity 0.3s, max-height 0.35s ' + EASE + ', padding 0.35s';
      topBar.style.overflow = 'hidden';
      topBar.style.maxHeight = '60px';
    }

    if (!bound) { bound = true; window.addEventListener('scroll', onScroll, { passive: true }); }
    onScroll();
  }

  function schedule() {
    if (pending) return;
    pending = true;
    setTimeout(setup, 30);
  }

  document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('load', schedule);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.nmMotion = schedule;
  var tries = 0;
  var timer = setInterval(function () {
    schedule();
    if (++tries > 60) { clearInterval(timer); sweep(true); }
  }, 250);
  setTimeout(function () { sweep(false); }, 1500);
  window.addEventListener('resize', schedule);
  schedule();
})();
