# PNGメタデータ表示機能 コンポーネント設計

## コンポーネント階層構造

```
App (page.tsx)
├── FileUploader
│   ├── DropZone
│   ├── FileSelectButton
│   └── FileInfo
├── LoadingIndicator
├── ErrorMessage
├── MetadataDisplay
│   ├── BasicInfoCard
│   ├── TextMetadataCard
│   ├── TimestampCard
│   ├── PhysicalDimensionsCard
│   ├── OtherChunksCard
│   └── ExportButton
└── Footer
```

## 個別コンポーネント設計

### 1. App (メインページコンポーネント)

**ファイル**: `src/app/page.tsx`

**責務**:
- アプリケーション全体の状態管理
- ファイル処理のオーケストレーション
- 各コンポーネント間の連携

**状態管理**:
```typescript
interface AppState {
  currentState: AppState;
  selectedFile?: File;
  metadata?: PngMetadata;
  error?: AppError;
  progress?: number;
}
```

**主要メソッド**:
- `handleFileSelect(file: File): void`
- `handleError(error: AppError): void`
- `handleReset(): void`
- `handleExport(format: ExportFormat): void`

---

### 2. FileUploader (ファイルアップロードコンポーネント)

**ファイル**: `src/components/FileUploader.tsx`

**責務**:
- ファイル選択UI の提供
- ドラッグ&ドロップ処理
- ファイル検証

**Props**:
```typescript
interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  currentState: AppState;
  error?: AppError;
  disabled?: boolean;
}
```

**Features**:
- ドラッグ&ドロップエリア
- ファイル選択ボタン
- ファイル形式・サイズの即座検証
- 視覚的フィードバック（ハイライト等）

**イベント**:
- `onDragEnter`, `onDragLeave`, `onDragOver`, `onDrop`
- `onChange` (input[type="file"])

---

### 3. DropZone (ドロップゾーンコンポーネント)

**ファイル**: `src/components/DropZone.tsx`

**責務**:
- ドラッグ&ドロップエリアの表示
- ドロップ状態の視覚的フィードバック

**Props**:
```typescript
interface DropZoneProps {
  onDrop: (files: FileList) => void;
  isDragActive: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}
```

**状態**:
- `isDragOver`: ドラッグ中かどうか
- `isDropValid`: 有効なファイルがドラッグされているか

---

### 4. FileSelectButton (ファイル選択ボタン)

**ファイル**: `src/components/FileSelectButton.tsx`

**責務**:
- ファイル選択ボタンの表示
- ファイル選択ダイアログの起動

**Props**:
```typescript
interface FileSelectButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
}
```

---

### 5. LoadingIndicator (ローディング表示)

**ファイル**: `src/components/LoadingIndicator.tsx`

**責務**:
- ローディング状態の表示
- プログレス表示

**Props**:
```typescript
interface LoadingIndicatorProps {
  message?: string;
  progress?: number;
  isLoading: boolean;
}
```

**表示パターン**:
- スピナーアニメーション
- プログレスバー（進捗がある場合）
- ローディングメッセージ

---

### 6. ErrorMessage (エラーメッセージ)

**ファイル**: `src/components/ErrorMessage.tsx`

**責務**:
- エラー情報の表示
- エラー解消のガイダンス

**Props**:
```typescript
interface ErrorMessageProps {
  error: AppError;
  onClose?: () => void;
  onRetry?: () => void;
}
```

**表示内容**:
- エラーアイコン
- エラーメッセージ
- 解決方法の提示
- 閉じるボタン・再試行ボタン

---

### 7. MetadataDisplay (メタデータ表示)

**ファイル**: `src/components/MetadataDisplay.tsx`

**責務**:
- メタデータ全体の表示管理
- 各カードコンポーネントの配置

**Props**:
```typescript
interface MetadataDisplayProps {
  metadata: PngMetadata;
  enableExport?: boolean;
  onExport?: (format: ExportFormat) => void;
}
```

**レイアウト**:
- グリッドレイアウトによるカード配置
- レスポンシブ対応
- 折りたたみ可能なセクション

---

### 8. BasicInfoCard (基本情報カード)

**ファイル**: `src/components/BasicInfoCard.tsx`

**責務**:
- PNG基本情報の表示

**Props**:
```typescript
interface BasicInfoCardProps {
  basicInfo: PngBasicInfo;
}
```

**表示項目**:
- ファイル名
- ファイルサイズ
- 画像サイズ（幅×高さ）
- ビット深度
- カラータイプ

---

### 9. TextMetadataCard (テキストメタデータカード)

**ファイル**: `src/components/TextMetadataCard.tsx`

**責務**:
- テキストメタデータの表示

**Props**:
```typescript
interface TextMetadataCardProps {
  textMetadata: PngTextMetadata[];
}
```

**表示形式**:
- キーワード・値のペア表示
- 長いテキストの折りたたみ
- 言語情報の表示（iTXtの場合）

---

### 10. TimestampCard (タイムスタンプカード)

**ファイル**: `src/components/TimestampCard.tsx`

**責務**:
- タイムスタンプ情報の表示

**Props**:
```typescript
interface TimestampCardProps {
  timestamp: PngTimestamp;
}
```

**表示形式**:
- 日本語フォーマット
- ISO形式も併記
- 相対時間表示（「3日前」など）

---

### 11. PhysicalDimensionsCard (物理的寸法カード)

**ファイル**: `src/components/PhysicalDimensionsCard.tsx`

**責務**:
- 物理的寸法情報の表示

**Props**:
```typescript
interface PhysicalDimensionsCardProps {
  dimensions: PngPhysicalDimensions;
}
```

**表示内容**:
- DPI/DPC 情報
- 印刷サイズの計算・表示

---

### 12. OtherChunksCard (その他チャンク情報)

**ファイル**: `src/components/OtherChunksCard.tsx`

**責務**:
- その他のチャンク情報の表示

**Props**:
```typescript
interface OtherChunksCardProps {
  chunks: PngChunkInfo[];
}
```

**表示形式**:
- チャンクリスト
- チャンクサイズ
- 重要/補助チャンクの区別

---

### 13. ExportButton (エクスポートボタン)

**ファイル**: `src/components/ExportButton.tsx`

**責務**:
- メタデータエクスポート機能

**Props**:
```typescript
interface ExportButtonProps {
  metadata: PngMetadata;
  onExport: (format: ExportFormat) => void;
}
```

**機能**:
- 形式選択ドロップダウン
- エクスポート実行
- ダウンロード処理

---

## 共通コンポーネント

### Card (カードコンテナ)

**ファイル**: `src/components/ui/Card.tsx`

**責務**:
- 統一されたカードスタイル
- 折りたたみ機能

**Props**:
```typescript
interface CardProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
}
```

---

### Button (ボタンコンポーネント)

**ファイル**: `src/components/ui/Button.tsx`

**責務**:
- 統一されたボタンスタイル
- 各種バリエーション

**Props**:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}
```

---

## スタイリング設計

### テーマ設定

**カラーパレット**:
```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-success: #10b981;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-border: #e5e7eb;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### レスポンシブ設計

**ブレイクポイント**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**レイアウトパターン**:
- モバイル: 1カラム
- タブレット: 2カラム
- デスクトップ: 3カラム

---

## アクセシビリティ設計

### 対応項目

1. **キーボードナビゲーション**
   - Tab による移動
   - Enter/Space による操作
   - Escape による閉じる操作

2. **スクリーンリーダー対応**
   - 適切な ARIA ラベル
   - セマンティックHTML
   - 状態変化の通知

3. **視覚的配慮**
   - 十分なコントラスト比
   - フォーカス表示
   - エラー表示の色以外での区別

### ARIA属性例

```typescript
// ドロップゾーンの例
<div
  role="button"
  tabIndex={0}
  aria-label="PNGファイルをドロップするか、クリックしてファイルを選択"
  aria-describedby="dropzone-help"
  onKeyDown={handleKeyDown}
>
```

---

## パフォーマンス最適化

### React最適化

1. **React.memo** の活用
2. **useMemo** / **useCallback** の適切な使用
3. **仮想化** （大量チャンクの表示時）

### バンドルサイズ最適化

1. **Tree shaking** の活用
2. **Dynamic import** による分割
3. **不要依存関係の除去**

### 実行時最適化

1. **Web Workers** の活用（ファイル解析）
2. **RequestAnimationFrame** による UI 更新
3. **適切なキャッシュ戦略**