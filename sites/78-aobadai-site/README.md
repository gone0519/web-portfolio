# 青葉台大学 入試情報サイト（サンプル）

## ファイル構成
- `index.dc.html` … サイト本体（全6ページ。`#/faculty` などのハッシュで切り替え）
- `support.js` … 表示用ランタイム（編集不要）
- `image-slot.js` … 画像差し込み枠（編集不要）
- `images/` … 写真（同じファイル名で上書きすると差し替わります）
- `images/illust/` … イラスト（同上）

## 確認方法
ローカルサーバーで開いてください（ファイルを直接開くと読み込みに失敗する場合があります）。
- VS Code 拡張「Live Server」で `index.dc.html` を開く
- または `npx serve .` / `python3 -m http.server` 実行後、ブラウザでアクセス

## 編集のポイント
- **レイアウト・文言** … `<x-dc>` 内のHTML（スタイルはインライン指定）
- **データ（学部・入試方式・FAQ・日程など）** … 下部 `<script data-dc-script>` 内の `renderVals()`
- **画像** … `<image-slot>` を通常の `<img src="..." style="width:100%;height:100%;object-fit:cover">` に置き換えるか、`src="画像URL"` 属性を追加
- **メインカラー** … `#D3121A` を一括置換

※ 大学名・日程・連絡先はすべてサンプルです。
