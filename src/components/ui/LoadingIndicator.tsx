"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingIndicatorProps {
  /** サイズ */
  size?: "sm" | "md" | "lg" | "xl";
  /** カラー */
  color?: "primary" | "secondary" | "white";
  /** 表示テキスト */
  text?: string;
  /** テキストの位置 */
  textPosition?: "bottom" | "right";
  /** 中央揃え */
  centered?: boolean;
  /** 追加のCSSクラス */
  className?: string;
}

export function LoadingIndicator({
  size = "md",
  color = "primary",
  text,
  textPosition = "bottom",
  centered = false,
  className,
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        centered && "justify-center",
        textPosition === "bottom" && "flex-col gap-2",
        textPosition === "right" && "flex-row gap-3",
        className
      )}
    >
      <Spinner size={size} color={color} />
      {text && (
        <div
          className={cn(
            "text-sm font-medium",
            color === "primary" && "text-primary",
            color === "secondary" && "text-gray-600",
            color === "white" && "text-white"
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
}

interface SpinnerProps {
  size: "sm" | "md" | "lg" | "xl";
  color: "primary" | "secondary" | "white";
}

function Spinner({ size, color }: SpinnerProps) {
  return (
    <svg
      className={cn(
        "animate-spin",
        size === "sm" && "h-4 w-4",
        size === "md" && "h-6 w-6",
        size === "lg" && "h-8 w-8",
        size === "xl" && "h-12 w-12",
        color === "primary" && "text-primary",
        color === "secondary" && "text-gray-600",
        color === "white" && "text-white"
      )}
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

export default LoadingIndicator;
