// 画像の割り当て表：<image-slot id="…"> に表示する写真を指定します。
// 差し替えるときは、右側のファイル名を変えるだけでOKです（images/ フォルダ内）。
(() => {
  const P = n => 'images/photo-' + String(n).padStart(2, '0') + '.jpg';
  const MAP = {
    // ── トップ（Manabi Gate.dc.html）
    'hero-main': P(23),   // メインビジュアル：並木道を歩く学生
    'hero-sub': P(2),     // キャンパスの風景：大樹のある中庭
    'intro-1': P(14),     // 講義室
    'intro-2': P(28),     // 図書館
    'type-1': P(31),      // 「Learn」横のピル
    'type-2': P(4),       // 「Picture」横のピル：桜
    'type-3': P(1),       // 「your Future.」横のピル：笑顔の学生
    'prog-wide': P(27),   // キャンパス外観・並木道
    'prog-detail': P(26), // 実習・演習（PCルーム）
    'fac-0': P(30), 'fac-1': P(32), 'fac-2': P(3), 'fac-3': P(25),
    'fac-4': P(29), 'fac-5': P(10), 'fac-6': P(33), 'fac-7': P(7),
    'prep-wide': P(16),   // 学習机
    'life-0': P(9), 'life-1': P(11), 'life-2': P(12), 'life-3': P(20), 'life-4': P(18), 'life-5': P(6),
    'oc-bg': P(17),       // オープンキャンパス背景

    // ── 学部・学科（Programs.dc.html）
    'pg-hero': P(2), 'pg-hero-sub': P(24),
    'pg-fac-0': P(32), 'pg-fac-1': P(18), 'pg-fac-2': P(30), 'pg-fac-3': P(3), 'pg-fac-4': P(15),
    'pg-fac-5': P(26), 'pg-fac-6': P(25), 'pg-fac-7': P(33), 'pg-fac-8': P(7),
    'pg-sb': P(28), 'pg-cta': P(9),

    // ── 入試対策（ExamPrep.dc.html）
    'ep-hero': P(16), 'ep-sub': P(14), 'ep-sb': P(20), 'ep-cta': P(11),

    // ── 入試・出願（Admissions.dc.html）
    'ad-hero': P(8), 'ad-sub': P(13), 'ad-sb': P(27), 'ad-cta': P(1),

    // ── 学費・奨学金（Tuition.dc.html）
    'tu-hero': P(30), 'tu-sub': P(29), 'tu-sb': P(28), 'tu-cta': P(22),

    // ── キャンパスライフ（CampusLife.dc.html）
    'cl-hero': P(1), 'cl-sub': P(9),
    'cl-strip-0': P(19), 'cl-strip-1': P(11), 'cl-strip-2': P(12), 'cl-strip-3': P(20), 'cl-strip-4': P(18), 'cl-strip-5': P(6),
    'cl-life-0': P(17), 'cl-life-1': P(31), 'cl-life-2': P(3), 'cl-life-3': P(22), 'cl-life-4': P(5), 'cl-life-5': P(28),
    'cl-sb': P(7)
  };
  const apply = () => document.querySelectorAll('image-slot[id]').forEach(s => {
    const u = MAP[s.id];
    if (u && s.getAttribute('src') !== u) s.setAttribute('src', u);
  });
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();
