import React from "react";
import { render, screen } from "@testing-library/react";
import { MetadataDisplay } from "../MetadataDisplay";
import { PngMetadata, PngColorType, PngUnitSpecifier } from "../../types/png-metadata";

describe("MetadataDisplay", () => {
  const completeMetadata: PngMetadata = {
    basicInfo: {
      fileName: "sample.png",
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
        text: "Sample Image",
      },
      {
        keyword: "Author", 
        text: "John Doe",
      },
    ],
    timestamp: {
      year: 2024,
      month: 1,
      day: 15,
      hour: 14,
      minute: 30,
      second: 45,
      date: new Date(2024, 0, 15, 14, 30, 45),
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

  describe("統合表示テスト", () => {
    test("should render all metadata cards", () => {
      render(<MetadataDisplay metadata={completeMetadata} />);
      
      expect(screen.getByRole("region", { name: /基本情報/ })).toBeInTheDocument();
      expect(screen.getByRole("region", { name: /テキストメタデータ/ })).toBeInTheDocument();
      expect(screen.getByRole("region", { name: /作成日時/ })).toBeInTheDocument();
      expect(screen.getByRole("region", { name: /物理的寸法/ })).toBeInTheDocument();
      expect(screen.getByRole("region", { name: /その他チャンク/ })).toBeInTheDocument();
    });

    test("should handle complete metadata", () => {
      render(<MetadataDisplay metadata={completeMetadata} />);
      
      // 各カードの主要な情報が表示されることを確認
      expect(screen.getByText("sample.png")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText(/2024年1月15日/)).toBeInTheDocument();
      expect(screen.getByText(/72 DPI/)).toBeInTheDocument();
      expect(screen.getByText("IDAT")).toBeInTheDocument();
    });

    test("should handle partial metadata", () => {
      const partialMetadata: PngMetadata = {
        basicInfo: completeMetadata.basicInfo,
        textMetadata: [],
        otherChunks: [],
      };
      
      render(<MetadataDisplay metadata={partialMetadata} />);
      
      expect(screen.getByRole("region", { name: /基本情報/ })).toBeInTheDocument();
      expect(screen.getByText(/テキストメタデータはありません/)).toBeInTheDocument();
      expect(screen.getByText(/作成日時情報はありません/)).toBeInTheDocument();
    });

    test("should handle empty metadata", () => {
      const emptyMetadata: PngMetadata = {
        basicInfo: {
          fileName: "empty.png",
          fileSize: 100,
          width: 1,
          height: 1,
          bitDepth: 1,
          colorType: PngColorType.GRAYSCALE,
          compressionMethod: 0,
          filterMethod: 0,
          interlaceMethod: 0,
        },
        textMetadata: [],
        otherChunks: [],
      };
      
      render(<MetadataDisplay metadata={emptyMetadata} />);
      
      expect(screen.getByText("empty.png")).toBeInTheDocument();
      expect(screen.getByText(/テキストメタデータはありません/)).toBeInTheDocument();
      expect(screen.getByText(/その他のチャンク情報はありません/)).toBeInTheDocument();
    });

    test("should display loading state", () => {
      render(<MetadataDisplay metadata={completeMetadata} loading={true} />);
      
      expect(screen.getByText(/読み込み中/)).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("エラーハンドリングテスト", () => {
    test("should display error state", () => {
      const error = new Error("メタデータの解析に失敗しました");
      
      render(<MetadataDisplay metadata={completeMetadata} error={error} />);
      
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
      expect(screen.getByText(/メタデータの解析に失敗しました/)).toBeInTheDocument();
    });

    test("should handle partial errors", () => {
      const partialErrorMetadata: PngMetadata = {
        ...completeMetadata,
        timestamp: undefined, // 一部データが欠損
      };
      
      render(<MetadataDisplay metadata={partialErrorMetadata} />);
      
      // 正常なデータは表示される
      expect(screen.getByText("sample.png")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      
      // 欠損データは適切にハンドリングされる
      expect(screen.getByText(/作成日時情報はありません/)).toBeInTheDocument();
    });

    test("should recover from errors", () => {
      const error = new Error("初期エラー");
      
      const { rerender } = render(
        <MetadataDisplay metadata={completeMetadata} error={error} />
      );
      
      expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
      
      // エラーが解決された状態で再レンダリング
      rerender(<MetadataDisplay metadata={completeMetadata} error={null} />);
      
      expect(screen.queryByText(/エラーが発生しました/)).not.toBeInTheDocument();
      expect(screen.getByText("sample.png")).toBeInTheDocument();
    });
  });
});