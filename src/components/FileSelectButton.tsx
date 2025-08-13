"use client";

import React, { useRef } from "react";
import Button from "./ui/Button";

export interface FileSelectButtonProps {
  /** ファイル選択時のコールバック */
  onFileSelect: (file: File) => void;
  /** 受け入れるファイル形式 */
  accept?: string;
  /** 無効化状態 */
  disabled?: boolean;
  /** ボタンのバリアント */
  variant?: "primary" | "secondary";
  /** ボタンのサイズ */
  size?: "sm" | "md" | "lg";
  /** 追加のCSSクラス */
  className?: string;
}

export function FileSelectButton({
  onFileSelect,
  accept = "image/png,.png",
  disabled = false,
  variant = "primary",
  size = "md",
  className,
}: FileSelectButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        variant={variant}
        size={size}
        className={className}
        icon={
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        }
        iconPosition="left"
      >
        ファイルを選択
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        data-testid="file-input"
      />
    </>
  );
}