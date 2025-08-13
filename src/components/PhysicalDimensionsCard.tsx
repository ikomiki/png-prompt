import React from "react";
import { PngPhysicalDimensions, PngUnitSpecifier } from "../types/png-metadata";

interface PhysicalDimensionsCardProps {
  dimensions: PngPhysicalDimensions;
  imageWidth: number;
  imageHeight: number;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

function calculateDPI(pixelsPerUnit: number, unitSpecifier: PngUnitSpecifier): number | null {
  if (unitSpecifier === PngUnitSpecifier.METER) {
    // Convert pixels per meter to DPI (dots per inch)
    return Math.round(pixelsPerUnit / 39.3701);
  }
  return null;
}

function calculatePrintSize(imageWidth: number, imageHeight: number, dpi: number | null): {
  cm: { width: number; height: number };
  inches: { width: number; height: number };
} | null {
  if (!dpi) return null;
  
  const widthInches = imageWidth / dpi;
  const heightInches = imageHeight / dpi;
  
  return {
    cm: {
      width: Math.round(widthInches * 2.54 * 10) / 10,
      height: Math.round(heightInches * 2.54 * 10) / 10,
    },
    inches: {
      width: Math.round(widthInches * 10) / 10,
      height: Math.round(heightInches * 10) / 10,
    },
  };
}

function getUnitDescription(unitSpecifier: PngUnitSpecifier): string {
  switch (unitSpecifier) {
    case PngUnitSpecifier.METER:
      return "pixels per meter";
    case PngUnitSpecifier.UNKNOWN:
      return "unknown units";
    default:
      return "unknown units";
  }
}

function getUnitName(unitSpecifier: PngUnitSpecifier): string {
  switch (unitSpecifier) {
    case PngUnitSpecifier.METER:
      return "meters";
    case PngUnitSpecifier.UNKNOWN:
      return "unknown units";
    default:
      return "unknown units";
  }
}

export function PhysicalDimensionsCard({ 
  dimensions, 
  imageWidth, 
  imageHeight, 
  collapsed = false, 
  onToggleCollapse 
}: PhysicalDimensionsCardProps) {
  const handleToggle = () => {
    onToggleCollapse?.(!collapsed);
  };

  const dpi = calculateDPI(dimensions.pixelsPerUnitX, dimensions.unitSpecifier);
  const printSize = calculatePrintSize(imageWidth, imageHeight, dpi);

  return (
    <div role="region" aria-labelledby="physical-dimensions-title" className="border rounded-lg p-4 bg-white shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 id="physical-dimensions-title" className="text-lg font-semibold">物理的寸法</h2>
        <button
          onClick={handleToggle}
          aria-label={`物理的寸法を${collapsed ? '展開' : '折りたたみ'}`}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? '▼' : '▲'}
        </button>
      </div>
      
      {!collapsed && (
        <div className="space-y-3">
          <div>
            <span className="font-medium">密度: </span>
            <span>{dimensions.pixelsPerUnitX} × {dimensions.pixelsPerUnitY} {getUnitDescription(dimensions.unitSpecifier)}</span>
          </div>
          
          <div>
            <span className="font-medium">単位: </span>
            <span>{getUnitName(dimensions.unitSpecifier)}</span>
          </div>
          
          {dpi ? (
            <>
              <div>
                <span className="font-medium">DPI: </span>
                <span>{dpi} DPI (水平) × {dpi} DPI (垂直)</span>
              </div>
              
              {printSize && (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">印刷サイズ (cm): </span>
                    <span>{printSize.cm.width} × {printSize.cm.height} cm</span>
                  </div>
                  <div>
                    <span className="font-medium">印刷サイズ (inches): </span>
                    <span>{printSize.inches.width} × {printSize.inches.height} inches</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500">
              <span>DPI情報なし</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}