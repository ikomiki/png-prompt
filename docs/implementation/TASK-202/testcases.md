# TASK-202: ファイルアップローダー テストケース

## 単体テスト仕様

### FileSelectButton コンポーネント

#### 基本機能テスト
```typescript
describe("FileSelectButton", () => {
  test("should render button with default props", () => {
    // ボタンが正しくレンダリングされることを確認
  });

  test("should trigger file input click on button click", () => {
    // ボタンクリック時にfile inputがクリックされることを確認
  });

  test("should call onFileSelect when file is selected", () => {
    // ファイル選択時にonFileSelectコールバックが呼ばれることを確認
  });

  test("should accept only specified file types", () => {
    // acceptプロパティで指定された形式のみ受け入れることを確認
  });

  test("should be disabled when disabled prop is true", () => {
    // disabledプロパティでボタンが無効化されることを確認
  });
});
```

#### バリアント・サイズテスト
```typescript
describe("FileSelectButton variants and sizes", () => {
  test("should render primary variant correctly", () => {
    // primaryバリアントのスタイルが適用されることを確認
  });

  test("should render secondary variant correctly", () => {
    // secondaryバリアントのスタイルが適用されることを確認
  });

  test("should render small size correctly", () => {
    // smサイズのスタイルが適用されることを確認
  });

  test("should render large size correctly", () => {
    // lgサイズのスタイルが適用されることを確認
  });
});
```

### DropZone コンポーネント

#### ドラッグ&ドロップテスト
```typescript
describe("DropZone", () => {
  test("should handle drag enter event", () => {
    // dragenterイベントでドラッグ状態が更新されることを確認
  });

  test("should handle drag over event", () => {
    // dragoverイベントでデフォルト動作が防止されることを確認
  });

  test("should handle drag leave event", () => {
    // dragleaveイベントでドラッグ状態がリセットされることを確認
  });

  test("should handle drop event with valid files", () => {
    // dropイベントで有効なファイルが処理されることを確認
  });

  test("should prevent default behavior on drag events", () => {
    // ドラッグイベントでpreventDefault()が呼ばれることを確認
  });
});
```

#### 視覚的フィードバックテスト
```typescript
describe("DropZone visual feedback", () => {
  test("should show drag state styling when isDragging is true", () => {
    // ドラッグ中の視覚的フィードバックが表示されることを確認
  });

  test("should remove drag state styling when isDragging is false", () => {
    // ドラッグ終了時に視覚的フィードバックが削除されることを確認
  });

  test("should be disabled when disabled prop is true", () => {
    // disabledプロパティでドロップゾーンが無効化されることを確認
  });
});
```

### FileUploader コンポーネント

#### ファイル処理テスト
```typescript
describe("FileUploader", () => {
  test("should render with initial state", () => {
    // 初期状態で正しくレンダリングされることを確認
  });

  test("should handle file selection from button", () => {
    // ボタンからのファイル選択が正しく処理されることを確認
  });

  test("should handle file drop", () => {
    // ドラッグ&ドロップでのファイル選択が正しく処理されることを確認
  });

  test("should validate file type", () => {
    // ファイル形式の検証が正しく実行されることを確認
  });

  test("should validate file size", () => {
    // ファイルサイズの検証が正しく実行されることを確認
  });
});
```

#### エラーハンドリングテスト
```typescript
describe("FileUploader error handling", () => {
  test("should show error for invalid file type", () => {
    // 無効なファイル形式でエラーが表示されることを確認
  });

  test("should show error for oversized file", () => {
    // ファイルサイズ超過でエラーが表示されることを確認
  });

  test("should handle multiple files (take first only)", () => {
    // 複数ファイルが選択された場合、最初のファイルのみ処理されることを確認
  });

  test("should clear error when valid file is selected", () => {
    // 有効なファイルが選択された場合、エラーがクリアされることを確認
  });
});
```

#### 状態管理テスト
```typescript
describe("FileUploader state management", () => {
  test("should update drag state when dragging", () => {
    // ドラッグ中に状態が正しく更新されることを確認
  });

  test("should show selected file info", () => {
    // 選択されたファイルの情報が表示されることを確認
  });

  test("should reset state when new file is selected", () => {
    // 新しいファイルが選択された場合、状態がリセットされることを確認
  });
});
```

## 統合テスト仕様

### ファイルアップロード統合テスト

```typescript
describe("File Upload Integration", () => {
  test("should complete full file upload flow via button", () => {
    // ボタンを使った完全なファイルアップロードフローを確認
    // 1. ボタンクリック
    // 2. ファイル選択
    // 3. ファイル情報表示
    // 4. 親コンポーネントへのコールバック実行
  });

  test("should complete full file upload flow via drag and drop", () => {
    // ドラッグ&ドロップを使った完全なファイルアップロードフローを確認
    // 1. ファイルドラッグ
    // 2. 視覚的フィードバック表示
    // 3. ファイルドロップ
    // 4. ファイル情報表示
    // 5. 親コンポーネントへのコールバック実行
  });

  test("should handle error scenarios end-to-end", () => {
    // エラーシナリオの統合テスト
    // 1. 無効なファイル選択
    // 2. エラーメッセージ表示
    // 3. エラー状態のUI確認
    // 4. リトライ機能確認
  });
});
```

### コンポーネント連携テスト

```typescript
describe("Component Communication", () => {
  test("should communicate between DropZone and FileUploader", () => {
    // DropZoneとFileUploaderの連携を確認
  });

  test("should communicate between FileSelectButton and FileUploader", () => {
    // FileSelectButtonとFileUploaderの連携を確認
  });

  test("should pass correct props to child components", () => {
    // 子コンポーネントに正しいpropsが渡されることを確認
  });
});
```

## E2Eテスト仕様

### ユーザー操作テスト

```typescript
describe("E2E File Upload", () => {
  test("should upload file using file picker", () => {
    // ユーザーがファイルピッカーを使ってファイルをアップロードできることを確認
    // 1. ページ読み込み
    // 2. ファイル選択ボタンクリック
    // 3. ファイル選択
    // 4. ファイル情報表示確認
    // 5. メタデータ表示への遷移確認
  });

  test("should upload file using drag and drop", () => {
    // ユーザーがドラッグ&ドロップでファイルをアップロードできることを確認
    // 1. ページ読み込み
    // 2. ファイルドラッグ
    // 3. ドロップゾーンの視覚的変化確認
    // 4. ファイルドロップ
    // 5. ファイル情報表示確認
    // 6. メタデータ表示への遷移確認
  });
});
```

### アクセシビリティテスト

```typescript
describe("E2E Accessibility", () => {
  test("should be accessible via keyboard navigation", () => {
    // キーボードナビゲーションでファイルアップロードができることを確認
    // 1. Tabキーでフォーカス移動
    // 2. Enterキーでファイル選択ダイアログ開く
    // 3. ファイル選択
    // 4. フォーカス表示確認
  });

  test("should work with screen readers", () => {
    // スクリーンリーダーでの操作を確認
    // 1. ARIA属性の読み上げ確認
    // 2. 状態変化の読み上げ確認
    // 3. エラーメッセージの読み上げ確認
  });
});
```

### エラーシナリオテスト

```typescript
describe("E2E Error Scenarios", () => {
  test("should handle invalid file type gracefully", () => {
    // 無効なファイル形式の処理を確認
    // 1. 非PNGファイルの選択/ドロップ
    // 2. エラーメッセージ表示確認
    // 3. エラー状態のUI確認
    // 4. 再試行操作確認
  });

  test("should handle oversized file gracefully", () => {
    // ファイルサイズ超過の処理を確認
    // 1. 大容量ファイルの選択/ドロップ
    // 2. エラーメッセージ表示確認
    // 3. ファイルサイズ情報表示確認
    // 4. 推奨対処法表示確認
  });
});
```

## パフォーマンステスト仕様

### レスポンシブネステスト

```typescript
describe("Performance Tests", () => {
  test("should respond quickly to file selection", () => {
    // ファイル選択操作の応答速度を確認
    // 目標: 100ms以内でUI更新
  });

  test("should handle large files without UI freeze", () => {
    // 大容量ファイル処理時のUI応答性を確認
    // 目標: UI操作可能状態維持
  });

  test("should work smoothly on mobile devices", () => {
    // モバイルデバイスでのパフォーマンスを確認
    // 目標: タッチ操作の即座の反応
  });
});
```

## テストデータ

### 有効なテストファイル
```typescript
const validPngFile = new File([pngBuffer], "test.png", { type: "image/png" });
const smallPngFile = new File([smallPngBuffer], "small.png", { type: "image/png" });
const largePngFile = new File([largePngBuffer], "large.png", { type: "image/png" });
```

### 無効なテストファイル
```typescript
const jpegFile = new File([jpegBuffer], "test.jpg", { type: "image/jpeg" });
const textFile = new File(["hello"], "test.txt", { type: "text/plain" });
const oversizedFile = new File([oversizedBuffer], "huge.png", { type: "image/png" });
```

### ファイルリスト
```typescript
const multipleFiles = [
  new File([pngBuffer1], "file1.png", { type: "image/png" }),
  new File([pngBuffer2], "file2.png", { type: "image/png" }),
];
```

## モックとセットアップ

### ファイル選択モック
```typescript
const mockFileInput = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png';
  return input;
};
```

### ドラッグ&ドロップイベントモック
```typescript
const createDragEvent = (type: string, files: File[]) => {
  const event = new DragEvent(type, {
    dataTransfer: new DataTransfer(),
  });
  files.forEach(file => event.dataTransfer?.items.add(file));
  return event;
};
```

### カスタムレンダラー
```typescript
const renderFileUploader = (props = {}) => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    onError: vi.fn(),
    maxFileSize: 10 * 1024 * 1024, // 10MB
    accept: "image/png",
  };
  
  return render(
    <FileUploader {...defaultProps} {...props} />
  );
};
```