未来創成大学 入試情報サイト（サンプル）

■ 開き方
ローカルサーバー経由で開いてください（ファイルを直接ダブルクリックすると部品の読み込みが動きません）。
  VS Code 拡張「Live Server」で "University Admissions.dc.html" を右クリック → Open with Live Server
  または: npx serve .

■ ファイル構成
University Admissions.dc.html … トップページ
Faculties.dc.html            … 学部・学科
ExamPrep.dc.html             … 受験対策
Admissions.dc.html           … 入試情報
TuitionSupport.dc.html       … 学費・サポート
CampusLife.dc.html           … キャンパスライフ・オープンキャンパス・お問い合わせ
SiteHeader.dc.html / SiteFooter.dc.html … 共通ヘッダー・フッター
site.css       … スマホ・タブレット向けの調整（899px以下／599px以下）
images.js      … 写真の割り当て表（どの画像枠にどの写真を表示するか）
images/        … 写真（1600px幅に縮小済み）
images/illust/ … イラスト（透過PNG）
motion.js      … スクロール表示・桜・帯の流れ・ホバー演出
image-slot.js  … 画像枠
support.js     … 実行用ランタイム（編集不要）

■ 編集のポイント
・各 .dc.html の <x-dc> 内がHTML、<script data-dc-script> 内の renderVals() が表示データです。
・文言・学部・日程などのデータは renderVals() 内の配列を編集してください。
・写真を差し替える：images/ に写真を入れ、images.js の該当行のファイル名を書き換えます。
・イラストを差し替える：images/illust/ の同名ファイルを上書きします。
・スマホ表示の調整は site.css で行います。
・桜の枚数は data-sakura="96" の数値で調整できます。

■ 注意
・表示には React（unpkg.com）と Google Fonts を読み込むため、インターネット接続が必要です。
・大学名・連絡先・日程・金額などはすべてサンプルです。
