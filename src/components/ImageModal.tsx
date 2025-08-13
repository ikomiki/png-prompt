import React, { useEffect, useCallback, useRef } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  fileName: string;
  onClose: () => void;
}

export function ImageModal({ isOpen, imageUrl, fileName, onClose }: ImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // スクロール無効化
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // スクロール復元
    };
  }, [isOpen, onClose]);

  // モーダル外クリックで閉じる
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  // フォーカス管理
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="relative max-w-4xl max-h-[90vh] p-4"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
          aria-label="モーダルを閉じる"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 画像 */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 truncate">
              {fileName}
            </h2>
          </div>
          <div className="p-4 flex items-center justify-center">
            <img
              ref={imageRef}
              src={imageUrl}
              alt={`${fileName}の拡大表示`}
              className="max-w-full max-h-[70vh] object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* キーボードヘルプ */}
        <div className="absolute bottom-2 left-2 text-white text-sm opacity-75">
          ESCキーで閉じる
        </div>
      </div>
    </div>
  );
}