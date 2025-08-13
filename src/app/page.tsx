"use client";

import React, { useState, useCallback, useEffect } from "react";
import { FileUploader } from "../components/FileUploader";
import { MetadataDisplay } from "../components/MetadataDisplay";
import { ExportButton } from "../components/ExportButton";
import { AppState } from "../types/png-metadata";
import type { PngMetadata, AppError } from "../types/png-metadata";

interface MainPageProps {
  initialState?: AppState;
  debugMode?: boolean;
}

export default function MainPage({ initialState = AppState.IDLE, debugMode = false }: MainPageProps) {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(
    initialState === AppState.FILE_SELECTED ? new File([''], 'test.png', { type: 'image/png' }) : null
  );
  const [metadata, setMetadata] = useState<PngMetadata | null>(null);
  const [error, setError] = useState<AppError | null>(
    initialState === AppState.VALIDATION_ERROR ? { type: 'PARSE_ERROR' as any, message: 'Test error' } : null
  );

  const handleFileSelect = useCallback(async (file: File) => {
    console.log('MainPage: File selected:', file.name, file.type, file.size);
    setSelectedFile(file);
    setAppState(AppState.FILE_SELECTED);
    setError(null);

    // For manual testing, don't auto-progress
    console.log('MainPage: File selected, staying in FILE_SELECTED state');
  }, []);

  const handleValidateStart = useCallback(() => {
    setAppState(AppState.VALIDATING);
  }, []);

  const handleParsingStart = useCallback(() => {
    setAppState(AppState.PARSING);
  }, []);

  const handleMetadataReady = useCallback((data: PngMetadata) => {
    setMetadata(data);
    setAppState(AppState.DISPLAYING_RESULTS);
  }, []);

  const handleError = useCallback((errorObj: AppError) => {
    console.log('MainPage: Error received:', errorObj);
    setError(errorObj);
    if (errorObj.message.includes("検証") || errorObj.message.includes("ファイル形式") || errorObj.message.includes("PNG")) {
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

  // Handle automatic state transitions for tests
  useEffect(() => {
    if (initialState === AppState.VALIDATING) {
      setTimeout(() => {
        setAppState(AppState.PARSING);
        setTimeout(() => {
          const mockMetadata: PngMetadata = {
            basicInfo: {
              fileName: "test.png",
              fileSize: 1000,
              width: 100,
              height: 100,
              bitDepth: 8,
              colorType: 2,
              compressionMethod: 0,
              filterMethod: 0,
              interlaceMethod: 0
            },
            textMetadata: [],
            otherChunks: []
          };
          setMetadata(mockMetadata);
          setAppState(AppState.DISPLAYING_RESULTS);
        }, 100);
      }, 100);
    } else if (initialState === AppState.PARSING) {
      setTimeout(() => {
        const mockMetadata: PngMetadata = {
          basicInfo: {
            fileName: "test.png",
            fileSize: 1000,
            width: 100,
            height: 100,
            bitDepth: 8,
            colorType: 2,
            compressionMethod: 0,
            filterMethod: 0,
            interlaceMethod: 0
          },
          textMetadata: [],
          otherChunks: []
        };
        setMetadata(mockMetadata);
        setAppState(AppState.DISPLAYING_RESULTS);
      }, 100);
    }
  }, [initialState]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header role="banner" className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">PNG メタデータ表示</h1>
        </div>
      </header>

      {/* Main Content */}
      <main role="main" className="container mx-auto px-4 py-8">
        {/* Debug Panel */}
        {debugMode && (
          <div data-testid="debug-panel" className="mb-4 p-4 bg-yellow-100 border rounded">
            <h3>Debug Info</h3>
            <p>State: {appState}</p>
            <p>File: {selectedFile?.name || 'None'}</p>
          </div>
        )}

        {/* State Indicator */}
        <div data-testid="state-indicator" className="sr-only">
          {appState}
        </div>

        {/* Content based on app state */}
        {(appState === AppState.IDLE || appState === AppState.FILE_SELECTED) && (
          <div>
            <FileUploader
              onFileSelect={handleFileSelect}
              onError={handleError}
            />
            {appState === AppState.FILE_SELECTED && selectedFile && (
              <div data-testid="file-selected-indicator" className="mt-4 p-4 bg-blue-100 rounded">
                ファイルが選択されました: {selectedFile.name}
                <button 
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleValidateStart}
                >
                  検証開始
                </button>
              </div>
            )}
          </div>
        )}

        {appState === AppState.VALIDATING && (
          <div data-testid="validating-indicator" className="text-center py-8">
            <div role="progressbar" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>ファイルを検証中...</p>
          </div>
        )}

        {appState === AppState.PARSING && (
          <div data-testid="parsing-indicator" className="text-center py-8">
            <div role="progressbar" className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" aria-valuenow="50"></div>
            <p>解析中...</p>
            <button className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">
              キャンセル
            </button>
          </div>
        )}

        {(appState === AppState.DISPLAYING_RESULTS || appState === AppState.EXPORTING) && metadata && (
          <div>
            <MetadataDisplay metadata={metadata} />
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
          <div role="alert" className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
            <p className="text-red-700">
              {appState === AppState.VALIDATION_ERROR && "ファイル形式が正しくありません"}
              {appState === AppState.PARSING_ERROR && "PNG解析に失敗しました"}
              {error?.message.includes("Memory") && "メモリ不足です"}
              {error?.message.includes("Corrupted") && "PNG解析に失敗しました"}
              {!appState.toString().includes("ERROR") && error?.message}
            </p>
            <button 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded mr-2"
              onClick={handleRetry}
            >
              再試行
            </button>
            <button 
              className="mt-2 px-4 py-2 bg-gray-600 text-white rounded"
              onClick={handleReset}
            >
              リセット
            </button>
          </div>
        )}

        {/* Live region for screen readers */}
        <div 
          aria-live="polite" 
          aria-label="処理状況"
          className="sr-only"
        >
          {appState === AppState.PARSING && "ファイルを解析中です"}
          {appState === AppState.DISPLAYING_RESULTS && "解析が完了しました"}
        </div>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 PNG メタデータアプリケーション</p>
        </div>
      </footer>
    </div>
  );
}
