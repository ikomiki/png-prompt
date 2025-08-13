import { PngMetadata, ExportFormat, PngColorType, PngUnitSpecifier } from "../types/png-metadata";

/**
 * Export metadata to JSON format
 */
export function exportToJSON(metadata: PngMetadata): string {
  const exportData = {
    exportInfo: {
      exportDate: new Date().toISOString(),
      format: "json",
      version: "1.0"
    },
    basicInfo: {
      ...metadata.basicInfo,
      colorTypeName: getColorTypeName(metadata.basicInfo.colorType),
    },
    textMetadata: metadata.textMetadata || [],
    timestamp: metadata.timestamp ? {
      ...metadata.timestamp,
      iso8601: metadata.timestamp.date.toISOString(),
    } : undefined,
    physicalDimensions: metadata.physicalDimensions ? {
      ...metadata.physicalDimensions,
      unitName: getUnitName(metadata.physicalDimensions.unitSpecifier),
      dpi: calculateDPI(metadata.physicalDimensions),
      printSizeCm: calculatePrintSize(metadata.basicInfo, metadata.physicalDimensions),
    } : undefined,
    otherChunks: metadata.otherChunks || [],
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export metadata to CSV format
 */
export function exportToCSV(metadata: PngMetadata): string {
  const rows: string[] = [];
  
  // Add UTF-8 BOM
  let csv = "\uFEFF";
  
  // Header
  rows.push("セクション,項目,値,単位,説明");
  
  // Basic info
  rows.push(`基本情報,ファイル名,${metadata.basicInfo.fileName},,`);
  rows.push(`基本情報,ファイルサイズ,${metadata.basicInfo.fileSize},bytes,${formatFileSize(metadata.basicInfo.fileSize)}`);
  rows.push(`基本情報,画像幅,${metadata.basicInfo.width},pixels,`);
  rows.push(`基本情報,画像高さ,${metadata.basicInfo.height},pixels,`);
  rows.push(`基本情報,ビット深度,${metadata.basicInfo.bitDepth},bits,`);
  rows.push(`基本情報,カラータイプ,${metadata.basicInfo.colorType},,${getColorTypeName(metadata.basicInfo.colorType)}`);
  rows.push(`基本情報,圧縮方式,${metadata.basicInfo.compressionMethod},,`);
  rows.push(`基本情報,フィルター方式,${metadata.basicInfo.filterMethod},,`);
  rows.push(`基本情報,インターレース,${metadata.basicInfo.interlaceMethod},,`);
  
  // Text metadata
  if (metadata.textMetadata && metadata.textMetadata.length > 0) {
    metadata.textMetadata.forEach(text => {
      const escapedText = escapeCSV(text.text);
      const type = text.compressed ? "zTXt chunk" : text.languageTag ? "iTXt chunk" : "tEXt chunk";
      const escapedKeyword = escapeCSV(text.keyword);
      rows.push(`テキスト,${escapedKeyword},${escapedText},,${type}`);
      
      // Add translated keyword if available
      if (text.translatedKeyword) {
        const escapedTranslated = escapeCSV(text.translatedKeyword);
        rows.push(`テキスト,${escapedTranslated}(翻訳),${escapedText},,${type}`);
      }
    });
  }
  
  // Timestamp
  if (metadata.timestamp) {
    rows.push(`日時,作成年,${metadata.timestamp.year},,`);
    rows.push(`日時,作成月,${metadata.timestamp.month},,`);
    rows.push(`日時,作成日,${metadata.timestamp.day},,`);
    rows.push(`日時,作成時,${metadata.timestamp.hour},,`);
    rows.push(`日時,作成分,${metadata.timestamp.minute},,`);
    rows.push(`日時,作成秒,${metadata.timestamp.second},,`);
  }
  
  // Physical dimensions
  if (metadata.physicalDimensions) {
    rows.push(`物理寸法,X軸密度,${metadata.physicalDimensions.pixelsPerUnitX},pixels/meter,`);
    rows.push(`物理寸法,Y軸密度,${metadata.physicalDimensions.pixelsPerUnitY},pixels/meter,`);
    
    const dpi = calculateDPI(metadata.physicalDimensions);
    if (dpi) {
      rows.push(`物理寸法,DPI,${dpi},dots/inch,`);
      const printSize = calculatePrintSize(metadata.basicInfo, metadata.physicalDimensions);
      if (printSize) {
        rows.push(`物理寸法,印刷幅,${printSize.width},cm,`);
        rows.push(`物理寸法,印刷高さ,${printSize.height},cm,`);
      }
    }
  }
  
  // Other chunks
  if (metadata.otherChunks && metadata.otherChunks.length > 0) {
    metadata.otherChunks.forEach(chunk => {
      const type = chunk.critical ? "Critical" : "Ancillary";
      rows.push(`チャンク,${chunk.type},${chunk.size},bytes,${chunk.description} - ${type}`);
    });
  }
  
  csv += rows.join("\n");
  return csv;
}

/**
 * Export metadata to text format
 */
export function exportToText(metadata: PngMetadata): string {
  const sections: string[] = [];
  
  // Header
  sections.push("PNG メタデータレポート");
  sections.push(`生成日時: ${new Date().toLocaleString("ja-JP", { timeZone: "JST" })} JST`);
  sections.push("========================================");
  sections.push("");
  
  // Basic info
  sections.push("■ 基本情報");
  sections.push(`ファイル名: ${metadata.basicInfo.fileName}`);
  sections.push(`ファイルサイズ: ${formatFileSize(metadata.basicInfo.fileSize)}`);
  sections.push(`画像寸法: ${metadata.basicInfo.width} × ${metadata.basicInfo.height} pixels`);
  sections.push(`色深度・タイプ: ${metadata.basicInfo.bitDepth}-bit ${getColorTypeName(metadata.basicInfo.colorType)}`);
  sections.push(`圧縮方式: ${metadata.basicInfo.compressionMethod} (deflate)`);
  sections.push(`フィルター方式: ${metadata.basicInfo.filterMethod} (adaptive)`);
  sections.push(`インターレース: ${metadata.basicInfo.interlaceMethod} (none)`);
  sections.push("");
  
  // Text metadata
  if (metadata.textMetadata && metadata.textMetadata.length > 0) {
    sections.push("■ テキストメタデータ");
    metadata.textMetadata.forEach(text => {
      let line = `${text.keyword}: ${text.text}`;
      if (text.compressed) line += " (圧縮済み)";
      if (text.languageTag) line += ` (${text.languageTag}`;
      if (text.translatedKeyword) line += `, 翻訳: ${text.translatedKeyword}`;
      if (text.languageTag) line += ")";
      sections.push(line);
    });
    sections.push("");
  }
  
  // Timestamp
  if (metadata.timestamp) {
    sections.push("■ 作成日時");
    sections.push(`日時: ${metadata.timestamp.year}年${metadata.timestamp.month}月${metadata.timestamp.day}日 ${metadata.timestamp.hour.toString().padStart(2, '0')}:${metadata.timestamp.minute.toString().padStart(2, '0')}:${metadata.timestamp.second.toString().padStart(2, '0')} UTC`);
    
    const now = new Date();
    const diff = now.getTime() - metadata.timestamp.date.getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (months > 0) {
      sections.push(`相対時間: ${months}ヶ月前`);
    }
    sections.push("");
  }
  
  // Physical dimensions
  if (metadata.physicalDimensions) {
    sections.push("■ 物理的寸法");
    sections.push(`ピクセル密度: ${metadata.physicalDimensions.pixelsPerUnitX} × ${metadata.physicalDimensions.pixelsPerUnitY} pixels/meter`);
    
    const dpi = calculateDPI(metadata.physicalDimensions);
    if (dpi) {
      sections.push(`DPI: ${dpi} × ${dpi} dots/inch`);
      const printSize = calculatePrintSize(metadata.basicInfo, metadata.physicalDimensions);
      if (printSize) {
        const inchWidth = Math.round(printSize.width / 2.54 * 10) / 10;
        const inchHeight = Math.round(printSize.height / 2.54 * 10) / 10;
        sections.push(`印刷サイズ: ${printSize.width} × ${printSize.height} cm (${inchWidth} × ${inchHeight} inches)`);
      }
    }
    sections.push("");
  }
  
  // Other chunks
  if (metadata.otherChunks && metadata.otherChunks.length > 0) {
    sections.push("■ その他チャンク");
    metadata.otherChunks.forEach(chunk => {
      const size = formatFileSize(chunk.size);
      const type = chunk.critical ? "Critical" : "Ancillary";
      sections.push(`${chunk.type.padEnd(8)} ${size.padEnd(12)} (${type}) - ${chunk.description}`);
    });
    sections.push("");
    sections.push(`総チャンク数: ${metadata.otherChunks.length}`);
    const totalSize = metadata.otherChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    sections.push(`合計データサイズ: ${formatFileSize(totalSize)}`);
  }
  
  sections.push("========================================");
  
  return sections.join("\n");
}

/**
 * Download file to browser
 */
export function downloadFile(data: string, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up blob URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(baseName: string, format: ExportFormat): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15).replace("T", "_");
  
  const extensions = {
    [ExportFormat.JSON]: "json",
    [ExportFormat.CSV]: "csv",
    [ExportFormat.TEXT]: "txt",
  };
  
  return `${baseName}_${timestamp}.${extensions[format]}`;
}

// Helper functions
function getColorTypeName(colorType: PngColorType): string {
  switch (colorType) {
    case PngColorType.GRAYSCALE: return "Grayscale";
    case PngColorType.RGB: return "RGB";
    case PngColorType.PALETTE: return "Palette";
    case PngColorType.GRAYSCALE_ALPHA: return "Grayscale with Alpha";
    case PngColorType.RGBA: return "RGBA";
    default: return "Unknown";
  }
}

function getUnitName(unitSpecifier: PngUnitSpecifier): string {
  switch (unitSpecifier) {
    case PngUnitSpecifier.METER: return "meter";
    case PngUnitSpecifier.UNKNOWN: return "unknown";
    default: return "unknown";
  }
}

function calculateDPI(dimensions: { pixelsPerUnitX: number; unitSpecifier: PngUnitSpecifier }): number | null {
  if (dimensions.unitSpecifier === PngUnitSpecifier.METER) {
    return Math.round(dimensions.pixelsPerUnitX / 39.3701);
  }
  return null;
}

function calculatePrintSize(basicInfo: { width: number; height: number }, dimensions: { pixelsPerUnitX: number; unitSpecifier: PngUnitSpecifier }): { width: number; height: number } | null {
  const dpi = calculateDPI(dimensions);
  if (!dpi) return null;
  
  const widthInches = basicInfo.width / dpi;
  const heightInches = basicInfo.height / dpi;
  
  return {
    width: Math.round(widthInches * 2.54 * 10) / 10,
    height: Math.round(heightInches * 2.54 * 10) / 10,
  };
}

function formatFileSize(bytes: number): string {
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  const formattedSize = unitIndex === 0 ? size.toString() : size.toFixed(1);
  return `${formattedSize} ${units[unitIndex]}`;
}

function escapeCSV(text: string): string {
  // If text contains comma, quote, or newline, wrap in quotes and escape quotes
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}