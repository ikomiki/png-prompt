import {
  PngChunk,
  PngParserOptions,
  PngParseResult,
  PngBasicInfo,
  PngColorType,
  PngTextMetadata,
  PngTimestamp,
  PngPhysicalDimensions,
  ErrorType,
  AppError,
} from "@/types";
import { createAppError, measureTimeAsync } from "./utils";
import { verifyPngSignature } from "./file-validator";

/**
 * PNG ファイルシグネチャ（最初の8バイト）
 */
const PNG_SIGNATURE_LENGTH = 8;

/**
 * デフォルトのPNG パーサーオプション
 */
const DEFAULT_PARSER_OPTIONS: PngParserOptions = {
  strictMode: false,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxChunks: 1000,
};

/**
 * CRC32ルックアップテーブル
 */
let crcTable: number[] | null = null;

/**
 * CRC32ルックアップテーブルを生成
 */
function makeCrcTable(): number[] {
  if (crcTable !== null) return crcTable;
  
  crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  return crcTable;
}

/**
 * CRC32を計算
 */
function calculateCrc(data: Uint8Array, typeBytes: Uint8Array): number {
  const table = makeCrcTable();
  let crc = 0xffffffff;
  
  // チャンクタイプをCRCに含める
  for (let i = 0; i < typeBytes.length; i++) {
    const value = table[(crc ^ typeBytes[i]!) & 0xff];
    if (value !== undefined) {
      crc = value ^ (crc >>> 8);
    }
  }
  
  // チャンクデータをCRCに含める
  for (let i = 0; i < data.length; i++) {
    const value = table[(crc ^ data[i]!) & 0xff];
    if (value !== undefined) {
      crc = value ^ (crc >>> 8);
    }
  }
  
  return crc ^ 0xffffffff;
}

/**
 * DataViewから32bit整数を読み取り（ビッグエンディアン）
 */
function readUint32BE(view: DataView, offset: number): number {
  return view.getUint32(offset, false); // false = ビッグエンディアン
}

/**
 * DataViewから16bit整数を読み取り（ビッグエンディアン）
 * 現在は未使用だが、将来的な拡張のために保持
 */
// function readUint16BE(view: DataView, offset: number): number {
//   return view.getUint16(offset, false); // false = ビッグエンディアン
// }

/**
 * DataViewから8bit整数を読み取り
 */
function readUint8(view: DataView, offset: number): number {
  return view.getUint8(offset);
}

/**
 * チャンクタイプを文字列に変換
 */
function chunkTypeToString(typeBytes: Uint8Array): string {
  return String.fromCharCode(...typeBytes);
}

/**
 * PNGチャンクを読み取る
 */
export function readChunk(
  dataView: DataView,
  offset: number
): { chunk: PngChunk; nextOffset: number } {
  // 最低限のチャンクサイズをチェック（長さ4 + タイプ4 + CRC4 = 12バイト）
  if (offset + 12 > dataView.byteLength) {
    throw new Error("Unexpected end of file while reading chunk header");
  }

  // チャンクの長さを読み取り
  const length = readUint32BE(dataView, offset);
  
  // チャンクサイズの妥当性チェック
  if (length > 0x7fffffff) {
    throw new Error("Invalid chunk length");
  }

  // チャンクタイプを読み取り
  const typeBytes = new Uint8Array(dataView.buffer, dataView.byteOffset + offset + 4, 4);
  const type = chunkTypeToString(typeBytes);

  // チャンクデータを読み取り
  const dataOffset = offset + 8;
  if (dataOffset + length + 4 > dataView.byteLength) {
    throw new Error("Unexpected end of file while reading chunk data");
  }

  const data = new Uint8Array(dataView.buffer, dataView.byteOffset + dataOffset, length);

  // CRCを読み取り
  const crcOffset = dataOffset + length;
  const crc = readUint32BE(dataView, crcOffset);

  const chunk: PngChunk = {
    length,
    type,
    data,
    crc,
  };

  const nextOffset = crcOffset + 4;

  return { chunk, nextOffset };
}

/**
 * チャンクのCRCを検証
 */
export function validateChunkCrc(chunk: PngChunk): boolean {
  const typeBytes = new TextEncoder().encode(chunk.type);
  const calculatedCrc = calculateCrc(chunk.data, typeBytes);
  return calculatedCrc === chunk.crc;
}

/**
 * IHDRチャンクから基本情報を抽出
 */
export function extractBasicInfo(ihdrChunk: PngChunk, fileName: string, fileSize: number): PngBasicInfo {
  if (ihdrChunk.type !== "IHDR") {
    throw new Error("Expected IHDR chunk");
  }

  if (ihdrChunk.data.length !== 13) {
    throw new Error("Invalid IHDR chunk size");
  }

  const view = new DataView(ihdrChunk.data.buffer, ihdrChunk.data.byteOffset, ihdrChunk.data.byteLength);

  const width = readUint32BE(view, 0);
  const height = readUint32BE(view, 4);
  const bitDepth = readUint8(view, 8);
  const colorType = readUint8(view, 9);
  const compressionMethod = readUint8(view, 10);
  const filterMethod = readUint8(view, 11);
  const interlaceMethod = readUint8(view, 12);

  // 基本的な妥当性チェック
  if (width === 0 || height === 0) {
    throw new Error("Invalid image dimensions");
  }

  if (![1, 2, 4, 8, 16].includes(bitDepth)) {
    throw new Error("Invalid bit depth");
  }

  if (![0, 2, 3, 4, 6].includes(colorType)) {
    throw new Error("Invalid color type");
  }

  // カラータイプとビット深度の組み合わせチェック
  if (colorType === PngColorType.PALETTE && ![1, 2, 4, 8].includes(bitDepth)) {
    throw new Error("Invalid bit depth for palette color type");
  }

  if ([PngColorType.RGB, PngColorType.GRAYSCALE_ALPHA, PngColorType.RGB_ALPHA].includes(colorType) && 
      ![8, 16].includes(bitDepth)) {
    throw new Error("Invalid bit depth for color type");
  }

  return {
    fileName,
    fileSize,
    width,
    height,
    bitDepth,
    colorType: colorType as PngColorType,
    compressionMethod,
    filterMethod,
    interlaceMethod,
  };
}

/**
 * チャンクが重要（critical）かどうかを判定
 */
function isChunkCritical(chunkType: string): boolean {
  // 最初の文字が大文字なら重要チャンク
  return chunkType.charAt(0) === chunkType.charAt(0).toUpperCase();
}

/**
 * チャンクの説明を取得
 */
function getChunkDescription(chunkType: string): string {
  const descriptions: Record<string, string> = {
    IHDR: "Image Header - 画像の基本情報",
    PLTE: "Palette - パレット情報",
    IDAT: "Image Data - 画像データ",
    IEND: "Image End - 画像終了マーカー",
    tRNS: "Transparency - 透明度情報",
    cHRM: "Chromaticity - 色度情報",
    gAMA: "Gamma - ガンマ値",
    iCCP: "ICC Profile - ICCプロファイル",
    sBIT: "Significant Bits - 有効ビット数",
    sRGB: "sRGB - sRGB色空間",
    tEXt: "Text - テキスト情報",
    zTXt: "Compressed Text - 圧縮テキスト",
    iTXt: "International Text - 国際化テキスト",
    bKGD: "Background - 背景色",
    hIST: "Histogram - ヒストグラム",
    pHYs: "Physical Dimensions - 物理的寸法",
    sPLT: "Suggested Palette - 推奨パレット",
    tIME: "Time Stamp - タイムスタンプ",
  };

  return descriptions[chunkType] || `Unknown chunk (${chunkType})`;
}

/**
 * PNG ファイルを解析
 */
export async function parsePng(
  file: File,
  options: Partial<PngParserOptions> = {}
): Promise<PngParseResult> {
  const opts = { ...DEFAULT_PARSER_OPTIONS, ...options };

  const { result, timeMs } = await measureTimeAsync(async () => {
    try {
      // ファイルサイズチェック
      if (file.size > opts.maxFileSize) {
        throw createAppError(
          ErrorType.FILE_TOO_LARGE,
          `ファイルサイズが大きすぎます（${Math.round(opts.maxFileSize / (1024 * 1024))}MB以下）`
        );
      }

      // ファイルを読み込み
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error("ファイルの読み込みに失敗しました"));
        reader.readAsArrayBuffer(file);
      });

      // PNG シグネチャを検証
      if (!verifyPngSignature(buffer)) {
        throw createAppError(
          ErrorType.CORRUPTED_FILE,
          "有効なPNGファイルではありません"
        );
      }

      const dataView = new DataView(buffer);
      let offset = PNG_SIGNATURE_LENGTH;
      const chunks: PngChunk[] = [];
      let ihdrChunk: PngChunk | null = null;

      // チャンクを順次読み取り
      while (offset < dataView.byteLength) {
        if (chunks.length >= opts.maxChunks) {
          throw createAppError(
            ErrorType.PARSE_ERROR,
            `チャンク数が上限（${opts.maxChunks}）を超えました`
          );
        }

        const { chunk, nextOffset } = readChunk(dataView, offset);

        // 厳密モードではCRCを検証
        if (opts.strictMode && !validateChunkCrc(chunk)) {
          throw createAppError(
            ErrorType.CORRUPTED_FILE,
            `チャンク ${chunk.type} のCRCが不正です`
          );
        }

        chunks.push(chunk);

        // IHDRチャンクを保存
        if (chunk.type === "IHDR") {
          if (ihdrChunk) {
            throw createAppError(
              ErrorType.CORRUPTED_FILE,
              "複数のIHDRチャンクが見つかりました"
            );
          }
          ihdrChunk = chunk;
        }

        // IENDチャンクで終了
        if (chunk.type === "IEND") {
          break;
        }

        offset = nextOffset;
      }

      // IHDRチャンクが必須
      if (!ihdrChunk) {
        throw createAppError(
          ErrorType.CORRUPTED_FILE,
          "IHDRチャンクが見つかりません"
        );
      }

      // 基本情報を抽出
      const basicInfo = extractBasicInfo(ihdrChunk, file.name, file.size);

      // その他のチャンク情報を作成
      const otherChunks = chunks
        .filter(chunk => chunk.type !== "IHDR")
        .map(chunk => ({
          type: chunk.type,
          size: chunk.length,
          description: getChunkDescription(chunk.type),
          critical: isChunkCritical(chunk.type),
        }));

      // メタデータを抽出
      const textMetadata: PngTextMetadata[] = [];
      let timestamp: PngTimestamp | undefined;
      let physicalDimensions: PngPhysicalDimensions | undefined;

      // メタデータ抽出器をインポート（動的インポートでサイクル依存を回避）
      const { extractMetadataFromChunk } = await import("./metadata-extractor");

      for (const chunk of chunks) {
        const metadata = extractMetadataFromChunk(chunk);
        
        if (metadata) {
          if ("keyword" in metadata) {
            // テキストメタデータ
            textMetadata.push(metadata);
          } else if ("year" in metadata) {
            // タイムスタンプ
            timestamp = metadata;
          } else if ("pixelsPerUnitX" in metadata) {
            // 物理的寸法
            physicalDimensions = metadata;
          }
        }
      }

      return {
        success: true,
        metadata: {
          basicInfo,
          textMetadata,
          timestamp,
          physicalDimensions,
          otherChunks,
        },
      };

    } catch (error) {
      if (error && typeof error === "object" && "type" in error) {
        // AppError の場合
        return {
          success: false,
          error: error as AppError,
        };
      } else {
        // その他のエラー
        return {
          success: false,
          error: createAppError(
            ErrorType.PARSE_ERROR,
            "PNG解析中にエラーが発生しました",
            error instanceof Error ? error.message : String(error)
          ),
        };
      }
    }
  });

  return {
    ...result,
    processingTime: timeMs,
  };
}