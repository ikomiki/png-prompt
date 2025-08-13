# TASK-204: エクスポート機能 テストケース

## 単体テスト仕様

### ExportButton コンポーネント

#### 基本表示テスト
```typescript
describe("ExportButton", () => {
  test("should render export button with default format", () => {
    // デフォルト形式（JSON）でボタンが表示されることを確認
  });

  test("should display available export formats", () => {
    // 利用可能な形式がドロップダウンで表示されることを確認
  });

  test("should handle format selection", () => {
    // 形式選択時の状態変更を確認
  });

  test("should disable button when exporting", () => {
    // エクスポート中はボタンが無効化されることを確認
  });

  test("should handle disabled state", () => {
    // disabled prop の動作を確認
  });
});
```

#### インタラクションテスト
```typescript
describe("ExportButton interactions", () => {
  test("should trigger export on button click", () => {
    // ボタンクリック時のエクスポート実行を確認
  });

  test("should show progress during export", () => {
    // エクスポート中のプログレス表示を確認
  });

  test("should call onExportComplete callback", () => {
    // エクスポート完了時のコールバック実行を確認
  });

  test("should handle export cancellation", () => {
    // エクスポート キャンセル機能を確認
  });

  test("should show success notification", () => {
    // 成功時の通知表示を確認
  });

  test("should handle export errors", () => {
    // エラー時の処理を確認
  });
});
```

### ExportFormatSelector コンポーネント

#### フォーマット選択テスト
```typescript
describe("ExportFormatSelector", () => {
  test("should render all available formats", () => {
    // 全ての利用可能形式が表示されることを確認
  });

  test("should highlight selected format", () => {
    // 選択中の形式がハイライト表示されることを確認
  });

  test("should call onFormatChange on selection", () => {
    // 形式変更時のコールバック実行を確認
  });

  test("should show format descriptions", () => {
    // 各形式の説明が表示されることを確認
  });

  test("should handle keyboard navigation", () => {
    // キーボードでの形式選択を確認
  });
});
```

#### アクセシビリティテスト
```typescript
describe("ExportFormatSelector accessibility", () => {
  test("should have proper ARIA attributes", () => {
    // ARIA属性が適切に設定されることを確認
  });

  test("should be screen reader accessible", () => {
    // スクリーンリーダー対応を確認
  });

  test("should support keyboard navigation", () => {
    // Tab/Arrow キーでの操作を確認
  });
});
```

### ExportProgressIndicator コンポーネント

#### 進行状況表示テスト
```typescript
describe("ExportProgressIndicator", () => {
  test("should show progress percentage", () => {
    // 進行状況の割合表示を確認
  });

  test("should display current stage", () => {
    // 現在の処理段階表示を確認
  });

  test("should show cancel button when cancellable", () => {
    // キャンセル可能時のボタン表示を確認
  });

  test("should handle progress updates", () => {
    // 進行状況の更新処理を確認
  });

  test("should hide when not active", () => {
    // 非アクティブ時の非表示を確認
  });
});
```

## ユーティリティ関数テスト

### export-utils.ts 関数群

#### JSON エクスポートテスト
```typescript
describe("JSON Export", () => {
  test("should export complete metadata as JSON", () => {
    // 完全なメタデータのJSON出力を確認
  });

  test("should handle partial metadata", () => {
    // 部分的なメタデータの処理を確認
  });

  test("should format dates as ISO 8601", () => {
    // 日付のISO 8601形式変換を確認
  });

  test("should include export metadata", () => {
    // エクスポート情報（日時、形式等）の含有を確認
  });

  test("should handle null/undefined values", () => {
    // null/undefined値の適切な処理を確認
  });

  test("should escape special characters", () => {
    // 特殊文字のエスケープ処理を確認
  });

  test("should maintain data structure integrity", () => {
    // データ構造の整合性を確認
  });
});
```

#### CSV エクスポートテスト
```typescript
describe("CSV Export", () => {
  test("should generate valid CSV format", () => {
    // 有効なCSV形式の生成を確認
  });

  test("should include UTF-8 BOM", () => {
    // UTF-8 BOMの含有を確認
  });

  test("should handle Japanese characters", () => {
    // 日本語文字の適切な処理を確認
  });

  test("should escape CSV special characters", () => {
    // CSV特殊文字（カンマ、改行等）のエスケープを確認
  });

  test("should organize data by sections", () => {
    // セクション別のデータ整理を確認
  });

  test("should handle empty sections", () => {
    // 空セクションの処理を確認
  });

  test("should maintain column structure", () => {
    // 列構造の一貫性を確認
  });
});
```

#### テキスト エクスポートテスト
```typescript
describe("Text Export", () => {
  test("should generate readable text format", () => {
    // 読みやすいテキスト形式の生成を確認
  });

  test("should include section headers", () => {
    // セクションヘッダーの含有を確認
  });

  test("should format Japanese text properly", () => {
    // 日本語テキストの適切なフォーマットを確認
  });

  test("should handle multiline text", () => {
    // 複数行テキストの処理を確認
  });

  test("should include summary information", () => {
    // サマリー情報の含有を確認
  });

  test("should handle missing data gracefully", () => {
    // 欠損データの適切な処理を確認
  });
});
```

### ファイルダウンロード機能テスト

#### ダウンロード処理テスト
```typescript
describe("File Download", () => {
  test("should create download link with correct MIME type", () => {
    // 正しいMIMEタイプでのダウンロードリンク作成を確認
  });

  test("should set appropriate filename", () => {
    // 適切なファイル名設定を確認
  });

  test("should handle Japanese filenames", () => {
    // 日本語ファイル名の処理を確認
  });

  test("should trigger browser download", () => {
    // ブラウザダウンロードの実行を確認
  });

  test("should clean up blob URLs", () => {
    // Blob URLのクリーンアップを確認
  });

  test("should handle download errors", () => {
    // ダウンロード エラーの処理を確認
  });
});
```

## 統合テスト仕様

### エクスポート機能統合テスト

```typescript
describe("Export Integration", () => {
  test("should export metadata from MetadataDisplay", () => {
    // MetadataDisplayからのエクスポート統合を確認
    // 1. MetadataDisplayコンポーネント表示
    // 2. エクスポートボタンクリック
    // 3. 形式選択
    // 4. エクスポート実行
    // 5. ファイルダウンロード確認
  });

  test("should handle format switching", () => {
    // 形式切り替えの統合動作を確認
    // 1. JSON形式選択
    // 2. エクスポート実行
    // 3. CSV形式に切り替え
    // 4. エクスポート実行
    // 5. 両方のファイル確認
  });

  test("should handle large metadata export", () => {
    // 大容量メタデータのエクスポートを確認
    // 1. 大容量メタデータ準備
    // 2. エクスポート開始
    // 3. プログレス表示確認
    // 4. 完了確認
    // 5. ファイル整合性確認
  });
});
```

### UI/UX 統合テスト

```typescript
describe("Export UI/UX Integration", () => {
  test("should provide smooth user experience", () => {
    // スムーズなユーザー体験を確認
    // 1. 直感的な操作フロー
    // 2. 適切なフィードバック
    // 3. エラー状態からの回復
    // 4. レスポンシブ対応
  });

  test("should handle concurrent export attempts", () => {
    // 同時エクスポート試行の処理を確認
    // 1. エクスポート開始
    // 2. 同時に別形式エクスポート試行
    // 3. 適切な制御確認
    // 4. 完了後の状態確認
  });
});
```

## E2Eテスト仕様

### エンドツーエンド ワークフローテスト

```typescript
describe("E2E Export Workflow", () => {
  test("should complete full export workflow", () => {
    // 完全なエクスポートワークフローを確認
    // 1. PNGファイル選択
    // 2. メタデータ表示確認
    // 3. エクスポートボタンクリック
    // 4. 形式選択（JSON）
    // 5. エクスポート実行
    // 6. ファイルダウンロード確認
    // 7. ダウンロードファイル内容検証
  });

  test("should handle multiple format exports", () => {
    // 複数形式の連続エクスポートを確認
    // 1. 同一メタデータで3形式エクスポート
    // 2. 各ファイルの正確性確認
    // 3. データ一貫性確認
  });

  test("should work with real PNG files", () => {
    // 実際のPNGファイルでのエクスポートを確認
    // 1. 複数の実PNG ファイルでテスト
    // 2. メタデータ解析
    // 3. エクスポート実行
    // 4. 結果ファイル検証
  });
});
```

## パフォーマンステスト

### 大容量データ処理テスト

```typescript
describe("Performance Tests", () => {
  test("should handle large metadata efficiently", () => {
    // 大容量メタデータの効率的な処理を確認
    // 目標: 10MB以下のデータを5秒以内で処理
  });

  test("should maintain UI responsiveness", () => {
    // UI応答性の維持を確認
    // 目標: エクスポート中もUI操作可能
  });

  test("should manage memory usage", () => {
    // メモリ使用量の管理を確認
    // 目標: メモリリークなし
  });

  test("should complete within time limits", () => {
    // 時間制限内の完了を確認
    // 目標: 標準的なメタデータを1秒以内
  });
});
```

## エラーハンドリングテスト

### エラー状況テスト

```typescript
describe("Error Handling", () => {
  test("should handle corrupted metadata", () => {
    // 破損メタデータの処理を確認
  });

  test("should handle browser limitations", () => {
    // ブラウザ制限の処理を確認
  });

  test("should handle network errors", () => {
    // ネットワークエラーの処理を確認
  });

  test("should provide recovery options", () => {
    // エラーからの回復オプション提供を確認
  });

  test("should maintain application stability", () => {
    // アプリケーション安定性の維持を確認
  });
});
```

## アクセシビリティテスト

### 支援技術対応テスト

```typescript
describe("Accessibility", () => {
  test("should support screen readers", () => {
    // スクリーンリーダー対応を確認
  });

  test("should work with keyboard only", () => {
    // キーボードのみでの操作を確認
  });

  test("should have proper contrast", () => {
    // 適切なコントラストを確認
  });

  test("should provide clear feedback", () => {
    // 明確なフィードバック提供を確認
  });
});
```

## テストデータ

### 完全なメタデータサンプル
```typescript
const completeExportTestData: PngMetadata = {
  basicInfo: {
    fileName: "export-test.png",
    fileSize: 2048576, // 2MB
    width: 2560,
    height: 1440,
    bitDepth: 8,
    colorType: PngColorType.RGB,
    compressionMethod: 0,
    filterMethod: 0,
    interlaceMethod: 0,
  },
  textMetadata: [
    {
      keyword: "Title",
      text: "Export Test Image",
    },
    {
      keyword: "Description",
      text: "A comprehensive test image for export functionality testing",
      compressed: true,
    },
    {
      keyword: "Comment",
      text: "エクスポートテスト用画像",
      languageTag: "ja-JP",
      translatedKeyword: "コメント",
    },
  ],
  timestamp: {
    year: 2024,
    month: 3,
    day: 15,
    hour: 14,
    minute: 30,
    second: 45,
    date: new Date(2024, 2, 15, 14, 30, 45),
  },
  physicalDimensions: {
    pixelsPerUnitX: 2835,
    pixelsPerUnitY: 2835,
    unitSpecifier: PngUnitSpecifier.METER,
  },
  otherChunks: [
    {
      type: "IDAT",
      size: 1800000,
      description: "Image Data - 画像データ",
      critical: true,
    },
    {
      type: "gAMA",
      size: 4,
      description: "Gamma - ガンマ値",
      critical: false,
    },
  ],
};
```

### 大容量テキストメタデータサンプル
```typescript
const largeTextMetadata: PngTextMetadata[] = [
  {
    keyword: "LongDescription",
    text: "A".repeat(10000), // 10KB のテキスト
  },
  {
    keyword: "VeryLongDescription", 
    text: "X".repeat(100000), // 100KB のテキスト
    compressed: true,
  },
];
```

### 特殊文字テストデータ
```typescript
const specialCharTestData: PngTextMetadata[] = [
  {
    keyword: "SpecialChars",
    text: 'Contains "quotes", commas,, and\nnewlines\tand tabs',
  },
  {
    keyword: "Japanese",
    text: "日本語文字列：テスト用データです。",
  },
  {
    keyword: "Emoji",
    text: "Test with emojis: 🖼️📊💾",
  },
];
```

## モックとヘルパー

### エクスポート機能テストヘルパー
```typescript
const renderExportButton = (metadata: PngMetadata, props = {}) => {
  const defaultProps = {
    onExportComplete: jest.fn(),
  };
  
  return render(
    <ExportButton 
      metadata={metadata} 
      {...defaultProps} 
      {...props} 
    />
  );
};

const expectFileDownload = async (filename: string, mimeType: string) => {
  // ファイルダウンロードの発生を確認するヘルパー
};

const validateExportedJSON = (jsonString: string, originalMetadata: PngMetadata) => {
  // エクスポートされたJSONの妥当性を検証するヘルパー
};

const validateExportedCSV = (csvString: string, originalMetadata: PngMetadata) => {
  // エクスポートされたCSVの妥当性を検証するヘルパー
};
```