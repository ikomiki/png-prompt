import { describe, it, expect } from "vitest";
import {
  extractTextMetadata,
  extractCompressedTextMetadata,
  extractInternationalTextMetadata,
  extractTimestamp,
  extractPhysicalDimensions,
  extractMetadataFromChunk,
} from "../metadata-extractor";
import { PngUnitSpecifier } from "@/types";

// テスト用のチャンクを作成するヘルパー関数
function createChunk(type: string, data: Uint8Array) {
  return {
    type,
    length: data.length,
    data,
    crc: 0, // テストでは簡略化
  };
}

// 文字列をUint8Arrayに変換するヘルパー
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// null終端文字列を作成するヘルパー
function createNullTerminatedString(str: string): Uint8Array {
  const encoded = stringToUint8Array(str);
  const result = new Uint8Array(encoded.length + 1);
  result.set(encoded);
  result[encoded.length] = 0; // null terminator
  return result;
}

describe("metadata-extractor", () => {
  describe("extractTextMetadata", () => {
    it("should extract valid tEXt metadata", () => {
      const keyword = "Title";
      const text = "My PNG Image";
      
      const keywordBytes = createNullTerminatedString(keyword);
      const textBytes = stringToUint8Array(text);
      
      const data = new Uint8Array(keywordBytes.length + textBytes.length);
      data.set(keywordBytes, 0);
      data.set(textBytes, keywordBytes.length);
      
      const chunk = createChunk("tEXt", data);
      const result = extractTextMetadata(chunk);
      
      expect(result.keyword).toBe(keyword);
      expect(result.text).toBe(text);
      expect(result.languageTag).toBeUndefined();
      expect(result.translatedKeyword).toBeUndefined();
      expect(result.compressed).toBeUndefined();
    });

    it("should throw error for non-tEXt chunk", () => {
      const chunk = createChunk("IHDR", new Uint8Array(13));
      
      expect(() => extractTextMetadata(chunk)).toThrow("Expected tEXt chunk");
    });

    it("should throw error for invalid format", () => {
      // null終端なしのデータ
      const data = stringToUint8Array("TitleWithoutNull");
      const chunk = createChunk("tEXt", data);
      
      expect(() => extractTextMetadata(chunk)).toThrow("Invalid tEXt chunk format");
    });

    it("should throw error for empty keyword", () => {
      const data = new Uint8Array([0, ...stringToUint8Array("text")]);
      const chunk = createChunk("tEXt", data);
      
      expect(() => extractTextMetadata(chunk)).toThrow("Invalid tEXt keyword length");
    });

    it("should throw error for too long keyword", () => {
      const longKeyword = "a".repeat(80); // 79文字を超える
      const keywordBytes = createNullTerminatedString(longKeyword);
      const textBytes = stringToUint8Array("text");
      
      const data = new Uint8Array(keywordBytes.length + textBytes.length);
      data.set(keywordBytes, 0);
      data.set(textBytes, keywordBytes.length);
      
      const chunk = createChunk("tEXt", data);
      
      expect(() => extractTextMetadata(chunk)).toThrow("Invalid tEXt keyword length");
    });

    it("should throw error for invalid keyword characters", () => {
      const keyword = "Title\x01"; // 制御文字を含む
      const keywordBytes = createNullTerminatedString(keyword);
      const textBytes = stringToUint8Array("text");
      
      const data = new Uint8Array(keywordBytes.length + textBytes.length);
      data.set(keywordBytes, 0);
      data.set(textBytes, keywordBytes.length);
      
      const chunk = createChunk("tEXt", data);
      
      expect(() => extractTextMetadata(chunk)).toThrow("Invalid tEXt keyword characters");
    });
  });

  describe("extractCompressedTextMetadata", () => {
    it("should extract valid zTXt metadata", () => {
      const keyword = "Description";
      const text = "A compressed description";
      
      const keywordBytes = createNullTerminatedString(keyword);
      const compressionMethod = new Uint8Array([0]); // compression method 0
      const textBytes = stringToUint8Array(text); // 実際は圧縮データだが、テストでは簡略化
      
      const data = new Uint8Array(keywordBytes.length + compressionMethod.length + textBytes.length);
      data.set(keywordBytes, 0);
      data.set(compressionMethod, keywordBytes.length);
      data.set(textBytes, keywordBytes.length + compressionMethod.length);
      
      const chunk = createChunk("zTXt", data);
      const result = extractCompressedTextMetadata(chunk);
      
      expect(result.keyword).toBe(keyword);
      expect(result.text).toBe(text); // テストでは展開なしで同じ
      expect(result.compressed).toBe(true);
    });

    it("should throw error for non-zTXt chunk", () => {
      const chunk = createChunk("tEXt", new Uint8Array(10));
      
      expect(() => extractCompressedTextMetadata(chunk)).toThrow("Expected zTXt chunk");
    });

    it("should throw error for unsupported compression method", () => {
      const keyword = "Description";
      const keywordBytes = createNullTerminatedString(keyword);
      const compressionMethod = new Uint8Array([1]); // unsupported method
      const textBytes = stringToUint8Array("text");
      
      const data = new Uint8Array(keywordBytes.length + compressionMethod.length + textBytes.length);
      data.set(keywordBytes, 0);
      data.set(compressionMethod, keywordBytes.length);
      data.set(textBytes, keywordBytes.length + compressionMethod.length);
      
      const chunk = createChunk("zTXt", data);
      
      expect(() => extractCompressedTextMetadata(chunk)).toThrow("Unsupported compression method");
    });
  });

  describe("extractInternationalTextMetadata", () => {
    it("should extract valid iTXt metadata", () => {
      const keyword = "Comment";
      const languageTag = "en-US";
      const translatedKeyword = "Comment";
      const text = "International text";
      
      const data = new Uint8Array(1000); // 十分なサイズを確保
      let offset = 0;
      
      // keyword (null-terminated)
      const keywordBytes = stringToUint8Array(keyword);
      data.set(keywordBytes, offset);
      offset += keywordBytes.length;
      data[offset++] = 0; // null terminator
      
      // compression flag
      data[offset++] = 0; // not compressed
      
      // compression method
      data[offset++] = 0;
      
      // language tag (null-terminated)
      const languageBytes = stringToUint8Array(languageTag);
      data.set(languageBytes, offset);
      offset += languageBytes.length;
      data[offset++] = 0; // null terminator
      
      // translated keyword (null-terminated)
      const translatedBytes = stringToUint8Array(translatedKeyword);
      data.set(translatedBytes, offset);
      offset += translatedBytes.length;
      data[offset++] = 0; // null terminator
      
      // text
      const textBytes = stringToUint8Array(text);
      data.set(textBytes, offset);
      offset += textBytes.length;
      
      const actualData = data.subarray(0, offset);
      const chunk = createChunk("iTXt", actualData);
      const result = extractInternationalTextMetadata(chunk);
      
      expect(result.keyword).toBe(keyword);
      expect(result.text).toBe(text);
      expect(result.languageTag).toBe(languageTag);
      expect(result.translatedKeyword).toBe(translatedKeyword);
      expect(result.compressed).toBe(false);
    });

    it("should throw error for non-iTXt chunk", () => {
      const chunk = createChunk("tEXt", new Uint8Array(10));
      
      expect(() => extractInternationalTextMetadata(chunk)).toThrow("Expected iTXt chunk");
    });

    it("should throw error for too short chunk", () => {
      const chunk = createChunk("iTXt", new Uint8Array(3));
      
      expect(() => extractInternationalTextMetadata(chunk)).toThrow("iTXt chunk too short");
    });
  });

  describe("extractTimestamp", () => {
    it("should extract valid tIME metadata", () => {
      const data = new Uint8Array(7);
      const view = new DataView(data.buffer);
      
      // 2024年1月15日 14:30:45
      view.setUint16(0, 2024, false); // year (big-endian)
      view.setUint8(2, 1);            // month
      view.setUint8(3, 15);           // day
      view.setUint8(4, 14);           // hour
      view.setUint8(5, 30);           // minute
      view.setUint8(6, 45);           // second
      
      const chunk = createChunk("tIME", data);
      const result = extractTimestamp(chunk);
      
      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
      expect(result.day).toBe(15);
      expect(result.hour).toBe(14);
      expect(result.minute).toBe(30);
      expect(result.second).toBe(45);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.date.getFullYear()).toBe(2024);
      expect(result.date.getMonth()).toBe(0); // Date.getMonth() は0ベース
      expect(result.date.getDate()).toBe(15);
    });

    it("should throw error for non-tIME chunk", () => {
      const chunk = createChunk("tEXt", new Uint8Array(7));
      
      expect(() => extractTimestamp(chunk)).toThrow("Expected tIME chunk");
    });

    it("should throw error for invalid chunk size", () => {
      const chunk = createChunk("tIME", new Uint8Array(6));
      
      expect(() => extractTimestamp(chunk)).toThrow("Invalid tIME chunk size");
    });

    it("should throw error for invalid month", () => {
      const data = new Uint8Array(7);
      const view = new DataView(data.buffer);
      
      view.setUint16(0, 2024, false);
      view.setUint8(2, 13); // invalid month
      view.setUint8(3, 15);
      view.setUint8(4, 14);
      view.setUint8(5, 30);
      view.setUint8(6, 45);
      
      const chunk = createChunk("tIME", data);
      
      expect(() => extractTimestamp(chunk)).toThrow("Invalid month in tIME chunk");
    });

    it("should throw error for invalid day", () => {
      const data = new Uint8Array(7);
      const view = new DataView(data.buffer);
      
      view.setUint16(0, 2024, false);
      view.setUint8(2, 1);
      view.setUint8(3, 32); // invalid day
      view.setUint8(4, 14);
      view.setUint8(5, 30);
      view.setUint8(6, 45);
      
      const chunk = createChunk("tIME", data);
      
      expect(() => extractTimestamp(chunk)).toThrow("Invalid day in tIME chunk");
    });

    it("should throw error for invalid hour", () => {
      const data = new Uint8Array(7);
      const view = new DataView(data.buffer);
      
      view.setUint16(0, 2024, false);
      view.setUint8(2, 1);
      view.setUint8(3, 15);
      view.setUint8(4, 24); // invalid hour
      view.setUint8(5, 30);
      view.setUint8(6, 45);
      
      const chunk = createChunk("tIME", data);
      
      expect(() => extractTimestamp(chunk)).toThrow("Invalid hour in tIME chunk");
    });
  });

  describe("extractPhysicalDimensions", () => {
    it("should extract valid pHYs metadata", () => {
      const data = new Uint8Array(9);
      const view = new DataView(data.buffer);
      
      view.setUint32(0, 2835, false); // pixels per unit X (big-endian)
      view.setUint32(4, 2835, false); // pixels per unit Y (big-endian)
      view.setUint8(8, 1);            // unit specifier (meter)
      
      const chunk = createChunk("pHYs", data);
      const result = extractPhysicalDimensions(chunk);
      
      expect(result.pixelsPerUnitX).toBe(2835);
      expect(result.pixelsPerUnitY).toBe(2835);
      expect(result.unitSpecifier).toBe(PngUnitSpecifier.METER);
    });

    it("should throw error for non-pHYs chunk", () => {
      const chunk = createChunk("tEXt", new Uint8Array(9));
      
      expect(() => extractPhysicalDimensions(chunk)).toThrow("Expected pHYs chunk");
    });

    it("should throw error for invalid chunk size", () => {
      const chunk = createChunk("pHYs", new Uint8Array(8));
      
      expect(() => extractPhysicalDimensions(chunk)).toThrow("Invalid pHYs chunk size");
    });

    it("should throw error for invalid unit specifier", () => {
      const data = new Uint8Array(9);
      const view = new DataView(data.buffer);
      
      view.setUint32(0, 2835, false);
      view.setUint32(4, 2835, false);
      view.setUint8(8, 2); // invalid unit specifier
      
      const chunk = createChunk("pHYs", data);
      
      expect(() => extractPhysicalDimensions(chunk)).toThrow("Invalid unit specifier");
    });

    it("should throw error for zero pixel density", () => {
      const data = new Uint8Array(9);
      const view = new DataView(data.buffer);
      
      view.setUint32(0, 0, false); // invalid: zero pixels per unit
      view.setUint32(4, 2835, false);
      view.setUint8(8, 1);
      
      const chunk = createChunk("pHYs", data);
      
      expect(() => extractPhysicalDimensions(chunk)).toThrow("Invalid pixel density");
    });
  });

  describe("extractMetadataFromChunk", () => {
    it("should extract tEXt metadata", () => {
      const keyword = "Title";
      const text = "Test Image";
      
      const keywordBytes = createNullTerminatedString(keyword);
      const textBytes = stringToUint8Array(text);
      
      const data = new Uint8Array(keywordBytes.length + textBytes.length);
      data.set(keywordBytes, 0);
      data.set(textBytes, keywordBytes.length);
      
      const chunk = createChunk("tEXt", data);
      const result = extractMetadataFromChunk(chunk);
      
      expect(result).not.toBeNull();
      if (result && "keyword" in result) {
        expect(result.keyword).toBe(keyword);
        expect(result.text).toBe(text);
      }
    });

    it("should extract tIME metadata", () => {
      const data = new Uint8Array(7);
      const view = new DataView(data.buffer);
      
      view.setUint16(0, 2024, false);
      view.setUint8(2, 1);
      view.setUint8(3, 15);
      view.setUint8(4, 14);
      view.setUint8(5, 30);
      view.setUint8(6, 45);
      
      const chunk = createChunk("tIME", data);
      const result = extractMetadataFromChunk(chunk);
      
      expect(result).not.toBeNull();
      if (result && "year" in result) {
        expect(result.year).toBe(2024);
        expect(result.month).toBe(1);
        expect(result.day).toBe(15);
      }
    });

    it("should extract pHYs metadata", () => {
      const data = new Uint8Array(9);
      const view = new DataView(data.buffer);
      
      view.setUint32(0, 2835, false);
      view.setUint32(4, 2835, false);
      view.setUint8(8, 1);
      
      const chunk = createChunk("pHYs", data);
      const result = extractMetadataFromChunk(chunk);
      
      expect(result).not.toBeNull();
      if (result && "pixelsPerUnitX" in result) {
        expect(result.pixelsPerUnitX).toBe(2835);
        expect(result.pixelsPerUnitY).toBe(2835);
        expect(result.unitSpecifier).toBe(PngUnitSpecifier.METER);
      }
    });

    it("should return null for unsupported chunk types", () => {
      const chunk = createChunk("IDAT", new Uint8Array(10));
      const result = extractMetadataFromChunk(chunk);
      
      expect(result).toBeNull();
    });

    it("should return null and log warning for invalid chunk data", () => {
      // スパイを使ってconsole.warnをモック
      const originalWarn = console.warn;
      let warnCalled = false;
      console.warn = () => { warnCalled = true; };
      
      const chunk = createChunk("tEXt", new Uint8Array(3)); // 無効なサイズ
      const result = extractMetadataFromChunk(chunk);
      
      expect(result).toBeNull();
      expect(warnCalled).toBe(true);
      
      console.warn = originalWarn;
    });
  });
});