# sowa — サイト構成

メイン1ページ＋下層5ページ。デザイン（配色・タイポグラフィ・グレイン・アニメーション）は全ページ共通です。

## ファイル構成

```
sowa/
├── index.html      メイン（トップ）
├── company.html    会社概要
├── service.html    事業内容
├── works.html      導入実績
├── news.html       お知らせ
├── contact.html    お問い合わせ
└── assets/
    ├── data.js     ★ 文言・画像パスはすべてここ
    ├── style.css   デザイン（全ページ共通）
    ├── site.js     共通処理（ヘッダー・フッター・演出）
    └── photos/     写真18点
```

`index.html` をダブルクリックすれば、そのままブラウザで閲覧できます。

## 編集のしかた

**`assets/data.js` だけ**を編集してください。全ページがこのファイルを読み込んでいます。
配列に要素を足す／消すと、そのまま画面の項目数が増減します。

| 内容 | キー |
|---|---|
| ナビゲーション | `nav` |
| 下層ページの見出し・リード文 | `pages` |
| ヒーローの縦書きコピー | `hero.vertical` |
| コンセプト本文 | `concept` |
| 選ばれる理由 | `reasons` |
| サービス一覧（9件） | `services` |
| 事業内容の3領域 | `serviceGroups` |
| ご依頼の流れ | `steps` |
| 導入実績（6件） | `works` |
| 数字（カウントアップ） | `metrics` |
| お客様の声 | `voices` |
| よくあるご質問 | `faqs` |
| お知らせ（10件） | `news` |
| 会社概要の表 | `profile` |
| アクセス | `access` |
| フォームの項目 | `formFields` |
| 固定の写真スロット | `photos` |
| 電話・住所など | `company` |

### 画像の差し替え

`assets/photos/` にファイルを置き、`data.js` の `img` にパスを書きます。
`img` を空にすると、抽象アートのプレースホルダに戻ります。

```js
photos: {
  office: { caption: 'オフィス風景', img: 'assets/photos/office-brick.jpg' },
  ...
}
```

`pos` を足すと切り抜き位置を調整できます（省略時は中央）。

```js
contact: { caption: '…', img: 'assets/photos/team-portrait.jpg', pos: 'center 30%' }
```

### 配色を変える

`assets/style.css` 冒頭の `:root` にある変数を書き換えると全ページに反映されます。

| 変数 | 用途 |
|---|---|
| `--ink` | 文字色・ダークセクションの背景 |
| `--paper` / `--paper-2` | 背景（明・やや暗） |
| `--sage` / `--sage-deep` | アクセントのグリーン |
| `--sand` | 補助のベージュ |

## 画像の割り当て一覧

| ファイル | 使用箇所 |
|---|---|
| team-working.jpg | トップのメインビジュアル |
| office-brick.jpg | Concept：オフィス風景 |
| meeting-bright.jpg | Concept：打合せ／実績05（医療） |
| desk-analytics.jpg | Concept：手元 |
| workshop.jpg | Concept：ワークショップ |
| handshake.jpg | CTAブロック背景（全ページ共用） |
| building-stone.jpg | 会社概要 ヘッダー |
| office-empty.jpg | 事業内容 ヘッダー |
| street.jpg | 導入実績 ヘッダー／アクセスの地図枠 |
| building-tower.jpg | お知らせ ヘッダー |
| team-portrait.jpg | お問い合わせ ヘッダー／実績06（人材） |
| plan-check.jpg | 事業内容 01 戦略設計 |
| team-desktop.jpg | 事業内容 02 制作・開発 |
| dashboard-review.jpg | 事業内容 03 運用・改善 |
| smartphone.jpg | 実績01（EC） |
| meeting-window.jpg | 実績02（SaaS） |
| team-stairs.jpg | 実績03（採用） |
| meeting-overhead.jpg | 実績04（BtoB製造業） |

## 公開前に対応が必要なこと

- **画像の解像度** — 現在の素材はすべて横640px です。特にトップのメインビジュアルは横2400px以上ないと拡大時に粗が出ます。同じ素材の L / XL サイズをダウンロードし、**同じファイル名で上書き**すれば `data.js` の編集は不要です
- **お問い合わせフォームの送信先** — 現在は送信されません。`assets/site.js` のフォーム処理に送信先を設定してください
- **お知らせの個別記事ページ** — 一覧のみ。リンク先は暫定で `contact.html` を指しています
- **地図** — アクセス欄は写真で代用しています。Google Maps の埋め込みに差し替えてください
