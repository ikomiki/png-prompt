# TASK-202: Refactor Phase - 改善点

## 改善対象

### 1. DropZone: ドラッグ境界検出の改善

**問題**: dragleave イベントが子要素間移動でも発火してしまう

**改善案**:
```typescript
const handleDragLeave = useCallback(
  (event: React.DragEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // より正確な境界検出
    const rect = event.currentTarget.getBoundingClientRect();
    const relatedTarget = event.relatedTarget as Element;
    
    // 関連要素がドロップゾーン内にある場合は無視
    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
      return;
    }
    
    onDragStateChange(false);
  },
  [disabled, onDragStateChange]
);
```

### 2. FileUploader: エラー状態のリセット改善

**改善**: ファイル選択時のエラークリア機能を追加

```typescript
const validateAndProcessFile = useCallback(
  async (file: File) => {
    setIsValidating(true);
    setSelectedFile(null);
    // エラー状態をクリア
    setError(null);

    try {
      // 検証ロジック...
    } catch (error) {
      // エラー処理...
    } finally {
      setIsValidating(false);
    }
  },
  [maxFileSize, onFileSelect, onError]
);
```

### 3. アクセシビリティの向上

**DropZone ARIA属性の追加**:
```typescript
<div
  role="button"
  tabIndex={disabled ? -1 : 0}
  aria-label="ファイルをドラッグ&ドロップまたはクリックして選択"
  aria-describedby="drop-zone-description"
  // その他の属性...
>
```

**FileUploader のARIA実装**:
```typescript
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isValidating && "ファイルを検証中です"}
  {selectedFile && `${selectedFile.name}が選択されました`}
</div>
```

### 4. パフォーマンス最適化

**メモ化の適用**:
```typescript
const dropZoneCallbacks = useMemo(
  () => ({
    onDrop: handleFileDrop,
    onDragStateChange: handleDragStateChange,
  }),
  [handleFileDrop, handleDragStateChange]
);
```

**ファイルサイズ表示の最適化**:
```typescript
const formattedFileSize = useMemo(
  () => selectedFile ? formatFileSize(selectedFile.size) : null,
  [selectedFile]
);
```

### 5. エラーハンドリングの改善

**より詳細なエラー情報**:
```typescript
const createFileError = (file: File, errorType: string): AppError => {
  const baseInfo = `ファイル: ${file.name} (${formatFileSize(file.size).formatted})`;
  
  switch (errorType) {
    case 'INVALID_TYPE':
      return {
        type: ErrorType.INVALID_FILE_TYPE,
        message: '対応していないファイル形式です',
        details: `${baseInfo}\n対応形式: PNG (.png)`,
      };
    case 'TOO_LARGE':
      return {
        type: ErrorType.FILE_TOO_LARGE,
        message: 'ファイルサイズが大きすぎます',
        details: `${baseInfo}\n上限サイズ: ${formatFileSize(maxFileSize).formatted}`,
      };
    default:
      return {
        type: ErrorType.PARSE_ERROR,
        message: 'ファイル処理中にエラーが発生しました',
        details: baseInfo,
      };
  }
};
```

### 6. TypeScript型安全性の向上

**より厳密な型定義**:
```typescript
interface FileValidationResult {
  valid: true;
  file: File;
} | {
  valid: false;
  error: AppError;
}

interface DropZoneCallbacks {
  readonly onDrop: (files: FileList) => void;
  readonly onDragStateChange: (isDragging: boolean) => void;
}
```

### 7. テストの改善

**act() ラッパーの追加**:
```typescript
import { act } from '@testing-library/react';

const selectFileAsync = async (fileInput: HTMLInputElement, file: File) => {
  await act(async () => {
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      configurable: true,
    });
    
    fireEvent.change(fileInput);
    
    // 非同期処理の完了を待機
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};
```

**カスタムレンダーの改善**:
```typescript
const renderFileUploader = (props: Partial<FileUploaderProps> = {}) => {
  const defaultProps: FileUploaderProps = {
    onFileSelect: vi.fn(),
    onError: vi.fn(),
    maxFileSize: 10 * 1024 * 1024,
    accept: "image/png,.png",
    disabled: false,
  };
  
  return {
    ...render(<FileUploader {...defaultProps} {...props} />),
    props: { ...defaultProps, ...props },
  };
};
```

## 実装優先度

### 高優先度
1. ✅ DropZone境界検出改善
2. ✅ エラー状態管理改善
3. ✅ アクセシビリティ向上

### 中優先度  
4. ⭕ パフォーマンス最適化
5. ⭕ エラーメッセージ改善

### 低優先度
6. ⭕ TypeScript型改善
7. ⭕ テスト改善

## 品質指標

### 目標
- ✅ コードカバレッジ: 90%以上
- ✅ アクセシビリティスコア: AA準拠
- ✅ パフォーマンス: 大容量ファイル対応
- ✅ ユーザビリティ: 直感的操作