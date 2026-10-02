炭火焼鳥 灯火 ウェブサイト
==========================

■ 表示のしかた
各ページが部品（ヘッダー・フッター）を読み込むため、HTMLファイルをダブルクリックしても正しく表示されません。
Webサーバーに置くか、ローカルでサーバーを立てて開いてください。

  例）このフォルダで  python -m http.server 8000
      → ブラウザで http://127.0.0.1:8000/Top.dc.html

※ 表示時にインターネット接続が必要です（React・Googleフォントを外部から読み込みます）。

■ ページ
  Top.dc.html          トップ（入口）
  Concept.dc.html      こだわり
  Menu.dc.html         お品書き
  Course.dc.html       コース
  Experience.dc.html   空間・お席
  Reservation.dc.html  ご予約・アクセス
  SiteHeader.dc.html   共通ヘッダー（全ページに反映）
  SiteFooter.dc.html   共通フッター（全ページに反映）

■ 画像
  images/ フォルダ内。差し替えは各HTMLの <image-slot ... src="images/～.jpg"> を書き換えます。

■ 未対応
  ・画像なし：お品書き「鶏出汁茶漬け」「焼きおにぎり」、空間・お席「個室」
  ・ご予約フォームは送信先が未接続です（画面上で完了表示が出るだけ）
  ・地図は仮置き（Google Maps 埋め込みに差し替え）
