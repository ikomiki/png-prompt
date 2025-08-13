import React from "react";
import { PngMetadata } from "../types/png-metadata";
import { BasicInfoCard } from "./BasicInfoCard";
import { TextMetadataCard } from "./TextMetadataCard";
import { TimestampCard } from "./TimestampCard";
import { PhysicalDimensionsCard } from "./PhysicalDimensionsCard";
import { OtherChunksCard } from "./OtherChunksCard";

interface MetadataDisplayProps {
  metadata: PngMetadata;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

export function MetadataDisplay({ metadata, loading = false, error = null, className = "" }: MetadataDisplayProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div role="progressbar" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border rounded-lg p-4 bg-red-50 border-red-200 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
        <p className="text-gray-500 text-center">このPNGファイルにはメタデータが含まれていません</p>
      </div>
    );
  }

  return (
    <div 
      className={`space-y-4 ${className}`}
      data-testid="metadata-display-container"
    >
      {/* デスクトップレイアウト用のグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* 基本情報は常に最上部に配置 */}
        <div className="col-span-full">
          <BasicInfoCard basicInfo={metadata.basicInfo} />
        </div>
        
        {/* テキストメタデータ */}
        <div className="lg:col-span-2">
          <TextMetadataCard textMetadata={metadata.textMetadata || []} />
        </div>
        
        {/* タイムスタンプ */}
        <div>
          {metadata.timestamp ? (
            <TimestampCard timestamp={metadata.timestamp} />
          ) : (
            <div className="border rounded-lg p-4 bg-white shadow">
              <h2 className="text-lg font-semibold mb-4">作成日時</h2>
              <p className="text-gray-500">作成日時情報はありません</p>
            </div>
          )}
        </div>
        
        {/* 物理的寸法 */}
        <div>
          {metadata.physicalDimensions ? (
            <PhysicalDimensionsCard 
              dimensions={metadata.physicalDimensions}
              imageWidth={metadata.basicInfo.width}
              imageHeight={metadata.basicInfo.height}
            />
          ) : (
            <div className="border rounded-lg p-4 bg-white shadow">
              <h2 className="text-lg font-semibold mb-4">物理的寸法</h2>
              <p className="text-gray-500">物理的寸法情報はありません</p>
            </div>
          )}
        </div>
        
        {/* その他チャンク */}
        <div className="lg:col-span-2">
          <OtherChunksCard chunks={metadata.otherChunks || []} />
        </div>
      </div>

      {/* モバイルレイアウト用の縦スタック (画面幅が狭い場合) */}
      <div className="flex flex-col space-y-4 lg:hidden">
        <BasicInfoCard basicInfo={metadata.basicInfo} />
        <TextMetadataCard textMetadata={metadata.textMetadata || []} />
        
        {metadata.timestamp ? (
          <TimestampCard timestamp={metadata.timestamp} />
        ) : (
          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-lg font-semibold mb-4">作成日時</h2>
            <p className="text-gray-500">作成日時情報はありません</p>
          </div>
        )}
        
        {metadata.physicalDimensions ? (
          <PhysicalDimensionsCard 
            dimensions={metadata.physicalDimensions}
            imageWidth={metadata.basicInfo.width}
            imageHeight={metadata.basicInfo.height}
          />
        ) : (
          <div className="border rounded-lg p-4 bg-white shadow">
            <h2 className="text-lg font-semibold mb-4">物理的寸法</h2>
            <p className="text-gray-500">物理的寸法情報はありません</p>
          </div>
        )}
        
        <OtherChunksCard chunks={metadata.otherChunks || []} />
      </div>
    </div>
  );
}