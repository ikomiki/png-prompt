"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AppError } from "@/types/png-metadata";
import { validatePngFile } from "@/lib/file-validator";
import { formatFileSize } from "@/lib/utils";
import { FileSelectButton } from "./FileSelectButton";
import { DropZone } from "./DropZone";
import { LoadingIndicator } from "./ui/LoadingIndicator";

export interface FileUploaderProps {
  /** ファイル選択時のコールバック */
  onFileSelect: (file: File) => void;
  /** エラー発生時のコールバック */
  onError: (error: AppError) => void;
  /** 受け入れるファイル形式 */
  accept?: string;
  /** 最大ファイルサイズ（バイト） */
  maxFileSize?: number;
  /** 無効化状態 */
  disabled?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

export function FileUploader({
  onFileSelect,
  onError,
  accept = "image/png,.png",
  maxFileSize = 100 * 1024 * 1024, // 100MB
  disabled = false,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  
  const [currentError, setCurrentError] = useState<AppError | null>(null);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const validateAndProcessFile = useCallback(
    async (file: File) => {
      setIsValidating(true);
      setCurrentError(null);

      try {
        const validationResult = await validatePngFile(file, {
          maxFileSize,
          checkPngSignature: true,
        });

        if (validationResult.isValid) {
          onFileSelect(file);
        } else if (validationResult.error) {
          setCurrentError(validationResult.error);
          onError(validationResult.error);
        }
      } catch (error) {
        const errorObj = {
          type: "PARSE_ERROR" as const,
          message: "ファイル検証中にエラーが発生しました",
          details: error instanceof Error ? error.message : String(error),
        };
        setCurrentError(errorObj);
        onError(errorObj);
      } finally {
        setTimeout(() => {
          if (isMountedRef.current) {
            setIsValidating(false);
          }
        }, 0);
      }
    },
    [maxFileSize, onFileSelect, onError]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      validateAndProcessFile(file);
    },
    [validateAndProcessFile]
  );

  const handleFileDrop = useCallback(
    (files: FileList) => {
      if (files.length > 0) {
        // Take only the first file
        const file = files[0];
        validateAndProcessFile(file);
      }
    },
    [validateAndProcessFile]
  );

  const handleDragStateChange = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);


  // 最大ファイルサイズ表示の最適化
  const formattedMaxSize = useMemo(
    () => formatFileSize(maxFileSize),
    [maxFileSize]
  );

  return (
    <div
      data-testid="file-uploader"
      className={cn("w-full max-w-2xl mx-auto", className)}
    >
      {/* スクリーンリーダー用のライブリージョン */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isValidating && "ファイルを検証中です"}
        {currentError && `エラー: ${currentError.message}`}
      </div>
      <DropZone
        onDrop={handleFileDrop}
        onDragStateChange={handleDragStateChange}
        isDragging={isDragging}
        disabled={disabled || isValidating}
      >
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {isValidating ? (
            <div className="mb-4">
              <LoadingIndicator
                text="ファイルを検証中..."
                textPosition="bottom"
                centered
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-lg font-medium text-gray-900">
                  PNGファイルをここにドロップするか
                </p>
                <p className="text-sm text-gray-600">
                  最大 {formattedMaxSize.formatted}
                </p>
              </div>

              <div className="mb-4">
                <FileSelectButton
                  onFileSelect={handleFileSelect}
                  accept={accept}
                  disabled={disabled || isValidating}
                  variant="primary"
                  size="lg"
                />
              </div>

              <p className="text-xs text-gray-500">
                PNG形式のファイルのみ対応しています
              </p>
            </>
          )}
        </div>
      </DropZone>
    </div>
  );
}