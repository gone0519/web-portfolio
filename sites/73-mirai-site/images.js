// 画像の割り当て表
// 左が <image-slot> の id、右が images/ フォルダ内のファイル名です。
// 写真を差し替えるときは、ここのファイル名を書き換えてください。
(function () {
  var MAP = {
    // ── トップ（University Admissions.dc.html）
    'hero-main': '11-students-walk.jpg',
    'hero-sub1': '14-lecture-student.jpg',
    'hero-sub2': '17-students-window.jpg',
    'intro-a': '02-campus-tree.jpg',
    'intro-b': '12-students-lounge.jpg',
    'programs-bg': '27-campus-mall.jpg',
    'prog-lit': '28-library.jpg',
    'prog-law': '20-students-desk.jpg',
    'prog-eco': '16-students-laptop.jpg',
    'prog-sci': '25-lab.jpg',
    'prog-intl': '18-students-intl.jpg',
    'prog-nurse': '31-trio-portrait.jpg',
    'prep-main': '33-lecture-smile.jpg',
    'prep-sub': '13-students-files.jpg',
    'method-bg': '30-consultation.jpg',
    'method-sub': '32-workshop.jpg',
    'admissions-bg': '04-sakura-sky.jpg',
    'support-parents': '22-students-portrait.jpg',
    'support-students': '29-study-support.jpg',
    'campus-bg': '23-campus-path.jpg',
    'ev-open': '24-seminar.jpg',
    'ev-tour': '21-students-walkway.jpg',
    'ev-online': '26-pc-room.jpg',
    'life-0': '19-friends.jpg',          // サークル活動
    'life-1': '09-students-cheer.jpg',   // 学園祭
    'life-2': '07-campus-terrace.jpg',   // 学生食堂
    'life-3': '01-group-hill.jpg',       // ゼミ合宿
    'life-4': '18-students-intl.jpg',    // 留学プログラム
    'life-5': '11-students-walk.jpg',    // スポーツ
    'life-6': '12-students-lounge.jpg',  // ラーニングコモンズ
    'life-7': '21-students-walkway.jpg', // ボランティア
    'life-8': '08-campus-tower.jpg',     // 学生寮
    'contact-staff': '10-students-stairs.jpg',

    // ── 学部・学科（Faculties.dc.html）
    'fac-hero-bg': '15-building-lattice.jpg',
    'fac-lit': '28-library.jpg',
    'fac-law': '20-students-desk.jpg',
    'fac-eco': '16-students-laptop.jpg',
    'fac-sci': '25-lab.jpg',
    'fac-intl': '18-students-intl.jpg',
    'fac-nurse': '31-trio-portrait.jpg',
    'fac-f1': '24-seminar.jpg',
    'fac-f2': '29-study-support.jpg',
    'fac-f3': '32-workshop.jpg',
    'fac-f4': '01-group-hill.jpg',

    // ── 受験対策（ExamPrep.dc.html）
    'prep-hero-bg': '28-library.jpg',
    'prep-road-img': '13-students-files.jpg',
    'prep-subj-img': '14-lecture-student.jpg',
    'prep-sel-1': '29-study-support.jpg',
    'prep-sel-2': '30-consultation.jpg',
    'prep-sel-3': '26-pc-room.jpg',

    // ── 入試情報（Admissions.dc.html）
    'adm-hero-bg': '06-campus-plaza.jpg',
    'adm-docs-img': '13-students-files.jpg',

    // ── 学費・サポート（TuitionSupport.dc.html）
    'tui-hero-bg': '07-campus-terrace.jpg',
    'tui-sup-1': '29-study-support.jpg',
    'tui-sup-2': '05-graduate-sakura.jpg',
    'tui-sup-3': '30-consultation.jpg',
    'tui-sup-4': '21-students-walkway.jpg',
    'tui-parents-img': '22-students-portrait.jpg',

    // ── キャンパスライフ（CampusLife.dc.html）
    'cam-hero-bg': '27-campus-mall.jpg',
    'cam-fac-1': '28-library.jpg',
    'cam-fac-2': '12-students-lounge.jpg',
    'cam-fac-3': '07-campus-terrace.jpg',
    'cam-fac-4': '25-lab.jpg',
    'cam-fac-5': '15-building-lattice.jpg',
    'cam-fac-6': '18-students-intl.jpg',
    'cam-day-img': '17-students-window.jpg',
    'cam-season-1': '04-sakura-sky.jpg',
    'cam-season-2': '01-group-hill.jpg',
    'cam-season-3': '11-students-walk.jpg',
    'cam-season-4': '05-graduate-sakura.jpg',
    'cam-ev-1': '24-seminar.jpg',
    'cam-ev-2': '20-students-desk.jpg',
    'cam-ev-3': '23-campus-path.jpg',
    'cam-ev-4': '26-pc-room.jpg',
    'cam-map': '27-campus-mall.jpg',
    'cam-contact-staff': '10-students-stairs.jpg',
  };

  // ページは描画後に部品が入れ替わるため、DOMの変化を監視して src を付け直します。
  function apply() {
    var slots = document.querySelectorAll('image-slot[id]');
    for (var i = 0; i < slots.length; i++) {
      var f = MAP[slots[i].id];
      if (!f) continue;
      var src = 'images/' + f;
      if (slots[i].getAttribute('src') !== src) slots[i].setAttribute('src', src);
    }
  }
  var t = null;
  new MutationObserver(function () { clearTimeout(t); t = setTimeout(apply, 30); })
    .observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();
