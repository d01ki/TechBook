# TechBook — 技術記事を「検索するだけ」で横断収集
複数メディアの技術記事をキーワード検索でまとめて取得し、シンプルに一覧表示する Next.js (App Router) アプリです。

## 特徴
- Zenn / Qiita / はてなブログの RSS を横断して検索
- タイトルに検索ワードを含む記事のみを抽出
- 余計な学習・推薦なし、リンクアウト主体の軽量設計
- フロント/バックとも Next.js 上で完結

## スタック
- Framework: Next.js 14 (App Router) / TypeScript
- UI: React 18, Tailwind CSS, Framer Motion, Lucide Icons
- Data: RSS Parser, Cheerio, date-fns

## クイックスタート
```bash
# 依存関係のインストール
yarn install --frozen-lockfile

# 開発サーバー
yarn dev  # http://localhost:3000

# Lint
yarn lint

# 本番ビルド & 起動
yarn build
yarn start
```

## プロジェクト構造（抜粋）
```
app/
	page.tsx           # トップ/検索ページ
	api/search/route.ts# RSS 検索 API
components/          # UI コンポーネント
lib/                 # RSS 取得・正規化・ユーティリティ
```

## API エンドポイント
- `GET /api/search?q=keyword` : キーワードにマッチする記事を JSON で返却
- `GET /api/trends`           : トレンド取得（実装に応じて）

レスポンス例（簡略）:
```json
{
	"articles": [
		{
			"title": "Next.js 14 新機能",
			"url": "https://example.com",
			"source": "Zenn",
			"publishedAt": "2024-01-01T00:00:00Z"
		}
	]
}
```

## Render でのデプロイ
本リポジトリには `render.yaml` を同梱しています。Render の Blueprint またはサービス設定で以下を指定してください。

- Build Command: `yarn install --frozen-lockfile && yarn build`
- Start Command: `yarn start`
- Environment: Node 20 (`NODE_VERSION=20`)

### 既存サービスに適用する場合
1. Dashboard > Settings > Build & Deploy で上記コマンドを設定
2. Manual Deploy から「Clear build cache & deploy」

### Blueprint で新規デプロイする場合
1. Render で New Blueprint > GitHub リポジトリを選択
2. `render.yaml` に従って自動設定

## 開発メモ
- 検索はタイトルに対する単純フィルタで、学習・推薦ロジックは持ちません。
- 記事本文は保存せず、必ず外部リンクへ誘導します。
- 追加フィルタやソート、履歴保存などは拡張余地として実装可能です。
