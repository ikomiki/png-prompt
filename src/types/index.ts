// PNG メタデータ表示機能 型定義の統合エクスポート

// 基本型定義
export type {
  PngBasicInfo,
  PngTextMetadata,
  PngTimestamp,
  PngPhysicalDimensions,
  PngChunkInfo,
  PngMetadata,
} from "./png-metadata";

// 列挙型
export {
  PngColorType,
  PngUnitSpecifier,
  AppState,
  ErrorType,
  ExportFormat,
  ByteUnit,
} from "./png-metadata";

// 定数
export { COLOR_TYPE_NAMES, UNIT_NAMES } from "./png-metadata";

// UI関連型
export type {
  AppError,
  AppStateManager,
  FileUploaderProps,
  MetadataDisplayProps,
  LoadingIndicatorProps,
  ErrorMessageProps,
} from "./png-metadata";

// エクスポート関連型
export type { ExportOptions } from "./png-metadata";

// PNG解析関連型
export type {
  PngChunk,
  PngParserOptions,
  PngParseResult,
} from "./png-metadata";

// ファイル検証関連型
export type {
  FileValidationResult,
  FileValidationOptions,
} from "./png-metadata";

// ユーティリティ型
export type {
  FormattedFileSize,
  DebugInfo,
} from "./png-metadata";