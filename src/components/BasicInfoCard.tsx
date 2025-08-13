import React from "react";
import { PngBasicInfo, PngColorType } from "../types/png-metadata";
import { 
  getColorTypeName, 
  getCompressionMethodName, 
  getFilterMethodName, 
  getInterlaceMethodName 
} from "../lib/utils";

interface BasicInfoCardProps {
  basicInfo: PngBasicInfo;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  onNewFileSelect?: () => void;
}

function formatFileSize(bytes: number): string {
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  const formattedSize = unitIndex === 0 ? size : size.toFixed(1);
  return `${formattedSize} ${units[unitIndex]} (${bytes.toLocaleString()} bytes)`;
}

function getColorTypeDescription(colorType: PngColorType, bitDepth: number): string {
  const colorTypeName = getColorTypeName(colorType);
  return `${bitDepth}-bit ${colorTypeName}`;
}

export function BasicInfoCard({ basicInfo, collapsed = false, onToggleCollapse, onNewFileSelect }: BasicInfoCardProps) {
  const handleToggle = () => {
    onToggleCollapse?.(!collapsed);
  };

  return (
    <div role="region" aria-labelledby="basic-info-title" className="border rounded-lg p-4 bg-white shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 id="basic-info-title" className="text-lg font-semibold">基本情報</h2>
        <div className="flex items-center gap-2">
          {onNewFileSelect && (
            <button
              onClick={onNewFileSelect}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              aria-label="新しいファイルを選択"
            >
              新しいファイル
            </button>
          )}
          <button
            onClick={handleToggle}
            aria-label={`基本情報を${collapsed ? '展開' : '折りたたみ'}`}
            className="p-1 rounded hover:bg-gray-100"
          >
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <span className="font-medium">ファイル名: </span>
          <span>{basicInfo.fileName}</span>
        </div>
        
        <div>
          <span className="font-medium">ファイルサイズ: </span>
          <span>{formatFileSize(basicInfo.fileSize)}</span>
        </div>
        
        <div>
          <span className="font-medium">画像寸法: </span>
          <span>{basicInfo.width} × {basicInfo.height} pixels</span>
        </div>
        
        <div>
          <span className="font-medium">色深度・タイプ: </span>
          <span>{getColorTypeDescription(basicInfo.colorType, basicInfo.bitDepth)}</span>
        </div>
        
        {!collapsed && (
          <div className="mt-4 pt-4 border-t space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">圧縮方式: </span>
              <span>{getCompressionMethodName(basicInfo.compressionMethod)}</span>
            </div>
            <div>
              <span className="font-medium">フィルター方式: </span>
              <span>{getFilterMethodName(basicInfo.filterMethod)}</span>
            </div>
            <div>
              <span className="font-medium">インターレース: </span>
              <span>{getInterlaceMethodName(basicInfo.interlaceMethod)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}