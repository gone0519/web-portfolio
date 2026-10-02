# あおば内科クリニック Webサイト

## ファイル構成
- Aoba Clinic.dc.html … トップページ
- About.dc.html … 当院について
- Treatment.dc.html … 診療内容
- Doctor.dc.html … 医師紹介
- FirstVisit.dc.html … 初めての方へ
- Access.dc.html … アクセス・お問い合わせ
- SiteHeader.dc.html / SiteFooter.dc.html … 共通ヘッダー・フッター（全ページで読み込み）
- anim.js … スクロール・ホバーなどのアニメーション（全ページ共通）
- responsive.css … スマホ・タブレット向けのレイアウト調整（全ページ共通）
- image-slot.js … 画像差し替え枠
- support.js … 表示用ランタイム（編集不要）

## 確認方法
ファイルを直接ダブルクリックすると、ブラウザのセキュリティ制限で共通パーツが読み込まれない場合があります。
VS Code の拡張機能「Live Server」などでローカルサーバーを起動して開いてください。

## 編集のポイント
- 文章・色・余白は各 .dc.html 内の `<x-dc>` の中（HTML・インラインstyle）を編集します。
- 診療項目・患者さまの声・FAQなど繰り返し表示される内容は、ファイル下部の `<script>` 内 `renderVals()` のデータを編集します。
- 写真は `<image-slot>` タグに `src="images/xxx.jpg"` を追加すると表示されます。
- 地図は Access.dc.html の地図枠を Google マップの `<iframe>` に置き換えてください。
