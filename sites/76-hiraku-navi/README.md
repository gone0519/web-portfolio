# ひらく進学ナビ

## ファイル構成
- Home.dc.html … トップページ
- Programs.dc.html … 学部・学科
- Preparation.dc.html … 受験対策
- Admissions.dc.html … 入試・出願
- Campus.dc.html … キャンパスライフ
- Contact.dc.html … お問い合わせ・資料請求
- support.js … 表示用ランタイム（編集不要）
- image-slot.js … 画像枠コンポーネント

## 表示方法
ファイルを直接ダブルクリックすると読み込みが制限される場合があります。
VS Code の拡張機能「Live Server」でフォルダを開き、Home.dc.html を右クリック →「Open with Live Server」で確認してください。

## 編集のポイント
- 各ファイルは `<x-dc>` 内がHTMLテンプレート、`<script data-dc-script>` 内がロジック（データ・動き）です。
- スタイルはすべてインラインで記述しています。
- 学部一覧・FAQ・スケジュールなど一部の文言はロジック内の配列にあります。
- 画像は `<image-slot>` を `<img src="images/xxx.jpg" style="width:100%;height:100%;object-fit:cover;border-radius:20px">` に置き換えると差し替えられます。
- 日程・学費・連絡先はサンプルです。公開前に正式な情報へ差し替えてください。
