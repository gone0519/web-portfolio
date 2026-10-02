# SORA — デジタルマーケティングエージェンシー サイト

**プレーンな HTML + CSS + JavaScript** で作られています。ビルド・依存インストール・フレームワークは一切不要。VS Code でそのまま開いて編集できます。

---

## 1. ファイル構成

```
.
├── index.html          # トップページ
├── services.html       # サービス一覧（SEO主軸・9サービス）
├── case-studies.html   # 実績（業種フィルター付き）
├── styles.css          # 全ページ共通のスタイル（★色やデザインはここ）
├── script.js           # 共通の動き（メニュー・FAQ・カウンター・フィルター）
├── README.md           # このファイル
└── uploads/            # 参考デザイン画像
```

- `about.html` / `contact.html` は未作成です。作る場合は `index.html` を複製してリンク先を用意すると簡単です（ヘッダーとフッターのリンクはすでに `about.html` / `contact.html` を指しています）。
- ページ間リンクは相対パス（`href="services.html"` など）です。

---

## 2. ローカルでの開き方

Google Fonts を使うためネット接続がある状態で、いずれか：

- **推奨: VS Code 拡張「Live Server」** … `index.html` を右クリック →「Open with Live Server」
- `index.html` をブラウザにドラッグ＆ドロップ
- ターミナルで `npx serve` → 表示された URL を開く

> CSS も JS も相対パスなので、フォルダごと配置すればそのまま動きます。

---

## 3. 編集のしかた（よくある変更）

### テキスト（コピー）
各 `*.html` の日本語をそのまま書き換えるだけです。

### 色を変える（一括）
`styles.css` の先頭 `:root { … }` にすべての色をまとめています。ここを変えると全ページに反映されます。

```css
:root{
  --primary:#2F7BD1;      /* メインの青。ボタン・リンクなど */
  --primary-deep:#1E5FA8; /* 濃い青 */
  --ink:#17222E;          /* 見出し・本文 */
  --muted:#54636F;        /* 補助テキスト */
  --bg:#FAFCFE;           /* 背景 */
  /* アクセント: coral / mint / amber / lav */
}
```

### フォントを変える
- 読み込み: 各HTMLの `<head>` にある Google Fonts の `<link>`
- 適用: `styles.css` の `--font-head`（見出し）・`--font-body`（本文）・`--font-num`（数字）

### カード・項目を増減する
繰り返しのカードは**HTML内でそのブロックをコピー／削除**するだけです。
- サービスカード（トップ）… `index.html` の `.service`
- 選ばれる理由 … `.reason`
- 実績カード … `.case`（`case-studies.html` では `data-cat="業種名"` がフィルター対象。フィルターのボタンは `.filter data-filter="業種名"`。業種名を揃えれば動きます）
- サービス詳細 … `services.html` の `.svc-block`（`id` はタブのリンク先と対応）
- FAQ … `.faq`（`class="faq open"` の `open` が付いた項目が最初から開いた状態）

### 画像の差し替え
現在は `［ team.jpg ］` のようなラベル付きプレースホルダです。`images/` フォルダを作り、該当の枠を
```html
<img src="images/xxx.jpg" alt="説明" style="width:100%;height:100%;object-fit:cover">
```
に置き換えてください。

### レイアウト・レスポンシブ
- グリッドは `.grid.grid-2 / grid-3 / grid-4` を使用。
- スマホ・タブレットの折り返しは `styles.css` 末尾の `@media (max-width: …)` にまとめています。

---

## 4. 動き（script.js）について

- **ハンバーガーメニュー**（`.burger` ↔ `.mobile-menu`）
- **FAQ アコーディオン**（`.faq` をクリックで開閉。1つずつ開く）
- **スクロール表示アニメ**（`class="reveal"` を付けた要素がふわっと表示。`data-delay="120"` で遅延）
- **数字カウントアップ**（`data-count="230" data-suffix="社"`。小数は `data-dec="1"`）
- **実績フィルター**（`.filter[data-filter]` と `.case[data-cat]`）

特別な設定は不要で、`<script src="script.js"></script>` を読み込めば自動で有効になります。

---

## 5. メモ

- クラス名はできるだけ日本語コメント付きで `styles.css` に整理しています。
- `about.html` / `contact.html` を追加したい場合や、機能追加が必要な場合は、このプロジェクトに戻ればいつでも対応できます。
