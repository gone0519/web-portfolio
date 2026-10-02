# あおい歯科クリニック Webサイト

## ファイル構成
- `Aoi Dental Clinic.dc.html` … トップページ
- `Concept.dc.html` / `Services.dc.html` / `Doctor.dc.html` / `Feature.dc.html` / `Reservation.dc.html` … 下層ページ
- `SiteHeader.dc.html` / `SubHero.dc.html` / `SiteFooter.dc.html` … 共通パーツ（下層ページで読み込み）
- `responsive.css` … レスポンシブ調整用スタイル（全ページで読み込み）
- `images/` … 掲載画像（15点）
- `support.js` … 表示用ランタイム（編集不要）

## 画像について
- 画像は `<img src="images/xxx.jpg" alt="..." style="...object-fit:cover">` で直接指定しています（画像枠コンポーネント `image-slot.js` は使用しなくなったため削除しました）。
- 掲載枠は約60か所あり、素材15点を複数の枠で使い回しています。差し替えるときは `images/` に同名で上書きするか、各ファイルの `src` を書き換えてください。
- 診療案内・設備・スタッフの画像は、ファイル末尾の `<script data-dc-script>` 内のデータで管理しています（`Services.dc.html` の `pics` / `Feature.dc.html` の `feats`・`equip` / `Doctor.dc.html` の `staff`）。
- 下層ページのメイン画像は `<dc-import name="SubHero" ... src="images/xxx.jpg">` で指定します。
- 縦長に切り取る枠で人物の顔が切れる場合は、`object-position`（例：`62% 22%`）で表示位置を調整できます。
- 元画像は長辺1600pxにリサイズ・JPEG品質85で再圧縮しています（合計約15MB → 約2MB）。元の解像度が必要な場合は差し替えてください。

## レスポンシブのブレイクポイント
| 幅 | 挙動 |
| --- | --- |
| 1240px 以上 | 画面右端に固定ボタン（TEL / 24時間WEB予約）を表示 |
| 1240px 未満 | 固定ボタンを画面下部のバーに切り替え（本文との重なりを防ぐため） |
| 1024px 以上 | グローバルナビを横並びで表示 |
| 1024px 未満 | ハンバーガーメニューに切り替え |
| 768px 未満 | 縦書きラベルを横書きキャプション化、入力欄を16px（iOSの自動ズーム防止） |

- 幅の判定は JavaScript 側（`Aoi Dental Clinic.dc.html` / `SiteHeader.dc.html` / `SiteFooter.dc.html` の `componentDidMount` 内 `window.innerWidth` 比較）と `responsive.css` のメディアクエリの2か所にあります。変更する場合は両方を揃えてください。
- `responsive.css` はインライン style を上書きするため `!important` を使用しています。

## ローカルでの確認
共通パーツを読み込むため、ファイルを直接開くのではなくローカルサーバー経由で表示してください。
- VS Code拡張「Live Server」で `Aoi Dental Clinic.dc.html` を開く
- または `npx serve .` / `python3 -m http.server`

## 編集のポイント
- 文章・スタイルは各 `.dc.html` の `<x-dc>` 内にインラインで記述しています。
- 診療内容・スタッフ・設備などのリストは、ファイル末尾の `<script data-dc-script>` 内のデータ配列で管理しています。
- 院長・スタッフ名、経歴、住所、電話番号は仮の内容です。
