"use client";

import React, { useState, useCallback } from "react";
import { FileUploader } from "../components/FileUploader";
import { MetadataDisplay } from "../components/MetadataDisplay";
import { ExportButton } from "../components/ExportButton";
import { AppState, ErrorType } from "../types/png-metadata";
import type { PngMetadata, AppError } from "../types/png-metadata";
import {
  validatePngFile,
  extractBasicPngInfo,
  readFileAsArrayBuffer,
} from "../lib/file-validator";

// Helper functions for PNG chunk information
function getChunkDescription(chunkType: string): string {
  const descriptions: Record<string, string> = {
    IHDR: "画像ヘッダー",
    PLTE: "パレット",
    IDAT: "画像データ",
    IEND: "画像終端",
    tRNS: "透明度",
    cHRM: "色度",
    gAMA: "ガンマ",
    iCCP: "ICCプロファイル",
    sBIT: "重要ビット",
    sRGB: "sRGB色空間",
    tEXt: "テキスト",
    zTXt: "圧縮テキスト",
    iTXt: "国際化テキスト",
    bKGD: "背景色",
    hIST: "ヒストグラム",
    pHYs: "物理的ピクセル寸法",
    sPLT: "推奨パレット",
    tIME: "タイムスタンプ",
  };
  return descriptions[chunkType] || `未知のチャンク (${chunkType})`;
}

function isCriticalChunk(chunkType: string): boolean {
  // PNG仕様: 大文字で始まるチャンクは重要(critical)
  return (
    typeof chunkType[0] === "string" &&
    chunkType[0] >= "A" &&
    chunkType[0] <= "Z"
  );
}

export default function MainPage() {
  const initialState = AppState.IDLE;
  const debugMode = false;
  const [appState, setAppState] = useState<AppState>(initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PngMetadata | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setAppState(AppState.FILE_SELECTED);
    setError(null);
  }, []);

  const handleValidateStart = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setAppState(AppState.VALIDATING);
      setError(null);

      // Step 1: Validate PNG file
      const validationResult = await validatePngFile(selectedFile, {
        checkPngSignature: true,
      });

      if (!validationResult.isValid) {
        setError(
          validationResult.error
            ? validationResult.error
            : {
                type: ErrorType.PARSE_ERROR,
                message: "ファイルの検証に失敗しました",
              }
        );
        setAppState(AppState.VALIDATION_ERROR);
        return;
      }

      // Step 2: Parse PNG and extract metadata
      setAppState(AppState.PARSING);

      // Read file as ArrayBuffer and extract all PNG information
      const buffer = await readFileAsArrayBuffer(selectedFile);
      const pngInfo = extractBasicPngInfo(buffer);

      // Create metadata with actual PNG information
      const pngMetadata: PngMetadata = {
        basicInfo: {
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          width: pngInfo.basicInfo.width,
          height: pngInfo.basicInfo.height,
          bitDepth: pngInfo.basicInfo.bitDepth,
          colorType: pngInfo.basicInfo.colorType,
          compressionMethod: pngInfo.basicInfo.compressionMethod,
          filterMethod: pngInfo.basicInfo.filterMethod,
          interlaceMethod: pngInfo.basicInfo.interlaceMethod,
        },
        textMetadata: pngInfo.textMetadata.map((item) => ({
          keyword: item.keyword,
          text: item.text,
        })),
        otherChunks: pngInfo.otherChunks.map((chunk) => ({
          type: chunk.type,
          size: chunk.size,
          description: getChunkDescription(chunk.type),
          critical: isCriticalChunk(chunk.type),
        })),
      };

      // Simulate parsing time for better UX
      setTimeout(() => {
        setMetadata(pngMetadata);
        setAppState(AppState.DISPLAYING_RESULTS);
      }, 500);
    } catch (error) {
      setError({
        type: ErrorType.PARSE_ERROR,
        message: "PNG処理中にエラーが発生しました",
        details: error instanceof Error ? error.message : String(error),
      });
      setAppState(AppState.PARSING_ERROR);
    }
  }, [selectedFile]);

  const handleError = useCallback((errorObj: AppError) => {
    console.log("MainPage: Error received:", errorObj);
    setError(errorObj);
    if (
      errorObj.message.includes("検証") ||
      errorObj.message.includes("ファイル形式") ||
      errorObj.message.includes("PNG")
    ) {
      setAppState(AppState.VALIDATION_ERROR);
    } else {
      setAppState(AppState.PARSING_ERROR);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setSelectedFile(null);
    setMetadata(null);
    setError(null);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    if (selectedFile) {
      setAppState(AppState.FILE_SELECTED);
    } else {
      setAppState(AppState.IDLE);
    }
  }, [selectedFile]);

  const handleNewFileSelect = useCallback(() => {
    setAppState(AppState.IDLE);
    setSelectedFile(null);
    setMetadata(null);
    setError(null);
    setResetTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header role="banner" className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PNG メタデータ表示
              </h1>
              {selectedFile && (
                <p className="mt-1 text-sm text-gray-600">
                  現在のファイル: {selectedFile.name}
                </p>
              )}
            </div>
            {selectedFile && appState === AppState.DISPLAYING_RESULTS && (
              <button
                onClick={handleNewFileSelect}
                className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                aria-label="新しいファイルを選択"
              >
                別のファイルを選択
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main role="main" className="container mx-auto px-4 py-8">
        {/* Debug Panel */}
        {debugMode && (
          <div
            data-testid="debug-panel"
            className="mb-4 rounded border bg-yellow-100 p-4"
          >
            <h3>Debug Info</h3>
            <p>State: {appState}</p>
            <p>File: {selectedFile?.name || "None"}</p>
          </div>
        )}

        {/* State Indicator */}
        <div data-testid="state-indicator" className="sr-only">
          {appState}
        </div>

        {/* Content based on app state */}
        {(appState === AppState.IDLE ||
          appState === AppState.FILE_SELECTED) && (
          <div>
            <FileUploader
              onFileSelect={handleFileSelect}
              onError={handleError}
              resetTrigger={resetTrigger}
            />
            {appState === AppState.FILE_SELECTED && selectedFile && (
              <div
                data-testid="file-selected-indicator"
                className="mt-4 rounded bg-blue-100 p-4"
              >
                ファイルが選択されました: {selectedFile.name}
                <button
                  className="ml-4 rounded bg-blue-600 px-4 py-2 text-white"
                  onClick={handleValidateStart}
                >
                  検証開始
                </button>
              </div>
            )}
          </div>
        )}

        {appState === AppState.VALIDATING && (
          <div data-testid="validating-indicator" className="py-8 text-center">
            <div
              role="progressbar"
              className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
            ></div>
            <p>ファイルを検証中...</p>
          </div>
        )}

        {appState === AppState.PARSING && (
          <div data-testid="parsing-indicator" className="py-8 text-center">
            <div
              role="progressbar"
              className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
              aria-valuenow={50}
            ></div>
            <p>解析中...</p>
            <button className="mt-4 rounded bg-gray-600 px-4 py-2 text-white">
              キャンセル
            </button>
          </div>
        )}

        {(appState === AppState.DISPLAYING_RESULTS ||
          appState === AppState.EXPORTING) &&
          metadata && (
            <div>
              <MetadataDisplay
                metadata={metadata}
                file={selectedFile ?? undefined}
                onNewFileSelect={handleNewFileSelect}
              />
              <div className="mt-6">
                <ExportButton
                  metadata={metadata}
                  isExporting={appState === AppState.EXPORTING}
                />
              </div>
            </div>
          )}

        {/* Processing indicators */}
        {appState === AppState.PARSING && (
          <div data-testid="processing-indicator" className="mt-4">
            Processing file...
          </div>
        )}

        {/* Error display */}
        {(error || appState.toString().includes("ERROR")) && (
          <div
            role="alert"
            className="mt-4 rounded border border-red-400 bg-red-100 p-4"
          >
            <p className="text-red-700">
              {appState === AppState.VALIDATION_ERROR &&
                "ファイル形式が正しくありません"}
              {appState === AppState.PARSING_ERROR && "PNG解析に失敗しました"}
              {error?.message.includes("Memory") && "メモリ不足です"}
              {error?.message.includes("Corrupted") && "PNG解析に失敗しました"}
              {!appState.toString().includes("ERROR") && error?.message}
            </p>
            <button
              className="mr-2 mt-2 rounded bg-red-600 px-4 py-2 text-white"
              onClick={handleRetry}
            >
              再試行
            </button>
            <button
              className="mt-2 rounded bg-gray-600 px-4 py-2 text-white"
              onClick={handleReset}
            >
              リセット
            </button>
          </div>
        )}

        {/* Live region for screen readers */}
        <div aria-live="polite" aria-label="処理状況" className="sr-only">
          {appState === AppState.PARSING && "ファイルを解析中です"}
          {appState === AppState.DISPLAYING_RESULTS && "解析が完了しました"}
        </div>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="mt-12 bg-gray-800 py-6 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 PNG メタデータアプリケーション</p>
        </div>
      </footer>
    </div>
  );
}
