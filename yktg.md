# Core Language Hub SaaS 詳細要件定義書（最新版）

このドキュメントは、実装・UI設計の基準となる要件定義書。

- 方針（確定）
  - 管理画面（作者側）は「標準的なSaaS管理UI」で良い（フォーム/テーブル中心、過度な独自デザインはしない）
  - 公開画面（読者側）は「東洋経済オンライン風」のニュース/経済メディアの情報設計・密度・見出し階層に寄せる
  - インフラはVercel中心（特定クラウドへの依存を避け、ベンダーニュートラルに要件を書く）

---

## 1. システム概要

### 1.1 目的

専門家が持つ暗黙知をAIとの対話で構造化（CLA構築）し、それに基づいた「記事・画像・メルマガ・フォーム」を一貫した世界観で自動生成・運用する知的生産SaaS。

### 1.2 ターゲットユーザー

- 士業、ドクター、コンサルタント等の高度な専門知識を持つプロフェッショナル
- 自身のビジネスを言語化し、24時間働く「営業資産」としてのメディアを構築したい個人・法人

### 1.3 用語

- Owner: 作者（=公開サイトのオーナー）。マルチテナント単位
- CLA（Core Language Architecture）: 専門家の暗黙知を構造化したコア言語
- ContentPlanBatch: タイトル案10件などを束ねるバッチ
- TitleIdea: タイトル案（1件=1レコード）
- Article: 記事（アウトライン→承認→本文生成）

---

## 2. 機能要件

### 2.1 ユーザー基盤 & オンボーディング

- 認証
  - メール/パスワード + Googleログイン
  - 将来の拡張: ロール（admin/owner/reader）・有料プランに基づく権限制御
- オンボーディング
  - ログイン直後に「AI執事」による対話が開始され、CLAの冒頭（PRB/EMP/BNF）を体験
- 決済
  - Stripe Billing
  - 「CLA全項目の解放」「記事生成回数」はサブスク契約が前提（MVPではUI導線のみでも可）

### 2.2 管理画面（作者側）

管理画面は標準的なSaaS管理UI（フォーム/テーブル中心）とする。

- 基本構成
  - 左ナビ: CLA / タイトル案バッチ / 記事 / タグ / 画像 / メルマガ / 問い合わせ
  - 一覧はテーブル中心（状態、更新日、指標の可視化）
  - 詳細はフォーム中心（編集・保存・公開）

### 2.3 CLA構築エンジン（Core Language Architecture Builder）

- AI対話モジュール
  - Vercel AI SDK + LangChain.js等によるチャット形式
- 11要素の構造化管理
  1. PRB (Problem): 課題と前提条件
  2. EMP (Empathy): ペルソナとカスタマージャーニー
  3. BNF (Benefit): ペルソナの理想の姿
  4. SLT (Solution): 解決策
  5. MKT (Marketing): マーケティングファネル
  6. PRS (Process): 業務プロセス
  7. KPI (Indicator): 重要指標
  8. PMQ (Monetization): マネタイズ
  9. VQF (Value/Quality): 原価企画
  10. stry (Story): ベネフィットの物語
  11. dsgn (Design): デザインの基本論点
- 整合性チェック
  - AIが「社会のニーズ」と「専門家のノウハウ」を照らし合わせ、論理矛盾を指摘/修正提案

### 2.4 コンテンツ・プロダクション（Content Engine）

- 戦略的10タイトル提案
  - CLAから逆算し、認知・教育・成約を網羅する10本の構成を提案
  - TitleIdeaは「1件=1レコード」、バッチ（ContentPlanBatch）で束ねる
- 記事生成（1本ずつ）
  - 生成フロー
    1) アウトライン生成
    2) 人が承認
    3) 本文生成（ストリーミング）
  - アウトラインは保存する
  - アウトライン再生成では edition を増やさない
  - 本文再生成は必ず edition++
- 保存形式
  - Article.content は Tiptap JSON を文字列として保存
  - excerpt は本文生成と同時に自動生成して保存
  - タグはAI自動付与 + 人が編集可能
- 失敗時のリトライ
  - LLM/画像生成ともに失敗時は最大2回自動リトライ

### 2.5 画像生成（Fal.ai → オブジェクトストレージ）

- 本文生成後に画像生成
- 複数画像を管理可能
- 本文には imageUrl を直接埋め込む運用
- 保存先は公開URL運用が可能なオブジェクトストレージ（S3互換、Vercel Blob等を含む）
- 画像生成に使用したプロンプト等のスナップショットを保存

### 2.6 公開メディア & パーソナライズ（Public Library）

#### 2.6.1 公開UI方針（東洋経済オンライン風）

公開画面（読者側）は、ニュース/経済メディアの“情報密度 + 見出し階層 + リスト主体”のUIに寄せる。

- トップ（ユーザー別サイトのトップ）
  - 注目枠（大きめの主見出し + サブ見出し）
  - 新着（見出しリスト中心）
  - ランキング（指標=精読率、MVPではreadCompleteCount）
  - カテゴリ/タグ別の導線（MVPではタグで代替可）
- 記事詳細
  - 見出し階層と導入文の読みやすさを優先
  - 余白、段落幅、行間を最適化し“読み物”の体験を作る
  - 記事末尾に導線（関連記事/ランキング/問い合わせ/メルマガ登録）

#### 2.6.2 Library Concierge（ヒアリング）

- 訪問読者への初回簡易アンケート（悩み、興味）
- ReaderProfileはowner単位で分離（混ぜない）

#### 2.6.3 パーソナライズ・レコメンド

- アンケート結果に基づき、トップページの表示記事を動的に最適化

### 2.7 ランキング/新着/解析

- ランキング指標
  - readCompleteCountのみ
  - 判定はスクロール100%到達
  - 同一ユーザーによる重複カウントOK
  - イベント保存はしない
- 表示種別
  - 全体ランキング
  - ユーザー内ランキング
- 新着はユーザー内のみ

### 2.8 問い合わせ

- ログイン不要
- 必ずどのowner宛てかを保持
- articleIdは任意

---

## 3. 非機能要件

### 3.1 UI/UX

- 管理画面（作者側）
  - 標準的なSaaS管理UI（フォーム/テーブル中心）
  - “速く編集できる”ことを優先
- 公開画面（読者側）
  - 東洋経済オンライン風（ニュース/経済メディアの情報設計）
  - 見出しの視認性・回遊性・情報密度を重視
- アクセシビリティ
  - 文字サイズ、行間、コントラスト比を最適化
- 応答性
  - 本文生成はストリーミングで体験を担保

### 3.2 セキュリティ

- データ分離
  - マルチテナント: owner単位で厳密に分離（DBレベルの制約、RLS等の適用を想定）
- 認可
  - 重要操作（公開/削除/請求関連）は権限チェック必須

### 3.3 パフォーマンス

- 公開ページは高速表示（ISR/キャッシュ戦略を適用）
- 画像はCDN配信
- 生成系はレートリミット/キューイング（将来）

---

## 4. 技術アーキテクチャ（方針）

- Frontend
  - Next.js（App Router）
  - Tailwind CSS
  - 記事編集: Tiptap
- Hosting
  - Vercel
- AI
  - Vercel AI SDK
  - LangChain.js
  - LLM: OpenAI/Anthropic等（差し替え可能な抽象化）
- Image Gen
  - Fal.ai（モデルは要件として固定せず、後で差し替え可能に）
- Payment
  - Stripe
- Email
  - Resend + React Email
- Analytics
  - Microsoft Clarity / GA4

---

## 5. データモデル（概念スキーマ）

以下は概念モデル。永続層はSQL/NoSQLいずれでも成立する形にする。

```ts
// Owner（作者）
type Owner = {
  id: string;
  userSlug: string; // global unique
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

// CLA
type CoreLanguageMaster = {
  id: string;
  ownerId: string;
  // MVPは全文テキストでも良いが、将来は11要素を別カラム化
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

// タイトル案バッチ
type ContentPlanBatch = {
  id: string;
  ownerId: string;
  claId: string;
  createdAt: string;
  updatedAt: string;
};

type TitleIdeaStatus = "PROPOSED" | "SELECTED" | "REJECTED";
type TitleIdea = {
  id: string;
  ownerId: string;
  batchId: string;
  title: string;
  status: TitleIdeaStatus;
  createdAt: string;
  updatedAt: string;
};

type Visibility = "PUBLIC" | "MEMBERS_ONLY";
type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type Article = {
  id: string;
  ownerId: string;
  slug: string; // unique within owner
  title: string;
  status: ArticleStatus;
  visibility: Visibility;
  content: string; // TipTap JSON string
  excerpt: string;
  outline?: string;
  edition: number;
  readCompleteCount: number;
  tagIds: string[];
  // generation lineage
  claId?: string;
  contentPlanBatchId?: string;
  titleIdeaId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

type Inquiry = {
  id: string;
  ownerId: string;
  senderEmail: string;
  content: string;
  referredArticleId?: string;
  createdAt: string;
};
```

---

## 6. ビジネス要件

### 6.1 プラン設計（例）

- Light: CLA構築 + 月5記事生成
- Pro: フル機能（独自ドメイン、メルマガ、分析、月15記事）
- Executive: 伴走サポート、法人管理、高度なカスタマイズ
