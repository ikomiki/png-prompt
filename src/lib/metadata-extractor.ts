import {
  PngChunk,
  PngTextMetadata,
  PngTimestamp,
  PngPhysicalDimensions,
  PngUnitSpecifier,
  ErrorType,
} from "@/types";
import { createAppError } from "./utils";

/**
 * 文字列をnull終端で分割
 */
function splitNullTerminated(data: Uint8Array, maxSplits = 1): Uint8Array[] {
  const result: Uint8Array[] = [];
  let start = 0;
  let splits = 0;

  for (let i = 0; i < data.length && splits < maxSplits; i++) {
    if (data[i] === 0) {
      result.push(data.subarray(start, i));
      start = i + 1;
      splits++;
    }
  }

  // 残りの部分を追加
  if (start < data.length) {
    result.push(data.subarray(start));
  }

  return result;
}

/**
 * Uint8ArrayをUTF-8文字列に変換
 */
function uint8ArrayToString(data: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
  } catch {
    // UTF-8としてデコードできない場合、Latin-1として試行
    return new TextDecoder("latin-1").decode(data);
  }
}

/**
 * zlib形式のデータを展開
 * 注意: ブラウザ環境ではzlibの実装が制限されているため、
 * 簡易的な実装またはpolyfillが必要
 */
function inflateZlib(data: Uint8Array): Uint8Array {
  // TODO: 実際のzlib実装が必要
  // 現在は簡易的にそのまま返す（テスト用）
  // 本格的な実装では pako.js などの使用を検討
  console.warn("zlib decompression not implemented, returning raw data");
  return data;
}

/**
 * tEXt チャンクからテキストメタデータを抽出
 */
export function extractTextMetadata(chunk: PngChunk): PngTextMetadata {
  if (chunk.type !== "tEXt") {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Expected tEXt chunk"
    );
  }

  const parts = splitNullTerminated(chunk.data, 1);
  
  if (parts.length !== 2) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid tEXt chunk format"
    );
  }

  const keywordPart = parts[0];
  const textPart = parts[1];
  
  if (!keywordPart || !textPart) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid tEXt chunk format"
    );
  }

  const keyword = uint8ArrayToString(keywordPart);
  const text = uint8ArrayToString(textPart);

  // キーワードの妥当性チェック
  if (keyword.length === 0 || keyword.length > 79) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid tEXt keyword length"
    );
  }

  // キーワードは ASCII 文字のみ
  if (!/^[\x20-\x7E]+$/.test(keyword)) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid tEXt keyword characters"
    );
  }

  return {
    keyword,
    text,
  };
}

/**
 * zTXt チャンクから圧縮テキストメタデータを抽出
 */
export function extractCompressedTextMetadata(chunk: PngChunk): PngTextMetadata {
  if (chunk.type !== "zTXt") {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Expected zTXt chunk"
    );
  }

  const parts = splitNullTerminated(chunk.data, 1);
  
  if (parts.length !== 2) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid zTXt chunk format"
    );
  }

  const keywordPart = parts[0];
  const compressedDataPart = parts[1];
  
  if (!keywordPart || !compressedDataPart) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid zTXt chunk format"
    );
  }

  const keyword = uint8ArrayToString(keywordPart);
  const compressedData = compressedDataPart;

  // キーワードの妥当性チェック
  if (keyword.length === 0 || keyword.length > 79) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid zTXt keyword length"
    );
  }

  if (!/^[\x20-\x7E]+$/.test(keyword)) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid zTXt keyword characters"
    );
  }

  // 圧縮メソッドをチェック（現在は0のみサポート）
  if (compressedData.length === 0 || compressedData[0] !== 0) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Unsupported compression method in zTXt chunk"
    );
  }

  try {
    // 圧縮データを展開
    const decompressedData = inflateZlib(compressedData.subarray(1));
    const text = uint8ArrayToString(decompressedData);

    return {
      keyword,
      text,
      compressed: true,
    };
  } catch (error) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Failed to decompress zTXt chunk",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * iTXt チャンクから国際化テキストメタデータを抽出
 */
export function extractInternationalTextMetadata(chunk: PngChunk): PngTextMetadata {
  if (chunk.type !== "iTXt") {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Expected iTXt chunk"
    );
  }

  if (chunk.data.length < 5) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "iTXt chunk too short"
    );
  }

  let offset = 0;
  const data = chunk.data;

  // キーワードを読み取り（null終端）
  const keywordEnd = data.indexOf(0, offset);
  if (keywordEnd === -1) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid iTXt chunk: keyword not terminated"
    );
  }

  const keyword = uint8ArrayToString(data.subarray(offset, keywordEnd));
  offset = keywordEnd + 1;

  // キーワードの妥当性チェック
  if (keyword.length === 0 || keyword.length > 79) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid iTXt keyword length"
    );
  }

  if (!/^[\x20-\x7E]+$/.test(keyword)) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid iTXt keyword characters"
    );
  }

  // 圧縮フラグを読み取り
  if (offset >= data.length) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid iTXt chunk: missing compression flag"
    );
  }

  const compressionFlag = data[offset];
  const compressed = compressionFlag === 1;
  offset++;

  // 圧縮メソッドを読み取り
  if (offset >= data.length) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid iTXt chunk: missing compression method"
    );
  }

  const compressionMethod = data[offset];
  if (compressed && compressionMethod !== 0) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Unsupported compression method in iTXt chunk"
    );
  }
  offset++;

  // 言語タグを読み取り（null終端）
  const languageEnd = data.indexOf(0, offset);
  if (languageEnd === -1) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid iTXt chunk: language tag not terminated"
    );
  }

  const languageTag = uint8ArrayToString(data.subarray(offset, languageEnd));
  offset = languageEnd + 1;

  // 翻訳されたキーワードを読み取り（null終端）
  const translatedKeywordEnd = data.indexOf(0, offset);
  if (translatedKeywordEnd === -1) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid iTXt chunk: translated keyword not terminated"
    );
  }

  const translatedKeyword = uint8ArrayToString(data.subarray(offset, translatedKeywordEnd));
  offset = translatedKeywordEnd + 1;

  // テキストを読み取り
  const textData = data.subarray(offset);
  let text: string;

  try {
    if (compressed) {
      const decompressedData = inflateZlib(textData);
      text = uint8ArrayToString(decompressedData);
    } else {
      text = uint8ArrayToString(textData);
    }
  } catch (error) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Failed to process iTXt text data",
      error instanceof Error ? error.message : String(error)
    );
  }

  return {
    keyword,
    text,
    languageTag: languageTag || undefined,
    translatedKeyword: translatedKeyword || undefined,
    compressed,
  };
}

/**
 * tIME チャンクからタイムスタンプを抽出
 */
export function extractTimestamp(chunk: PngChunk): PngTimestamp {
  if (chunk.type !== "tIME") {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Expected tIME chunk"
    );
  }

  if (chunk.data.length !== 7) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid tIME chunk size"
    );
  }

  const data = chunk.data;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  const year = view.getUint16(0, false); // ビッグエンディアン
  const month = view.getUint8(2);
  const day = view.getUint8(3);
  const hour = view.getUint8(4);
  const minute = view.getUint8(5);
  const second = view.getUint8(6);

  // 妥当性チェック
  if (month < 1 || month > 12) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid month in tIME chunk"
    );
  }

  if (day < 1 || day > 31) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid day in tIME chunk"
    );
  }

  if (hour > 23) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid hour in tIME chunk"
    );
  }

  if (minute > 59) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid minute in tIME chunk"
    );
  }

  if (second > 60) { // 60は閏秒を考慮
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid second in tIME chunk"
    );
  }

  try {
    const date = new Date(year, month - 1, day, hour, minute, second);
    
    // 無効な日付をチェック
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      date,
    };
  } catch (error) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Failed to create date from tIME chunk",
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * pHYs チャンクから物理的ピクセル寸法を抽出
 */
export function extractPhysicalDimensions(chunk: PngChunk): PngPhysicalDimensions {
  if (chunk.type !== "pHYs") {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Expected pHYs chunk"
    );
  }

  if (chunk.data.length !== 9) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid pHYs chunk size"
    );
  }

  const data = chunk.data;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  const pixelsPerUnitX = view.getUint32(0, false); // ビッグエンディアン
  const pixelsPerUnitY = view.getUint32(4, false); // ビッグエンディアン
  const unitSpecifier = view.getUint8(8);

  // 単位種別の妥当性チェック
  if (unitSpecifier !== PngUnitSpecifier.UNKNOWN && unitSpecifier !== PngUnitSpecifier.METER) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid unit specifier in pHYs chunk"
    );
  }

  // ピクセル密度の妥当性チェック
  if (pixelsPerUnitX === 0 || pixelsPerUnitY === 0) {
    throw createAppError(
      ErrorType.PARSE_ERROR,
      "Invalid pixel density in pHYs chunk"
    );
  }

  return {
    pixelsPerUnitX,
    pixelsPerUnitY,
    unitSpecifier: unitSpecifier as PngUnitSpecifier,
  };
}

/**
 * チャンクタイプに基づいてメタデータを抽出
 */
export function extractMetadataFromChunk(chunk: PngChunk): PngTextMetadata | PngTimestamp | PngPhysicalDimensions | null {
  try {
    switch (chunk.type) {
      case "tEXt":
        return extractTextMetadata(chunk);
      
      case "zTXt":
        return extractCompressedTextMetadata(chunk);
      
      case "iTXt":
        return extractInternationalTextMetadata(chunk);
      
      case "tIME":
        return extractTimestamp(chunk);
      
      case "pHYs":
        return extractPhysicalDimensions(chunk);
      
      default:
        // サポートしていないチャンクタイプ
        return null;
    }
  } catch (error) {
    // エラーが発生した場合はログに記録してnullを返す
    console.warn(`Failed to extract metadata from ${chunk.type} chunk:`, error);
    return null;
  }
}