/* ============================================================
   ▼▼▼ サイト全体のデータ ▼▼▼
   全ページがこのファイルを読み込みます。文言の編集はここだけ。
   配列に要素を足す／消すと、そのまま画面の項目数が増減します。

   img : 表示する画像のパス。空にすると抽象アートのプレースホルダに戻ります
   pos : 切り抜き位置。'center 30%' のように書くと上寄りで切り抜かれます（省略可）
   ============================================================ */
const DATA = {

  /* ---------- 共通ナビゲーション（ヘッダー・メニュー・フッター） ---------- */
  nav: [
    { en: 'Top',     jp: 'トップ',       href: 'index.html',   page: 'top'     },
    { en: 'Company', jp: '会社概要',     href: 'company.html', page: 'company' },
    { en: 'Service', jp: '事業内容',     href: 'service.html', page: 'service' },
    { en: 'Works',   jp: '導入実績',     href: 'works.html',   page: 'works'   },
    { en: 'News',    jp: 'お知らせ',     href: 'news.html',    page: 'news'    },
    { en: 'Contact', jp: 'お問い合わせ', href: 'contact.html', page: 'contact' }
  ],

  /* ---------- 下層ページの見出し ---------- */
  pages: {
    company: { en: 'Company', jp: '会社概要',     lead: '成果の理由を説明できるチームであること。私たちの考え方と、それを支える体制についてご紹介します。' },
    service: { en: 'Service', jp: '事業内容',     lead: '戦略、制作、運用、分析。分断されがちな領域を一つのチームで担当し、施策の因果を見失わないまま成果まで伴走します。' },
    works:   { en: 'Works',   jp: '導入実績',     lead: '業種も課題も異なる案件を、同じ手順で成果まで運んでいます。代表的な事例をご紹介します。' },
    news:    { en: 'News',    jp: 'お知らせ',     lead: '会社からのお知らせと、現場で得た知見をまとめた記事を掲載しています。' },
    contact: { en: 'Contact', jp: 'お問い合わせ', lead: '初回のご相談と簡易診断は無料です。現状の課題整理から、施策の優先順位づけまでお手伝いします。' }
  },

  /* ---------- ヒーロー（メインページ） ---------- */
  hero: {
    since: '2011',
    vertical: '成果が、あなたのブランドを解き放つ'
  },

  /* ---------- Concept（本文） ---------- */
  concept: {
    heading: '成果があなたの<br>ブランドを解き放つ',
    lead: '広告費、制作、運用。数字に追われる日々から解き放たれて、本来向き合うべき事業に集中してほしい。',
    paragraphs: [
      '戦略設計から実装、改善までを一つのチームで。成果の理由が説明できる状態を、いつもご用意しています。',
      '数字をリセットして、新しい成長に出会える場所。私達は、そんなパートナーでありたいと思っています。'
    ]
  },

  /* ---------- Why sowa（選ばれる理由） ---------- */
  reasons: [
    { no: '01', title: '戦略から運用までを\n一つのチームで', body: '設計する人と実行する人を分けません。仮説を立てた本人が数字を見るため、意思決定が速く、施策の意図が最後まで濁りません。' },
    { no: '02', title: '成果の理由を\n必ず説明します', body: '上がった時も下がった時も、要因を分解してお伝えします。再現できない成果は成果として扱わない、というのが私たちの基準です。' },
    { no: '03', title: '運用体制ごと\nお渡しします', body: 'ご希望に応じて、社内で内製化するための手順書と研修までを提供します。長く依存させることを目的にしていません。' }
  ],

  /* ---------- Service（事業内容 9項目） ---------- */
  services: [
    { en: 'Digital Marketing', jp: 'デジタルマーケティング', body: '獲得目標から逆算してチャネル構成を設計し、予算配分と優先順位を決めます。' },
    { en: 'SEO', jp: 'SEO', body: 'テクニカル監査、コンテンツ設計、内部改善まで。検索意図から構造を組み直します。' },
    { en: 'Google Ads / PPC', jp: '運用型広告', body: '検索・ディスプレイ・動画。アカウント構成の整理からクリエイティブ改善まで担当します。' },
    { en: 'Social Media', jp: 'SNSマーケティング', body: '各媒体の役割を定義し、投稿と広告を一本の導線として運用します。' },
    { en: 'Web Development', jp: 'サイト制作・開発', body: '設計、デザイン、実装。表示速度と計測設計を最初から織り込みます。' },
    { en: 'Landing Page', jp: 'LP制作', body: '訴求の検証を前提に、差し替えやすい構造で制作。改善までを一続きで行います。' },
    { en: 'Branding', jp: 'ブランディング', body: '言葉とビジュアルの基準をつくり、媒体をまたいでも印象がぶれない状態に整えます。' },
    { en: 'Strategy', jp: 'マーケティング戦略', body: '市場・競合・自社の整理から、年間の投資計画とKPIツリーまで設計します。' },
    { en: 'Analytics', jp: '分析・レポーティング', body: 'GA4とタグの設計を整え、意思決定に使えるダッシュボードを構築します。' }
  ],

  /* ---------- 事業内容ページの3つの領域 ---------- */
  serviceGroups: [
    {
      no: '01', en: 'Strategy', jp: '戦略設計',
      body: '事業の目標から逆算して、どのチャネルにいくら投じるかを決めます。市場と競合の整理、KPIツリーの設計、年間の投資計画まで。ここが曖昧なまま走り出すと、あとから何を直せばいいか分からなくなります。',
      items: ['マーケティング戦略', 'デジタルマーケティング', '分析・レポーティング'],
      img: 'assets/photos/plan-check.jpg'
    },
    {
      no: '02', en: 'Creative', jp: '制作・開発',
      body: '設計、デザイン、実装までを社内で完結させます。表示速度と計測設計は後付けではなく最初から織り込み、公開直後から数字が読める状態でお渡しします。訴求の差し替えを前提とした構造で制作します。',
      items: ['サイト制作・開発', 'LP制作', 'ブランディング'],
      img: 'assets/photos/team-desktop.jpg'
    },
    {
      no: '03', en: 'Growth', jp: '運用・改善',
      body: '公開してからが本番です。アカウント構成の整理、クリエイティブの検証、コンテンツの追加。2週間ごとに進捗を共有し、月次で成果と要因を分解してご報告します。',
      items: ['運用型広告', 'SEO', 'SNSマーケティング'],
      img: 'assets/photos/dashboard-review.jpg'
    }
  ],

  /* ---------- Process（ご依頼の流れ） ---------- */
  steps: [
    { no: '01', title: 'お問い合わせ',     body: 'フォームまたはお電話から。現状と課題を簡単にお聞かせください。' },
    { no: '02', title: '無料診断',         body: '広告アカウントやサイトを拝見し、改善余地をレポートにまとめます。' },
    { no: '03', title: 'ご提案・お見積り', body: '施策の優先順位と体制、費用を明示したうえでご提案します。' },
    { no: '04', title: '実行',             body: '初月は計測環境の整備から。2週間ごとに進捗を共有します。' },
    { no: '05', title: '改善・報告',       body: '月次で成果と要因を報告し、次の打ち手を決めていきます。' }
  ],

  /* ---------- Works（導入実績） ---------- */
  works: [
    {
      caption: 'ECサイト', industry: 'E-Commerce', term: '2025.04 — 継続中',
      title: 'アパレルECの広告構成を再設計し、獲得単価を改善',
      metric: '42', unit: '%', metricLabel: 'CPA 削減',
      img: 'assets/photos/smartphone.jpg',
      body: '商品軸で乱立していたキャンペーンを、購買意欲の段階で組み直しました。計測の重複を解消したうえで予算配分を見直し、4ヶ月でCPAを42%削減しています。',
      tags: ['運用型広告', '分析・レポーティング']
    },
    {
      caption: 'SaaS LP', industry: 'SaaS', term: '2025.01 — 2025.10',
      title: '検索流入からの商談化を軸にコンテンツを再構築',
      metric: '3.1', unit: '倍', metricLabel: '商談数',
      img: 'assets/photos/meeting-window.jpg',
      body: '流入は多いのに商談に繋がらない状態でした。検索意図を分解して記事の役割を定義し直し、導線とLPを作り替えたところ、商談数が3.1倍になりました。',
      tags: ['SEO', 'LP制作']
    },
    {
      caption: '採用サイト', industry: 'Recruiting', term: '2024.09 — 2025.06',
      title: '採用サイトの刷新とSNS運用で応募数を底上げ',
      metric: '186', unit: '%', metricLabel: '応募数 増加',
      img: 'assets/photos/team-stairs.jpg', pos: 'center 22%',
      body: '求職者が知りたい情報が載っていない状態を解消し、社員インタビューを軸に再構成。SNSを認知の入口として設計し、応募数が前年比186%増となりました。',
      tags: ['サイト制作・開発', 'SNSマーケティング']
    },
    {
      caption: 'BtoB 製造業', industry: 'Manufacturing', term: '2024.05 — 継続中',
      title: '問い合わせの質を上げるためにキーワード戦略を再定義',
      metric: '2.4', unit: '倍', metricLabel: '有効商談率',
      img: 'assets/photos/meeting-overhead.jpg',
      body: '件数は足りているが商談にならない、という課題でした。検索キーワードを購買段階で仕分け、下流に予算を寄せた結果、有効商談率が2.4倍になっています。',
      tags: ['マーケティング戦略', '運用型広告']
    },
    {
      caption: '医療・クリニック', industry: 'Healthcare', term: '2024.02 — 2025.03',
      title: '地域検索の設計を見直し、予約完了率を改善',
      metric: '58', unit: '%', metricLabel: '予約完了率 向上',
      img: 'assets/photos/meeting-bright.jpg',
      body: 'エリアごとのニーズ差をふまえてページ構成を分割。予約フォームまでの導線を短くし、離脱していた層を拾えるようにしました。',
      tags: ['SEO', 'サイト制作・開発']
    },
    {
      caption: '人材サービス', industry: 'HR Tech', term: '2023.11 — 2024.12',
      title: 'ブランド基準を整え、媒体をまたいだ印象を統一',
      metric: '1.9', unit: '倍', metricLabel: '指名検索数',
      img: 'assets/photos/team-portrait.jpg', pos: 'center 28%',
      body: '媒体ごとに表現がばらついていたため、言葉とビジュアルの基準を策定。運用ルールまで含めてお渡しし、指名検索数が1.9倍に伸びました。',
      tags: ['ブランディング', 'デジタルマーケティング']
    }
  ],

  /* ---------- Numbers（数字で見る sowa）※ n が0からカウントアップします ---------- */
  metrics: [
    { n: 240, prefix: '',  suffix: '+', label: '支援実績' },
    { n: 94,  prefix: '',  suffix: '%', label: '継続率' },
    { n: 15,  prefix: '',  suffix: '年', label: '事業年数' },
    { n: 38,  prefix: '¥', suffix: '億', label: '年間広告運用額' }
  ],

  /* ---------- Voice（お客様の声） ---------- */
  voices: [
    { quote: '数字が動いた理由を毎回言語化してもらえるので、社内の説明が楽になりました。代理店というより事業側のチームに近い距離感です。', name: '製造業 / 事業企画部 部長' },
    { quote: '初回の無料診断の時点で、社内で気づいていなかった計測の穴を指摘されました。提案の前に事実を揃える姿勢が信頼できます。', name: 'SaaS / マーケティング責任者' },
    { quote: '内製化まで見据えた進め方で、半年後には自社で運用できる状態になりました。引き際まで設計されているのが印象的でした。', name: 'EC / 代表取締役' }
  ],

  /* ---------- FAQ（よくあるご質問）※ 最初の1件が開いた状態で表示されます ---------- */
  faqs: [
    { q: '最低契約期間はありますか？', a: '運用型広告・SEOは3ヶ月以上を推奨しています。改善サイクルを2回転させないと、施策の良し悪しを数字で判断できないためです。制作単発のご依頼は期間の縛りはありません。' },
    { q: '費用の目安を教えてください。', a: '広告運用は月額20万円〜（広告費の20%）、サイト制作は120万円〜、SEOコンサルティングは月額30万円〜が目安です。ご予算に応じて範囲を調整しますので、まずはご相談ください。' },
    { q: '既存の制作会社や代理店と併走できますか？', a: '可能です。既存パートナーの役割を整理したうえで、重複しない形で参画します。引き継ぎが必要な場合はアカウント構成の監査から着手します。' },
    { q: 'レポートはどのような形式ですか？', a: '月次でダッシュボード（Looker Studio）と定例ミーティングをご用意します。数値の羅列ではなく、次に何をするかまで書いた状態でお渡しします。' },
    { q: '対応エリアはどこまでですか？', a: '全国対応しています。オンラインでの定例が中心ですが、四半期に一度の訪問をご希望の場合も承ります。' },
    { q: '相談だけでも問い合わせて良いですか？', a: 'もちろんです。初回のご相談と簡易診断は無料でお受けしています。発注をお約束いただく必要はありません。' }
  ],

  /* ---------- News（お知らせ・記事） ---------- */
  news: [
    { date: '2026.08.12', cat: 'Insight', title: 'GA4移行後によくある計測ミス5つと、その直し方' },
    { date: '2026.07.28', cat: 'News',    title: '恵比寿オフィスを拡張移転しました' },
    { date: '2026.07.09', cat: 'SEO',     title: '検索意図の分解からはじめる、記事構成のつくり方' },
    { date: '2026.06.21', cat: 'Ads',     title: '広告費を増やす前に見直したいアカウント構成の3点' },
    { date: '2026.06.03', cat: 'Insight', title: '「なんとなく好調」を疑う。月次レポートで最初に見る指標' },
    { date: '2026.05.19', cat: 'News',    title: 'デザイナー・広告運用コンサルタントを募集しています' },
    { date: '2026.05.02', cat: 'SEO',     title: '内部リンクを設計に変える。回遊率が上がる構造の作り方' },
    { date: '2026.04.15', cat: 'Ads',     title: '検索広告のクリエイティブ改善、まず削るべき3つの型' },
    { date: '2026.03.28', cat: 'Insight', title: 'LPの改善順序。ファーストビューより先に見るべき場所' },
    { date: '2026.03.10', cat: 'News',    title: '2026年度の新卒採用エントリーを開始しました' }
  ],

  /* ---------- 会社概要 ---------- */
  profile: [
    { k: '商号',     v: '株式会社 sowa' },
    { k: '設立',     v: '2011年4月' },
    { k: '代表者',   v: '代表取締役　—' },
    { k: '資本金',   v: '3,000万円' },
    { k: '従業員数', v: '42名（2026年8月現在）' },
    { k: '所在地',   v: '東京都渋谷区恵比寿西1丁目8-3　EBISU WEST 5F' },
    { k: '事業内容', v: 'デジタルマーケティング支援 / SEOコンサルティング / 運用型広告運用 / Webサイト・LP制作 / ブランディング' },
    { k: '取引銀行', v: '三井住友銀行 恵比寿支店' }
  ],

  /* ---------- アクセス ---------- */
  access: [
    { k: 'JR 恵比寿駅',         v: '西口より徒歩4分' },
    { k: '東京メトロ 恵比寿駅', v: '1番出口より徒歩5分' },
    { k: '受付時間',            v: '平日 10:00〜19:00' }
  ],

  /* ---------- お問い合わせフォームの項目 ---------- */
  formFields: [
    { name: 'company', label: '会社名',       type: 'text',   required: true,  placeholder: '株式会社サンプル' },
    { name: 'name',    label: 'お名前',       type: 'text',   required: true,  placeholder: '和佐 太郎' },
    { name: 'email',   label: 'メールアドレス', type: 'email',  required: true,  placeholder: 'name@example.com' },
    { name: 'tel',     label: '電話番号',     type: 'tel',     required: false, placeholder: '03-0000-0000' },
    { name: 'budget',  label: 'ご予算',       type: 'select',  required: false, options: ['未定', '〜50万円 / 月', '50〜100万円 / 月', '100万円〜 / 月'] },
    { name: 'subject', label: 'ご相談内容',   type: 'select',  required: true,  options: ['デジタルマーケティング全般', 'SEO', '運用型広告', 'サイト制作・LP制作', 'ブランディング', 'その他'] },
    { name: 'message', label: 'お問い合わせ内容', type: 'textarea', required: true, placeholder: '現状の課題や、ご検討中の内容をご記入ください。' }
  ],

  /* ---------- 固定の写真スロット ---------- */
  photos: {
    hero:     { caption: '全画面：チームの作業風景', img: 'assets/photos/team-working.jpg',    pos: 'center 42%' },
    office:   { caption: 'オフィス風景（横位置）',   img: 'assets/photos/office-brick.jpg' },
    meeting:  { caption: '打合せ',                  img: 'assets/photos/meeting-bright.jpg' },
    hands:    { caption: '手元',                    img: 'assets/photos/desk-analytics.jpg' },
    workshop: { caption: 'ワークショップ',           img: 'assets/photos/workshop.jpg' },
    cta:      { caption: '背景（横長・暗めに調整）', img: 'assets/photos/handshake.jpg',        pos: 'center 35%' },
    company:  { caption: '会社概要 ヘッダー背景',    img: 'assets/photos/building-stone.jpg',   pos: 'center 45%' },
    service:  { caption: '事業内容 ヘッダー背景',    img: 'assets/photos/office-empty.jpg' },
    worksTop: { caption: '導入実績 ヘッダー背景',    img: 'assets/photos/street.jpg',           pos: 'center 55%' },
    newsTop:  { caption: 'お知らせ ヘッダー背景',    img: 'assets/photos/building-tower.jpg',   pos: 'center 45%' },
    contact:  { caption: 'お問い合わせ ヘッダー背景', img: 'assets/photos/team-portrait.jpg',   pos: 'center 30%' },
    map:      { caption: '地図 ／ 恵比寿オフィス',   img: 'assets/photos/street.jpg' }
  },

  /* ---------- 会社情報 ---------- */
  company: {
    tel: '03-6427-0119',
    email: 'contact@sowa.example.jp',
    address: '東京都渋谷区恵比寿西1丁目8-3　EBISU WEST 5F',
    hours: '10:00〜19:00',
    holiday: '土・日・祝'
  }
};
