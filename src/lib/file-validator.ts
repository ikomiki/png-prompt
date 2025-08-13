import {
  ErrorType,
  FileValidationResult,
  FileValidationOptions,
} from "@/types";
import { createAppError } from "./utils";

/**
 * PNG ファイルシグネチャ（最初の8バイト）
 */
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

/**
 * デフォルトのファイル検証オプション
 */
const DEFAULT_VALIDATION_OPTIONS: FileValidationOptions = {
  allowedMimeTypes: ["image/png"],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  checkPngSignature: true,
};

/**
 * ファイルの基本検証（MIME type、サイズ）
 */
export function validateFile(
  file: File,
  options: Partial<FileValidationOptions> = {}
): FileValidationResult {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

  // MIME type チェック
  if (!opts.allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: createAppError(
        ErrorType.INVALID_FILE_TYPE,
        "PNG ファイルを選択してください"
      ),
    };
  }

  // ファイルサイズチェック
  if (file.size > opts.maxFileSize) {
    const maxSizeMB = Math.round(opts.maxFileSize / (1024 * 1024));
    return {
      isValid: false,
      error: createAppError(
        ErrorType.FILE_TOO_LARGE,
        `ファイルサイズが大きすぎます（${maxSizeMB}MB以下）`
      ),
    };
  }

  // 0バイトファイルチェック
  if (file.size === 0) {
    return {
      isValid: false,
      error: createAppError(
        ErrorType.CORRUPTED_FILE,
        "ファイルが空です"
      ),
    };
  }

  return { isValid: true };
}

/**
 * PNG シグネチャの検証
 */
export function verifyPngSignature(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < PNG_SIGNATURE.length) {
    return false;
  }

  const header = new Uint8Array(buffer, 0, PNG_SIGNATURE.length);
  
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (header[i] !== PNG_SIGNATURE[i]) {
      return false;
    }
  }

  return true;
}

/**
 * ファイルをArrayBufferとして読み込み
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };

    reader.onerror = () => {
      reject(new Error("File reading failed"));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * 完全なファイル検証（シグネチャ含む）
 */
export async function validatePngFile(
  file: File,
  options: Partial<FileValidationOptions> = {}
): Promise<FileValidationResult> {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

  // 基本検証
  const basicValidation = validateFile(file, opts);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // PNG シグネチャ検証（有効な場合）
  if (opts.checkPngSignature) {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      
      if (!verifyPngSignature(buffer)) {
        return {
          isValid: false,
          error: createAppError(
            ErrorType.CORRUPTED_FILE,
            "有効なPNGファイルではありません"
          ),
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: createAppError(
          ErrorType.PARSE_ERROR,
          "ファイルの読み込みに失敗しました",
          error instanceof Error ? error.message : String(error)
        ),
      };
    }
  }

  return { isValid: true };
}

/**
 * ブラウザがFile APIをサポートしているかチェック
 */
export function isBrowserSupported(): boolean {
  return (
    typeof File !== "undefined" &&
    typeof FileReader !== "undefined" &&
    typeof ArrayBuffer !== "undefined"
  );
}

/**
 * ファイル拡張子の検証
 */
export function validateFileExtension(fileName: string): boolean {
  const extension = fileName.toLowerCase().split(".").pop();
  return extension === "png";
}