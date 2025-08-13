# TASK-301: メインページ統合要件定義

## 概要

PNGメタデータ表示アプリケーションのメインページを実装する。これまでに実装したコンポーネント（FileUploader、MetadataDisplay、ExportButton）を統合し、完全なユーザーワークフローを提供する。

## 機能要件

### REQ-MAIN-001: アプリケーション状態管理
- アプリケーション全体の状態を一元管理する
- ファイル選択、解析、表示、エクスポートの状態遷移を制御する
- エラー状態とリカバリー機能を提供する
- ローディング状態の適切な管理

### REQ-MAIN-002: ファイル処理フロー統合
- ファイル選択 → 検証 → 解析 → 表示の完全なフローを実装
- PNG署名検証とメタデータ抽出の統合
- 大容量ファイルの非同期処理対応
- 処理進行状況の表示

### REQ-MAIN-003: UI状態遷移管理
- 初期状態: ファイル選択UI表示
- ファイル選択後: 処理中表示
- 解析完了後: メタデータ表示 + エクスポート機能
- エラー時: エラーメッセージ + 再試行機能

### REQ-MAIN-004: エラーハンドリング統合
- ファイル検証エラーの統一処理
- パース エラーの適切な表示
- ネットワークエラー（将来の機能拡張用）
- ユーザビリティを重視したエラー回復

### REQ-MAIN-005: レスポンシブレイアウト
- モバイル: 縦スクロール単一カラムレイアウト
- タブレット: 適応的レイアウト
- デスクトップ: 効率的な2-3カラムレイアウト
- 画面サイズに応じた情報密度調整

### REQ-MAIN-006: パフォーマンス最適化
- 大容量PNG（100MB以上）の効率的な処理
- メモリ使用量の最適化
- UI応答性の維持（3秒ルール準拠）
- Web Workersの活用検討

## 非機能要件

### NFR-MAIN-001: ユーザビリティ
- 直感的な操作フロー
- 明確な状態表示
- 適切なフィードバック
- エラーからの容易な回復

### NFR-MAIN-002: アクセシビリティ
- WCAG 2.1 AA準拠
- スクリーンリーダー完全対応
- キーボード操作のみでの完全な機能利用
- 高コントラスト表示対応

### NFR-MAIN-003: パフォーマンス
- 初期ロード: 2秒以内
- ファイル解析: 標準的なPNG（10MB）を3秒以内
- UI応答性: 100ms以内の反応
- メモリ効率: 処理ファイルサイズの2倍以下

### NFR-MAIN-004: 保守性
- 明確なコンポーネント分離
- 状態管理の集約化
- エラー処理の統一化
- テスト容易性の確保

## コンポーネント構成

### MainPage (メインコンポーネント)
```typescript
interface MainPageProps {
  /** 初期状態（テスト用） */
  initialState?: AppState;
  /** デバッグモード */
  debugMode?: boolean;
}

interface MainPageState {
  /** 現在のアプリケーション状態 */
  appState: AppState;
  /** 選択されたファイル */
  selectedFile: File | null;
  /** 解析済みメタデータ */
  metadata: PngMetadata | null;
  /** 現在のエラー */
  error: AppError | null;
  /** 処理進行状況 */
  progress: ProcessingProgress;
}
```

### ProcessingProgress (処理進行管理)
```typescript
interface ProcessingProgress {
  /** 全体の進行状況（0-100） */
  overall: number;
  /** 現在のステージ */
  stage: ProcessingStage;
  /** ステージ別進行状況 */
  stageProgress: number;
  /** 処理開始時刻 */
  startTime: number;
  /** 推定残り時間 */
  estimatedTimeRemaining?: number;
}

enum ProcessingStage {
  FILE_VALIDATION = "file_validation",
  PNG_SIGNATURE_CHECK = "png_signature_check", 
  CHUNK_PARSING = "chunk_parsing",
  METADATA_EXTRACTION = "metadata_extraction",
  UI_RENDERING = "ui_rendering",
  COMPLETED = "completed",
}
```

### AppStateManager (状態管理)
```typescript
interface AppStateManager {
  /** 現在の状態 */
  currentState: AppState;
  /** 状態遷移関数 */
  transitionTo: (newState: AppState, data?: any) => void;
  /** エラー設定 */
  setError: (error: AppError) => void;
  /** エラークリア */
  clearError: () => void;
  /** プログレス更新 */
  updateProgress: (progress: Partial<ProcessingProgress>) => void;
}
```

## 状態遷移仕様

### 状態遷移図
```
IDLE 
  ↓ (ファイル選択)
FILE_SELECTED
  ↓ (検証開始)
VALIDATING
  ↓ (検証成功)
PARSING
  ↓ (解析成功)
DISPLAYING_RESULTS
  ↓ (エクスポート実行)
EXPORTING
  ↓ (完了)
DISPLAYING_RESULTS

エラー時:
任意の状態 → ERROR_STATE → (再試行) → 適切な状態
```

### 状態別UI表示
```typescript
const StateUIMapping = {
  [AppState.IDLE]: <FileUploader />,
  [AppState.FILE_SELECTED]: <FileUploader + ValidatingIndicator />,
  [AppState.VALIDATING]: <ProcessingIndicator stage="validation" />,
  [AppState.PARSING]: <ProcessingIndicator stage="parsing" />,
  [AppState.DISPLAYING_RESULTS]: <MetadataDisplay + ExportButton />,
  [AppState.EXPORTING]: <MetadataDisplay + ExportButton isExporting />,
  [AppState.VALIDATION_ERROR]: <ErrorDisplay + FileUploader />,
  [AppState.PARSING_ERROR]: <ErrorDisplay + RetryButton />,
};
```

## UI/UX要件

### レイアウト構成
```
┌─────────────────────────────────────┐
│ Header (Title + Navigation)         │
├─────────────────────────────────────┤
│ Main Content Area                   │
│ ┌─────────────────────────────────┐ │
│ │ State-dependent Component       │ │
│ │ (FileUploader / MetadataDisplay)│ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Status Bar (Progress / Error)       │
├─────────────────────────────────────┤
│ Footer (Info + Links)               │
└─────────────────────────────────────┘
```

### レスポンシブブレークポイント
- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (adaptive layout)
- **Desktop**: > 1024px (multi-column optimal)
- **Large Desktop**: > 1440px (enhanced spacing)

### 視覚的階層
- **Level 1**: ページタイトル、メイン操作
- **Level 2**: セクションヘッダー、状態表示
- **Level 3**: 詳細情報、補助操作
- **Level 4**: メタ情報、ヘルプテキスト

### カラーシステム
```css
:root {
  /* Primary Colors */
  --color-primary: #2563eb;      /* Blue-600 */
  --color-primary-hover: #1d4ed8; /* Blue-700 */
  
  /* Status Colors */
  --color-success: #059669;      /* Emerald-600 */
  --color-warning: #d97706;      /* Amber-600 */
  --color-error: #dc2626;        /* Red-600 */
  --color-info: #0891b2;         /* Cyan-600 */
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-900: #111827;
}
```

## データフロー仕様

### ファイル処理パイプライン
```typescript
const processingPipeline = async (file: File): Promise<PngMetadata> => {
  // Stage 1: File Validation (10%)
  await validateFile(file);
  updateProgress({ stage: ProcessingStage.FILE_VALIDATION, overall: 10 });
  
  // Stage 2: PNG Signature Check (20%)
  await validatePngSignature(file);
  updateProgress({ stage: ProcessingStage.PNG_SIGNATURE_CHECK, overall: 20 });
  
  // Stage 3: Chunk Parsing (70%)
  const chunks = await parseChunks(file, (progress) => {
    updateProgress({ 
      stage: ProcessingStage.CHUNK_PARSING, 
      overall: 20 + (progress * 0.5) 
    });
  });
  
  // Stage 4: Metadata Extraction (90%)
  const metadata = await extractMetadata(chunks);
  updateProgress({ stage: ProcessingStage.METADATA_EXTRACTION, overall: 90 });
  
  // Stage 5: UI Rendering (100%)
  updateProgress({ stage: ProcessingStage.UI_RENDERING, overall: 100 });
  
  return metadata;
};
```

### エラーハンドリングフロー
```typescript
const errorHandlingFlow = {
  FileValidationError: {
    display: "分かりやすいエラーメッセージ",
    recovery: "ファイル再選択",
    logLevel: "warn"
  },
  PngSignatureError: {
    display: "PNGファイルではありません",
    recovery: "適切なPNGファイルを選択",
    logLevel: "info"
  },
  ParseError: {
    display: "ファイル解析に失敗しました",
    recovery: "再試行 または ファイル再選択",
    logLevel: "error"
  },
  MemoryError: {
    display: "ファイルが大きすぎます",
    recovery: "より小さなファイルを選択",
    logLevel: "error"
  }
};
```

## パフォーマンス要件

### 処理時間目標
- **小ファイル** (< 1MB): 1秒以内
- **中ファイル** (1-10MB): 3秒以内
- **大ファイル** (10-100MB): 10秒以内
- **超大ファイル** (> 100MB): 30秒以内 + 進行表示

### メモリ使用量目標
- **基本使用量**: < 50MB
- **ファイル処理中**: ファイルサイズの2倍以下
- **最大使用量**: 500MB（ブラウザ制限考慮）

### 応答性目標
- **UI反応**: < 100ms
- **状態更新**: < 50ms
- **プログレス更新**: 100ms間隔

## セキュリティ要件

### ファイル処理セキュリティ
- **ファイルサイズ制限**: デフォルト100MB、設定可能
- **ファイル形式検証**: PNG署名 + MIME type double check
- **メモリ制限**: 過度なメモリ使用の防止
- **処理時間制限**: 無限ループ防止のタイムアウト

### データプライバシー
- **クライアント側処理**: ファイルをサーバーに送信しない
- **一時データクリア**: ページリロード時のメモリクリア
- **ローカルストレージ**: 機密データの保存なし

## エラーハンドリング仕様

### エラーカテゴリ
1. **ユーザーエラー**: 不適切なファイル選択
2. **システムエラー**: ブラウザ制限、メモリ不足
3. **データエラー**: 破損ファイル、不正フォーマット
4. **ネットワークエラー**: 将来の機能拡張用

### エラー表示パターン
```typescript
const ErrorDisplayPatterns = {
  inline: "フィールド横の小さなエラー表示",
  banner: "ページ上部の目立つエラーバナー", 
  modal: "重要エラー用のモーダル",
  toast: "一時的な通知用トースト"
};
```

## 受け入れ基準

### AC-MAIN-001: 基本ワークフロー
- [ ] ファイル選択 → 解析 → 表示 の完全フローが動作する
- [ ] 各段階で適切な状態表示がされる
- [ ] エラー時に適切な回復オプションが提供される

### AC-MAIN-002: 状態管理
- [ ] 全ての状態遷移が適切に動作する
- [ ] 状態に応じたUI表示が正確である
- [ ] 同時操作の適切な制御ができる

### AC-MAIN-003: パフォーマンス
- [ ] 標準的なPNG（10MB）が3秒以内で処理される
- [ ] UI応答性が常に維持される
- [ ] メモリリークが発生しない

### AC-MAIN-004: エラーハンドリング
- [ ] 全種類のエラーが適切に処理される
- [ ] エラーメッセージが分かりやすい
- [ ] エラー回復が容易である

### AC-MAIN-005: アクセシビリティ
- [ ] スクリーンリーダーで完全に操作できる
- [ ] キーボードのみで全機能を利用できる
- [ ] 高コントラストモードで視認できる

### AC-MAIN-006: レスポンシブデザイン
- [ ] 全デバイスサイズで適切に表示される
- [ ] タッチ操作が快適である
- [ ] 画面回転に適切に対応する

## テストケース概要

### 統合テストケース
1. **完全ワークフロー**: ファイル選択 → 表示 → エクスポート
2. **エラー回復フロー**: エラー発生 → 回復 → 正常処理
3. **大容量ファイル**: パフォーマンス + 進行表示
4. **複数形式ファイル**: 様々なPNGファイルでの動作確認

### パフォーマンステスト
1. **処理時間測定**: 各サイズでの処理時間
2. **メモリ使用量**: 最大メモリ使用量測定
3. **UI応答性**: 処理中のUI操作可能性

### アクセシビリティテスト
1. **スクリーンリーダー**: 完全なワークフロー実行
2. **キーボード操作**: マウス無しでの完全操作
3. **高コントラスト**: 視認性確認

## 実装優先度

### Phase 1: Core Integration (High)
- アプリケーション状態管理
- 基本的なファイル処理フロー
- エラーハンドリング

### Phase 2: UX Enhancement (Medium)
- 進行状況表示
- レスポンシブレイアウト
- アクセシビリティ強化

### Phase 3: Performance Optimization (Low)
- Web Workers integration
- 大容量ファイル最適化
- メモリ管理強化