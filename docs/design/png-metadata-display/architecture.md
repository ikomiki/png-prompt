# PNG メタデータ表示機能 アーキテクチャ設計

## システム概要

PNGファイルのメタデータを表示するクライアントサイドWebアプリケーション。ユーザーがPNGファイルを選択すると、ブラウザ内でファイルを解析し、メタデータを抽出して表示する。

## アーキテクチャパターン

- **パターン**: Client-Side SPA (Single Page Application)
- **理由**: 
  - セキュリティ要件（ファイルを外部に送信しない）
  - パフォーマンス要件（3秒以内の処理）
  - シンプルな機能要件に適している

## コンポーネント構成

### フロントエンド
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **状態管理**: React useState/useReducer
- **スタイリング**: Tailwind CSS
- **ファイル処理**: Web APIs (File API, ArrayBuffer)
- **PNG解析**: カスタムPNGパーサー

### 主要コンポーネント

```
src/
├── app/
│   ├── page.tsx              # メインページ
│   ├── layout.tsx           # レイアウト
│   └── globals.css          # グローバルスタイル
├── components/
│   ├── FileUploader.tsx     # ファイル選択・D&D
│   ├── MetadataDisplay.tsx  # メタデータ表示
│   ├── LoadingIndicator.tsx # ローディング表示
│   └── ErrorMessage.tsx     # エラー表示
├── lib/
│   ├── png-parser.ts        # PNGファイル解析
│   ├── metadata-extractor.ts # メタデータ抽出
│   └── file-validator.ts    # ファイル検証
└── types/
    └── png-metadata.ts      # 型定義
```

## 技術スタック

### 必須ライブラリ
- **Next.js 14**: Reactフレームワーク
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング

### PNG解析ライブラリの選択肢
1. **自前実装**: PNG仕様に基づく独自パーサー
2. **png-js**: 軽量PNGライブラリ
3. **pngjs**: Node.js用だがブラウザでも利用可能

**推奨**: 自前実装（要件に特化、依存関係最小化）

## セキュリティ設計

### データ保護
- ファイルデータはメモリ内でのみ処理
- 外部APIへの送信なし
- ローカルストレージへの保存なし

### 入力検証
- ファイル形式の厳密チェック
- ファイルサイズ制限（100MB）
- PNGシグネチャ検証
- チャンクサイズ検証

## パフォーマンス設計

### 最適化戦略
- **ストリーミング処理**: 大ファイルの段階的読み込み
- **Web Workers**: メタデータ解析の非同期処理
- **メモリ管理**: 不要なArrayBufferの適切な解放
- **プログレッシブ表示**: チャンク単位での結果表示

### 処理フロー最適化
1. ファイルシグネチャ検証（即座）
2. 基本情報抽出（IHDR チャンク）
3. メタデータチャンク抽出（tEXt, iTXt等）
4. 段階的UI更新

## 互換性設計

### ブラウザサポート
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### 必要なWeb API
- File API
- ArrayBuffer
- FileReader
- Drag and Drop API

### フォールバック戦略
- Web Workers未サポート時はメインスレッド処理
- File API未サポート時は警告表示

## エラーハンドリング設計

### エラー分類
1. **ファイル形式エラー**: PNG以外のファイル
2. **破損ファイルエラー**: 不正なPNG構造
3. **サイズエラー**: ファイルサイズ制限超過
4. **メモリエラー**: ブラウザメモリ不足

### エラー表示戦略
- ユーザーフレンドリーなメッセージ
- 日本語での説明
- 修正方法の提示（可能な場合）

## デプロイメント設計

### 静的サイト生成
- Next.js Static Export
- CDN配信対応
- キャッシュ戦略

### 環境設定
- 開発環境: Next.js Dev Server
- 本番環境: Static Files
- ブランチプレビュー: Vercel/Netlify