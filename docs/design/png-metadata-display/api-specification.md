# PNGメタデータ表示機能 API仕様

## 概要

この機能は完全にクライアントサイドで動作し、外部APIは使用しません。
代わりに、内部的に使用するJavaScript関数・メソッドのインターフェースを定義します。

## 内部API仕様

### ファイル検証API

#### `validateFile(file: File, options?: FileValidationOptions): FileValidationResult`

**説明**: PNGファイルの基本的な検証を行う

**パラメータ**:
```typescript
interface FileValidationOptions {
  allowedMimeTypes: string[]; // デフォルト: ['image/png']
  maxFileSize: number;        // デフォルト: 100MB
  checkPngSignature: boolean; // デフォルト: true
}
```

**戻り値**:
```typescript
interface FileValidationResult {
  isValid: boolean;
  error?: AppError;
}
```

**使用例**:
```typescript
const result = validateFile(file, {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  checkPngSignature: true
});

if (!result.isValid) {
  console.error(result.error?.message);
}
```

---

### PNGパーサーAPI

#### `parsePng(file: File, options?: PngParserOptions): Promise<PngParseResult>`

**説明**: PNGファイルを解析してメタデータを抽出する

**パラメータ**:
```typescript
interface PngParserOptions {
  strictMode: boolean;    // デフォルト: false
  maxFileSize: number;    // デフォルト: 100MB
  maxChunks: number;      // デフォルト: 1000
}
```

**戻り値**:
```typescript
interface PngParseResult {
  success: boolean;
  metadata?: PngMetadata;
  error?: AppError;
  processingTime: number;
}
```

**使用例**:
```typescript
try {
  const result = await parsePng(file, { strictMode: true });
  if (result.success && result.metadata) {
    displayMetadata(result.metadata);
  } else {
    handleError(result.error);
  }
} catch (error) {
  handleError(createAppError(ErrorType.UNKNOWN_ERROR, error.message));
}
```

---

### メタデータ抽出API

#### `extractBasicInfo(ihdrChunk: PngChunk): PngBasicInfo`

**説明**: IHDRチャンクから基本情報を抽出

**パラメータ**:
- `ihdrChunk`: IHDR チャンクデータ

**戻り値**: `PngBasicInfo` オブジェクト

---

#### `extractTextMetadata(chunk: PngChunk): PngTextMetadata`

**説明**: tEXt, iTXt, zTXt チャンクからテキストメタデータを抽出

**パラメータ**:
- `chunk`: テキストチャンクデータ

**戻り値**: `PngTextMetadata` オブジェクト

---

#### `extractTimestamp(timeChunk: PngChunk): PngTimestamp`

**説明**: tIME チャンクからタイムスタンプを抽出

**パラメータ**:
- `timeChunk`: tIME チャンクデータ

**戻り値**: `PngTimestamp` オブジェクト

---

#### `extractPhysicalDimensions(physChunk: PngChunk): PngPhysicalDimensions`

**説明**: pHYs チャンクから物理的寸法を抽出

**パラメータ**:
- `physChunk`: pHYs チャンクデータ

**戻り値**: `PngPhysicalDimensions` オブジェクト

---

### ファイル処理API

#### `readFileAsArrayBuffer(file: File): Promise<ArrayBuffer>`

**説明**: ファイルをArrayBufferとして読み込む

**パラメータ**:
- `file`: 読み込むファイル

**戻り値**: `Promise<ArrayBuffer>`

**使用例**:
```typescript
const buffer = await readFileAsArrayBuffer(file);
const dataView = new DataView(buffer);
```

---

#### `verifyPngSignature(buffer: ArrayBuffer): boolean`

**説明**: PNG ファイルのシグネチャを検証

**パラメータ**:
- `buffer`: ファイルのArrayBuffer

**戻り値**: 有効なPNGシグネチャかどうか

---

### チャンク処理API

#### `readChunk(dataView: DataView, offset: number): { chunk: PngChunk, nextOffset: number }`

**説明**: 指定されたオフセットからPNGチャンクを読み取る

**パラメータ**:
- `dataView`: ファイルデータのDataView
- `offset`: 読み取り開始オフセット

**戻り値**: チャンクデータと次のオフセット

---

#### `validateChunkCrc(chunk: PngChunk): boolean`

**説明**: チャンクのCRCを検証

**パラメータ**:
- `chunk`: 検証するチャンク

**戻り値**: CRCが正しいかどうか

---

### エクスポートAPI

#### `exportMetadata(metadata: PngMetadata, options: ExportOptions): string`

**説明**: メタデータを指定された形式でエクスポート

**パラメータ**:
```typescript
interface ExportOptions {
  format: ExportFormat;           // JSON, CSV, TEXT
  includeBasicInfo: boolean;
  includeTextMetadata: boolean;
  includeTimestamp: boolean;
  includePhysicalDimensions: boolean;
  includeOtherChunks: boolean;
}
```

**戻り値**: エクスポートされた文字列

**使用例**:
```typescript
const exportedData = exportMetadata(metadata, {
  format: ExportFormat.JSON,
  includeBasicInfo: true,
  includeTextMetadata: true,
  includeTimestamp: true,
  includePhysicalDimensions: true,
  includeOtherChunks: false
});

// ファイルダウンロード
downloadFile(exportedData, 'metadata.json', 'application/json');
```

---

#### `downloadFile(content: string, filename: string, mimeType: string): void`

**説明**: ブラウザでファイルダウンロードを実行

**パラメータ**:
- `content`: ダウンロードするコンテンツ
- `filename`: ファイル名
- `mimeType`: MIMEタイプ

---

### ユーティリティAPI

#### `formatFileSize(bytes: number): FormattedFileSize`

**説明**: バイト数を読みやすい形式にフォーマット

**パラメータ**:
- `bytes`: バイト数

**戻り値**: フォーマット済みのファイルサイズ

**使用例**:
```typescript
const formatted = formatFileSize(1048576);
// { value: 1, unit: 'MB', formatted: '1.0 MB' }
```

---

#### `createAppError(type: ErrorType, message: string, details?: string): AppError`

**説明**: アプリケーションエラーオブジェクトを作成

**パラメータ**:
- `type`: エラータイプ
- `message`: エラーメッセージ
- `details`: 詳細情報（オプション）

**戻り値**: `AppError` オブジェクト

---

#### `getColorTypeName(colorType: PngColorType): string`

**説明**: カラータイプの表示名を取得

**パラメータ**:
- `colorType`: PNGカラータイプ

**戻り値**: 日本語の表示名

---

## エラーハンドリング

### エラータイプ一覧

```typescript
enum ErrorType {
  INVALID_FILE_TYPE = 'invalid_file_type',      // 無効なファイル形式
  FILE_TOO_LARGE = 'file_too_large',            // ファイルサイズ超過
  CORRUPTED_FILE = 'corrupted_file',            // ファイル破損
  MEMORY_ERROR = 'memory_error',                // メモリ不足
  PARSE_ERROR = 'parse_error',                  // パースエラー
  UNKNOWN_ERROR = 'unknown_error',              // 不明なエラー
}
```

### エラーメッセージマッピング

```typescript
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.INVALID_FILE_TYPE]: 'PNG ファイルを選択してください',
  [ErrorType.FILE_TOO_LARGE]: 'ファイルサイズが大きすぎます（100MB以下）',
  [ErrorType.CORRUPTED_FILE]: 'ファイルが破損している可能性があります',
  [ErrorType.MEMORY_ERROR]: 'ファイルが大きすぎて処理できません',
  [ErrorType.PARSE_ERROR]: 'ファイルの解析中にエラーが発生しました',
  [ErrorType.UNKNOWN_ERROR]: 'ファイル処理中にエラーが発生しました',
};
```

## パフォーマンス考慮事項

### 非同期処理
- ファイル読み込み: `Promise` ベース
- メタデータ解析: `async/await` パターン
- UI更新: React の状態管理

### メモリ管理
- 大きなArrayBufferの適切な解放
- チャンク処理時の中間データクリーンアップ
- メタデータオブジェクトの効率的な構築

### プログレス表示
```typescript
interface ProgressCallback {
  (progress: number, message: string): void;
}

// 使用例
parsePng(file, options, (progress, message) => {
  updateProgressUI(progress, message);
});
```