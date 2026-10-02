/* ============================================================
   sowa — 共通スクリプト
   全ページ共通。ヘッダー／メニュー／フッターの生成、DATA の差し込み、
   スクロール演出をまとめて担当します。
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var PAGE = document.body.getAttribute('data-page') || 'top';
  var co = DATA.company || {};

  /* ==========================================================
     1. 共通パーツの生成（グレイン・罫線・進捗・縦インデックス）
     ========================================================== */
  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  document.body.insertBefore(el('<div class="grain"></div>'), document.body.firstChild);
  document.body.insertBefore(el('<div class="gridlines"><i></i><i></i><i></i></div>'), document.body.firstChild);
  document.body.insertBefore(el('<div class="progress" id="progress"></div>'), document.body.firstChild);
  document.body.insertBefore(el(
    '<aside class="vindex"><span class="vline"></span><span class="vlabel" id="vlabel"></span><span class="vline"></span></aside>'
  ), document.body.firstChild);

  /* ---------- ヘッダー ---------- */
  var navHtml = DATA.nav.filter(function (n) { return n.page !== 'top'; }).map(function (n) {
    return '<a href="' + n.href + '"' + (n.page === PAGE ? ' class="on"' : '') + '>' +
             '<span class="lbl">' + n.en + '</span><span class="bar"></span>' +
           '</a>';
  }).join('');

  var header = el(
    '<header class="hdr" id="siteHeader">' +
      '<a href="index.html" class="logo">' +
        '<span class="mark">sowa</span>' +
        '<span class="sub">Digital ✕ Marketing</span>' +
      '</a>' +
      '<nav>' + navHtml + '</nav>' +
    '</header>'
  );
  document.body.insertBefore(header, document.body.firstChild);

  /* ---------- ハンバーガー ＆ オーバーレイメニュー ---------- */
  var burger = el('<button class="burger" id="menuBtn" aria-label="メニュー"><span></span><span></span><span></span></button>');
  document.body.appendChild(burger);

  var ovHtml = DATA.nav.map(function (n) {
    return '<a href="' + n.href + '"' + (n.page === PAGE ? ' class="on"' : '') + '>' +
             '<span class="en">' + n.en + '</span><span class="jp">' + n.jp + '</span>' +
           '</a>';
  }).join('');
  var overlay = el('<div class="overlay" id="menuOverlay">' + ovHtml + '<span class="ov-tel">' + (co.tel || '') + '</span></div>');
  document.body.appendChild(overlay);

  /* ---------- ページ間ナビ（下層ページの末尾） ---------- */
  var pn = $('[data-pagenav]');
  if (pn) {
    pn.className = 'pagenav';
    pn.innerHTML = DATA.nav.filter(function (n) {
      return n.page !== PAGE && n.page !== 'top';
    }).map(function (n) {
      return '<a href="' + n.href + '"><span class="en">' + n.en + '</span><span class="jp">' + n.jp + '</span></a>';
    }).join('');
  }

  /* ---------- フッター ---------- */
  var ftrNav = DATA.nav.map(function (n) { return '<a href="' + n.href + '">' + n.en + '</a>'; }).join('');
  var footer = el(
    '<footer class="ftr">' +
      '<div class="ftr-top">' +
        '<div class="ftr-lock">' +
          '<span class="i">Since</span><span class="m">sowa</span>' +
          '<span class="y">' + ((DATA.hero || {}).since || '') + '</span>' +
        '</div>' +
        '<span class="ftr-sub">Digital ✕ Marketing</span>' +
      '</div>' +
      '<dl class="ftr-info">' +
        '<div><dt>Address</dt><dd>' + (co.address || '') + '</dd></div>' +
        '<div><dt>Phone</dt><dd>' + (co.tel || '') + '</dd></div>' +
        '<div><dt>Open - Close</dt><dd>' + (co.hours || '') + '</dd></div>' +
        '<div><dt>Holiday</dt><dd>' + (co.holiday || '') + '</dd></div>' +
      '</dl>' +
      '<nav class="ftr-nav">' + ftrNav + '</nav>' +
      '<p class="ftr-cr">© sowa inc. デジタルマーケティングエージェンシー</p>' +
    '</footer>'
  );
  document.body.appendChild(footer);

  /* ==========================================================
     2. テンプレート展開（{{ x.field }} を DATA で置換）
     ========================================================== */
  function subst(str, item) {
    return str.replace(/\{\{\s*[\w$]+\.([\w$]+)\s*\}\}/g, function (_, key) {
      var v = item[key];
      return (v === undefined || v === null) ? '' : String(v);
    });
  }
  function fillNodes(root, item) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        if (n.nodeValue.indexOf('{{') !== -1) n.nodeValue = subst(n.nodeValue, item);
      } else {
        Array.prototype.slice.call(n.attributes).forEach(function (a) {
          if (a.value.indexOf('{{') !== -1) n.setAttribute(a.name, subst(a.value, item));
        });
      }
    });
  }
  $$('template[data-tpl]').forEach(function (tpl) {
    var items = DATA[tpl.getAttribute('data-tpl')] || [];
    var limit = parseInt(tpl.getAttribute('data-limit'), 10);
    if (limit > 0) items = items.slice(0, limit);
    var frag = document.createDocumentFragment();
    items.forEach(function (item, i) {
      var clone = tpl.content.cloneNode(true);
      fillNodes(clone, item);
      $$('[data-index]', clone).forEach(function (e) { e.textContent = ('0' + (i + 1)).slice(-2); });
      $$('[data-list]', clone).forEach(function (e) {
        var arr = item[e.getAttribute('data-list')] || [];
        e.innerHTML = arr.map(function (t) { return '<span>' + t + '</span>'; }).join('');
      });
      frag.appendChild(clone);
    });
    tpl.parentNode.insertBefore(frag, tpl);
  });

  /* ==========================================================
     3. テキスト・会社情報の差し込み
     ========================================================== */
  var hero = DATA.hero || {}, cpt = DATA.concept || {};
  $$('[data-tel]').forEach(function (e) { e.textContent = co.tel || ''; });
  $$('[data-email]').forEach(function (e) { e.textContent = co.email || ''; });
  $$('[data-address]').forEach(function (e) { e.textContent = co.address || ''; });
  $$('[data-hours]').forEach(function (e) { e.textContent = co.hours || ''; });
  $$('[data-holiday]').forEach(function (e) { e.textContent = co.holiday || ''; });
  $$('[data-hero-year]').forEach(function (e) { e.textContent = hero.since || ''; });
  $$('[data-hero-vertical]').forEach(function (e) { e.textContent = hero.vertical || ''; });
  $$('[data-tel-href]').forEach(function (e) { e.setAttribute('href', 'tel:' + String(co.tel || '').replace(/[^0-9+]/g, '')); });
  $$('[data-mail-href]').forEach(function (e) { e.setAttribute('href', 'mailto:' + (co.email || '')); });
  $$('[data-tel-btn]').forEach(function (e) {
    e.innerHTML = (co.tel || '') + ' <span class="tip">→</span>';
    e.setAttribute('href', 'tel:' + String(co.tel || '').replace(/[^0-9+]/g, ''));
  });

  var ch = $('[data-concept-heading]');
  if (ch) ch.innerHTML = cpt.heading || '';
  var cb = $('[data-concept-body]');
  if (cb) {
    cb.innerHTML = [cpt.lead].concat(cpt.paragraphs || []).filter(Boolean)
      .map(function (t) { return '<p>' + t + '</p>'; }).join('');
  }

  /* ---------- 下層ページの見出し ---------- */
  var pinfo = (DATA.pages || {})[PAGE];
  if (pinfo) {
    $$('[data-page-en]').forEach(function (e) { e.textContent = pinfo.en; });
    $$('[data-page-jp]').forEach(function (e) { e.textContent = pinfo.jp; });
    $$('[data-page-lead]').forEach(function (e) { e.textContent = pinfo.lead; });
  }

  /* ---------- 会社概要・アクセスの表 ---------- */
  var prof = $('[data-profile]');
  if (prof) {
    prof.className = 'profile';
    prof.innerHTML = (DATA.profile || []).map(function (r) {
      return '<div class="row"><dt>' + r.k + '</dt><dd>' + r.v + '</dd></div>';
    }).join('');
  }
  var acc = $('[data-access]');
  if (acc) {
    acc.className = 'access-list';
    acc.innerHTML = (DATA.access || []).map(function (r) {
      return '<div class="row"><dt>' + r.k + '</dt><dd>' + r.v + '</dd></div>';
    }).join('');
  }

  /* ==========================================================
     4. 写真スロット（img があれば実写、なければ抽象アート）
        pos は切り抜き位置。'center 30%' と書くと上寄りで切り抜かれる
     ========================================================== */
  var VARIANTS = ['v1', 'v2', 'v3', 'v4', 'v5'];
  function paint(node, caption, img, pos) {
    var layer = $('.layer', node);
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'layer';
      node.insertBefore(layer, node.firstChild);
    }
    if (img) {
      node.classList.add('has-img');
      layer.style.backgroundImage = 'url("' + img + '")';
      if (pos) layer.style.backgroundPosition = pos;
    }
    var cap = $('.cap', node);
    if (!cap) {
      cap = document.createElement('span');
      cap.className = 'cap';
      node.appendChild(cap);
    }
    cap.textContent = 'PHOTO ／ ' + (caption || '');
  }
  var photos = DATA.photos || {};
  $$('[data-photo]').forEach(function (node) {
    var p = photos[node.getAttribute('data-photo')] || {};
    paint(node, p.caption, p.img, p.pos);
  });
  $$('[data-photo-caption]').forEach(function (node) {
    var p = photos[node.getAttribute('data-photo-caption')] || {};
    if (p.img) node.remove(); else node.textContent = 'PHOTO ／ ' + (p.caption || '');
  });
  $$('[data-caption]').forEach(function (node, i) {
    if (!VARIANTS.some(function (v) { return node.classList.contains(v); })) {
      node.classList.add(VARIANTS[i % VARIANTS.length]);
    }
    paint(node, node.getAttribute('data-caption'), node.getAttribute('data-img'), node.getAttribute('data-pos'));
  });

  /* ==========================================================
     5. マーキー（services から自動生成）
     ========================================================== */
  var mq = $('#marquee');
  if (mq) {
    var html = (DATA.services || []).map(function (s) {
      return '<span class="w">' + s.en + '</span><span class="dot"></span>';
    }).join('');
    mq.innerHTML = '<div class="track">' + html + '</div><div class="track" aria-hidden="true">' + html + '</div>';
  }

  /* ==========================================================
     6. 見出しの1文字ずつ出現
     ========================================================== */
  $$('.split').forEach(function (node) {
    var text = node.textContent;
    node.textContent = '';
    text.split('').forEach(function (c, i) {
      var s = document.createElement('span');
      s.textContent = (c === ' ') ? ' ' : c;
      s.style.transitionDelay = (0.04 * i + 0.1) + 's';
      node.appendChild(s);
    });
  });

  /* ==========================================================
     7. メニュー開閉
     ========================================================== */
  var ovLinks = $$('a', overlay);
  ovLinks.forEach(function (a, i) { a.style.transitionDelay = (0.06 * i + 0.12) + 's'; });
  function closeMenu() {
    overlay.classList.remove('on');
    burger.classList.remove('on');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', function () {
    var on = overlay.classList.toggle('on');
    burger.classList.toggle('on', on);
    document.body.style.overflow = on ? 'hidden' : '';
  });
  ovLinks.forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ==========================================================
     8. FAQ アコーディオン
     ========================================================== */
  var faqItems = $$('.faq-item');
  if (faqItems.length) {
    var openFaq = 0;
    var setFaq = function (idx) {
      faqItems.forEach(function (item, i) {
        var open = (i === idx);
        item.classList.toggle('open', open);
        $('.faq-btn', item).setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    };
    faqItems.forEach(function (item, i) {
      $('.faq-btn', item).addEventListener('click', function () {
        openFaq = (openFaq === i) ? -1 : i;
        setFaq(openFaq);
      });
    });
    setFaq(openFaq);
  }

  /* ==========================================================
     9. News のカテゴリ絞り込み
     ========================================================== */
  var filters = $('[data-filters]');
  if (filters) {
    var cats = ['All'].concat((DATA.news || []).map(function (n) { return n.cat; })
      .filter(function (c, i, a) { return a.indexOf(c) === i; }));
    filters.className = 'filters';
    filters.innerHTML = cats.map(function (c, i) {
      return '<button data-cat="' + c + '"' + (i === 0 ? ' class="on"' : '') + '>' + c + '</button>';
    }).join('');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      $$('button', filters).forEach(function (x) { x.classList.toggle('on', x === b); });
      var cat = b.getAttribute('data-cat');
      $$('.news-item').forEach(function (item) {
        var c = $('.c', item).textContent.trim();
        item.style.display = (cat === 'All' || c === cat) ? '' : 'none';
      });
    });
  }

  /* ==========================================================
     10. お問い合わせフォーム
     ========================================================== */
  var formHost = $('[data-form]');
  if (formHost) {
    var badge = function (req) {
      return req ? '<span class="req">必須</span>' : '<span class="opt">任意</span>';
    };
    var fields = (DATA.formFields || []).map(function (f) {
      var input;
      if (f.type === 'textarea') {
        input = '<textarea id="f-' + f.name + '" name="' + f.name + '" placeholder="' + (f.placeholder || '') + '"' + (f.required ? ' required' : '') + '></textarea>';
      } else if (f.type === 'select') {
        input = '<select id="f-' + f.name + '" name="' + f.name + '"' + (f.required ? ' required' : '') + '>' +
          '<option value="">選択してください</option>' +
          (f.options || []).map(function (o) { return '<option>' + o + '</option>'; }).join('') +
          '</select>';
      } else {
        input = '<input id="f-' + f.name + '" type="' + f.type + '" name="' + f.name + '" placeholder="' + (f.placeholder || '') + '"' + (f.required ? ' required' : '') + '>';
      }
      return '<div class="field"><label for="f-' + f.name + '">' + f.label + badge(f.required) + '</label><div>' + input + '</div></div>';
    }).join('');

    formHost.innerHTML =
      '<form class="form" novalidate>' + fields + '</form>' +
      '<div class="form-foot">' +
        '<label class="privacy"><input type="checkbox" id="agree"> 個人情報の取り扱いに同意する</label>' +
        '<button type="button" class="btn solid" id="submitBtn">Send <span class="tip">→</span></button>' +
        '<p class="note">※ ローカル表示のためデータは送信されません。<br>公開時にフォームの送信先を設定してください。</p>' +
      '</div>' +
      '<div class="sent" id="sentMsg" style="display:none"></div>';

    $('#submitBtn').addEventListener('click', function () {
      var form = $('form', formHost);
      var ok = true;
      $$('[required]', form).forEach(function (i) {
        var bad = !i.value.trim();
        i.style.borderColor = bad ? '#b4543f' : '';
        if (bad) ok = false;
      });
      if (!$('#agree').checked) ok = false;
      var msg = $('#sentMsg');
      msg.style.display = 'block';
      msg.innerHTML = ok
        ? 'お問い合わせありがとうございます。<br>2営業日以内に担当者よりご連絡いたします。<br><small>（ローカル表示のため実際には送信されていません）</small>'
        : '未入力の必須項目、または同意チェックがあります。<br>ご確認のうえ、もう一度お試しください。';
    });
  }

  /* ==========================================================
     11. スクロールで出現
     ========================================================== */
  var reveals = $$('[data-reveal]');
  reveals.forEach(function (node) {
    if (!node.hasAttribute('data-stagger')) return;
    Array.prototype.slice.call(node.children)
      .filter(function (c) { return getComputedStyle(c).position !== 'absolute'; })
      .forEach(function (c, i) {
        c.setAttribute('data-stagger-child', '');
        c.style.transition = 'opacity .9s var(--ease) ' + (0.12 + i * 0.13) + 's, transform .9s var(--ease) ' + (0.12 + i * 0.13) + 's';
      });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      if ($('[data-count]', e.target)) runCount();
      io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(function (node) { io.observe(node); });

  /* ==========================================================
     12. Numbers のカウントアップ
     ========================================================== */
  var counting = false;
  function runCount() {
    if (counting) return;
    counting = true;
    var spans = $$('[data-count]');
    var t0 = performance.now(), dur = 1700;
    (function tick(now) {
      var p = Math.min(1, ((now || performance.now()) - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      spans.forEach(function (s) {
        var n = parseFloat(s.getAttribute('data-count')) || 0;
        s.textContent = (s.getAttribute('data-prefix') || '') + Math.round(n * e) + (s.getAttribute('data-suffix') || '');
      });
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  /* ==========================================================
     13. ヘッダー表示・パララックス・進捗・現在地
     ========================================================== */
  var bar = $('#progress'), vlabel = $('#vlabel'), parallax = $('#parallax');
  var spy = $$('[data-label]');
  var raf = null, active = null;
  var alwaysHeader = (PAGE !== 'top');

  if (alwaysHeader) header.classList.add('show');
  if (vlabel) vlabel.textContent = spy.length ? spy[0].getAttribute('data-label') : ((pinfo && pinfo.en) || 'Top');

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      var y = window.scrollY || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      if (parallax) parallax.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
      if (!alwaysHeader) header.classList.toggle('show', y > window.innerHeight * 0.72);

      if (spy.length && vlabel) {
        var cur = spy[0];
        spy.forEach(function (s) { if (s.getBoundingClientRect().top <= 150) cur = s; });
        if (cur !== active) {
          active = cur;
          vlabel.textContent = cur.getAttribute('data-label');
        }
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
