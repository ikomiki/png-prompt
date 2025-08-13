import React from "react";
import { render, screen } from "@testing-library/react";
import { BasicInfoCard } from "../BasicInfoCard";
import { PngBasicInfo, PngColorType } from "../../types/png-metadata";

describe("BasicInfoCard", () => {
  const mockBasicInfo: PngBasicInfo = {
    fileName: "sample.png",
    fileSize: 1234567,
    width: 1920,
    height: 1080,
    bitDepth: 8,
    colorType: PngColorType.RGB,
    compressionMethod: 0,
    filterMethod: 0,
    interlaceMethod: 0,
  };

  describe("基本表示テスト", () => {
    test("should render basic image information", () => {
      render(<BasicInfoCard basicInfo={mockBasicInfo} />);
      
      expect(screen.getByText("sample.png")).toBeInTheDocument();
      expect(screen.getByText(/1920 × 1080 pixels/)).toBeInTheDocument();
      expect(screen.getByText(/1\.2 MB \(1,234,567 bytes\)/)).toBeInTheDocument();
    });

    test("should display file size in human readable format", () => {
      render(<BasicInfoCard basicInfo={mockBasicInfo} />);
      
      const fileSizeElement = screen.getByText(/1\.2 MB \(1,234,567 bytes\)/);
      expect(fileSizeElement).toBeInTheDocument();
    });

    test("should display image dimensions", () => {
      render(<BasicInfoCard basicInfo={mockBasicInfo} />);
      
      const dimensionsElement = screen.getByText(/1920 × 1080 pixels/);
      expect(dimensionsElement).toBeInTheDocument();
    });

    test("should display color type and bit depth", () => {
      render(<BasicInfoCard basicInfo={mockBasicInfo} />);
      
      expect(screen.getByText(/8-bit RGB/)).toBeInTheDocument();
    });

    test("should handle different PNG color types", () => {
      const paletteInfo = {
        ...mockBasicInfo,
        colorType: PngColorType.PALETTE,
        bitDepth: 4,
      };
      
      render(<BasicInfoCard basicInfo={paletteInfo} />);
      expect(screen.getByText(/4-bit Palette/)).toBeInTheDocument();
    });
  });

  describe("技術情報表示テスト", () => {
    test("should display compression method", () => {
      render(<BasicInfoCard basicInfo={mockBasicInfo} />);
      
      expect(screen.getByText("圧縮方式:")).toBeInTheDocument();
      expect(screen.getAllByText("0")).toHaveLength(3); // compression, filter, interlace all show 0
    });

    test("should display filter method", () => {
      render(<BasicInfoCard basicInfo={mockBasicInfo} />);
      
      expect(screen.getByText("フィルター方式:")).toBeInTheDocument();
      expect(screen.getAllByText("0")).toHaveLength(3); // compression, filter, interlace
    });

    test("should display interlace method", () => {
      render(<BasicInfoCard basicInfo={mockBasicInfo} />);
      
      expect(screen.getByText("インターレース:")).toBeInTheDocument();
      expect(screen.getAllByText("0")).toHaveLength(3);
    });

    test("should handle collapsed state", () => {
      render(<BasicInfoCard basicInfo={mockBasicInfo} collapsed={true} />);
      
      const technicalDetails = screen.queryByText("圧縮方式:");
      expect(technicalDetails).not.toBeInTheDocument();
    });
  });
});