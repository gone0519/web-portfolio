# RUBINO — サイトデザイン（編集用データ）

## 中身
- `Rubino Site.dc.html` — サイト本体。1ファイルにHTML・スタイル・ロジックがすべて入っています。
- `support.js` — 描画用のランタイム。**編集不要**。同じフォルダに置いたままにしてください。
- `images/` — サイトで使う写真。

## 開き方
1. このフォルダをVS Codeで開く
2. `Rubino Site.dc.html` を**ローカルサーバー経由**で開く（VS Codeの Live Server 拡張が手軽です）

ファイルをブラウザに直接ドラッグしても表示はされますが、`file://` では
ランタイムの一部の読み込みが失敗するため、ローカルサーバーを推奨します。
Live Server が無い場合は、このフォルダで次のコマンドでも代用できます。

```
python -m http.server 8765
```

→ ブラウザで `http://127.0.0.1:8765/Rubino%20Site.dc.html`

Webフォント（Google Fonts）と描画ライブラリはCDNから読み込むため、**表示にはネット接続が必要**です。

## 別のPCで作業を引き継ぐとき
このフォルダはGitリポジトリです。`.git` ごとコピーすれば変更履歴も一緒に移ります。

移行先で必要なもの:
- **Git**（GitHub Desktop を入れると同梱されます）
- **VS Code**（+ Live Server 拡張）
- ブラウザ

コピー後、移行先で最初に確認するコマンド:

```
git log --oneline     # 履歴が来ているか
git status            # クリーンなら移行成功
```

Gitのユーザー名とメールが未設定だとコミットできません。未設定なら:

```
git config --global user.name  "あなたの名前"
git config --global user.email "あなたのメール"
```

## ファイル構造
`Rubino Site.dc.html` は3つのブロックに分かれています。

1. `<x-dc>` 〜 `</x-dc>` … マークアップ本体
   - `<helmet>` … フォント読み込み、body リセット、keyframes
   - `<header>` … ヘッダーとナビゲーション
   - `<sc-if value="{{ isHome }}">` … トップページ
   - 以降 `isMind` / `isCourse` / `isWine` / `isLunch` / `isAccess` … 各下層ページ
   - `<footer>` … フッター

2. `<script data-dc-script>` 内の `class Component` … テキスト・価格・メニューなどのデータ
   - `renderVals()` の戻り値がテンプレートに渡る値です
   - 例：`courses`（夜のコース）、`byGlass`（グラスワイン）、`storeInfo`（店舗情報）、`faqData`（FAQ）

3. `data-props` … ヒーローの切替（`heroTreatment`: `mosaic` / `single` / `split`）

## 書き方のルール
- スタイルはすべて `style="..."` のインライン。**レスポンシブ用のクラスだけ例外**です（下記）。
- `{{ name }}` は `renderVals()` が返す値の差し込み口。式は書けません（`{{ a + b }}` は不可）。
- 繰り返しは `<sc-for list="{{ items }}" as="item">`、条件分岐は `<sc-if value="{{ flag }}">`。
- `:hover` は `style-hover="..."` 属性で書きます。

## レスポンシブ
インラインstyleでは `@media` が書けないため、`<helmet>` 内の `<style>` の末尾に
メディアクエリをまとめてあります。**PC表示（幅1025px以上）の見た目は従来どおり**で、
狭い画面でだけインラインstyleを `!important` で上書きする方式です。

ブレークポイントは **1024 / 900 / 860 / 720 / 640 / 560 px**。

要素に付ける `class="rb-…"` が切り替えのフックです。新しいブロックを足すときは、
同じ役割のクラスを付ければそのまま追従します。

| クラス | つける場所 | 狭い画面での挙動 |
| --- | --- | --- |
| `rb-bleed` | 左右余白ゼロの全幅セクション | セクション共通の左右余白調整から除外する |
| `rb-band` | 全幅の帯セクション（縦書きコピー入り） | 高さを 340px に縮める |
| `rb-bar` / `rb-bar-note` / `rb-bar-tel` | ヘッダー上段とその中の要素 | 2段に折り返し。860px以下で中央寄せ、560px以下で「ご予約・お問い合わせ」を非表示 |
| `rb-nav` / `rb-navbtn` / `rb-navline` | グローバルナビとボタン・下線 | 900px以下で横スクロール（スクロールバーは非表示） |
| `rb-hero-mosaic` | ヒーロー（mosaic）のタイル格子 | 860px以下で2列2段（5枚目のタイルは非表示）、480px以下で高さ400px |
| `rb-hero-single` | ヒーロー（single）の外枠 | 高さを 480px → 420px に縮める |
| `rb-hero-split` | ヒーロー（split）の2カラム | 1カラムに。画像側の斜めカット（clip-path）を解除 |
| `rb-g2` | 2カラムのグリッド | 900px以下で1カラム |
| `rb-g2s` | 小さめの2カラム（SNSリンクなど） | 640px以下で1カラム |
| `rb-g3` / `rb-g4` | 3列・4列のカードグリッド | 900px以下で2列、640px以下で1列 |
| `rb-side` | 「見出し○px + 本文1fr」の表組み | 720px以下で1カラム（見出しが上、本文が下） |
| `rb-coursepair` | コース2枚組（ボタンがはみ出す配置） | 縦積み時の間隔を76pxに広げる |
| `rb-vwrap` / `rb-vwrap-r` | 縦書きブロックの親（flex） | 縦積みに。`-r` は読み順を保つため逆順で積む |
| `rb-vtext` | `writing-mode: vertical-rl` の要素 | 横書きに戻して高さ指定を解除 |
| `rb-quote` | 装飾の引用符「”」 | 画面外に出ないよう位置と大きさを調整 |
| `rb-img` | 高さ固定の画像プレースホルダー | 高さを `clamp(220px, 52vw, 380px)` に |
| `rb-offset` | `margin-top` でずらした画像 | ずらしを解除 |
| `rb-deco` / `rb-deco-l` | 背景の大きな装飾文字（Course / Wine） | 84px → 54px に縮小。`-l` は左寄せ位置も調整 |
| `rb-footer` / `rb-copybar` | フッターと最下部のコピーライト帯 | 左右余白と負マージンを揃える |
| `rb-faq-a` | FAQの回答文 | 560px以下で右余白を解除 |

セクションの左右余白は個別指定ではなく `section:not(.rb-bleed)` でまとめて調整しています
（1024px以下で30px、560px以下で18px）。新しいセクションを足しても自動で効きます。
全幅で見せたいセクションにだけ `class="rb-bleed"` を付けてください。

見出しやロゴなど一部は、メディアクエリではなくインラインの `clamp()` / `min()` で
なめらかに縮むようにしています（例: `font-size: clamp(27px, 8vw, 52px)`）。

## 画像
写真は `images/` フォルダに用途名で入れてあり、すべて配置済みです。
表示は `background: url('images/xxx.jpg') center/cover no-repeat;`（中央基準の自動トリミング）。

**差し替えるときは、同じファイル名で上書きするのが一番簡単です。** HTMLを触る必要がありません。

| ファイル名 | 使用箇所 |
| --- | --- |
| `hero-1-wine.jpg` 〜 `hero-5-dolce.jpg` | トップのヒーロー（5枚のタイル）※`hero-3` は中央でロゴの箱に隠れます／`hero-5` はスマホ非表示 |
| `home-storefront.jpg` | ホーム「美味しい時間が、神楽坂に。」横の外観 |
| `home-wine-band.jpg` | ホームの全幅帯（＋`single`ヒーロー使用時の背景） |
| `home-beef.jpg` / `home-pouring-hands.jpg` | 和×Italian セクション上段の2枚 |
| `home-donabe.jpg` | 和×Italian セクションの大きい1枚 |
| `home-pasta-cheese.jpg` / `home-pasta-seafood.jpg` | コースへの導線（斜めカットの2枚） |
| `home-sommelier.jpg` | Wine セクション |
| `home-lunch.jpg` | Lunch セクション |
| `news-1-autumn.jpg` / `news-2-duck.jpg` / `news-3-bottles.jpg` | News の3枚 |
| `mind-portrait.jpg` | 店主の想い／ポートレート |
| `mind-pasta.jpg` / `mind-plate.jpg` / `mind-counter.jpg` | 三つの約束の下の3枚 |
| `course-full.jpg` / `course-cheese.jpg` / `course-degustazione.jpg` | 各コースの1枚 |
| `wine-band.jpg` | ワインページの全幅帯 |
| `lunch-pasta.jpg` / `lunch-rubino.jpg` | ランチ2種のカード |
| `floor-counter.jpg` / `floor-table.jpg` / `floor-private.jpg` | 店舗案内の店内3枚（`floor-counter` は `split`ヒーロー使用時にも使用） |
| `spare-wine-bottle.jpg` | 予備（未使用） |

`sc-for` で回している箇所（ヒーロー／News／三つの約束／コース／ランチ／店内）は、
テンプレートではなく `renderVals()` 内の `heroTiles` `news` `mindShots` `courses`
`lunchSets` `floorShots` にパスが書いてあります。枚数を増減するならそちらを編集してください。

暗い帯とヒーローの上には文字を載せるため、`linear-gradient(rgba(...), rgba(...))` を
画像に重ねて暗くしています。写真が明るすぎて文字が読みにくいときは、この数値
（`0.42` / `0.5` / `0.55` / `0.58`）を上げてください。

**Googleマップ枠だけは未設定**です（`[ google maps embed ]` の縞模様が残っています）。
その `<div>` を Google マップの `<iframe>` に置き換えてください。

### 元素材について
`images/` の中身は `0818WEB/①/画像/` からコピーしたものです（各640px前後）。
全幅の帯（`home-wine-band.jpg` / `wine-band.jpg`）だけは 2000px以上の素材に
差し替えると、大きな画面でのにじみが解消されます。

## ロゴ
`<svg width="100%" viewBox="0 0 82 72" ...>` が樽とワイングラスのマークです。
ヒーロー3パターンとフッターに合計4か所あり、パスデータは同一です。
色は `stroke="#F0E9DE"`、サイズは親 `<div>` の `width` で調整します。

## 主なカラー
| 用途 | 値 |
| --- | --- |
| ワインレッド（背景） | `#3A0D14` → `#2C0E13` |
| 黒（背景） | `#17130F` / `#120F0D` |
| 紙（明るい面） | `#E9E5DD` / `#FBFAF7` |
| ゴールド（罫線・見出し） | `#C9A961` |
| 本文（暗い面） | `#C6BAA9` / `#A79B8C` |
| 本文（明るい面） | `#4B443C` / `#5F564C` |

## フォント
- `Cormorant Garamond` … 欧文の見出し・ロゴ・数字
- `Playfair Display`（italic） … 装飾見出し（Course / Wine / News）
- `Shippori Mincho` … 和文すべて
