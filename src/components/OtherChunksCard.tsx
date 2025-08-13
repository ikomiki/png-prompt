import React from "react";
import { PngChunkInfo } from "../types/png-metadata";

interface OtherChunksCardProps {
  chunks: PngChunkInfo[];
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

function formatChunkSize(bytes: number): string {
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  const formattedSize = unitIndex === 0 ? size : size.toFixed(1);
  return `${formattedSize} ${units[unitIndex]}`;
}

export function OtherChunksCard({ chunks, collapsed = false, onToggleCollapse }: OtherChunksCardProps) {
  const handleToggle = () => {
    onToggleCollapse?.(!collapsed);
  };

  if (chunks.length === 0) {
    return (
      <div role="region" aria-labelledby="other-chunks-title" className="border rounded-lg p-4 bg-white shadow">
        <h2 id="other-chunks-title" className="text-lg font-semibold mb-4">その他チャンク</h2>
        <p className="text-gray-500">その他のチャンク情報はありません</p>
      </div>
    );
  }

  return (
    <div role="region" aria-labelledby="other-chunks-title" className="border rounded-lg p-4 bg-white shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 id="other-chunks-title" className="text-lg font-semibold">その他チャンク</h2>
        <button
          onClick={handleToggle}
          aria-label={`その他チャンクを${collapsed ? '展開' : '折りたたみ'}`}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? '▼' : '▲'}
        </button>
      </div>
      
      {!collapsed && (
        <div className="space-y-3">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">タイプ</th>
                <th className="text-left py-2">サイズ</th>
                <th className="text-left py-2">重要度</th>
                <th className="text-left py-2">説明</th>
              </tr>
            </thead>
            <tbody>
              {chunks.map((chunk, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 font-mono text-sm">{chunk.type}</td>
                  <td className="py-2 text-sm">{formatChunkSize(chunk.size)}</td>
                  <td className="py-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      chunk.critical 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {chunk.critical ? 'Critical' : 'Ancillary'}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-gray-600">{chunk.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}