(function () {
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var RED = 'rgb(208, 2, 27)';
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  var PILL = 'a[style*="border-radius: 999px"]';
  var ROUND = 'span[style*="border-radius: 50%"]';
  function injectCSS() {
    if (document.getElementById('site-motion-css')) return;
    var s = document.createElement('style'); s.id = 'site-motion-css';
    s.textContent =
      '@keyframes smGrid{from{background-position:0 0,0 0}to{background-position:0 80px,80px 0}}' +
      '@keyframes smPulse{0%,100%{box-shadow:0 0 0 0 rgba(208,2,27,.55)}50%{box-shadow:0 0 0 10px rgba(208,2,27,0)}}' +
      '@keyframes smFloat{0%,100%{transform:translate(0,0)}50%{transform:translate(3vw,-2vw)}}' +
      '@keyframes smKen{from{transform:scale(1.14)}to{transform:scale(1)}}' +
      '@keyframes smShine{from{transform:translateX(-120%) skewX(-20deg)}to{transform:translateX(320%) skewX(-20deg)}}' +
      '@keyframes smDrop{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}' +
      // pill buttons: shine sweep + arrow turns on hover
      PILL + ':not([style*="position: absolute"]){position:relative;overflow:hidden;isolation:isolate}' +
      PILL + '::after{content:"";position:absolute;top:0;bottom:0;left:0;width:40%;z-index:-1;pointer-events:none;' +
      'background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:translateX(-150%) skewX(-20deg)}' +
      PILL + ':hover::after{transition:transform .9s ' + EASE + ';transform:translateX(350%) skewX(-20deg)}' +
      PILL + ' ' + ROUND + '{transition:transform .45s ' + EASE + '}' +
      PILL + ':hover ' + ROUND + '{transform:rotate(-45deg)}' +
      // next-page band: arrow slides and fills
      'a[data-screen-label="Next"] ' + ROUND + '{transition:transform .5s ' + EASE + ',background .4s,color .4s}' +
      'a[data-screen-label="Next"]:hover ' + ROUND + '{transform:translateX(10px);background:#fff;color:#1c3f94}' +
      // card image zoom on hover (after the wipe-in has finished)
      'image-slot[data-sm-done]{transition:clip-path 1.3s ' + EASE + ',transform .9s ' + EASE + '!important}' +
      'article:hover image-slot[data-sm-done]{transform:scale(1.07)!important}' +
      // hero title letters
      '.sm-word{display:inline-block;white-space:nowrap}.sm-char{display:inline-block;will-change:transform}' +
      // timeline progress line
      'ol[data-sm-tl]::before{content:"";position:absolute;left:-2px;top:0;width:3px;height:100%;background:#d0021b;' +
      'transform-origin:top;transform:scaleY(var(--sm-p,0));pointer-events:none}' +
      // slots with a photo never show the dashed placeholder outline (the runtime's
      // re-render can strip image-slot's own data-filled flag, so don't rely on it)
      'image-slot[src]::part(ring){display:none}' +
      '#sm-cursor.hot{width:64px!important;height:64px!important;margin:-32px 0 0 -32px!important;background:rgba(208,2,27,.12)}';
    document.head.appendChild(s);
  }
  function progressBar() {
    if (document.getElementById('sm-progress')) return;
    var b = document.createElement('div'); b.id = 'sm-progress';
    b.style.cssText = 'position:fixed;left:0;top:0;height:3px;width:100%;background:#d0021b;transform-origin:0 50%;transform:scaleX(0);z-index:100;pointer-events:none';
    document.body.appendChild(b);
    var upd = function () { var h = document.documentElement.scrollHeight - innerHeight; b.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')'; };
    addEventListener('scroll', upd, { passive: true }); upd();
  }
  function scrollCue(hero) {
    if (!hero || hero.querySelector('[data-sm-cue]')) return;
    var c = document.createElement('div'); c.setAttribute('data-sm-cue', '');
    c.style.cssText = 'position:absolute;left:clamp(24px,8vw,160px);bottom:36px;display:flex;align-items:center;gap:14px;font:500 11px Outfit,sans-serif;letter-spacing:.2em;color:#fff;pointer-events:none;z-index:2';
    c.innerHTML = '<span style="position:relative;width:1px;height:56px;background:rgba(255,255,255,.3);overflow:hidden;display:block"><span style="position:absolute;inset:0;background:#fff;animation:smDrop 1.8s ' + EASE + ' infinite;display:block"></span></span>SCROLL';
    hero.appendChild(c);
  }

  // ── page transition curtain ─────────────────────────────────────────────
  var curtain = null;
  function makeCurtain() {
    curtain = document.createElement('div'); curtain.id = 'sm-curtain';
    curtain.style.cssText = 'position:fixed;inset:0;z-index:300;pointer-events:none;background:#0f1c48;transform:translateX(0);will-change:transform';
    curtain.innerHTML =
      '<span style="position:absolute;top:0;bottom:0;left:-36px;width:36px;background:#d0021b;transform:skewX(-10deg)"></span>' +
      '<span style="position:absolute;top:0;bottom:0;right:-36px;width:36px;background:#d0021b;transform:skewX(-10deg)"></span>' +
      '<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:700 30px/1 Outfit,sans-serif;letter-spacing:-0.02em;color:#fff;display:flex;align-items:center">Mika<i style="display:inline-block;width:7px;height:26px;background:#d0021b;transform:skewX(-20deg);margin:0 4px"></i>ge</span>';
    document.body.appendChild(curtain);
  }
  function curtainOut() {
    curtain.style.pointerEvents = 'none';
    curtain.style.transition = 'transform 1s ' + EASE;
    curtain.style.transform = 'translateX(104%)';
  }
  function curtainIn(done) {
    curtain.style.transition = 'none';
    curtain.style.transform = 'translateX(-104%)';
    curtain.style.pointerEvents = 'auto';
    void curtain.offsetWidth;
    curtain.style.transition = 'transform .6s ' + EASE;
    curtain.style.transform = 'translateX(0)';
    setTimeout(done, 620);
  }
  function onNavClick(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    var u; try { u = new URL(a.href, location.href); } catch (_) { return; }
    if (u.origin !== location.origin || u.pathname === location.pathname) return;
    if (!/\.dc\.html$/.test(u.pathname)) return;
    e.preventDefault();
    curtainIn(function () { location.href = u.href; });
  }
  if (!reduced() && document.body && !document.getElementById('sm-curtain')) {
    makeCurtain();
    setTimeout(curtainOut, 250);
    addEventListener('pageshow', function (e) { if (e.persisted) { curtain.style.transition = 'none'; curtain.style.transform = 'translateX(104%)'; curtain.style.pointerEvents = 'none'; } });
    document.addEventListener('click', onNavClick);
  }

  // ── helpers ─────────────────────────────────────────────────────────────
  // Split the hero title into per-letter spans (words kept unbreakable).
  function splitChars(h) {
    var chars = [];
    Array.prototype.slice.call(h.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement('span'); w.className = 'sm-word';
          part.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'sm-char'; s.textContent = ch; w.appendChild(s); chars.push(s); });
          frag.appendChild(w);
        });
        h.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        n.classList.add('sm-char'); chars.push(n);
      }
    });
    return chars;
  }
  // Decode-style text reveal. Mutates the existing text node so React keeps its reference.
  function scramble(node) {
    var fin = node.nodeValue, N = fin.length, t0 = performance.now(), D = Math.min(1100, 300 + N * 45);
    var C = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/_%';
    (function f(now) {
      var p = Math.min(1, (now - t0) / D), k = Math.floor(p * N), s = fin.slice(0, k);
      for (var i = k; i < N; i++) s += /[\s&]/.test(fin[i]) ? fin[i] : C[(Math.random() * C.length) | 0];
      node.nodeValue = p < 1 ? s : fin;
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }
  function dragScroll(tr) {
    if (tr.hasAttribute('data-sm-drag')) return;
    tr.setAttribute('data-sm-drag', '');
    tr.style.cursor = 'grab'; tr.style.userSelect = 'none';
    var down = false, moved = false, sx = 0, sl = 0;
    tr.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = tr.scrollLeft;
    });
    addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; tr.style.scrollSnapType = 'none'; tr.style.cursor = 'grabbing'; }
      if (moved) tr.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', function () {
      if (!down) return;
      down = false; tr.style.cursor = 'grab';
      if (moved) { tr.style.scrollSnapType = 'x mandatory'; setTimeout(function () { moved = false; }, 0); }
    });
    // a drag must not count as a click on the card / image slot underneath
    tr.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }
  function cursorFollower() {
    if (!matchMedia('(pointer: fine)').matches || document.getElementById('sm-cursor')) return;
    var c = document.createElement('div'); c.id = 'sm-cursor';
    c.style.cssText = 'position:fixed;left:0;top:0;width:36px;height:36px;margin:-18px 0 0 -18px;border:1px solid rgba(208,2,27,.9);border-radius:50%;pointer-events:none;z-index:250;opacity:0;transition:width .3s,height .3s,margin .3s,background .3s,opacity .3s';
    document.body.appendChild(c);
    var x = -100, y = -100, cx = -100, cy = -100;
    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY; c.style.opacity = '1';
      c.classList.toggle('hot', !!(e.target.closest && e.target.closest('a,button,[role="tab"]')));
    }, { passive: true });
    document.addEventListener('mouseleave', function () { c.style.opacity = '0'; });
    (function loop() {
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      c.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  window.setupSiteMotion = function () {
    injectCSS(); progressBar();
    if (!('IntersectionObserver' in window) || reduced()) return;
    var hero = document.querySelector('main > section');
    scrollCue(hero);
    var onScroll = [];

    // hero intro: ken burns + staggered reveal of hero text
    if (hero && !hero.hasAttribute('data-sm')) {
      hero.setAttribute('data-sm', '');
      var bg = hero.querySelector('image-slot');
      if (bg) {
        bg.style.animation = 'smKen 2.8s ' + EASE + ' both';
        // parallax: the photo drifts slower than the page
        var media = bg.parentElement;
        onScroll.push(function () {
          if (scrollY > innerHeight * 1.5) return;
          media.style.transform = 'translate3d(0,' + (scrollY * 0.35).toFixed(1) + 'px,0)';
        });
      }
      var lines = hero.querySelectorAll('div[style*="rotate"]');
      lines.forEach(function (l, i) {
        var base = l.style.transform; l.style.transformOrigin = 'top';
        l.style.transform = base + ' scaleY(0)'; l.style.transition = 'transform 1.4s ' + EASE + ' ' + (0.4 + i * 0.2) + 's';
        requestAnimationFrame(function () { requestAnimationFrame(function () { l.style.transform = base; }); });
      });
      var content = hero.querySelector('div[style*="padding"]:not([style*="inset"])');
      var kids = content ? Array.prototype.slice.call(content.children) : [];
      kids.forEach(function (el, i) {
        el.setAttribute('data-rv', '');
        var isH = el.tagName === 'H1';
        var delay = 0.25 + i * 0.14;
        el.style.opacity = '0';
        el.style.transform = isH ? 'none' : 'translateY(28px)';
        el.style.transition = 'opacity 1.1s ' + EASE + ' ' + delay + 's, transform 1.3s ' + EASE + ' ' + delay + 's';
        if (isH) {
          // letters rise one by one
          splitChars(el).forEach(function (c, j) {
            c.style.opacity = '0';
            c.style.transform = 'translateY(80%) rotate(6deg)';
            c.style.transition = 'transform 1s ' + EASE + ' ' + (delay + j * 0.035) + 's, opacity .6s ease ' + (delay + j * 0.035) + 's';
            requestAnimationFrame(function () { requestAnimationFrame(function () { c.style.opacity = '1'; c.style.transform = 'none'; }); });
          });
        }
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'none'; }); });
      });
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        var kind = el.getAttribute('data-sm-kind');
        if (kind === 'count') {
          var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), t0 = performance.now();
          (function step(now) {
            var p = Math.min(1, (now - t0) / 1800);
            el.textContent = (target * (1 - Math.pow(1 - p, 4))).toFixed(dec);
            if (p < 1) requestAnimationFrame(step);
          })(t0);
        } else if (kind === 'scramble') {
          scramble(el.firstChild);
        } else if (kind === 'slash') {
          // grow back only — never touch opacity (header nav hides inactive slashes with it)
          el.style.transform = el.dataset.baseT;
        } else {
          if (kind === 'img') {
            var slot = el.querySelector('image-slot');
            if (slot) {
              slot.style.clipPath = 'inset(0 0 0 0)'; slot.style.transform = 'scale(1)';
              setTimeout(function () { slot.setAttribute('data-sm-done', ''); }, 1900);
            }
            var sh = el.querySelector('[data-sm-shine]');
            if (sh) sh.style.animation = 'smShine 1.2s ' + EASE + ' .5s both';
            // an image wrapper can itself be a reveal/card element — fade it in too
            if (el.dataset.baseT === undefined) return;
          }
          revealEl(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    function revealEl(el) {
      el.style.opacity = '1'; el.style.transform = el.dataset.baseT || '';
      if (el.dataset.smClip) el.style.clipPath = 'inset(0 0 -20% 0)';
      // hand the element's own hover transition back once the reveal is over
      if (el.dataset.origTr !== undefined) {
        setTimeout(function () { el.style.transition = el.dataset.origTr; }, 1500 + (parseFloat(el.dataset.smDelay) || 0) * 1000);
      }
    }
    // Clip-hidden headings have zero visible area, so the observer never sees
    // them — watch their parent instead and reveal the heading from there.
    var parentIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        parentIO.unobserve(e.target);
        (e.target._smBig || []).forEach(revealEl);
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    // fade/slide-up with sibling stagger (sections + card grids)
    document.querySelectorAll('[data-reveal]:not([data-rv]), [data-card]:not([data-rv])').forEach(function (el) {
      el.setAttribute('data-rv', '');
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute('data-reveal') || c.hasAttribute('data-card'); });
      var idx = Math.min(sibs.indexOf(el), 6);
      var big = parseFloat(getComputedStyle(el).fontSize) > 60 || el.tagName === 'H2';
      el.dataset.baseT = el.style.transform || '';
      el.dataset.origTr = el.style.transition || '';
      el.dataset.smDelay = String(idx * 0.12);
      el.style.opacity = '0';
      el.style.transform = el.dataset.baseT + ' translateY(' + (big ? 60 : 40) + 'px)';
      if (big) { el.dataset.smClip = '1'; el.style.clipPath = 'inset(0 0 100% 0)'; }
      var d = (idx * 0.12) + 's';
      el.style.transition = 'opacity 1.1s ' + EASE + ' ' + d + ', transform 1.2s ' + EASE + ' ' + d + ', clip-path 1.2s ' + EASE + ' ' + d;
      if (big) {
        var par = el.parentElement;
        (par._smBig = par._smBig || []).push(el);
        parentIO.observe(par);
      } else io.observe(el);
    });

    // counters
    document.querySelectorAll('[data-count]:not([data-sm-kind])').forEach(function (el) { el.setAttribute('data-sm-kind', 'count'); io.observe(el); });

    // image wipe reveal (skip hero)
    document.querySelectorAll('image-slot:not([data-sm-img])').forEach(function (el) {
      if (hero && hero.contains(el)) return;
      el.setAttribute('data-sm-img', '');
      el.style.clipPath = 'inset(0 100% 0 0)'; el.style.transform = 'scale(1.12)';
      el.style.transition = 'clip-path 1.3s ' + EASE + ', transform 1.8s ' + EASE;
      var p = el.parentNode;
      if (getComputedStyle(p).position === 'static') p.style.position = 'relative';
      p.style.overflow = 'hidden';
      var sh = document.createElement('span'); sh.setAttribute('data-sm-shine', '');
      sh.style.cssText = 'position:absolute;top:0;bottom:0;left:0;width:30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);pointer-events:none;transform:translateX(-120%);z-index:1';
      p.appendChild(sh);
      p.setAttribute('data-sm-kind', 'img');
      io.observe(p);
    });

    // red slash accents: grow in
    document.querySelectorAll('span, div').forEach(function (el) {
      if (el.hasAttribute('data-sm-slash')) return;
      var st = el.style;
      if (st.background !== RED && st.backgroundColor !== RED) return;
      if (!/skewX/.test(st.transform) || parseFloat(st.height) > 40) return;
      el.setAttribute('data-sm-slash', ''); el.setAttribute('data-rv', ''); el.setAttribute('data-sm-kind', 'slash');
      el.dataset.baseT = st.transform; st.transform = el.dataset.baseT + ' scaleY(0)';
      st.transformOrigin = 'bottom'; st.transition = 'transform .7s ' + EASE + ' .25s';
      io.observe(el);
    });

    // English eyebrow labels next to a slash accent: decode-style reveal
    document.querySelectorAll('span').forEach(function (sp) {
      if (sp.hasAttribute('data-sm-kind') || sp.children.length || sp.classList.contains('sc-interp') || sp.closest('header')) return;
      var prev = sp.previousElementSibling;
      if (!prev || prev.tagName !== 'SPAN' || !/skewX/.test(prev.style.transform)) return;
      var t = sp.firstChild;
      if (!t || t.nodeType !== 3 || !/^[A-Za-z0-9 &'.,\/-]{3,40}$/.test(t.nodeValue.trim())) return;
      if (hero && hero.contains(sp)) return;
      sp.setAttribute('data-sm-kind', 'scramble');
      io.observe(sp);
    });

    // red wedges: slide in
    document.querySelectorAll('div[aria-hidden="true"]').forEach(function (el) {
      if (el.hasAttribute('data-rv')) return;
      var st = el.style;
      if (st.background !== RED && st.background !== 'rgb(176, 0, 26)') return;
      el.setAttribute('data-rv', '');
      el.dataset.baseT = st.transform || '';
      st.transform = /right/.test(st.cssText) && !/left/.test(st.cssText) ? 'translateX(100%)' : 'translateX(-100%)';
      st.transition = 'transform 1.4s ' + EASE;
      io.observe(el);
    });

    // blueprint grid drift, timeline pulses, glow float
    document.querySelectorAll('div[style*="background-size: 80px 80px"]').forEach(function (el) { el.style.animation = 'smGrid 6s linear infinite'; });
    document.querySelectorAll('li > span[style*="rotate(45deg)"]').forEach(function (el, i) { el.style.animation = 'smPulse 2.4s ease-in-out ' + (i * 0.3) + 's infinite'; });
    document.querySelectorAll('div[aria-hidden="true"][style*="border-radius: 50%"]').forEach(function (el) { el.style.animation = 'smFloat 14s ease-in-out infinite'; });

    // timeline: red line fills as you scroll through it
    document.querySelectorAll('ol[style*="border-left"]:not([data-sm-tl])').forEach(function (ol) {
      ol.setAttribute('data-sm-tl', '');
      ol.style.position = 'relative';
      onScroll.push(function () {
        var r = ol.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (innerHeight * 0.65 - r.top) / r.height));
        ol.style.setProperty('--sm-p', p.toFixed(3));
      });
    });

    // horizontal card tracks: mouse drag to scroll
    document.querySelectorAll('div[style*="scroll-snap-type"]').forEach(dragScroll);

    cursorFollower();

    // parallax on giant display type
    document.querySelectorAll('div[aria-hidden="true"]').forEach(function (el) {
      if (el.hasAttribute('data-sm-par')) return;
      var cs = getComputedStyle(el);
      if (parseFloat(cs.fontSize) < 80) return;
      el.setAttribute('data-sm-par', '');
      var abs = cs.position === 'absolute';
      onScroll.push(function () {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        var t = (innerHeight - r.top) / (innerHeight + r.height);
        el.style.transform = abs ? 'translateY(' + ((t - 0.5) * -120).toFixed(1) + 'px)' : 'translateX(' + ((0.5 - t) * 16).toFixed(2) + '%)';
      });
    });

    if (onScroll.length) {
      var ticking = false;
      var run = function () { ticking = false; onScroll.forEach(function (f) { f(); }); };
      addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
      run();
    }
  };

  // re-animate filtered card grids
  window.siteCardsIn = function () {
    if (reduced()) return;
    requestAnimationFrame(function () {
      document.querySelectorAll('[data-card]').forEach(function (el, i) {
        var orig = el.dataset.origTr || '';
        el.style.transition = 'none'; el.style.opacity = '0'; el.style.transform = 'translateY(30px)';
        requestAnimationFrame(function () {
          el.style.transition = 'opacity .7s ' + EASE + ' ' + (i * 0.06) + 's, transform .7s ' + EASE + ' ' + (i * 0.06) + 's';
          el.style.opacity = '1'; el.style.transform = '';
          setTimeout(function () { el.style.transition = orig; }, 800 + i * 60);
        });
      });
    });
  };
})();
