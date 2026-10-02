/* 鉄板焼 燈 — shared motion engine (page curtain, reveals, scrub, parallax, tilt, magnet, cursor) */
(function () {
  if (window.AkariMotion) return;
  var d = document, W = window;
  var E = 'cubic-bezier(.77,0,.18,1)', E2 = 'cubic-bezier(.19,1,.22,1)';
  var reduce = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = W.matchMedia('(pointer: fine)').matches;
  var started = false, ready = false, io = null, pending = [], mt = null;
  var curtain, black, gold, word, cur = null;
  var par = [], scrubs = [], tilts = [], magnets = [];
  var mouse = { x: -200, y: -200, nx: .5, ny: .5 };
  var LATIN = /[A-Za-z0-9'’&\-]/, OPEN = /[「『（(〈《【“]/, STOP = /[、。，．！？!?]/,
    CLOSE = /[、。，．・：；！？!?,.:;」』）)〉》】”ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ々〜…]/;

  function css(n, o) { for (var k in o) n.style[k] = o[k]; return n; }
  function el(tag, o, parent) { var n = d.createElement(tag); css(n, o || {}); (parent || d.body).appendChild(n); return n; }

  function buildCurtain() {
    curtain = el('div', { position: 'fixed', inset: '0', zIndex: '300', pointerEvents: 'none', overflow: 'hidden' });
    curtain.setAttribute('aria-hidden', 'true');
    gold = el('div', { position: 'absolute', inset: '0', background: '#b89a5e' }, curtain);
    black = el('div', { position: 'absolute', inset: '0', background: '#0f0c0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }, curtain);
    word = el('span', { fontFamily: "'Shippori Mincho',serif", color: '#e4dccf', fontSize: 'clamp(22px,3vw,34px)', letterSpacing: '.5em', paddingLeft: '.5em', opacity: '0', transition: 'opacity .5s' }, black);
    word.textContent = '鉄板焼 燈';
  }
  function curtainIn(done) {
    [gold, black].forEach(function (p) { p.style.transition = 'none'; p.style.transform = 'translateX(-100%)'; });
    curtain.style.pointerEvents = 'auto'; word.style.opacity = '0';
    void curtain.offsetWidth;
    gold.style.transition = 'transform .75s ' + E; black.style.transition = 'transform .75s ' + E + ' .1s';
    gold.style.transform = 'translateX(0)'; black.style.transform = 'translateX(0)';
    setTimeout(function () { word.style.opacity = '1'; }, 650);
    setTimeout(done, 950);
  }
  function curtainOut(delay) {
    [gold, black].forEach(function (p) { p.style.transition = 'none'; p.style.transform = 'translateX(0)'; });
    word.style.opacity = '1';
    void curtain.offsetWidth;
    setTimeout(function () {
      word.style.opacity = '0';
      black.style.transition = 'transform 1s ' + E; gold.style.transition = 'transform 1s ' + E + ' .12s';
      black.style.transform = 'translateX(100%)'; gold.style.transform = 'translateX(100%)';
      curtain.style.pointerEvents = 'none';
    }, delay);
  }
  function onClick(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var h = a.getAttribute('href');
    if (!h || h.charAt(0) === '#' || a.target === '_blank' || h.indexOf('.dc.html') < 0) return;
    e.preventDefault();
    curtainIn(function () { location.href = a.href; });
  }

  function splitChars(n, wrap) {
    var i = 0, out = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = d.createDocumentFragment();
          // wrap mode: each char becomes an atomic inline-block, which drops the browser's
          // own line-breaking rules. Rebuild them: a phrase (up to 、。) stays together when it
          // fits, punctuation never starts a line, and Latin words never split.
          var clause = null, unit = null, uLat = false, glue = false;
          function box(css, parent) { var s = d.createElement('span'); s.style.cssText = css; parent.appendChild(s); return s; }
          Array.from(c.textContent).forEach(function (ch) {
            if (/\s/.test(ch)) { clause = unit = null; glue = false; f.appendChild(d.createTextNode(ch)); return; }
            var inn = d.createElement('span'); inn.textContent = ch;
            if (wrap) {
              var lat = LATIN.test(ch);
              if (!unit || !(glue || CLOSE.test(ch) || (lat && uLat))) {
                if (!clause) clause = box('display:inline-block;vertical-align:top', f);
                unit = box('display:inline-block;white-space:nowrap;vertical-align:top', clause); uLat = lat;
              }
              glue = OPEN.test(ch);
              var o = box('display:inline-block;overflow:hidden;vertical-align:top', unit);
              inn.style.cssText = 'display:inline-block;transform:translateY(110%);transition:transform 1.1s ' + E2 + ' ' + (i++ * 38) + 'ms';
              o.appendChild(inn);
              if (STOP.test(ch)) clause = unit = null;
            } else { inn.style.transition = 'color .35s ease'; f.appendChild(inn); }
            out.push(inn);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(n);
    return out;
  }

  function prep(n) {
    var k = n.getAttribute('data-m');
    n._prep = 1;
    if (k === 'title') n._chars = splitChars(n, true);
    else if (k === 'label') { n._ls = getComputedStyle(n).letterSpacing; css(n, { opacity: '0', letterSpacing: '1em', transition: 'opacity 1.2s ease, letter-spacing 1.6s ' + E2 }); }
    else if (k === 'up') css(n, { opacity: '0', transform: 'translateY(34px) skewY(2.5deg)', transformOrigin: '0 0', transition: 'opacity 1.1s ease, transform 1.3s ' + E2 });
    else if (k === 'line') { var v = n.offsetWidth <= 2 && n.offsetHeight > 2; css(n, { transform: v ? 'scaleY(0)' : 'scaleX(0)', transformOrigin: v ? '50% 0' : '0 50%', transition: 'transform 1.6s ' + E2 }); }
    else if (k === 'img') {
      if (getComputedStyle(n).position === 'static') n.style.position = 'relative';
      n.style.overflow = 'hidden';
      n._g = el('div', { position: 'absolute', inset: '0', background: '#b89a5e', zIndex: '4', transformOrigin: '100% 50%', transition: 'transform 1.1s ' + E + ' .14s', pointerEvents: 'none' }, n);
      n._b = el('div', { position: 'absolute', inset: '0', background: '#15120f', zIndex: '5', transformOrigin: '100% 50%', transition: 'transform 1.1s ' + E, pointerEvents: 'none' }, n);
      var s = n.querySelector('image-slot'); if (s) { n._s = s; css(s, { transform: 'scale(1.3)', transition: 'transform 2.4s ' + E2 }); }
    } else if (k === 'shutter') {
      var N = 7; n._bars = [];
      for (var j = 0; j < N; j++) n._bars.push(el('div', { position: 'absolute', top: '0', bottom: '0', left: (j * 100 / N) + '%', width: (100 / N + .4) + '%', background: '#0f0c0a', zIndex: '4', transformOrigin: j % 2 ? '50% 100%' : '50% 0', transition: 'transform 1.3s ' + E + ' ' + (j * 70) + 'ms', pointerEvents: 'none' }, n));
      var s2 = n.querySelector('image-slot'); if (s2) { n._s = s2; css(s2, { transform: 'scale(1.35)', transition: 'transform 3.2s ' + E2 }); }
    }
    io.observe(n);
  }
  function show(n, delay) {
    if (!n._prep || n._shown) return; n._shown = 1;
    var k = n.getAttribute('data-m'), dl = delay + 'ms';
    if (k === 'title') n._chars.forEach(function (c) { c.style.transform = 'none'; });
    else if (k === 'label') { n.style.transitionDelay = dl; n.style.opacity = '1'; n.style.letterSpacing = n._ls; }
    else if (k === 'up') { n.style.transitionDelay = dl; n.style.opacity = '1'; n.style.transform = 'none'; }
    else if (k === 'line') { n.style.transitionDelay = dl; n.style.transform = 'none'; }
    else if (k === 'img') { n._b.style.transform = 'scaleX(0)'; n._g.style.transform = 'scaleX(0)'; if (n._s) n._s.style.transform = 'scale(1)'; }
    else if (k === 'shutter') { n._bars.forEach(function (b) { b.style.transform = 'scaleY(0)'; }); if (n._s) n._s.style.transform = 'scale(1.06)'; }
  }

  function scan() {
    Array.prototype.forEach.call(d.querySelectorAll('[data-m],[data-parallax],[data-scrub],[data-tilt],[data-magnet]'), function (n) {
      if (n._am) return; n._am = 1;
      if (n.hasAttribute('data-parallax')) par.push({ n: n, f: parseFloat(n.getAttribute('data-parallax')) || .1 });
      if (n.hasAttribute('data-scrub')) { n._chars = splitChars(n, false); n._chars.forEach(function (c) { c.style.color = 'rgba(228,220,207,.16)'; }); scrubs.push(n); }
      if (n.hasAttribute('data-tilt')) tilts.push({ n: n, x: 0, y: 0 });
      if (n.hasAttribute('data-magnet') && fine) magnets.push({ n: n, x: 0, y: 0, tx: 0, ty: 0 });
      if (n.hasAttribute('data-m')) prep(n);
    });
  }

  function buildCursor() {
    cur = {
      dot: el('div', { position: 'fixed', left: '0', top: '0', width: '6px', height: '6px', margin: '-3px 0 0 -3px', borderRadius: '50%', background: '#cdb27a', zIndex: '290', pointerEvents: 'none' }),
      ring: el('div', { position: 'fixed', left: '0', top: '0', width: '40px', height: '40px', margin: '-20px 0 0 -20px', borderRadius: '50%', border: '1px solid rgba(205,178,122,.6)', zIndex: '289', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', transition: 'width .45s ' + E2 + ', height .45s ' + E2 + ', margin .45s ' + E2 + ', background .4s', fontFamily: "'Cormorant Garamond',serif", fontSize: '12px', letterSpacing: '.2em', color: '#15120f' }),
      x: -200, y: -200
    };
  }
  function setRing(size, bg, text) { var r = cur.ring; r.style.width = r.style.height = size + 'px'; r.style.margin = (-size / 2) + 'px 0 0 ' + (-size / 2) + 'px'; r.style.background = bg; r.textContent = text || ''; }
  function onOver(e) {
    var t = e.target; if (!t || !t.closest) return;
    var c = t.closest('[data-cursor]');
    if (c) setRing(92, '#b89a5e', c.getAttribute('data-cursor'));
    else if (t.closest('a,button')) setRing(64, 'rgba(184,154,94,.14)');
    else setRing(40, 'transparent');
  }
  function onMove(e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.nx = e.clientX / W.innerWidth; mouse.ny = e.clientY / W.innerHeight; }

  function loop() {
    var vh = W.innerHeight;
    par.forEach(function (p) { var r = p.n.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; p.n.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -p.f).toFixed(1) + 'px,0)'; });
    scrubs.forEach(function (n) {
      var r = n.getBoundingClientRect(), p = Math.max(0, Math.min(1, (vh * .82 - r.top) / (r.height + vh * .3))), lim = p * n._chars.length;
      n._chars.forEach(function (c, i) { var on = i < lim; if (c._on !== on) { c._on = on; c.style.color = on ? (i > lim - 4 ? '#cdb27a' : '#e4dccf') : 'rgba(228,220,207,.16)'; } else if (on && i > lim - 4) c.style.color = '#cdb27a'; else if (on && c.style.color !== 'rgb(228, 220, 207)') c.style.color = '#e4dccf'; });
    });
    tilts.forEach(function (t) { t.x += ((mouse.nx - .5) * -28 - t.x) * .06; t.y += ((mouse.ny - .5) * -18 - t.y) * .06; t.n.style.transform = 'translate3d(' + t.x.toFixed(2) + 'px,' + t.y.toFixed(2) + 'px,0)'; });
    magnets.forEach(function (m) {
      var r = m.n.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = mouse.x - cx, dy = mouse.y - cy;
      var near = Math.abs(dx) < r.width * .8 && Math.abs(dy) < r.height * 1.2;
      m.tx = near ? dx * .28 : 0; m.ty = near ? dy * .35 : 0;
      m.x += (m.tx - m.x) * .15; m.y += (m.ty - m.y) * .15;
      m.n.style.transform = 'translate3d(' + m.x.toFixed(2) + 'px,' + m.y.toFixed(2) + 'px,0)';
    });
    if (cur) {
      cur.x += (mouse.x - cur.x) * .16; cur.y += (mouse.y - cur.y) * .16;
      cur.dot.style.transform = 'translate3d(' + mouse.x + 'px,' + mouse.y + 'px,0)';
      cur.ring.style.transform = 'translate3d(' + cur.x.toFixed(1) + 'px,' + cur.y.toFixed(1) + 'px,0)';
    }
    requestAnimationFrame(loop);
  }

  function init() {
    if (started) { scan(); return; }
    started = true;
    if (reduce) return;
    buildCurtain();
    io = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) { if (!e.isIntersecting) return; io.unobserve(e.target); if (ready) show(e.target, k++ * 90); else pending.push(e.target); });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    scan();
    new MutationObserver(function () { clearTimeout(mt); mt = setTimeout(scan, 80); }).observe(d.body, { childList: true, subtree: true });
    curtainOut(450);
    setTimeout(function () { ready = true; pending.forEach(function (n, i) { show(n, i * 90); }); pending = []; }, 950);
    function safety(all) {
      var vh = W.innerHeight;
      Array.prototype.forEach.call(d.querySelectorAll('[data-m]'), function (n) {
        if (n._shown || !n._prep) return;
        if (all || n.getBoundingClientRect().top < vh) { if (io) io.unobserve(n); show(n, 0); }
      });
      if (all) { [gold, black].forEach(function (p) { p.style.transition = 'none'; p.style.transform = 'translateX(100%)'; }); curtain.style.pointerEvents = 'none'; }
    }
    setTimeout(function () { ready = true; safety(false); }, 2600);
    W.addEventListener('scroll', function () { clearTimeout(W._akSafe); W._akSafe = setTimeout(function () { safety(false); }, 1200); }, { passive: true });
    W.addEventListener('beforeprint', function () { safety(true); });
    d.addEventListener('click', onClick);
    W.addEventListener('pageshow', function (e) { if (e.persisted) curtainOut(0); });
    if (fine) { buildCursor(); W.addEventListener('mousemove', onMove, { passive: true }); d.addEventListener('mouseover', onOver); }
    requestAnimationFrame(loop);
  }
  window.AkariMotion = { init: init };
})();
