import React from "react";
import { PngTimestamp } from "../types/png-metadata";

interface TimestampCardProps {
  timestamp: PngTimestamp;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

function formatDate(timestamp: PngTimestamp): string {
  try {
    if (timestamp.year === 0 || timestamp.month === 0 || timestamp.day === 0 || isNaN(timestamp.date.getTime())) {
      return "無効な日付";
    }
    
    return `${timestamp.year}年${timestamp.month}月${timestamp.day}日 ${timestamp.hour.toString().padStart(2, '0')}:${timestamp.minute.toString().padStart(2, '0')}:${timestamp.second.toString().padStart(2, '0')}`;
  } catch {
    return "無効な日付";
  }
}

function getRelativeTime(date: Date): string {
  try {
    if (isNaN(date.getTime())) {
      return "";
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分前`;
    } else {
      return "現在";
    }
  } catch {
    return "";
  }
}

export function TimestampCard({ timestamp, collapsed = false, onToggleCollapse }: TimestampCardProps) {
  const handleToggle = () => {
    onToggleCollapse?.(!collapsed);
  };

  const formattedDate = formatDate(timestamp);
  const relativeTime = getRelativeTime(timestamp.date);
  
  if (formattedDate === "無効な日付") {
    return (
      <div role="region" aria-labelledby="timestamp-title" className="border rounded-lg p-4 bg-white shadow">
        <h2 id="timestamp-title" className="text-lg font-semibold mb-4">作成日時</h2>
        <p className="text-red-500">無効な日付</p>
      </div>
    );
  }

  return (
    <div role="region" aria-labelledby="timestamp-title" className="border rounded-lg p-4 bg-white shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 id="timestamp-title" className="text-lg font-semibold">作成日時</h2>
        <button
          onClick={handleToggle}
          aria-label={`作成日時を${collapsed ? '展開' : '折りたたみ'}`}
          className="p-1 rounded hover:bg-gray-100"
        >
          {collapsed ? '▼' : '▲'}
        </button>
      </div>
      
      {!collapsed && (
        <div className="space-y-3">
          <div>
            <span className="font-medium">日時: </span>
            <span>{formattedDate}</span>
          </div>
          
          {relativeTime && (
            <div>
              <span className="font-medium">相対時間: </span>
              <span className="text-gray-600">({relativeTime})</span>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            <span className="font-medium">タイムゾーン: </span>
            <span>UTC</span>
          </div>
        </div>
      )}
    </div>
  );
}