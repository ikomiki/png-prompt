"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのバリアント */
  variant?: "default" | "primary" | "secondary" | "danger" | "ghost";
  /** ボタンのサイズ */
  size?: "sm" | "md" | "lg";
  /** 読み込み中の状態 */
  loading?: boolean;
  /** 読み込み中のテキスト */
  loadingText?: string;
  /** アイコン */
  icon?: React.ReactNode;
  /** アイコンの位置 */
  iconPosition?: "left" | "right";
  /** フルワイズ */
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      loadingText,
      icon,
      iconPosition = "left",
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          // ベーススタイル
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
          "focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",

          // バリアント
          variant === "default" &&
            "hover:bg-bg-tertiary border border-border bg-bg-secondary text-gray-900",
          variant === "primary" && "bg-primary text-white hover:bg-primary/90",
          variant === "secondary" &&
            "bg-gray-100 text-gray-900 hover:bg-gray-200",
          variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
          variant === "ghost" &&
            "bg-transparent text-gray-700 hover:bg-bg-secondary",

          // サイズ
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",

          // フルワイズ
          fullWidth && "w-full",

          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingSpinner className="h-4 w-4" />}

        {!loading && icon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}

        <span>{loading && loadingText ? loadingText : children}</span>

        {!loading && icon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// ローディングスピナーコンポーネント
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Button;
