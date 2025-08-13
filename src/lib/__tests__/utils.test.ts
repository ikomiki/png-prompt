import { describe, it, expect } from "vitest";
import {
  createAppError,
  getErrorMessage,
  formatFileSize,
  getSizeInMB,
  getColorTypeName,
  getUnitName,
  calculateDPI,
  getChannelCount,
  formatDateJapanese,
  getRelativeTime,
  truncateText,
  formatKeyword,
  isSafeString,
  isValidNumber,
  measureTime,
  cn,
} from "../utils";
import {
  ErrorType,
  PngColorType,
  PngUnitSpecifier,
  ByteUnit,
} from "@/types";

describe("utils", () => {
  describe("エラー関連", () => {
    it("createAppError should create error with default message", () => {
      const error = createAppError(ErrorType.INVALID_FILE_TYPE);
      expect(error.type).toBe(ErrorType.INVALID_FILE_TYPE);
      expect(error.message).toBe("PNG ファイルを選択してください");
      expect(error.details).toBeUndefined();
    });

    it("createAppError should create error with custom message", () => {
      const error = createAppError(
        ErrorType.PARSE_ERROR,
        "カスタムエラー",
        "詳細情報"
      );
      expect(error.type).toBe(ErrorType.PARSE_ERROR);
      expect(error.message).toBe("カスタムエラー");
      expect(error.details).toBe("詳細情報");
    });

    it("getErrorMessage should return correct message", () => {
      expect(getErrorMessage(ErrorType.FILE_TOO_LARGE)).toBe(
        "ファイルサイズが大きすぎます（100MB以下）"
      );
    });
  });

  describe("ファイルサイズ関連", () => {
    it("formatFileSize should format bytes correctly", () => {
      expect(formatFileSize(0)).toEqual({
        value: 0,
        unit: ByteUnit.BYTE,
        formatted: "0 B",
      });

      expect(formatFileSize(500)).toEqual({
        value: 500,
        unit: ByteUnit.BYTE,
        formatted: "500 B",
      });

      expect(formatFileSize(1024)).toEqual({
        value: 1,
        unit: ByteUnit.KILOBYTE,
        formatted: "1 KB",
      });

      expect(formatFileSize(1536)).toEqual({
        value: 1.5,
        unit: ByteUnit.KILOBYTE,
        formatted: "1.5 KB",
      });

      expect(formatFileSize(1024 * 1024)).toEqual({
        value: 1,
        unit: ByteUnit.MEGABYTE,
        formatted: "1 MB",
      });

      expect(formatFileSize(1024 * 1024 * 1024)).toEqual({
        value: 1,
        unit: ByteUnit.GIGABYTE,
        formatted: "1 GB",
      });
    });

    it("getSizeInMB should calculate MB correctly", () => {
      expect(getSizeInMB(1024 * 1024)).toBe(1);
      expect(getSizeInMB(1536 * 1024)).toBe(1.5);
      expect(getSizeInMB(0)).toBe(0);
    });
  });

  describe("PNG関連", () => {
    it("getColorTypeName should return correct names", () => {
      expect(getColorTypeName(PngColorType.RGB)).toBe("RGB");
      expect(getColorTypeName(PngColorType.GRAYSCALE)).toBe("グレースケール");
      expect(getColorTypeName(PngColorType.RGB_ALPHA)).toBe("RGBA");
      expect(getColorTypeName(99 as PngColorType)).toBe("不明");
    });

    it("getUnitName should return correct names", () => {
      expect(getUnitName(PngUnitSpecifier.METER)).toBe("メートル");
      expect(getUnitName(PngUnitSpecifier.UNKNOWN)).toBe("未指定");
      expect(getUnitName(99 as PngUnitSpecifier)).toBe("不明");
    });

    it("calculateDPI should calculate correctly", () => {
      expect(calculateDPI(2835, PngUnitSpecifier.METER)).toBe(72);
      expect(calculateDPI(3543, PngUnitSpecifier.METER)).toBe(90);
      expect(calculateDPI(1000, PngUnitSpecifier.UNKNOWN)).toBeNull();
    });

    it("getChannelCount should return correct counts", () => {
      expect(getChannelCount(PngColorType.GRAYSCALE)).toBe(1);
      expect(getChannelCount(PngColorType.RGB)).toBe(3);
      expect(getChannelCount(PngColorType.PALETTE)).toBe(1);
      expect(getChannelCount(PngColorType.GRAYSCALE_ALPHA)).toBe(2);
      expect(getChannelCount(PngColorType.RGB_ALPHA)).toBe(4);
      expect(getChannelCount(99 as PngColorType)).toBe(0);
    });
  });

  describe("時間関連", () => {
    it("formatDateJapanese should format date correctly", () => {
      const date = new Date("2024-01-15T10:30:45");
      const formatted = formatDateJapanese(date);
      expect(formatted).toContain("2024年");
      expect(formatted).toContain("1月");
      expect(formatted).toContain("15日");
    });

    it("getRelativeTime should return correct relative time", () => {
      const now = new Date();
      
      // 30秒前
      const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
      expect(getRelativeTime(thirtySecondsAgo)).toBe("たった今");

      // 5分前
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(getRelativeTime(fiveMinutesAgo)).toBe("5分前");

      // 2時間前
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(getRelativeTime(twoHoursAgo)).toBe("2時間前");

      // 3日前
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(getRelativeTime(threeDaysAgo)).toBe("3日前");
    });
  });

  describe("文字列関連", () => {
    it("truncateText should truncate correctly", () => {
      expect(truncateText("短いテキスト", 10)).toBe("短いテキスト");
      expect(truncateText("これは長いテキストです", 8)).toBe("これは長い...");
      expect(truncateText("", 5)).toBe("");
    });

    it("formatKeyword should format camelCase correctly", () => {
      expect(formatKeyword("fileName")).toBe("File Name");
      expect(formatKeyword("imageWidth")).toBe("Image Width");
      expect(formatKeyword("test")).toBe("Test");
      expect(formatKeyword("XMLHttpRequest")).toBe("X M L Http Request");
    });

    it("isSafeString should detect dangerous strings", () => {
      expect(isSafeString("安全な文字列")).toBe(true);
      expect(isSafeString("普通のテキスト")).toBe(true);
      expect(isSafeString("<script>alert('xss')</script>")).toBe(false);
      expect(isSafeString("javascript:alert('xss')")).toBe(false);
      expect(isSafeString('<div onclick="alert()">test</div>')).toBe(false);
      expect(isSafeString("<iframe src='evil'></iframe>")).toBe(false);
    });
  });

  describe("バリデーション関連", () => {
    it("isValidNumber should validate numbers correctly", () => {
      expect(isValidNumber(42)).toBe(true);
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(-1)).toBe(true);
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber(-Infinity)).toBe(false);
      expect(isValidNumber(10, 0, 20)).toBe(true);
      expect(isValidNumber(25, 0, 20)).toBe(false);
      expect(isValidNumber(-5, 0, 20)).toBe(false);
    });
  });

  describe("パフォーマンス関連", () => {
    it("measureTime should measure execution time", () => {
      const { result, timeMs } = measureTime(() => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      expect(result).toBe(499500);
      expect(timeMs).toBeGreaterThanOrEqual(0);
      expect(typeof timeMs).toBe("number");
    });
  });

  describe("CSS関連", () => {
    it("cn should combine class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("class1", null, "class2", undefined, false, "class3")).toBe(
        "class1 class2 class3"
      );
      expect(cn()).toBe("");
      expect(cn(null, undefined, false)).toBe("");
    });
  });
});