# はるねファミリークリニック サイトデータ

## ページ構成
- Top.dc.html … トップページ
- About.dc.html … 当院について
- Services.dc.html … 診療案内
- Doctor.dc.html … 医師・院内紹介
- Access.dc.html … アクセス
- Contact.dc.html … ご予約・お問い合わせ
- SiteHeader.dc.html / SiteFooter.dc.html … 共通ヘッダー・フッター

## 補助ファイル
- support.js … 表示用ランタイム（削除しないでください）
- image-slot.js … 画像枠
- site-effects.js … スクロール演出
- responsive.css … 画面幅による表示切り替え（レスポンシブ）
- images/ … 掲載写真（1.jpg〜20.jpg／長辺1920pxに圧縮済み）

## 確認方法
ローカルサーバーで開いてください（ファイルを直接ダブルクリックすると共通部品が読み込まれません）。
例: VS Code 拡張「Live Server」で Top.dc.html を開く。

## 編集のポイント
- 各ファイルの <x-dc> 内がHTML、<script data-dc-script> 内がデータ（診療科・お知らせ・診療時間など）です。
- スタイルは原則インラインで記述しています。

## 画像について
- 写真は images/ フォルダに置き、`<img src="images/◯.jpg" style="width:100%;height:100%;object-fit:cover">` で表示しています。
- 一覧で繰り返し表示している箇所（診療科・当院の特徴・院内ツアーなど）は、
  <script data-dc-script> 内のデータにある `img: 'images/◯.jpg'` を書き換えると差し替えられます。
- 単独の写真（各ページ上部のメイン写真、院長写真など）は、HTML内の `src` を直接書き換えてください。
- 写真の見せたい位置がずれる場合は `object-position:68% center` のように調整できます（院長写真で使用）。
- ファーストビュー以外の画像には `loading="lazy"` を付けて、初期表示を軽くしています。
- 差し替え用の写真は長辺1920px・JPEG品質82程度に圧縮してから置くことをおすすめします。

### まだ写真が入っていない箇所（<image-slot> の枠のまま）
枠に画像ファイルをドラッグ&ドロップすると入ります（ローカルサーバー表示時）。
- 地図（Top / Access）… Googleマップの埋め込みコードに置き換えるのがおすすめです。
- アクセスページ「駅からの道順」STEP 01・02 … 駅前・通りの実写に差し替えてください。

## レスポンシブについて
スマートフォン〜PCまで1つのHTMLで対応しています（可変レイアウト）。

- 余白・文字サイズは `clamp(最小, 可変, 最大)` でインラインに書いています。
  例: `padding:clamp(64px,10vw,110px) 20px` → 画面が狭いほど余白が詰まります。
- 段組みは `repeat(auto-fit,minmax(min(100%,◯◯px),1fr))` で、幅が足りなくなると自動で縦積みになります。
  1行あたりの最小幅を変えたいときは、この `◯◯px` を調整してください。
- 「画面幅で表示／非表示を切り替える」指定だけは responsive.css にまとめています。
  - `.sp-bar` / `.sp-bar-space` … 画面下部の固定バー（960px以上のPCでは非表示）
  - `.deco-pc-only` … 飾りの英字など（768px未満では非表示）
  - `.vert-label` / `.vert-label-row` … 縦書きラベル（600px未満では横書きに）
  - `.narrow-only` … 画面の狭い端末（360px未満）だけに出す補足文
  - インライン指定を上書きするため、responsive.css 側の指定には `!important` が必要です。
- ヘッダーのメニューは JavaScript で切り替えています（960px未満でMENUボタン表示）。
  → SiteHeader.dc.html の `window.innerWidth < 960` の数値を変更してください。
