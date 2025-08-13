import {
  ErrorType,
  FileValidationResult,
  FileValidationOptions,
} from "@/types/png-metadata";
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
 * IHDRチャンクから基本情報を抽出
 */
export function extractIHDRInfo(buffer: ArrayBuffer) {
  const dataView = new DataView(buffer);
  
  // PNG signature (8 bytes) をスキップ
  let offset = 8;
  
  // 最初のチャンク（IHDR）を読み取り
  const ihdrLength = dataView.getUint32(offset);
  offset += 4;
  
  // チャンクタイプを確認 (IHDR = 0x49484452)
  const chunkType = dataView.getUint32(offset);
  if (chunkType !== 0x49484452) {
    throw new Error('Invalid PNG: First chunk is not IHDR');
  }
  offset += 4;
  
  // IHDR データを読み取り
  const width = dataView.getUint32(offset);
  offset += 4;
  const height = dataView.getUint32(offset);
  offset += 4;
  const bitDepth = dataView.getUint8(offset);
  offset += 1;
  const colorType = dataView.getUint8(offset);
  offset += 1;
  const compressionMethod = dataView.getUint8(offset);
  offset += 1;
  const filterMethod = dataView.getUint8(offset);
  offset += 1;
  const interlaceMethod = dataView.getUint8(offset);
  
  return {
    width,
    height,
    bitDepth,
    colorType,
    compressionMethod,
    filterMethod,
    interlaceMethod
  };
}

/**
 * PNGファイルから基本的なチャンク情報を抽出
 */
export function extractBasicPngInfo(buffer: ArrayBuffer) {
  const dataView = new DataView(buffer);
  let offset = 8; // PNG signatureをスキップ
  
  const ihdrInfo = extractIHDRInfo(buffer);
  const textMetadata: Array<{keyword: string, text: string}> = [];
  const otherChunks: Array<{type: string, size: number}> = [];
  
  // 最初のIHDRチャンクをスキップ
  const ihdrLength = dataView.getUint32(offset);
  offset += 4 + 4 + ihdrLength + 4; // length + type + data + crc
  
  // 他のチャンクを読み取り
  while (offset < buffer.byteLength - 12) { // 少なくともIENDチャンクが必要
    try {
      const length = dataView.getUint32(offset);
      offset += 4;
      
      // チャンクタイプを文字列として読み取り
      const typeBytes = new Uint8Array(buffer, offset, 4);
      const type = String.fromCharCode(...typeBytes);
      offset += 4;
      
      if (type === 'IEND') {
        break; // ファイル終端
      }
      
      // tEXtチャンクの場合、テキストメタデータを抽出
      if (type === 'tEXt' && length > 0) {
        const textData = new Uint8Array(buffer, offset, length);
        const nullIndex = textData.findIndex(byte => byte === 0);
        if (nullIndex !== -1) {
          const keyword = String.fromCharCode(...textData.subarray(0, nullIndex));
          const text = String.fromCharCode(...textData.subarray(nullIndex + 1));
          textMetadata.push({ keyword, text });
        }
      } else {
        // その他のチャンク情報を記録
        otherChunks.push({ type, size: length });
      }
      
      offset += length + 4; // data + crc
    } catch (e) {
      // チャンク読み取りエラーの場合は終了
      break;
    }
  }
  
  return {
    basicInfo: ihdrInfo,
    textMetadata,
    otherChunks
  };
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