import React, { useState, useCallback, useEffect } from 'react';

interface ImageThumbnailProps {
  file: File;
  onImageClick?: (imageUrl: string) => void;
  size?: number;
  className?: string;
}

export function ImageThumbnail({ 
  file, 
  onImageClick, 
  size = 150,
  className = '' 
}: ImageThumbnailProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('画像の読み込みに失敗しました');
      setLoading(false);
    };
    
    reader.readAsDataURL(file);
    
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [file, imageUrl]);

  const handleClick = useCallback(() => {
    if (imageUrl && onImageClick) {
      onImageClick(imageUrl);
    }
  }, [imageUrl, onImageClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border rounded ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border rounded text-gray-500 text-xs ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>読み込みエラー</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`border rounded overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${file.name}のサムネイル画像。クリックで拡大表示`}
    >
      <img
        src={imageUrl}
        alt={`${file.name}のサムネイル`}
        className="w-full h-full object-contain bg-white"
        loading="lazy"
      />
    </div>
  );
}