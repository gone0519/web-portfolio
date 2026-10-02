# AXIS — デジタルマーケティングエージェンシー（トップページ）

VS Code でそのまま開いて編集できる、フレームワーク非依存の静的サイトです。

## 構成
```
axis-site/
├─ index.html        … マークアップ（各セクションはコメントで区切り）
├─ css/style.css     … スタイル（:root の変数で色・フォントを一括管理）
├─ js/main.js        … ヒーロースライダー / スクロール表示
└─ images/           … 画像プレースホルダー（差し替え用）
```

## 使い方
1. `index.html` をブラウザで開く（またはVS Codeの Live Server 拡張でプレビュー）。
2. `images/` 内の各PNGを、同じファイル名で実画像に差し替える。
   - hero.png / feature1〜3.png / link1〜3.png / map.png
   - 別の拡張子にする場合は `index.html` の `src` を書き換えてください。

## よく編集する箇所
- **色・フォント**: `css/style.css` 冒頭の `:root` 変数（--blue / --coral / フォント）。
- **本文コピー**: `index.html` の各セクション（<!-- ===== ... ===== --> で区切り）。
- **ヒーローのスライド文言**: `js/main.js` の `AXIS_SLIDES` 配列。
- **ナビ / サービス / ブログ項目**: `index.html` を直接編集。

## 依存（CDN・オンライン）
- Google Fonts（Cormorant Garamond / Noto Sans JP / Noto Serif JP）
- Lucide Icons（`https://unpkg.com/lucide`）

オフラインで使う場合は、これらをローカルに保存して参照先を差し替えてください。
