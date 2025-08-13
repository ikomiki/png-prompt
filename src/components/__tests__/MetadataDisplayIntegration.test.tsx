import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MetadataDisplay } from "../MetadataDisplay";
import { PngMetadata, PngColorType, PngUnitSpecifier } from "../../types/png-metadata";

describe("Metadata Display Integration", () => {
  const completeMetadata: PngMetadata = {
    basicInfo: {
      fileName: "integration-test.png",
      fileSize: 5000000,
      width: 2560,
      height: 1440,
      bitDepth: 8,
      colorType: PngColorType.RGB,
      compressionMethod: 0,
      filterMethod: 0,
      interlaceMethod: 0,
    },
    textMetadata: [
      {
        keyword: "Title",
        text: "Integration Test Image",
      },
      {
        keyword: "Description",
        text: "A comprehensive test image with multiple metadata types for integration testing purposes. This text is intentionally long to test text truncation and expansion functionality.",
        compressed: true,
      },
      {
        keyword: "Comment",
        text: "統合テストサンプル画像",
        languageTag: "ja-JP",
        translatedKeyword: "コメント",
      },
    ],
    timestamp: {
      year: 2024,
      month: 3,
      day: 20,
      hour: 10,
      minute: 15,
      second: 30,
      date: new Date(2024, 2, 20, 10, 15, 30),
    },
    physicalDimensions: {
      pixelsPerUnitX: 2835,
      pixelsPerUnitY: 2835,
      unitSpecifier: PngUnitSpecifier.METER,
    },
    otherChunks: [
      {
        type: "IDAT",
        size: 4500000,
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
        type: "cHRM",
        size: 32,
        description: "Chromaticities - 色度情報",
        critical: false,
      },
    ],
  };

  test("should display complete PNG metadata", () => {
    render(<MetadataDisplay metadata={completeMetadata} />);
    
    // 1. 基本情報カード表示
    expect(screen.getByText("integration-test.png")).toBeInTheDocument();
    expect(screen.getByText(/2560 × 1440 pixels/)).toBeInTheDocument();
    expect(screen.getByText(/4\.8 MB/)).toBeInTheDocument();
    
    // 2. テキストメタデータカード表示
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Integration Test Image")).toBeInTheDocument();
    expect(screen.getByText(/圧縮済み/)).toBeInTheDocument();
    expect(screen.getByText("ja-JP")).toBeInTheDocument();
    
    // 3. タイムスタンプカード表示
    expect(screen.getByText(/2024年3月20日/)).toBeInTheDocument();
    expect(screen.getByText(/10:15:30/)).toBeInTheDocument();
    
    // 4. 物理的寸法カード表示
    expect(screen.getByText(/72 DPI/)).toBeInTheDocument();
    expect(screen.getByText(/cm/)).toBeInTheDocument();
    
    // 5. その他チャンクカード表示
    expect(screen.getByText("IDAT")).toBeInTheDocument();
    expect(screen.getByText(/4\.3 MB/)).toBeInTheDocument();
    expect(screen.getByText(/Critical/)).toBeInTheDocument();
  });

  test("should handle real PNG file metadata", () => {
    // 実際のPNGファイルから抽出されるような現実的なメタデータ
    const realMetadata: PngMetadata = {
      basicInfo: {
        fileName: "screenshot-2024-03-20.png",
        fileSize: 2048576, // 2MB
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
          keyword: "Software",
          text: "macOS Screenshot Utility",
        },
        {
          keyword: "Creation Time",
          text: "2024-03-20T10:15:30+09:00",
        },
      ],
      timestamp: {
        year: 2024,
        month: 3,
        day: 20,
        hour: 1,
        minute: 15,
        second: 30,
        date: new Date(2024, 2, 20, 1, 15, 30),
      },
      physicalDimensions: {
        pixelsPerUnitX: 2835,
        pixelsPerUnitY: 2835,
        unitSpecifier: PngUnitSpecifier.METER,
      },
      otherChunks: [
        {
          type: "IDAT",
          size: 1900000,
          description: "Image Data - 画像データ",
          critical: true,
        },
      ],
    };
    
    render(<MetadataDisplay metadata={realMetadata} />);
    
    // 1. ファイル解析結果の確認
    expect(screen.getByText("screenshot-2024-03-20.png")).toBeInTheDocument();
    expect(screen.getByText(/2\.0 MB/)).toBeInTheDocument();
    
    // 2. メタデータ抽出結果の確認
    expect(screen.getByText("Software")).toBeInTheDocument();
    expect(screen.getByText("macOS Screenshot Utility")).toBeInTheDocument();
    
    // 3. 各カードでの表示確認
    expect(screen.getByText(/1920 × 1080 pixels/)).toBeInTheDocument();
    expect(screen.getByText(/2024年3月20日/)).toBeInTheDocument();
    
    // 4. 表示内容の検証
    expect(screen.getByText(/72 DPI/)).toBeInTheDocument();
    expect(screen.getByText(/1\.8 MB/)).toBeInTheDocument(); // IDATサイズ
  });

  test("should handle card collapse/expand interactions", () => {
    render(<MetadataDisplay metadata={completeMetadata} />);
    
    // 1. 初期状態確認（すべてのカードが展開状態）
    expect(screen.getByText(/圧縮方式/)).toBeVisible();
    expect(screen.getByText("Integration Test Image")).toBeVisible();
    expect(screen.getByText(/10:15:30/)).toBeVisible();
    
    // 2. 基本情報カードの折りたたみ
    const basicInfoToggle = screen.getByRole("button", { name: /基本情報.*折りたたみ/ });
    fireEvent.click(basicInfoToggle);
    
    // 3. 状態保持確認（技術詳細が非表示になる）
    expect(screen.queryByText(/圧縮方式/)).not.toBeVisible();
    
    // 4. 展開動作確認
    fireEvent.click(basicInfoToggle);
    expect(screen.getByText(/圧縮方式/)).toBeVisible();
  });
});

describe("Responsive Integration", () => {
  const mockMetadata: PngMetadata = {
    basicInfo: {
      fileName: "responsive-test.png",
      fileSize: 1024000,
      width: 800,
      height: 600,
      bitDepth: 8,
      colorType: PngColorType.RGB,
      compressionMethod: 0,
      filterMethod: 0,
      interlaceMethod: 0,
    },
    textMetadata: [],
    otherChunks: [],
  };

  test("should adapt layout for mobile", () => {
    // モバイル画面サイズをシミュレート
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<MetadataDisplay metadata={mockMetadata} />);
    
    // 1. 縦スクロールレイアウト
    const container = screen.getByTestId("metadata-display-container");
    expect(container).toHaveClass("flex-col");
    
    // 2. カード配置最適化
    const cards = screen.getAllByRole("region");
    cards.forEach(card => {
      expect(card).toHaveClass("w-full");
    });
    
    // 3. 情報密度調整
    expect(screen.getByText("responsive-test.png")).toBeInTheDocument();
    expect(screen.getByText(/800 × 600 pixels/)).toBeInTheDocument();
  });

  test("should adapt layout for desktop", () => {
    // デスクトップ画面サイズをシミュレート
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
    
    render(<MetadataDisplay metadata={mockMetadata} />);
    
    // 1. 効率的なカード配置
    const container = screen.getByTestId("metadata-display-container");
    expect(container).toHaveClass("grid");
    
    // 2. 空間利用最適化
    expect(container).toHaveClass("grid-cols-2", "lg:grid-cols-3");
    
    // 3. 読みやすさ向上
    const basicInfoCard = screen.getByRole("region", { name: /基本情報/ });
    expect(basicInfoCard).toHaveClass("col-span-full");
  });
});