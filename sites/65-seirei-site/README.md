# 青嶺大学 入試情報サイト（サンプル）

## ファイル構成
- Top.dc.html … トップページ
- Faculties.dc.html … 学部・学科
- Preparation.dc.html … 入試対策
- Admissions.dc.html … 入試情報（日程・出願・学費・FAQ）
- CampusLife.dc.html … キャンパスライフ
- Contact.dc.html … お問い合わせ・資料請求フォーム
- SiteHeader.dc.html / SiteFooter.dc.html … 全ページ共通のヘッダー・メニュー・背景／フッター
- site.css … 全ページ共通のスマホ対応（レスポンシブ）・見た目の補正
- site-motion.js … 全ページ共通のアニメーション
- image-slot.js … 画像の差し込み枠
- support.js … 実行用ランタイム（編集不要）

## プレビュー方法
共通パーツを読み込むため、ファイルを直接ダブルクリックではなくローカルサーバーで開いてください。
- おすすめ：このフォルダで `python serve.py` を実行し、http://127.0.0.1:8080/Top.dc.html を開く（キャッシュ無効なので、編集がすぐ反映されます）
- または VS Code の拡張機能「Live Server」で Top.dc.html を開く
- 編集後に表示が変わらないときは、Ctrl+F5（強制再読み込み）を試してください。

## 編集のポイント
- 見た目は各要素の style 属性（インラインCSS）で指定しています。
- スマホ表示（幅768px以下）での変更は site.css にまとめています。要素に付いた class 名（例：vside, hide-sp）で対応箇所を探せます。
- `<image-slot>` には class が効かないため、site.css では `data-cap="bottom"` のような data 属性で指定しています。
- テキストやデータ（学部・日程・FAQなど）は各ファイル下部の `<script>` 内 `class Component` にあります。
- 写真は images フォルダに入っています（横1600pxに縮小済み）。差し替えるときは同じファイル名で上書きするのが簡単です。
  - 学部の写真（fac-*.jpg）や選抜方式の写真（prep-*.jpg）は、トップと下層ページで共通です。
  - 写真とファイル名の対応は、各ファイル下部の `<script>` 内の `img:'images/...'` を参照してください。
  - extra-*.jpg は今回使っていない予備の写真です。
- イラストは images/illust フォルダ（背景透過PNG）に入っています。複数の場面が描かれた素材は場面ごとに切り出してあります。
  - ページ上部のイラストは class="hero-illust"（トップは hero-illust-top）で、幅1100px以下では本文の下に移動します。
- 日程・金額・住所などはすべてサンプルです。公開前に正式な情報へ差し替えてください。
