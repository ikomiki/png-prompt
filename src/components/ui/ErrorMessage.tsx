"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ErrorMessageProps {
  /** エラーメッセージ */
  message: string;
  /** 詳細メッセージ */
  details?: string;
  /** エラーの種類 */
  variant?: "error" | "warning" | "info";
  /** サイズ */
  size?: "sm" | "md" | "lg";
  /** リトライボタン */
  onRetry?: () => void;
  /** リトライボタンのテキスト */
  retryText?: string;
  /** 閉じるボタン */
  onClose?: () => void;
  /** アイコンを表示するか */
  showIcon?: boolean;
  /** 折りたたみ可能にするか */
  collapsible?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

export function ErrorMessage({
  message,
  details,
  variant = "error",
  size = "md",
  onRetry,
  retryText = "再試行",
  onClose,
  showIcon = true,
  collapsible = false,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        {
          "border-red-200 bg-red-50": variant === "error",
          "border-yellow-200 bg-yellow-50": variant === "warning",
          "border-blue-200 bg-blue-50": variant === "info",
        },
        {
          "text-sm": size === "sm",
          "text-base": size === "md",
          "text-lg": size === "lg",
        },
        className
      )}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <ErrorIcon variant={variant} />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "font-medium",
              {
                "text-red-800": variant === "error",
                "text-yellow-800": variant === "warning",
                "text-blue-800": variant === "info",
              }
            )}
          >
            {message}
          </div>
          
          {details && (
            <div
              className={cn(
                "mt-1",
                {
                  "text-red-700": variant === "error",
                  "text-yellow-700": variant === "warning",
                  "text-blue-700": variant === "info",
                },
                {
                  "text-xs": size === "sm",
                  "text-sm": size === "md" || size === "lg",
                }
              )}
            >
              {collapsible ? (
                <details className="mt-2">
                  <summary className="cursor-pointer select-none font-medium">
                    詳細を表示
                  </summary>
                  <div className="mt-2 whitespace-pre-wrap break-words">
                    {details}
                  </div>
                </details>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {details}
                </div>
              )}
            </div>
          )}
          
          {(onRetry || onClose) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={cn(
                    "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    {
                      "bg-red-100 text-red-800 hover:bg-red-200": variant === "error",
                      "bg-yellow-100 text-yellow-800 hover:bg-yellow-200": variant === "warning",
                      "bg-blue-100 text-blue-800 hover:bg-blue-200": variant === "info",
                    }
                  )}
                >
                  <RefreshIcon className="mr-1.5 h-4 w-4" />
                  {retryText}
                </button>
              )}
              
              {onClose && (
                <button
                  onClick={onClose}
                  className={cn(
                    "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    {
                      "text-red-700 hover:bg-red-100": variant === "error",
                      "text-yellow-700 hover:bg-yellow-100": variant === "warning",
                      "text-blue-700 hover:bg-blue-100": variant === "info",
                    }
                  )}
                >
                  閉じる
                </button>
              )}
            </div>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              "flex-shrink-0 p-1 rounded-md transition-colors",
              {
                "text-red-400 hover:text-red-600 hover:bg-red-100": variant === "error",
                "text-yellow-400 hover:text-yellow-600 hover:bg-yellow-100": variant === "warning",
                "text-blue-400 hover:text-blue-600 hover:bg-blue-100": variant === "info",
              }
            )}
          >
            <XIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

interface ErrorIconProps {
  variant: "error" | "warning" | "info";
}

function ErrorIcon({ variant }: ErrorIconProps) {
  if (variant === "error") {
    return (
      <svg
        className="h-5 w-5 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }
  
  if (variant === "warning") {
    return (
      <svg
        className="h-5 w-5 text-yellow-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    );
  }
  
  return (
    <svg
      className="h-5 w-5 text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default ErrorMessage;