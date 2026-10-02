/* =========================================================
   MITSUBA DIGITAL — 共通スクリプト
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- スマホ用メニュー ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  if (menuBtn) {
    var setMenu = function (open) {
      document.body.classList.toggle('is-menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    };
    menuBtn.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('is-menu-open'));
    });
    document.querySelectorAll('.gnav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- スクロールで表示（.reveal） ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- FAQ: 1つ開いたら他を閉じる ---------- */
  document.querySelectorAll('[data-accordion]').forEach(function (group) {
    var items = group.querySelectorAll('details');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (other) { if (other !== d) other.open = false; });
      });
    });
  });

  /* ---------- 絞り込み（導入実績・お役立ち情報） ----------
     <div data-filter-group="id"> 内のボタン [data-filter="値"] で
     [data-list="id"] 内の [data-category] を絞り込みます。
     [data-search="id"] の入力欄があればキーワード検索も併用します。 */
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var id = group.getAttribute('data-filter-group');
    var list = document.querySelector('[data-list="' + id + '"]');
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-category]'));
    var buttons = group.querySelectorAll('[data-filter]');
    var search = document.querySelector('[data-search="' + id + '"]');
    var label = document.querySelector('[data-result="' + id + '"]');
    var current = 'all';

    // 件数を自動で表示
    buttons.forEach(function (b) {
      var count = b.querySelector('.filter-btn__count');
      if (!count) return;
      var v = b.getAttribute('data-filter');
      count.textContent = v === 'all'
        ? items.length
        : items.filter(function (i) { return i.getAttribute('data-category') === v; }).length;
    });

    var apply = function () {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      items.forEach(function (item) {
        var okCat = current === 'all' || item.getAttribute('data-category') === current;
        var okQ = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
        var visible = okCat && okQ;
        item.hidden = !visible;
        if (visible) {
          shown++;
          item.classList.add('is-visible');
        }
      });
      if (label) {
        if (!shown) {
          label.textContent = '該当する項目がありません。条件を変えてお試しください。';
        } else if (label.hasAttribute('data-result-cases')) {
          label.textContent = current === 'all'
            ? '全 ' + shown + '件を表示中'
            : current + 'の事例 ' + shown + '件を表示中';
        } else {
          label.textContent = shown + '件の記事を表示中';
        }
      }
    };

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        current = b.getAttribute('data-filter');
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    apply();
  });

  /* ---------- フォーム送信（デモ用） ----------
     実際に送信する場合は、form の action を送信先に設定し、
     data-demo-form 属性を削除してください。 */
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('[data-form-note]');
      if (note) {
        note.textContent = form.getAttribute('data-demo-form');
        note.classList.add('is-sent');
      }
      form.reset();
    });
  });

  /* ---------- コピーライトの年 ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
