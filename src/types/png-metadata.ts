// PNG メタデータ表示機能 TypeScript型定義

// ==================== 基本型定義 ====================

/**
 * PNGファイルの基本情報
 */
export interface PngBasicInfo {
  /** ファイル名 */
  fileName: string;
  /** ファイルサイズ（バイト） */
  fileSize: number;
  /** 画像幅（ピクセル） */
  width: number;
  /** 画像高さ（ピクセル） */
  height: number;
  /** ビット深度 */
  bitDepth: number;
  /** カラータイプ */
  colorType: PngColorType;
  /** 圧縮方式 */
  compressionMethod: number;
  /** フィルター方式 */
  filterMethod: number;
  /** インターレース方式 */
  interlaceMethod: number;
}

/**
 * PNGカラータイプ列挙型
 */
export enum PngColorType {
  GRAYSCALE = 0,
  RGB = 2,
  PALETTE = 3,
  GRAYSCALE_ALPHA = 4,
  RGBA = 6,
}

/**
 * PNGカラータイプの表示名マッピング
 */
export const COLOR_TYPE_NAMES: Record<PngColorType, string> = {
  [PngColorType.GRAYSCALE]: "グレースケール",
  [PngColorType.RGB]: "RGB",
  [PngColorType.PALETTE]: "パレット",
  [PngColorType.GRAYSCALE_ALPHA]: "グレースケール + Alpha",
  [PngColorType.RGBA]: "RGBA",
};

// ==================== メタデータ型定義 ====================

/**
 * テキストメタデータ
 */
export interface PngTextMetadata {
  /** キーワード */
  keyword: string;
  /** テキスト内容 */
  text: string;
  /** 言語タグ（iTXtの場合） */
  languageTag?: string;
  /** 翻訳されたキーワード（iTXtの場合） */
  translatedKeyword?: string;
  /** 圧縮フラグ（iTXtの場合） */
  compressed?: boolean;
}

/**
 * タイムスタンプメタデータ
 */
export interface PngTimestamp {
  /** 年 */
  year: number;
  /** 月 */
  month: number;
  /** 日 */
  day: number;
  /** 時 */
  hour: number;
  /** 分 */
  minute: number;
  /** 秒 */
  second: number;
  /** Date オブジェクト */
  date: Date;
}

/**
 * 物理的ピクセル寸法
 */
export interface PngPhysicalDimensions {
  /** X軸のピクセル密度 */
  pixelsPerUnitX: number;
  /** Y軸のピクセル密度 */
  pixelsPerUnitY: number;
  /** 単位種別 */
  unitSpecifier: PngUnitSpecifier;
}

/**
 * PNG単位種別
 */
export enum PngUnitSpecifier {
  UNKNOWN = 0,
  METER = 1,
}

/**
 * PNG単位の表示名
 */
export const UNIT_NAMES: Record<PngUnitSpecifier, string> = {
  [PngUnitSpecifier.UNKNOWN]: "未指定",
  [PngUnitSpecifier.METER]: "メートル",
};

/**
 * その他のチャンク情報
 */
export interface PngChunkInfo {
  /** チャンクタイプ */
  type: string;
  /** チャンクサイズ */
  size: number;
  /** チャンクの説明 */
  description?: string;
  /** チャンクが重要かどうか */
  critical: boolean;
}

/**
 * 完全なPNGメタデータ
 */
export interface PngMetadata {
  /** 基本情報 */
  basicInfo: PngBasicInfo;
  /** テキストメタデータ配列 */
  textMetadata: PngTextMetadata[];
  /** タイムスタンプ */
  timestamp?: PngTimestamp;
  /** 物理的寸法 */
  physicalDimensions?: PngPhysicalDimensions;
  /** その他のチャンク */
  otherChunks: PngChunkInfo[];
}

// ==================== UI状態管理型定義 ====================

/**
 * アプリケーションの状態
 */
export enum AppState {
  IDLE = "idle",
  FILE_SELECTED = "file_selected",
  VALIDATING = "validating",
  LOADING = "loading",
  PARSING = "parsing",
  DISPLAYING_RESULTS = "displaying_results",
  EXPORTING = "exporting",
  VALIDATION_ERROR = "validation_error",
  PARSING_ERROR = "parsing_error",
}

/**
 * エラータイプ
 */
export enum ErrorType {
  INVALID_FILE_TYPE = "invalid_file_type",
  FILE_TOO_LARGE = "file_too_large",
  CORRUPTED_FILE = "corrupted_file",
  MEMORY_ERROR = "memory_error",
  PARSE_ERROR = "parse_error",
  UNKNOWN_ERROR = "unknown_error",
}

/**
 * エラー情報
 */
export interface AppError {
  /** エラータイプ */
  type: ErrorType;
  /** エラーメッセージ */
  message: string;
  /** 詳細エラー情報 */
  details?: string;
}

/**
 * アプリケーションの状態管理
 */
export interface AppStateManager {
  /** 現在の状態 */
  currentState: AppState;
  /** 選択されたファイル */
  selectedFile?: File;
  /** 解析済みメタデータ */
  metadata?: PngMetadata;
  /** エラー情報 */
  error?: AppError;
  /** ローディングプログレス */
  progress?: number;
}

// ==================== UI コンポーネント Props ====================

/**
 * ファイルアップローダーコンポーネントのProps
 */
export interface FileUploaderProps {
  /** ファイル選択時のコールバック */
  onFileSelect: (file: File) => void;
  /** 現在の状態 */
  currentState: AppState;
  /** エラー情報 */
  error?: AppError;
  /** アップロード可能かどうか */
  disabled?: boolean;
}

/**
 * メタデータ表示コンポーネントのProps
 */
export interface MetadataDisplayProps {
  /** 表示するメタデータ */
  metadata: PngMetadata;
  /** エクスポート機能を有効にするか */
  enableExport?: boolean;
  /** エクスポート時のコールバック */
  onExport?: (format: ExportFormat) => void;
}

/**
 * ローディング表示コンポーネントのProps
 */
export interface LoadingIndicatorProps {
  /** ローディングメッセージ */
  message?: string;
  /** プログレス値（0-100） */
  progress?: number;
  /** ローディング状態 */
  isLoading: boolean;
}

/**
 * エラーメッセージコンポーネントのProps
 */
export interface ErrorMessageProps {
  /** エラー情報 */
  error: AppError;
  /** エラー閉じる時のコールバック */
  onClose?: () => void;
  /** 再試行コールバック */
  onRetry?: () => void;
}

// ==================== エクスポート関連型定義 ====================

/**
 * エクスポート形式
 */
export enum ExportFormat {
  JSON = "json",
  CSV = "csv",
  TEXT = "text",
}

/**
 * エクスポート設定
 */
export interface ExportOptions {
  /** エクスポート形式 */
  format: ExportFormat;
  /** 基本情報を含めるか */
  includeBasicInfo: boolean;
  /** テキストメタデータを含めるか */
  includeTextMetadata: boolean;
  /** タイムスタンプを含めるか */
  includeTimestamp: boolean;
  /** 物理的寸法を含めるか */
  includePhysicalDimensions: boolean;
  /** その他のチャンクを含めるか */
  includeOtherChunks: boolean;
}

// ==================== PNG パーサー関連型定義 ====================

/**
 * PNGチャンク
 */
export interface PngChunk {
  /** チャンクの長さ */
  length: number;
  /** チャンクタイプ */
  type: string;
  /** チャンクデータ */
  data: Uint8Array;
  /** CRC */
  crc: number;
}

/**
 * PNG パーサーの設定
 */
export interface PngParserOptions {
  /** 厳密モード（エラーを厳しくチェック） */
  strictMode: boolean;
  /** 最大ファイルサイズ（バイト） */
  maxFileSize: number;
  /** 解析する最大チャンク数 */
  maxChunks: number;
}

/**
 * PNG パーサーの結果
 */
export interface PngParseResult {
  /** 解析成功フラグ */
  success: boolean;
  /** メタデータ */
  metadata?: PngMetadata;
  /** エラー情報 */
  error?: AppError;
  /** 処理時間（ミリ秒） */
  processingTime: number;
}

// ==================== ファイル検証関連型定義 ====================

/**
 * ファイル検証結果
 */
export interface FileValidationResult {
  /** 検証成功フラグ */
  isValid: boolean;
  /** エラー情報（検証失敗時） */
  error?: AppError;
}

/**
 * ファイル検証設定
 */
export interface FileValidationOptions {
  /** 許可するMIMEタイプ */
  allowedMimeTypes: string[];
  /** 最大ファイルサイズ（バイト） */
  maxFileSize: number;
  /** PNGシグネチャをチェックするか */
  checkPngSignature: boolean;
}

// ==================== ユーティリティ型定義 ====================

/**
 * バイトサイズの単位
 */
export enum ByteUnit {
  BYTE = "B",
  KILOBYTE = "KB",
  MEGABYTE = "MB",
  GIGABYTE = "GB",
}

/**
 * フォーマット済みファイルサイズ
 */
export interface FormattedFileSize {
  /** 数値部分 */
  value: number;
  /** 単位 */
  unit: ByteUnit;
  /** フォーマット済み文字列 */
  formatted: string;
}

/**
 * デバッグ情報
 */
export interface DebugInfo {
  /** パース開始時刻 */
  parseStartTime: number;
  /** パース終了時刻 */
  parseEndTime: number;
  /** 処理されたチャンク数 */
  chunksProcessed: number;
  /** 読み取ったバイト数 */
  bytesRead: number;
  /** エラー詳細 */
  errorDetails?: string;
}