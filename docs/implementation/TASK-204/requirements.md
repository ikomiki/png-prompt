# TASK-204: エクスポート機能要件定義

## 概要

PNGメタデータを複数の形式（JSON、CSV、テキスト）でエクスポートする機能を実装する。ユーザーがメタデータを他のアプリケーションで利用できるよう、標準的な形式でデータを提供する。

## 機能要件

### REQ-EXPORT-001: JSON形式エクスポート
- PngMetadata型の完全なJSON表現を生成する
- 日付オブジェクトをISO 8601形式の文字列に変換する
- ファイル名に現在日時を含める（例：metadata_20240315_143022.json）
- データ構造を保持したプログラム間連携用途

### REQ-EXPORT-002: CSV形式エクスポート
- メタデータを表形式のCSV形式で出力する
- 基本情報、テキストメタデータ、タイムスタンプ、物理的寸法を含む
- エクセル等のスプレッドシート アプリケーション対応
- UTF-8 BOM付きエンコーディング（日本語対応）

### REQ-EXPORT-003: テキスト形式エクスポート
- 人間が読みやすい形式のプレーンテキスト
- 各セクション（基本情報、テキスト等）を明確に分離
- 技術的詳細を含む完全な情報表示
- レポート作成やドキュメント用途

### REQ-EXPORT-004: エクスポート形式選択UI
- ドロップダウンメニューによる形式選択
- 各形式の特徴と用途を説明する tooltip
- エクスポート実行ボタン
- プログレス表示（大容量データ時）

### REQ-EXPORT-005: ファイルダウンロード処理
- ブラウザの標準ダウンロード機能を利用
- 適切なMIMEタイプとファイル拡張子の設定
- 日本語ファイル名の適切な処理
- ダウンロード完了時の成功通知

### REQ-EXPORT-006: データ整合性保証
- エクスポート前のデータ検証
- 無効データの適切な処理（null/undefinedの処理）
- 特殊文字のエスケープ処理
- データサイズ制限チェック

## 非機能要件

### NFR-EXPORT-001: パフォーマンス
- 大容量メタデータ（10MB以上）の効率的な処理
- プログレス表示による用户体验向上
- メモリ使用量の最適化
- ブロッキングUI の防止

### NFR-EXPORT-002: 互換性
- 主要ブラウザでの動作保証（Chrome、Firefox、Safari、Edge）
- 各形式の標準仕様準拠
- 他のアプリケーションでの読み込み保証
- 文字エンコーディングの適切な処理

### NFR-EXPORT-003: セキュリティ
- XSS攻撃の防止（ファイル名、データ内容）
- 機密情報の意図しない露出防止
- クライアントサイド処理（サーバー送信なし）
- データサニタイゼーション

### NFR-EXPORT-004: アクセシビリティ
- キーボードによる操作可能
- スクリーンリーダー対応
- 高コントラスト表示対応
- 操作フィードバックの提供

## コンポーネント構成

### ExportButton（メインコンポーネント）
```typescript
interface ExportButtonProps {
  /** エクスポート対象のメタデータ */
  metadata: PngMetadata;
  /** 利用可能なエクスポート形式 */
  availableFormats?: ExportFormat[];
  /** エクスポート実行中状態 */
  isExporting?: boolean;
  /** エクスポート完了時のコールバック */
  onExportComplete?: (format: ExportFormat, success: boolean) => void;
  /** 追加のCSSクラス */
  className?: string;
  /** ボタンを無効化するか */
  disabled?: boolean;
}
```

### ExportFormatSelector（フォーマット選択）
```typescript
interface ExportFormatSelectorProps {
  /** 現在選択されている形式 */
  selectedFormat: ExportFormat;
  /** 形式変更時のコールバック */
  onFormatChange: (format: ExportFormat) => void;
  /** 利用可能な形式 */
  availableFormats: ExportFormat[];
  /** 各形式の説明を表示するか */
  showDescriptions?: boolean;
}
```

### ExportProgressIndicator（進行状況表示）
```typescript
interface ExportProgressIndicatorProps {
  /** 進行状況（0-100） */
  progress: number;
  /** 現在の処理段階 */
  stage: ExportStage;
  /** 処理中かどうか */
  isActive: boolean;
  /** キャンセル可能か */
  canCancel?: boolean;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
}
```

## データ形式仕様

### JSON形式
```json
{
  "exportInfo": {
    "exportDate": "2024-03-15T14:30:22.123Z",
    "format": "json",
    "version": "1.0"
  },
  "basicInfo": {
    "fileName": "sample.png",
    "fileSize": 1234567,
    "width": 1920,
    "height": 1080,
    "bitDepth": 8,
    "colorType": 2,
    "colorTypeName": "RGB",
    "compressionMethod": 0,
    "filterMethod": 0,
    "interlaceMethod": 0
  },
  "textMetadata": [
    {
      "keyword": "Title",
      "text": "Sample Image",
      "languageTag": null,
      "translatedKeyword": null,
      "compressed": false
    }
  ],
  "timestamp": {
    "year": 2024,
    "month": 1,
    "day": 15,
    "hour": 14,
    "minute": 30,
    "second": 45,
    "iso8601": "2024-01-15T14:30:45.000Z"
  },
  "physicalDimensions": {
    "pixelsPerUnitX": 2835,
    "pixelsPerUnitY": 2835,
    "unitSpecifier": 1,
    "unitName": "meter",
    "dpi": 72,
    "printSizeCm": {
      "width": 67.8,
      "height": 38.1
    }
  },
  "otherChunks": [
    {
      "type": "IDAT",
      "size": 1000000,
      "description": "Image Data - 画像データ",
      "critical": true
    }
  ]
}
```

### CSV形式
```csv
セクション,項目,値,単位,説明
基本情報,ファイル名,sample.png,,
基本情報,ファイルサイズ,1234567,bytes,1.2 MB
基本情報,画像幅,1920,pixels,
基本情報,画像高さ,1080,pixels,
基本情報,ビット深度,8,bits,
基本情報,カラータイプ,2,,RGB
基本情報,圧縮方式,0,,
基本情報,フィルター方式,0,,
基本情報,インターレース,0,,
テキスト,Title,Sample Image,,tEXt chunk
テキスト,Author,John Doe,,tEXt chunk
日時,作成年,2024,,
日時,作成月,1,,
日時,作成日,15,,
日時,作成時,14,,
日時,作成分,30,,
日時,作成秒,45,,
物理寸法,X軸密度,2835,pixels/meter,
物理寸法,Y軸密度,2835,pixels/meter,
物理寸法,DPI,72,dots/inch,
物理寸法,印刷幅,67.8,cm,
物理寸法,印刷高さ,38.1,cm,
チャンク,IDAT,1000000,bytes,Image Data - Critical
チャンク,gAMA,4,bytes,Gamma - Ancillary
```

### テキスト形式
```
PNG メタデータレポート
生成日時: 2024-03-15 14:30:22 JST
========================================

■ 基本情報
ファイル名: sample.png
ファイルサイズ: 1.2 MB (1,234,567 bytes)
画像寸法: 1920 × 1080 pixels
色深度・タイプ: 8-bit RGB (True Color)
圧縮方式: 0 (deflate)
フィルター方式: 0 (adaptive)
インターレース: 0 (none)

■ テキストメタデータ
Title: Sample Image
Author: John Doe
Description: A sample PNG image with metadata (圧縮済み)
Comment: 国際化テキストサンプル (ja-JP, 翻訳: コメント)

■ 作成日時
日時: 2024年1月15日 14:30:45 UTC
相対時間: 2ヶ月前

■ 物理的寸法
ピクセル密度: 2835 × 2835 pixels/meter
DPI: 72 × 72 dots/inch
印刷サイズ: 67.8 × 38.1 cm (26.7 × 15.0 inches)

■ その他チャンク
IDAT    1.0 MB (Critical)   - Image Data - 画像データ
gAMA    4 bytes (Ancillary) - Gamma - ガンマ値
cHRM    32 bytes (Ancillary)- Chromaticities - 色度情報

========================================
総チャンク数: 3
合計データサイズ: 1.0 MB
```

## UI/UX要件

### 視覚的デザイン
- **主要操作**: 目立つ「エクスポート」ボタン
- **形式選択**: 分かりやすいドロップダウンメニュー
- **進行表示**: プログレスバーとステージ表示
- **フィードバック**: 成功・エラー通知

### インタラクション設計
- **2ステップ操作**: 形式選択 → エクスポート実行
- **確認ダイアログ**: 大容量データ時の警告表示
- **キャンセル機能**: 長時間処理のキャンセル
- **再試行機能**: エラー時の再実行

### レスポンシブ対応
- **モバイル**: 縦配置の選択・実行UI
- **デスクトップ**: 横配置の効率的レイアウト
- **タッチ**: 大きなタッチターゲット

## エラーハンドリング

### データエラー
- **不完全データ**: 部分的な情報でもエクスポート続行
- **無効値**: デフォルト値での置き換え
- **文字エンコーディング**: UTF-8での安全な処理

### システムエラー
- **メモリ不足**: 分割処理による対応
- **ブラウザ制限**: 制限内でのデータ調整
- **ダウンロード失敗**: 再試行オプション提供

### ユーザーエラー
- **不適切な操作**: 明確なエラーメッセージ
- **キャンセル**: 状態の適切なリセット
- **重複実行**: 実行中の重複防止

## 受け入れ基準

### AC-EXPORT-001: JSON形式エクスポート
- [ ] PngMetadata の完全なJSON表現が生成される
- [ ] 日付がISO 8601形式で出力される
- [ ] ファイル名に現在日時が含まれる
- [ ] 他のアプリケーションで読み込み可能

### AC-EXPORT-002: CSV形式エクスポート
- [ ] スプレッドシート アプリケーションで読み込み可能
- [ ] UTF-8 BOMで日本語が正しく表示される
- [ ] 表形式での構造化データ出力
- [ ] セクション分けが明確

### AC-EXPORT-003: テキスト形式エクスポート
- [ ] 人間が読みやすい形式で出力される
- [ ] 全ての情報が含まれる
- [ ] セクション分けが明確
- [ ] 日本語が適切に表示される

### AC-EXPORT-004: UI操作性
- [ ] 形式選択が直感的
- [ ] エクスポート実行が明確
- [ ] 進行状況が分かりやすい
- [ ] 完了通知が適切

### AC-EXPORT-005: パフォーマンス
- [ ] 大容量データでも快適に動作
- [ ] プログレス表示でユーザー体験良好
- [ ] メモリ使用量が適切
- [ ] UIがブロックされない

### AC-EXPORT-006: エラーハンドリング
- [ ] エラー時の適切なメッセージ表示
- [ ] 部分データでもエクスポート続行
- [ ] 再試行機能が動作
- [ ] キャンセル機能が動作

## テストケース

### 形式別テスト
1. JSON形式の正確性検証
2. CSV形式のスプレッドシート互換性
3. テキスト形式の可読性確認
4. 各形式のファイルサイズ最適化

### データパターンテスト
1. 完全なメタデータセット
2. 部分的なメタデータセット
3. 空のメタデータセット
4. 大容量テキストデータ
5. 特殊文字・多言語データ

### UI/UXテスト
1. 形式選択操作
2. エクスポート実行操作
3. 進行表示確認
4. エラー状態確認
5. キャンセル操作確認

### パフォーマンステスト
1. 大容量データエクスポート時間
2. メモリ使用量測定
3. UI応答性確認
4. 複数形式連続エクスポート

### 統合テスト
1. MetadataDisplay からのエクスポート
2. 実際のPNGファイルデータエクスポート
3. ブラウザ間互換性確認
4. ファイルダウンロード確認