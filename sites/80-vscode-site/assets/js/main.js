/* =========================================================
   光葉女子大学 入試情報サイト  動作スクリプト（ライブラリ不要）
   - data-action / data-list / data-if / data-bind 属性を目印に動作します
   - 各ページの文言データは HTML 末尾の <script id="page-data"> にあります
   ========================================================= */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var dataEl = $('#page-data');
  var DATA = dataEl ? JSON.parse(dataEl.textContent) : {};
  var isMobile = function () { return window.matchMedia('(max-width: 959px)').matches; };
  function bind(path, value, root) { $$('[data-bind="' + path + '"]', root).forEach(function (el) { el.textContent = value; }); }
  function items(list, tag) { return $$('[data-list="' + list + '"]').filter(function (el) { return !tag || el.tagName === tag; }); }

  /* ---------- ヘッダー：スマホメニュー ---------- */
  var menu = $('[data-if="menuVisible"]');
  var menuBtn = $('[data-action="toggleMenu"]');
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    bind('menuLabel', open ? '閉じる' : 'MENU');
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  $$('[data-action="closeMenu"]').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (!isMobile()) setMenu(false); });

  /* ---------- フッター：ページトップボタン ---------- */
  var topBtn = $('[data-if="showTop"]');
  if (topBtn) {
    window.addEventListener('scroll', function () { topBtn.hidden = window.scrollY <= 700; }, { passive: true });
    topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- トップ：ヒーロースライダー（5秒ごとに自動切替） ---------- */
  if (DATA.heroSlides) {
    var slides = items('heroSlides', 'DIV');
    var dots = items('heroSlides', 'BUTTON');
    var hero = 0, timer;
    var setHero = function (i) {
      hero = i;
      slides.forEach(function (s, k) { s.style.opacity = k === i ? 1 : 0; });
      dots.forEach(function (d, k) {
        d.style.width = k === i ? '28px' : '8px';
        d.style.opacity = k === i ? 1 : 0.35;
        d.setAttribute('aria-selected', String(k === i));
      });
      bind('hero.no', DATA.heroSlides[i].no);
      bind('hero.title', DATA.heroSlides[i].title);
      bind('hero.sub', DATA.heroSlides[i].sub);
    };
    var start = function () { clearInterval(timer); timer = setInterval(function () { setHero((hero + 1) % slides.length); }, 5000); };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { setHero(k); start(); }); });
    start();
  }

  /* ---------- トップ：先輩の声（本のタブ切替） ---------- */
  if (DATA.stories) {
    var tabs = items('stories', 'BUTTON');
    var photos = items('stories', 'DIV');
    var lineTpl = items('story.lines')[0];
    var lineBox = lineTpl && lineTpl.parentNode;
    var story = 0;
    var setStory = function (i) {
      story = i;
      var s = DATA.stories[i];
      bind('story.who', s.who);
      bind('story.title', s.title);
      if (lineBox) {
        lineBox.innerHTML = '';
        s.lines.forEach(function (t) { var p = lineTpl.cloneNode(false); p.textContent = t; lineBox.appendChild(p); });
      }
      photos.forEach(function (p, k) { p.style.opacity = k === i ? 1 : 0; p.style.pointerEvents = k === i ? 'auto' : 'none'; });
      layoutTabs();
    };
    var layoutTabs = function () {
      tabs.forEach(function (t, k) {
        var a = k === story;
        t.setAttribute('aria-selected', String(a));
        t.style.transform = isMobile() ? 'translateY(' + (a ? '0' : '-6px') + ')' : 'translateX(' + (a ? '8px' : '0') + ')';
      });
    };
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { setStory(k); }); });
    window.addEventListener('resize', layoutTabs);
    layoutTabs();
  }

  /* ---------- 学部・学科：学部で絞り込み ---------- */
  if (DATA.filters && DATA.depts) {
    var fbtns = items('filters', 'BUTTON');
    var cards = items('depts');
    fbtns.forEach(function (b, k) {
      b.addEventListener('click', function () {
        var label = DATA.filters[k].label;
        fbtns.forEach(function (x, j) {
          var a = j === k;
          x.style.background = a ? '#141414' : '#fff';
          x.style.color = a ? '#fff' : '#141414';
          x.setAttribute('aria-selected', String(a));
        });
        cards.forEach(function (c, j) { c.hidden = !(label === 'すべて' || DATA.depts[j].faculty === label); });
      });
    });
  }

  /* ---------- 入試情報：入試制度・FAQ のアコーディオン ---------- */
  function accordion(list, ifName, signName) {
    var rows = items(list);
    if (!rows.length) return;
    rows.forEach(function (row, k) {
      var btn = $('[data-action="toggle"]', row);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var willOpen = btn.getAttribute('aria-expanded') !== 'true';
        rows.forEach(function (r, j) {
          var open = willOpen && j === k;
          var body = $('[data-if="' + ifName + '"]', r);
          var b = $('[data-action="toggle"]', r);
          if (body) body.hidden = !open;
          if (b) b.setAttribute('aria-expanded', String(open));
          bind(signName, open ? '−' : '+', r);
        });
      });
    });
  }
  accordion('exams', 'e.open', 'e.sign');
  accordion('faq', 'q.open', 'q.sign');

  /* ---------- オープンキャンパス：日程選択と予約フォーム ---------- */
  if (DATA.dates) {
    var dateBtns = items('dates', 'BUTTON');
    var chosen = 0;
    var setDate = function (i) {
      chosen = i;
      dateBtns.forEach(function (b, k) {
        var a = k === i;
        b.style.background = a ? '#FFF6C2' : '#fff';
        b.style.boxShadow = a ? '5px 6px 0 #1A5FD0' : '3px 3px 0 #ddd';
        b.setAttribute('aria-pressed', String(a));
      });
    };
    dateBtns.forEach(function (b, k) { b.addEventListener('click', function () { setDate(k); }); });

    var field = function (name) { return $('[data-change="' + name + '"]'); };
    var formBox = $('[data-if="notDone"]');
    var doneBox = $('[data-if="done"]');
    var errBox = $('[data-if="hasError"]');
    var submit = $('[data-action="submit"]');
    var reset = $('[data-action="reset"]');

    if (submit) submit.addEventListener('click', function () {
      var name = field('onName').value.trim();
      var email = field('onEmail').value.trim();
      var school = field('onSchool').value.trim();
      var miss = [];
      if (!name) miss.push('お名前');
      if (!/^\S+@\S+\.\S+$/.test(email)) miss.push('メールアドレス');
      if (!school) miss.push('高校名');
      if (miss.length) {
        bind('error', miss.join('・') + 'を正しく入力してください。');
        errBox.hidden = false;
        return;
      }
      errBox.hidden = true;
      var d = DATA.dates[chosen];
      var guests = field('onGuests').value;
      bind('f.name', name);
      bind('f.email', email);
      bind('f.dept', field('onDept').value);
      bind('chosen.no', d.no);
      bind('chosen.type', d.type);
      bind('chosen.date', d.date);
      bind('guestsLabel', guests === '0' ? 'なし' : guests + '名');
      formBox.hidden = true;
      doneBox.hidden = false;
      var sec = $('#reserve');
      if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    });
    if (reset) reset.addEventListener('click', function () { formBox.hidden = false; doneBox.hidden = true; });
    $$('[data-change]').forEach(function (el) { el.addEventListener('input', function () { if (errBox) errBox.hidden = true; }); });
  }
})();
