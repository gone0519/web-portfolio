MERIDIAN Web サイト データ一式
==============================

■ ページ構成（トップ + 下層 5 ページ）
  MERIDIAN Home.dc.html      トップ
  MERIDIAN About.dc.html     会社について
  MERIDIAN Services.dc.html  サービス
  MERIDIAN Cases.dc.html     導入実績
  MERIDIAN Insights.dc.html  インサイト
  MERIDIAN Contact.dc.html   お問い合わせ

■ 共通パーツ（1 ファイル直せば全ページに反映）
  MeridianHeader.dc.html     上部の帯・メニュー（スマホ時はハンバーガー）
  MeridianPageHero.dc.html   下層ページ上部の見出し
  MeridianCTA.dc.html        下部の「無料診断」案内
  MeridianFooter.dc.html     サイトマップ
  meridian.css               レスポンシブ用の共通スタイル
  support.js                 表示用ランタイム（編集不要）
  images/                    写真素材

■ 表示のしかた
  ・Web サーバーに フォルダごとアップロード すれば、そのまま表示できます。
  ・HTML ファイルをダブルクリックで開くと、ブラウザの制限で
    ヘッダー・フッターなどの共通パーツが表示されません。
    手元で確認するときは、ローカルサーバーを使ってください。

    例1）Python がある場合
         このフォルダでコマンドプロンプトを開き
           python -m http.server 8000
         → ブラウザで http://localhost:8000/MERIDIAN%20Home.dc.html

    例2）VS Code の拡張機能「Live Server」で MERIDIAN Home.dc.html を開く

  ・表示にはインターネット接続が必要です（React と Google Fonts を読み込むため）。

■ 画像の差し替え
  ・Home / About / Insights の注目記事 … 各ページ内の <img src="images/..."> を書き換え
  ・Cases / Insights の一覧 … ページ下部スクリプト内の images 配列を書き換え
  ・下層ページのヒーロー背景 … <dc-import name="MeridianPageHero" image="..."> を書き換え

■ 未設定の箇所
  ・Contact ページの地図 2 か所は仮の枠のままです（Google マップの埋め込み等に差し替え）。
  ・お問い合わせフォーム・ニュースレター登録は送信先が未接続です（画面上の動作のみ）。
