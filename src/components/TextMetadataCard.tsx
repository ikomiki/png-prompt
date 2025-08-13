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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      // コピー成功表示を2秒後にリセット
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
      // フォールバック: 古いブラウザ対応
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (fallbackErr) {
        console.error('フォールバック方法でもコピーに失敗しました:', fallbackErr);
      } finally {
        document.body.removeChild(textArea);
      }
    }
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
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">{formattedText}</div>
                          <button
                            onClick={() => copyToClipboard(item.text, index)}
                            className={`flex-shrink-0 p-1 rounded transition-colors ${
                              copiedIndex === index 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                            title="クリップボードにコピー"
                            aria-label={`${item.keyword}の内容をクリップボードにコピー`}
                          >
                            {copiedIndex === index ? (
                              // コピー完了アイコン (チェックマーク)
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              // コピーアイコン
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        
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
                        
                        {copiedIndex === index && (
                          <div className="text-xs text-green-600 animate-fade-in">
                            📋 クリップボードにコピーしました
                          </div>
                        )}
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