import React, { useState, useCallback } from "react";
import { PngMetadata, ExportFormat } from "../types/png-metadata";
import {
  exportToJSON,
  exportToCSV,
  exportToText,
  downloadFile,
  generateFilename,
} from "../lib/export-utils";

interface ExportButtonProps {
  /** エクスポート対象のメタデータ */
  metadata: PngMetadata;
  /** 利用可能なエクスポート形式 */
  availableFormats?: ExportFormat[];
  /** エクスポート実行中状態 */
  isExporting?: boolean;
  /** エクスポート完了時のコールバック */
  onExportComplete?: (format: ExportFormat, success: boolean) => void;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
  /** 追加のCSSクラス */
  className?: string;
  /** ボタンを無効化するか */
  disabled?: boolean;
}

const DEFAULT_FORMATS = [
  ExportFormat.JSON,
  ExportFormat.CSV,
  ExportFormat.TEXT,
];

const FORMAT_LABELS = {
  [ExportFormat.JSON]: "JSON",
  [ExportFormat.CSV]: "CSV",
  [ExportFormat.TEXT]: "テキスト",
};

const MIME_TYPES = {
  [ExportFormat.JSON]: "application/json",
  [ExportFormat.CSV]: "text/csv",
  [ExportFormat.TEXT]: "text/plain",
};

export function ExportButton({
  metadata,
  availableFormats = DEFAULT_FORMATS,
  isExporting = false,
  onExportComplete,
  onCancel,
  className = "",
  disabled = false,
}: ExportButtonProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(
    availableFormats[0] || ExportFormat.JSON
  );
  const [showNotification, setShowNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleExport = useCallback(async () => {
    try {
      let exportedData: string;

      switch (selectedFormat) {
        case ExportFormat.JSON:
          exportedData = exportToJSON(metadata);
          break;
        case ExportFormat.CSV:
          exportedData = exportToCSV(metadata);
          break;
        case ExportFormat.TEXT:
          exportedData = exportToText(metadata);
          break;
        default:
          throw new Error("Unsupported export format");
      }

      const filename = generateFilename("metadata", selectedFormat);
      const mimeType = MIME_TYPES[selectedFormat];

      downloadFile(exportedData, filename, mimeType);

      setShowNotification({
        type: "success",
        message: "エクスポートが完了しました",
      });

      onExportComplete?.(selectedFormat, true);
    } catch (error) {
      console.error(error);
      setShowNotification({
        type: "error",
        message: "エクスポートに失敗しました",
      });

      onExportComplete?.(selectedFormat, false);
    }

    // Hide notification after 3 seconds
    setTimeout(() => setShowNotification(null), 3000);
  }, [selectedFormat, metadata, onExportComplete]);

  const handleFormatChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedFormat(event.target.value as ExportFormat);
    },
    []
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  if (isExporting) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <div
            role="progressbar"
            className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"
            aria-label="エクスポート中"
          ></div>
          <span role="status" aria-live="polite">
            エクスポート中...
          </span>
        </div>
        {onCancel && (
          <button
            onClick={handleCancel}
            className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            aria-label="エクスポートをキャンセル"
          >
            キャンセル
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <select
        value={selectedFormat}
        onChange={handleFormatChange}
        className="rounded border border-gray-300 bg-white px-3 py-2"
        aria-label="エクスポート形式を選択"
        role="combobox"
        disabled={disabled}
      >
        {availableFormats.map((format) => (
          <option key={format} value={format}>
            {FORMAT_LABELS[format]}
          </option>
        ))}
      </select>

      <button
        onClick={handleExport}
        disabled={disabled || isExporting}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        aria-label="選択した形式でメタデータをエクスポート"
      >
        エクスポート
      </button>

      {showNotification && (
        <div
          className={`rounded px-3 py-2 text-sm ${
            showNotification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
          role="alert"
          aria-live="assertive"
        >
          {showNotification.message}
        </div>
      )}
    </div>
  );
}
