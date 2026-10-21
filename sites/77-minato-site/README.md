# みなと学園大学 入試サイト（サンプル）

## ファイル構成
- University Admissions.dc.html … トップページ
- Faculties.dc.html … 学部・学科
- ExamPrep.dc.html … 入試準備
- Admissions.dc.html … 入試・出願情報
- Support.dc.html … 学費・サポート
- CampusLife.dc.html … キャンパスライフ・お問い合わせ
- SiteHeader.dc.html / SiteFooter.dc.html … 共通ヘッダー・フッター
- responsive.css … スマホ・タブレット向けのレイアウト調整
- img/ … 写真（差し替えは同じファイル名で上書き）
- motion.js … アニメーション
- support.js … 表示用ランタイム（編集不要）

## 編集方法
- 各ページの見た目は <x-dc> 内のHTML（インラインstyle）を編集します。
- 文言やリストのデータは下部 <script data-dc-script> 内の renderVals() にあります。
- {{ name }} は renderVals() が返す値の差し込み位置です。

## プレビュー
ローカルサーバーで開いてください（ファイルを直接開くと読み込めない場合があります）。
例: VS Code 拡張「Live Server」、または `npx serve .`
