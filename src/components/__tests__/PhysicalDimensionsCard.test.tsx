import React from "react";
import { render, screen } from "@testing-library/react";
import { PhysicalDimensionsCard } from "../PhysicalDimensionsCard";
import { PngPhysicalDimensions, PngUnitSpecifier } from "../../types/png-metadata";

describe("PhysicalDimensionsCard", () => {
  const mockDimensions: PngPhysicalDimensions = {
    pixelsPerUnitX: 2835,
    pixelsPerUnitY: 2835,
    unitSpecifier: PngUnitSpecifier.METER,
  };

  describe("寸法表示テスト", () => {
    test("should render physical dimensions", () => {
      render(
        <PhysicalDimensionsCard 
          dimensions={mockDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      expect(screen.getByText(/2835 × 2835/)).toBeInTheDocument();
      expect(screen.getByText(/pixels per meter/)).toBeInTheDocument();
    });

    test("should calculate and display DPI", () => {
      render(
        <PhysicalDimensionsCard 
          dimensions={mockDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      // 2835 pixels/meter = 72 DPI (2835 / 39.3701)
      expect(screen.getByText(/72 DPI/)).toBeInTheDocument();
    });

    test("should calculate print size", () => {
      render(
        <PhysicalDimensionsCard 
          dimensions={mockDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      // 1920px / 72DPI = 26.7 inches = 67.8 cm
      // 1080px / 72DPI = 15.0 inches = 38.1 cm
      expect(screen.getByText(/67\.8 × 38\.1 cm/)).toBeInTheDocument();
    });

    test("should handle different unit specifiers", () => {
      const unknownUnitDimensions: PngPhysicalDimensions = {
        pixelsPerUnitX: 300,
        pixelsPerUnitY: 300,
        unitSpecifier: PngUnitSpecifier.UNKNOWN,
      };
      
      render(
        <PhysicalDimensionsCard 
          dimensions={unknownUnitDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      expect(screen.getByText(/unknown units/)).toBeInTheDocument();
    });

    test("should display unit information", () => {
      render(
        <PhysicalDimensionsCard 
          dimensions={mockDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      expect(screen.getByText(/meters/)).toBeInTheDocument();
    });
  });

  describe("DPI計算テスト", () => {
    test("should calculate DPI for meter units", () => {
      const meterDimensions: PngPhysicalDimensions = {
        pixelsPerUnitX: 3937,
        pixelsPerUnitY: 3937,
        unitSpecifier: PngUnitSpecifier.METER,
      };
      
      render(
        <PhysicalDimensionsCard 
          dimensions={meterDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      // 3937 pixels/meter = 100 DPI
      expect(screen.getByText(/100 DPI/)).toBeInTheDocument();
    });

    test("should handle unknown units", () => {
      const unknownDimensions: PngPhysicalDimensions = {
        pixelsPerUnitX: 72,
        pixelsPerUnitY: 72,
        unitSpecifier: PngUnitSpecifier.UNKNOWN,
      };
      
      render(
        <PhysicalDimensionsCard 
          dimensions={unknownDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      expect(screen.getByText(/DPI情報なし/)).toBeInTheDocument();
    });

    test("should calculate print size in cm", () => {
      render(
        <PhysicalDimensionsCard 
          dimensions={mockDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      expect(screen.getByText(/cm/)).toBeInTheDocument();
    });

    test("should calculate print size in inches", () => {
      render(
        <PhysicalDimensionsCard 
          dimensions={mockDimensions}
          imageWidth={1920}
          imageHeight={1080}
        />
      );
      
      expect(screen.getByText(/26\.7 × 15\.0 inches/)).toBeInTheDocument();
    });
  });
});