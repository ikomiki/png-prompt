import React, { useEffect, useCallback, useRef } from "react";

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  fileName: string;
  onClose: () => void;
}

export function ImageModal({
  isOpen,
  imageUrl,
  fileName,
  onClose,
}: ImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // スクロール無効化
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset"; // スクロール復元
    };
  }, [isOpen, onClose]);

  // モーダル外クリックで閉じる
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    },
    [onClose]
  );

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
        className="relative max-h-[90vh] max-w-4xl p-4"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-black bg-opacity-50 p-2 text-white transition-colors hover:bg-opacity-70"
          aria-label="モーダルを閉じる"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 画像 */}
        <div className="overflow-hidden rounded-lg bg-white shadow-2xl">
          <div className="border-b bg-gray-50 p-4">
            <h2
              id="modal-title"
              className="truncate text-lg font-semibold text-gray-900"
            >
              {fileName}
            </h2>
          </div>
          <div className="flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt={`${fileName}の拡大表示`}
              className="max-h-[70vh] max-w-full object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* キーボードヘルプ */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform text-sm text-white opacity-75">
        ESCキーで閉じる
      </div>
    </div>
  );
}
