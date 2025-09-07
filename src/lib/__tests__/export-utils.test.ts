import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  exportToJSON,
  exportToCSV,
  exportToText,
  downloadFile,
  generateFilename,
} from "../export-utils";
import {
  PngMetadata,
  PngColorType,
  PngUnitSpecifier,
  ExportFormat,
} from "../../types/png-metadata";

describe("Export Utils", () => {
  const mockMetadata: PngMetadata = {
    basicInfo: {
      fileName: "test.png",
      fileSize: 1234567,
      width: 1920,
      height: 1080,
      bitDepth: 8,
      colorType: PngColorType.RGB,
      compressionMethod: 0,
      filterMethod: 0,
      interlaceMethod: 0,
    },
    textMetadata: [
      {
        keyword: "Title",
        text: "Test Image",
      },
      {
        keyword: "Description",
        text: "A test PNG image with metadata",
        compressed: true,
      },
      {
        keyword: "Comment",
        text: "テスト用画像",
        languageTag: "ja-JP",
        translatedKeyword: "コメント",
      },
    ],
    timestamp: {
      year: 2024,
      month: 3,
      day: 15,
      hour: 14,
      minute: 30,
      second: 45,
      date: new Date(Date.UTC(2024, 2, 15, 14, 30, 45)),
    },
    physicalDimensions: {
      pixelsPerUnitX: 2835,
      pixelsPerUnitY: 2835,
      unitSpecifier: PngUnitSpecifier.METER,
    },
    otherChunks: [
      {
        type: "IDAT",
        size: 1000000,
        description: "Image Data - 画像データ",
        critical: true,
      },
      {
        type: "gAMA",
        size: 4,
        description: "Gamma - ガンマ値",
        critical: false,
      },
    ],
  };

  describe("JSON Export", () => {
    test("should export complete metadata as JSON", () => {
      const result = exportToJSON(mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.basicInfo.fileName).toBe("test.png");
      expect(parsed.basicInfo.fileSize).toBe(1234567);
      expect(parsed.textMetadata).toHaveLength(3);
      expect(parsed.timestamp.iso8601).toBe("2024-03-15T14:30:45.000Z");
    });

    test("should handle partial metadata", () => {
      const partialMetadata: PngMetadata = {
        basicInfo: mockMetadata.basicInfo,
        textMetadata: [],
        otherChunks: [],
      };

      const result = exportToJSON(partialMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.basicInfo).toBeDefined();
      expect(parsed.textMetadata).toEqual([]);
      expect(parsed.timestamp).toBeUndefined();
    });

    test("should format dates as ISO 8601", () => {
      const result = exportToJSON(mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp.iso8601).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    test("should include export metadata", () => {
      const result = exportToJSON(mockMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.exportInfo).toBeDefined();
      expect(parsed.exportInfo.format).toBe("json");
      expect(parsed.exportInfo.version).toBe("1.0");
      expect(parsed.exportInfo.exportDate).toBeDefined();
    });

    test("should handle null/undefined values", () => {
      const metadataWithNulls: PngMetadata = {
        ...mockMetadata,
        timestamp: undefined,
        physicalDimensions: undefined,
      };

      const result = exportToJSON(metadataWithNulls);
      const parsed = JSON.parse(result);

      expect(parsed.timestamp).toBeUndefined();
      expect(parsed.physicalDimensions).toBeUndefined();
    });

    test("should escape special characters", () => {
      const specialMetadata: PngMetadata = {
        ...mockMetadata,
        textMetadata: [
          {
            keyword: "Special",
            text: 'Text with "quotes" and \n newlines',
          },
        ],
      };

      const result = exportToJSON(specialMetadata);
      const parsed = JSON.parse(result);

      expect(parsed.textMetadata[0].text).toBe(
        'Text with "quotes" and \n newlines'
      );
    });
  });

  describe("CSV Export", () => {
    test("should generate valid CSV format", () => {
      const result = exportToCSV(mockMetadata);

      expect(result).toContain("セクション,項目,値,単位,説明");
      expect(result).toContain("基本情報,ファイル名,test.png,,");
      expect(result).toContain("テキスト,Title,Test Image,,tEXt chunk");
    });

    test("should include UTF-8 BOM", () => {
      const result = exportToCSV(mockMetadata);

      expect(result.startsWith("\uFEFF")).toBe(true);
    });

    test("should handle Japanese characters", () => {
      const result = exportToCSV(mockMetadata);

      expect(result).toContain("テスト用画像");
      expect(result).toContain("コメント");
    });

    test("should escape CSV special characters", () => {
      const csvSpecialMetadata: PngMetadata = {
        ...mockMetadata,
        textMetadata: [
          {
            keyword: "CSV,Test",
            text: 'Text with "quotes", commas, and\nnewlines',
          },
        ],
      };

      const result = exportToCSV(csvSpecialMetadata);

      expect(result).toContain('"CSV,Test"');
      expect(result).toContain('"Text with ""quotes"", commas, and\nnewlines"');
    });

    test("should organize data by sections", () => {
      const result = exportToCSV(mockMetadata);

      expect(result).toContain("基本情報,");
      expect(result).toContain("テキスト,");
      expect(result).toContain("日時,");
      expect(result).toContain("物理寸法,");
      expect(result).toContain("チャンク,");
    });

    test("should handle empty sections", () => {
      const emptyMetadata: PngMetadata = {
        basicInfo: mockMetadata.basicInfo,
        textMetadata: [],
        otherChunks: [],
      };

      const result = exportToCSV(emptyMetadata);

      expect(result).toContain("基本情報,");
      expect(result).not.toContain("テキスト,");
    });
  });

  describe("Text Export", () => {
    test("should generate readable text format", () => {
      const result = exportToText(mockMetadata);

      expect(result).toContain("PNG メタデータレポート");
      expect(result).toContain("■ 基本情報");
      expect(result).toContain("ファイル名: test.png");
    });

    test("should include section headers", () => {
      const result = exportToText(mockMetadata);

      expect(result).toContain("■ 基本情報");
      expect(result).toContain("■ テキストメタデータ");
      expect(result).toContain("■ 作成日時");
      expect(result).toContain("■ 物理的寸法");
      expect(result).toContain("■ その他チャンク");
    });

    test("should format Japanese text properly", () => {
      const result = exportToText(mockMetadata);

      expect(result).toContain("テスト用画像");
      expect(result).toContain("2024年3月15日");
      expect(result).toContain("画像データ");
    });

    test("should handle multiline text", () => {
      const multilineMetadata: PngMetadata = {
        ...mockMetadata,
        textMetadata: [
          {
            keyword: "Description",
            text: "Line 1\nLine 2\nLine 3",
          },
        ],
      };

      const result = exportToText(multilineMetadata);

      expect(result).toContain("Line 1");
      expect(result).toContain("Line 2");
      expect(result).toContain("Line 3");
    });

    test("should include summary information", () => {
      const result = exportToText(mockMetadata);

      expect(result).toContain("総チャンク数:");
      expect(result).toContain("合計データサイズ:");
    });

    test("should handle missing data gracefully", () => {
      const partialMetadata: PngMetadata = {
        basicInfo: mockMetadata.basicInfo,
        textMetadata: [],
        otherChunks: [],
      };

      const result = exportToText(partialMetadata);

      expect(result).toContain("■ 基本情報");
      expect(result).not.toContain("■ テキストメタデータ");
    });
  });

  describe("File Download", () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn();
    const mockRevokeObjectURL = vi.fn();

    beforeEach(() => {
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;
      mockCreateObjectURL.mockReturnValue("mock-blob-url");
    });

    test("should create download link with correct MIME type", () => {
      const data = "test data";
      const filename = "test.json";
      const mimeType = "application/json";

      downloadFile(data, filename, mimeType);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: mimeType,
        })
      );
    });

    test("should set appropriate filename", () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: "",
        download: "",
        style: { display: "" },
        click: mockClick,
      };

      vi.spyOn(document, "createElement").mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, "appendChild").mockImplementation(
        (node: Node) => node
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(
        (child: Node) => child
      );

      downloadFile("data", "test-file.json", "application/json");

      expect(mockLink.download).toBe("test-file.json");
    });

    test("should trigger browser download", () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: "",
        download: "",
        style: { display: "" },
        click: mockClick,
      };

      vi.spyOn(document, "createElement").mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, "appendChild").mockImplementation(
        (node: Node) => node
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(
        (child: Node) => child
      );

      downloadFile("data", "test.json", "application/json");

      expect(mockClick).toHaveBeenCalled();
    });

    test("should clean up blob URLs", async () => {
      const mockClick = vi.fn();
      const mockLink = {
        href: "",
        download: "",
        style: { display: "" },
        click: mockClick,
      };

      vi.spyOn(document, "createElement").mockReturnValue(
        mockLink as unknown as HTMLAnchorElement
      );
      vi.spyOn(document.body, "appendChild").mockImplementation(
        (node: Node) => node
      );
      vi.spyOn(document.body, "removeChild").mockImplementation(
        (child: Node) => child
      );

      downloadFile("data", "test.json", "application/json");

      // Wait for cleanup timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockRevokeObjectURL).toHaveBeenCalledWith("mock-blob-url");
    });
  });

  describe("Filename Generation", () => {
    test("should generate filename with timestamp", () => {
      const result = generateFilename("metadata", ExportFormat.JSON);

      expect(result).toMatch(/^metadata_\d{8}_\d{6}\.json$/);
    });

    test("should handle different formats", () => {
      const jsonFilename = generateFilename("test", ExportFormat.JSON);
      const csvFilename = generateFilename("test", ExportFormat.CSV);
      const textFilename = generateFilename("test", ExportFormat.TEXT);

      expect(jsonFilename.endsWith(".json")).toBe(true);
      expect(csvFilename.endsWith(".csv")).toBe(true);
      expect(textFilename.endsWith(".txt")).toBe(true);
    });

    test("should handle Japanese characters", () => {
      const result = generateFilename("メタデータ", ExportFormat.JSON);

      expect(result).toContain("メタデータ");
      expect(result.endsWith(".json")).toBe(true);
    });
  });
});
