import React, { useState } from "react";
import { PngTextMetadata } from "../types/png-metadata";

interface TextMetadataCardProps {
  textMetadata: PngTextMetadata[];
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncateText(text: string, maxLength: number = 200): { truncated: string; isTruncated: boolean } {
  if (text.length <= maxLength) {
    return { truncated: text, isTruncated: false };
  }
  return { truncated: text.substring(0, maxLength) + '...', isTruncated: true };
}

export function TextMetadataCard({ textMetadata, collapsed = false, onToggleCollapse }: TextMetadataCardProps) {
  const [expandedTexts, setExpandedTexts] = useState<Set<number>>(new Set());

  const handleToggle = () => {
    onToggleCollapse?.(!collapsed);
  };

  const toggleTextExpansion = (index: number) => {
    const newExpanded = new Set(expandedTexts);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTexts(newExpanded);
  };

  if (textMetadata.length === 0) {
    return (
      <div role="region" aria-labelledby="text-metadata-title" className="border rounded-lg p-4 bg-white shadow">
        <h2 id="text-metadata-title" className="text-lg font-semibold mb-4">テキストメタデータ</h2>
        <p className="text-gray-500">テキストメタデータはありません</p>
      </div>
    );
  }

  return (
    <div role="region" aria-labelledby="text-metadata-title" className="border rounded-lg p-4 bg-white shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 id="text-metadata-title" className="text-lg font-semibold">テキストメタデータ</h2>
        <button
          onClick={handleToggle}
          aria-label={`テキストメタデータを${collapsed ? '展開' : '折りたたみ'}`}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? '▼' : '▲'}
        </button>
      </div>
      
      {!collapsed && (
        <div className="space-y-4">
          <table className="w-full">
            <tbody>
              {textMetadata.map((item, index) => {
                const { truncated, isTruncated } = truncateText(item.text);
                const isExpanded = expandedTexts.has(index);
                const displayText = isExpanded ? item.text : truncated;
                
                // 改行を保持して表示
                const formattedText = displayText.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {lineIndex > 0 && <br />}
                    <span dangerouslySetInnerHTML={{ __html: escapeHtml(line) }} />
                  </React.Fragment>
                ));

                return (
                  <tr key={index} className="border-b">
                    <td className="py-2 pr-4 font-medium align-top">{item.keyword}</td>
                    <td className="py-2">
                      <div className="space-y-1">
                        <div>{formattedText}</div>
                        
                        {isTruncated && (
                          <button
                            onClick={() => toggleTextExpansion(index)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                            role="button"
                            aria-label={isExpanded ? '詳細を非表示' : '詳細を表示'}
                          >
                            {isExpanded ? '詳細を非表示' : '詳細を表示'}
                          </button>
                        )}
                        
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          {item.compressed && (
                            <span className="bg-yellow-100 px-2 py-1 rounded">圧縮済み</span>
                          )}
                          {item.languageTag && (
                            <span className="bg-blue-100 px-2 py-1 rounded">{item.languageTag}</span>
                          )}
                          {item.translatedKeyword && (
                            <span className="bg-green-100 px-2 py-1 rounded">翻訳: {item.translatedKeyword}</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}