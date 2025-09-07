import {
  AppError,
  ErrorType,
  FormattedFileSize,
  ByteUnit,
  PngColorType,
  PngUnitSpecifier,
  COLOR_TYPE_NAMES,
  UNIT_NAMES,
} from "@/types/png-metadata";

// ==================== エラー関連ユーティリティ ====================

/**
 * エラーメッセージのマッピング
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.INVALID_FILE_TYPE]: "PNG ファイルを選択してください",
  [ErrorType.FILE_TOO_LARGE]: "ファイルサイズが大きすぎます（100MB以下）",
  [ErrorType.CORRUPTED_FILE]: "ファイルが破損している可能性があります",
  [ErrorType.MEMORY_ERROR]: "ファイルが大きすぎて処理できません",
  [ErrorType.PARSE_ERROR]: "ファイルの解析中にエラーが発生しました",
  [ErrorType.UNKNOWN_ERROR]: "ファイル処理中にエラーが発生しました",
};

/**
 * AppError オブジェクトを作成
 */
export function createAppError(
  type: ErrorType,
  message?: string,
  details?: string
): AppError {
  return {
    type,
    message: message ?? ERROR_MESSAGES[type],
    details,
  };
}

/**
 * エラータイプから日本語メッセージを取得
 */
export function getErrorMessage(type: ErrorType): string {
  return ERROR_MESSAGES[type];
}

// ==================== ファイルサイズ関連ユーティリティ ====================

/**
 * バイト数を読みやすい形式にフォーマット
 */
export function formatFileSize(bytes: number): FormattedFileSize {
  if (bytes === 0) {
    return {
      value: 0,
      unit: ByteUnit.BYTE,
      formatted: "0 B",
    };
  }

  const sizes = [
    { unit: ByteUnit.GIGABYTE, threshold: 1024 * 1024 * 1024 },
    { unit: ByteUnit.MEGABYTE, threshold: 1024 * 1024 },
    { unit: ByteUnit.KILOBYTE, threshold: 1024 },
    { unit: ByteUnit.BYTE, threshold: 1 },
  ];

  for (const size of sizes) {
    if (bytes >= size.threshold) {
      const value = bytes / size.threshold;
      const roundedValue =
        size.unit === ByteUnit.BYTE
          ? Math.round(value)
          : Math.round(value * 10) / 10;

      return {
        value: roundedValue,
        unit: size.unit,
        formatted: `${roundedValue} ${size.unit}`,
      };
    }
  }

  return {
    value: bytes,
    unit: ByteUnit.BYTE,
    formatted: `${bytes} B`,
  };
}

/**
 * ファイルサイズを MB 単位で取得
 */
export function getSizeInMB(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

// ==================== PNG関連ユーティリティ ====================

/**
 * PNGカラータイプの日本語名を取得
 */
export function getColorTypeName(colorType: PngColorType): string {
  return COLOR_TYPE_NAMES[colorType] ?? "不明";
}

/**
 * PNG単位の日本語名を取得
 */
export function getUnitName(unitSpecifier: PngUnitSpecifier): string {
  return UNIT_NAMES[unitSpecifier] ?? "不明";
}

/**
 * PNG圧縮方式の日本語名を取得
 */
export function getCompressionMethodName(compressionMethod: number): string {
  const compressionMethods: Record<number, string> = {
    0: "Deflate (標準)",
  };
  return compressionMethods[compressionMethod] ?? `不明 (${compressionMethod})`;
}

/**
 * PNGフィルター方式の日本語名を取得
 */
export function getFilterMethodName(filterMethod: number): string {
  const filterMethods: Record<number, string> = {
    0: "適応フィルター (標準)",
  };
  return filterMethods[filterMethod] ?? `不明 (${filterMethod})`;
}

/**
 * PNGインターレース方式の日本語名を取得
 */
export function getInterlaceMethodName(interlaceMethod: number): string {
  const interlaceMethods: Record<number, string> = {
    0: "なし (順次スキャン)",
    1: "Adam7インターレース",
  };
  return interlaceMethods[interlaceMethod] ?? `不明 (${interlaceMethod})`;
}

/**
 * ピクセル密度からDPIを計算
 */
export function calculateDPI(
  pixelsPerUnit: number,
  unitSpecifier: PngUnitSpecifier
): number | null {
  if (unitSpecifier === PngUnitSpecifier.METER) {
    // 1メートル = 39.3701インチ
    return Math.round(pixelsPerUnit / 39.3701);
  }
  return null;
}

/**
 * ビット深度とカラータイプからチャンネル数を計算
 */
export function getChannelCount(colorType: PngColorType): number {
  switch (colorType) {
    case PngColorType.GRAYSCALE:
      return 1;
    case PngColorType.RGB:
      return 3;
    case PngColorType.PALETTE:
      return 1;
    case PngColorType.GRAYSCALE_ALPHA:
      return 2;
    case PngColorType.RGBA:
      return 4;
    default:
      return 0;
  }
}

// ==================== 時間関連ユーティリティ ====================

/**
 * 日付を日本語形式でフォーマット
 */
export function formatDateJapanese(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/**
 * 相対時間を日本語で表示
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "たった今";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return formatDateJapanese(date);
  }
}

// ==================== 文字列関連ユーティリティ ====================

/**
 * テキストを指定文字数で切り詰め
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * キーワードをキャメルケースからスペース区切りに変換
 */
export function formatKeyword(keyword: string): string {
  return keyword
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// ==================== バリデーション関連ユーティリティ ====================

/**
 * 安全な文字列かチェック（XSS対策）
 */
export function isSafeString(str: string): boolean {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(str));
}

/**
 * 数値が有効な範囲内かチェック
 */
export function isValidNumber(
  value: number,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER
): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

// ==================== デバッグ関連ユーティリティ ====================

/**
 * 処理時間を測定するヘルパー
 */
export function measureTime<T>(fn: () => T): { result: T; timeMs: number } {
  const start = performance.now();
  const result = fn();
  const timeMs = performance.now() - start;
  return { result, timeMs };
}

/**
 * 非同期処理時間を測定するヘルパー
 */
export async function measureTimeAsync<T>(
  fn: () => Promise<T>
): Promise<{ result: T; timeMs: number }> {
  const start = performance.now();
  const result = await fn();
  const timeMs = performance.now() - start;
  return { result, timeMs };
}

// ==================== クラス名関連ユーティリティ ====================

/**
 * 条件付きクラス名を結合
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
