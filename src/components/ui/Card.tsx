"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  /** カードのタイトル */
  title: string;
  /** カードの内容 */
  children: React.ReactNode;
  /** 折りたたみ可能にするか */
  collapsible?: boolean;
  /** デフォルトで展開するか */
  defaultExpanded?: boolean;
  /** タイトルアイコン */
  icon?: React.ReactNode;
  /** 追加のCSSクラス */
  className?: string;
}

export function Card({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  icon,
  className,
}: CardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-primary shadow-md",
        className
      )}
    >
      {/* ヘッダー */}
      <div
        className={cn(
          "flex items-center justify-between p-4",
          collapsible && "cursor-pointer hover:bg-bg-secondary transition-colors"
        )}
        onClick={toggleExpanded}
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={(e) => {
          if (collapsible && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            toggleExpanded();
          }
        }}
        aria-expanded={collapsible ? isExpanded : undefined}
        aria-controls={collapsible ? `card-content-${title}` : undefined}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex-shrink-0 text-primary">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        
        {collapsible && (
          <div
            className={cn(
              "flex-shrink-0 transition-transform duration-200",
              isExpanded ? "rotate-180" : "rotate-0"
            )}
          >
            <ChevronDownIcon className="h-5 w-5 text-secondary" />
          </div>
        )}
      </div>

      {/* コンテンツ */}
      {(!collapsible || isExpanded) && (
        <div
          id={collapsible ? `card-content-${title}` : undefined}
          className="border-t border-border p-4"
        >
          {children}
        </div>
      )}
    </div>
  );
}

// シンプルなChevronDownアイコンコンポーネント
function ChevronDownIcon({ className }: { className?: string }) {
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
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}