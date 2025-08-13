import React from "react";
import { render, screen } from "@testing-library/react";
import { OtherChunksCard } from "../OtherChunksCard";
import { PngChunkInfo } from "../../types/png-metadata";

describe("OtherChunksCard", () => {
  const mockChunks: PngChunkInfo[] = [
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
    {
      type: "tEXt",
      size: 156,
      description: "Text - テキスト情報",
      critical: false,
    },
  ];

  describe("チャンク一覧表示テスト", () => {
    test("should render chunk list", () => {
      render(<OtherChunksCard chunks={mockChunks} />);
      
      expect(screen.getByText("IDAT")).toBeInTheDocument();
      expect(screen.getByText("gAMA")).toBeInTheDocument();
      expect(screen.getByText("tEXt")).toBeInTheDocument();
    });

    test("should display chunk type and size", () => {
      render(<OtherChunksCard chunks={mockChunks} />);
      
      expect(screen.getByText("IDAT")).toBeInTheDocument();
      expect(screen.getByText(/1\.0 MB/)).toBeInTheDocument();
      expect(screen.getByText("gAMA")).toBeInTheDocument();
      expect(screen.getByText(/4 bytes/)).toBeInTheDocument();
    });

    test("should display chunk description", () => {
      render(<OtherChunksCard chunks={mockChunks} />);
      
      expect(screen.getByText(/Image Data - 画像データ/)).toBeInTheDocument();
      expect(screen.getByText(/Gamma - ガンマ値/)).toBeInTheDocument();
    });

    test("should indicate critical vs ancillary chunks", () => {
      render(<OtherChunksCard chunks={mockChunks} />);
      
      expect(screen.getByText(/Critical/)).toBeInTheDocument();
      expect(screen.getByText(/Ancillary/)).toBeInTheDocument();
    });

    test("should handle empty chunk list", () => {
      render(<OtherChunksCard chunks={[]} />);
      
      expect(screen.getByText(/その他のチャンク情報はありません/)).toBeInTheDocument();
    });
  });

  describe("チャンク分類テスト", () => {
    test("should classify critical chunks correctly", () => {
      const criticalChunks: PngChunkInfo[] = [
        {
          type: "IHDR",
          size: 13,
          description: "Image Header - 画像ヘッダー",
          critical: true,
        },
        {
          type: "PLTE",
          size: 768,
          description: "Palette - パレット",
          critical: true,
        },
      ];
      
      render(<OtherChunksCard chunks={criticalChunks} />);
      
      const criticalBadges = screen.getAllByText(/Critical/);
      expect(criticalBadges).toHaveLength(2);
    });

    test("should classify ancillary chunks correctly", () => {
      const ancillaryChunks: PngChunkInfo[] = [
        {
          type: "bKGD",
          size: 6,
          description: "Background - 背景色",
          critical: false,
        },
        {
          type: "tRNS",
          size: 256,
          description: "Transparency - 透明度",
          critical: false,
        },
      ];
      
      render(<OtherChunksCard chunks={ancillaryChunks} />);
      
      const ancillaryBadges = screen.getAllByText(/Ancillary/);
      expect(ancillaryBadges).toHaveLength(2);
    });

    test("should display chunk size in appropriate units", () => {
      const variedSizeChunks: PngChunkInfo[] = [
        {
          type: "SMALL",
          size: 10,
          description: "Small chunk",
          critical: false,
        },
        {
          type: "MEDIUM",
          size: 5000,
          description: "Medium chunk",
          critical: false,
        },
        {
          type: "LARGE",
          size: 2000000,
          description: "Large chunk",
          critical: false,
        },
      ];
      
      render(<OtherChunksCard chunks={variedSizeChunks} />);
      
      expect(screen.getByText(/10 bytes/)).toBeInTheDocument();
      expect(screen.getByText(/4\.9 KB/)).toBeInTheDocument();
      expect(screen.getByText(/1\.9 MB/)).toBeInTheDocument();
    });
  });
});