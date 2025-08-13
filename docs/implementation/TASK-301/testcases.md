# TASK-301: メインページ統合 テストケース

## 単体テスト仕様

### MainPage コンポーネント

#### 基本レンダリングテスト
```typescript
describe("MainPage", () => {
  test("should render initial state with file uploader", () => {
    // 初期状態でFileUploaderが表示されることを確認
  });

  test("should render page header and footer", () => {
    // ページヘッダーとフッターが表示されることを確認
  });

  test("should apply responsive classes correctly", () => {
    // レスポンシブクラスが適切に適用されることを確認
  });

  test("should handle initial state prop", () => {
    // initialState prop が正しく処理されることを確認
  });

  test("should toggle debug mode", () => {
    // デバッグモードの切り替えが動作することを確認
  });
});
```

#### 状態管理テスト
```typescript
describe("MainPage State Management", () => {
  test("should transition from IDLE to FILE_SELECTED", () => {
    // ファイル選択時の状態遷移を確認
  });

  test("should transition from FILE_SELECTED to VALIDATING", () => {
    // 検証開始時の状態遷移を確認
  });

  test("should transition from VALIDATING to PARSING", () => {
    // 解析開始時の状態遷移を確認
  });

  test("should transition from PARSING to DISPLAYING_RESULTS", () => {
    // 表示状態への遷移を確認
  });

  test("should handle error states correctly", () => {
    // エラー状態の遷移を確認
  });

  test("should maintain state consistency", () => {
    // 状態の一貫性を確認
  });

  test("should handle concurrent state changes", () => {
    // 同時状態変更の制御を確認
  });
});
```

### AppStateManager テスト

#### 状態遷移テスト
```typescript
describe("AppStateManager", () => {
  test("should initialize with IDLE state", () => {
    // IDLE状態での初期化を確認
  });

  test("should transition states correctly", () => {
    // 状態遷移の正確性を確認
  });

  test("should validate state transitions", () => {
    // 不正な状態遷移の防止を確認
  });

  test("should emit state change events", () => {
    // 状態変更イベントの発行を確認
  });

  test("should handle state rollback on error", () => {
    // エラー時の状態ロールバックを確認
  });
});
```

#### エラーハンドリングテスト
```typescript
describe("AppStateManager Error Handling", () => {
  test("should set error state correctly", () => {
    // エラー状態の設定を確認
  });

  test("should clear error state", () => {
    // エラー状態のクリアを確認
  });

  test("should handle multiple errors", () => {
    // 複数エラーの処理を確認
  });

  test("should categorize errors correctly", () => {
    // エラーカテゴリ分類を確認
  });
});
```

### ProcessingProgress テスト

#### プログレス管理テスト
```typescript
describe("ProcessingProgress", () => {
  test("should initialize with zero progress", () => {
    // ゼロ進行状況での初期化を確認
  });

  test("should update overall progress", () => {
    // 全体進行状況の更新を確認
  });

  test("should update stage progress", () => {
    // ステージ進行状況の更新を確認
  });

  test("should calculate estimated time remaining", () => {
    // 推定残り時間の計算を確認
  });

  test("should handle progress completion", () => {
    // 進行完了の処理を確認
  });

  test("should validate progress values", () => {
    // 進行状況値の検証を確認
  });
});
```

## 統合テスト仕様

### 完全ワークフローテスト

#### 正常フローテスト
```typescript
describe("Complete Workflow Integration", () => {
  test("should complete full file processing workflow", () => {
    // 完全なファイル処理ワークフローを確認
    // 1. 初期状態表示
    // 2. ファイル選択
    // 3. 検証処理
    // 4. 解析処理
    // 5. メタデータ表示
    // 6. エクスポート機能
  });

  test("should handle file selection correctly", () => {
    // ファイル選択の統合処理を確認
    // 1. FileUploader との連携
    // 2. ファイル検証
    // 3. 状態更新
  });

  test("should process PNG metadata correctly", () => {
    // PNG メタデータ処理の統合を確認
    // 1. PNG 署名確認
    // 2. チャンク解析
    // 3. メタデータ抽出
    // 4. 表示データ準備
  });

  test("should display metadata correctly", () => {
    // メタデータ表示の統合を確認
    // 1. MetadataDisplay 表示
    // 2. ExportButton 表示
    // 3. データバインディング
  });

  test("should handle export functionality", () => {
    // エクスポート機能の統合を確認
    // 1. エクスポートボタン動作
    // 2. 形式選択
    // 3. ファイルダウンロード
  });
});
```

#### エラーフローテスト
```typescript
describe("Error Flow Integration", () => {
  test("should handle file validation errors", () => {
    // ファイル検証エラーの統合処理を確認
    // 1. 不正ファイル選択
    // 2. エラー状態遷移
    // 3. エラー表示
    // 4. 回復オプション
  });

  test("should handle PNG parsing errors", () => {
    // PNG解析エラーの統合処理を確認
    // 1. 破損ファイル処理
    // 2. エラー検出
    // 3. 適切なエラー表示
    // 4. 再試行機能
  });

  test("should handle memory errors", () => {
    // メモリエラーの統合処理を確認
    // 1. 大容量ファイル
    // 2. メモリ不足検出
    // 3. エラー表示
    // 4. ファイルサイズ制限提案
  });

  test("should recover from errors gracefully", () => {
    // エラーからの適切な回復を確認
    // 1. エラー状態
    // 2. 回復オプション選択
    // 3. 状態リセット
    // 4. 正常処理再開
  });
});
```

### パフォーマンステスト

#### 処理時間テスト
```typescript
describe("Performance Integration", () => {
  test("should process small files within time limit", () => {
    // 小ファイル（< 1MB）の処理時間を確認
    // 目標: 1秒以内
  });

  test("should process medium files within time limit", () => {
    // 中ファイル（1-10MB）の処理時間を確認
    // 目標: 3秒以内
  });

  test("should process large files within time limit", () => {
    // 大ファイル（10-100MB）の処理時間を確認
    // 目標: 10秒以内
  });

  test("should maintain UI responsiveness during processing", () => {
    // 処理中のUI応答性を確認
    // 目標: 100ms以内の反応
  });

  test("should update progress indicators regularly", () => {
    // 進行表示の定期更新を確認
    // 目標: 100ms間隔
  });
});
```

#### メモリ使用量テスト
```typescript
describe("Memory Usage Integration", () => {
  test("should maintain reasonable memory usage", () => {
    // 適切なメモリ使用量を確認
    // 目標: ファイルサイズの2倍以下
  });

  test("should clean up memory after processing", () => {
    // 処理後のメモリクリーンアップを確認
  });

  test("should handle memory pressure gracefully", () => {
    // メモリ不足状況での適切な処理を確認
  });
});
```

## E2Eテスト仕様

### ユーザーワークフローテスト

#### 基本操作フローテスト
```typescript
describe("E2E User Workflow", () => {
  test("should complete end-to-end workflow", () => {
    // エンドツーエンドワークフローを確認
    // 1. ページ訪問
    // 2. ファイル選択（ドラッグ&ドロップ）
    // 3. 処理完了まで待機
    // 4. メタデータ表示確認
    // 5. エクスポート実行
    // 6. ファイルダウンロード確認
  });

  test("should handle file selection via button", () => {
    // ボタンによるファイル選択のE2Eを確認
    // 1. ファイル選択ボタンクリック
    // 2. ファイルダイアログ操作
    // 3. ファイル選択確認
    // 4. 処理開始確認
  });

  test("should handle drag and drop file selection", () => {
    // ドラッグ&ドロップのE2Eを確認
    // 1. ファイルドラッグ開始
    // 2. ドロップゾーンへの移動
    // 3. ファイルドロップ
    // 4. 処理開始確認
  });

  test("should display processing progress", () => {
    // 処理進行表示のE2Eを確認
    // 1. 大容量ファイル選択
    // 2. 進行表示確認
    // 3. ステージ更新確認
    // 4. 完了確認
  });
});
```

#### エラーハンドリングE2E
```typescript
describe("E2E Error Handling", () => {
  test("should handle invalid file gracefully", () => {
    // 無効ファイル処理のE2Eを確認
    // 1. 非PNGファイル選択
    // 2. エラーメッセージ表示確認
    // 3. 回復オプション確認
    // 4. 正しいファイルでの再試行
  });

  test("should handle corrupted PNG file", () => {
    // 破損PNGファイル処理のE2Eを確認
    // 1. 破損ファイル選択
    // 2. 解析エラー検出
    // 3. エラー表示確認
    // 4. 適切な回復オプション
  });

  test("should handle network issues", () => {
    // ネットワーク問題のE2E処理を確認
    // 将来の機能拡張用
  });
});
```

### アクセシビリティE2Eテスト

#### スクリーンリーダーテスト
```typescript
describe("E2E Accessibility", () => {
  test("should work with screen readers", () => {
    // スクリーンリーダーでのE2E操作を確認
    // 1. ページ構造の読み上げ
    // 2. ファイル選択操作
    // 3. 処理状況の音声フィードバック
    // 4. メタデータ読み上げ
    // 5. エクスポート操作
  });

  test("should support keyboard-only navigation", () => {
    // キーボードのみでのE2E操作を確認
    // 1. Tab順序での移動
    // 2. Enter/Spaceでの操作
    // 3. 全機能への到達可能性
    // 4. フォーカス表示の明確性
  });

  test("should work in high contrast mode", () => {
    // 高コントラストモードでのE2Eを確認
    // 1. 視認性確認
    // 2. 操作可能性確認
    // 3. フィードバックの明確性
  });
});
```

### レスポンシブE2Eテスト

#### デバイス別テスト
```typescript
describe("E2E Responsive Design", () => {
  test("should work on mobile devices", () => {
    // モバイルデバイスでのE2E操作を確認
    // 1. タッチ操作
    // 2. 縦スクロール
    // 3. レイアウト適応
    // 4. ファイル選択
    // 5. メタデータ表示
  });

  test("should work on tablet devices", () => {
    // タブレットデバイスでのE2E操作を確認
    // 1. 適応レイアウト
    // 2. タッチ + マウス操作
    // 3. 画面回転対応
  });

  test("should work on desktop browsers", () => {
    // デスクトップブラウザでのE2E操作を確認
    // 1. マルチカラムレイアウト
    // 2. マウス操作
    // 3. キーボードショートカット
  });

  test("should handle screen orientation changes", () => {
    // 画面回転でのE2E動作を確認
    // 1. 縦向き表示
    // 2. 横向き回転
    // 3. レイアウト再調整
    // 4. 機能継続性
  });
});
```

## パフォーマンステスト仕様

### ロードパフォーマンステスト

#### 初期ロードテスト
```typescript
describe("Load Performance", () => {
  test("should load initial page within time limit", () => {
    // 初期ページロード時間を確認
    // 目標: 2秒以内
    // 測定項目: TTFB, FCP, LCP
  });

  test("should be interactive quickly", () => {
    // インタラクティブ時間を確認
    // 目標: 3秒以内のTTI
  });

  test("should have minimal layout shift", () => {
    // レイアウト安定性を確認
    // 目標: CLS < 0.1
  });
});
```

#### 処理パフォーマンステスト
```typescript
describe("Processing Performance", () => {
  test("should process files efficiently", () => {
    // ファイル処理効率を確認
    // 各サイズカテゴリでの処理時間測定
  });

  test("should maintain frame rate during processing", () => {
    // 処理中のフレームレート維持を確認
    // 目標: 30fps以上
  });

  test("should handle memory efficiently", () => {
    // メモリ効率性を確認
    // メモリ使用量とガベージコレクション頻度
  });
});
```

## テストデータ

### ファイルテストデータセット
```typescript
const TestFiles = {
  // 小サイズファイル
  small: {
    basic: "test-basic-1mb.png",
    withMetadata: "test-metadata-500kb.png",
    minimal: "test-minimal-100kb.png"
  },
  
  // 中サイズファイル  
  medium: {
    standard: "test-standard-5mb.png",
    heavyMetadata: "test-heavy-metadata-8mb.png",
    manyChunks: "test-many-chunks-3mb.png"
  },
  
  // 大サイズファイル
  large: {
    highRes: "test-4k-50mb.png",
    ultraRes: "test-8k-100mb.png"
  },
  
  // 特殊ケース
  special: {
    corrupted: "test-corrupted.png",
    invalidSignature: "test-invalid-signature.png",
    truncated: "test-truncated.png",
    emptyMetadata: "test-no-metadata.png"
  },
  
  // 非PNGファイル
  invalid: {
    jpeg: "test-image.jpg",
    text: "test-file.txt",
    executable: "test-file.exe"
  }
};
```

### 状態遷移テストケース
```typescript
const StateTransitionTests = {
  valid: [
    { from: AppState.IDLE, to: AppState.FILE_SELECTED, trigger: "fileSelect" },
    { from: AppState.FILE_SELECTED, to: AppState.VALIDATING, trigger: "startValidation" },
    { from: AppState.VALIDATING, to: AppState.PARSING, trigger: "validationSuccess" },
    { from: AppState.PARSING, to: AppState.DISPLAYING_RESULTS, trigger: "parsingSuccess" },
    { from: AppState.DISPLAYING_RESULTS, to: AppState.EXPORTING, trigger: "startExport" },
    { from: AppState.EXPORTING, to: AppState.DISPLAYING_RESULTS, trigger: "exportComplete" }
  ],
  
  error: [
    { from: AppState.VALIDATING, to: AppState.VALIDATION_ERROR, trigger: "validationFailed" },
    { from: AppState.PARSING, to: AppState.PARSING_ERROR, trigger: "parsingFailed" }
  ],
  
  recovery: [
    { from: AppState.VALIDATION_ERROR, to: AppState.IDLE, trigger: "reset" },
    { from: AppState.PARSING_ERROR, to: AppState.FILE_SELECTED, trigger: "retry" }
  ]
};
```

## モック・ヘルパー関数

### テスト用モック
```typescript
const mockFileProcessing = {
  validateFile: vi.fn(),
  parseChunks: vi.fn(), 
  extractMetadata: vi.fn(),
  
  // 成功ケース用モック
  setupSuccessCase: () => {
    mockFileProcessing.validateFile.mockResolvedValue(true);
    mockFileProcessing.parseChunks.mockResolvedValue(mockChunks);
    mockFileProcessing.extractMetadata.mockResolvedValue(mockMetadata);
  },
  
  // エラーケース用モック
  setupErrorCase: (errorType: string) => {
    switch(errorType) {
      case 'validation':
        mockFileProcessing.validateFile.mockRejectedValue(new ValidationError());
        break;
      case 'parsing':
        mockFileProcessing.parseChunks.mockRejectedValue(new ParseError());
        break;
    }
  }
};
```

### テスト用ヘルパー
```typescript
const testHelpers = {
  // メインページレンダリングヘルパー
  renderMainPage: (props = {}) => {
    const defaultProps = {
      initialState: AppState.IDLE,
      debugMode: false
    };
    return render(<MainPage {...defaultProps} {...props} />);
  },
  
  // ファイル選択シミュレーション
  simulateFileSelect: async (component, file: File) => {
    const fileInput = component.getByLabelText(/ファイル選択/);
    await userEvent.upload(fileInput, file);
  },
  
  // 状態遷移待機ヘルパー
  waitForState: async (expectedState: AppState, timeout = 5000) => {
    await waitFor(() => {
      expect(getCurrentAppState()).toBe(expectedState);
    }, { timeout });
  },
  
  // プログレス確認ヘルパー
  expectProgressUpdate: (component, expectedProgress: number) => {
    const progressBar = component.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', expectedProgress.toString());
  },
  
  // エラー表示確認ヘルパー
  expectErrorDisplay: (component, errorMessage: string) => {
    const errorElement = component.getByRole('alert');
    expect(errorElement).toHaveTextContent(errorMessage);
  }
};
```

## テスト実行設定

### テスト環境設定
```typescript
// test-setup.ts
const testEnvironmentSetup = {
  // ファイルAPI モック
  setupFileAPI: () => {
    global.File = vi.fn().mockImplementation((parts, name, options) => ({
      name,
      size: parts.reduce((sum, part) => sum + part.length, 0),
      type: options?.type || 'application/octet-stream'
    }));
    
    global.FileReader = vi.fn().mockImplementation(() => ({
      readAsArrayBuffer: vi.fn(),
      result: null,
      onload: null,
      onerror: null
    }));
  },
  
  // Worker API モック
  setupWorkerAPI: () => {
    global.Worker = vi.fn().mockImplementation(() => ({
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: null,
      onerror: null
    }));
  },
  
  // Performance API モック
  setupPerformanceAPI: () => {
    global.performance = {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn()
    };
  }
};
```

### テストユーティリティ
```typescript
const testUtils = {
  // 大容量データ生成
  generateLargeFile: (sizeInMB: number): File => {
    const data = new Uint8Array(sizeInMB * 1024 * 1024);
    return new File([data], `test-${sizeInMB}mb.png`, { type: 'image/png' });
  },
  
  // PNG署名付きテストファイル
  createValidPngFile: (): File => {
    const pngSignature = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    return new File([pngSignature], 'valid.png', { type: 'image/png' });
  },
  
  // パフォーマンス測定ヘルパー
  measurePerformance: async (fn: () => Promise<void>): Promise<{ duration: number, memory: number }> => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    await fn();
    
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return {
      duration: endTime - startTime,
      memory: endMemory - startMemory
    };
  }
};
```