# TASK-203: メタデータ表示コンポーネント テストケース

## 単体テスト仕様

### BasicInfoCard コンポーネント

#### 基本表示テスト
```typescript
describe("BasicInfoCard", () => {
  test("should render basic image information", () => {
    // ファイル名、サイズ、寸法が表示されることを確認
  });

  test("should display file size in human readable format", () => {
    // ファイルサイズが「1.2 MB (1,234,567 bytes)」形式で表示されることを確認
  });

  test("should display image dimensions", () => {
    // 画像寸法が「1920 × 1080 pixels」形式で表示されることを確認
  });

  test("should display color type and bit depth", () => {
    // カラータイプとビット深度が分かりやすく表示されることを確認
  });

  test("should handle different PNG color types", () => {
    // RGB、パレット、グレースケール等の各カラータイプが適切に表示されることを確認
  });
});
```

#### 技術情報表示テスト
```typescript
describe("BasicInfoCard technical details", () => {
  test("should display compression method", () => {
    // 圧縮方式が表示されることを確認
  });

  test("should display filter method", () => {
    // フィルター方式が表示されることを確認
  });

  test("should display interlace method", () => {
    // インターレース方式が表示されることを確認
  });

  test("should handle collapsed state", () => {
    // 折りたたみ状態が正しく動作することを確認
  });
});
```

### TextMetadataCard コンポーネント

#### テキスト表示テスト
```typescript
describe("TextMetadataCard", () => {
  test("should render text metadata list", () => {
    // テキストメタデータのリストが表示されることを確認
  });

  test("should display keyword and text pairs", () => {
    // キーワードとテキストのペアが表示されることを確認
  });

  test("should handle empty text metadata", () => {
    // テキストメタデータが空の場合の表示を確認
  });

  test("should display compression status", () => {
    // 圧縮状態（zTXt）が表示されることを確認
  });

  test("should display internationalization info", () => {
    // 国際化情報（iTXt）が表示されることを確認
  });
});
```

#### 長いテキスト処理テスト
```typescript
describe("TextMetadataCard long text handling", () => {
  test("should truncate very long text", () => {
    // 長いテキストが適切に省略されることを確認
  });

  test("should provide expand/collapse for long text", () => {
    // 長いテキストの展開/折りたたみ機能を確認
  });

  test("should handle multiline text", () => {
    // 複数行テキストが適切に表示されることを確認
  });

  test("should handle special characters", () => {
    // 特殊文字が適切にエスケープ・表示されることを確認
  });
});
```

### TimestampCard コンポーネント

#### 日時表示テスト
```typescript
describe("TimestampCard", () => {
  test("should render timestamp information", () => {
    // タイムスタンプ情報が表示されることを確認
  });

  test("should display formatted date and time", () => {
    // 日時が人間が読める形式で表示されることを確認
  });

  test("should display relative time", () => {
    // 相対時間（「2日前」等）が表示されることを確認
  });

  test("should handle different date formats", () => {
    // 異なる日付形式が適切に処理されることを確認
  });

  test("should handle invalid dates", () => {
    // 無効な日付の処理を確認
  });
});
```

#### タイムゾーン処理テスト
```typescript
describe("TimestampCard timezone handling", () => {
  test("should display timezone information", () => {
    // タイムゾーン情報が表示されることを確認
  });

  test("should handle UTC time", () => {
    // UTC時間が適切に処理されることを確認
  });

  test("should calculate relative time correctly", () => {
    // 相対時間の計算が正確であることを確認
  });
});
```

### PhysicalDimensionsCard コンポーネント

#### 寸法表示テスト
```typescript
describe("PhysicalDimensionsCard", () => {
  test("should render physical dimensions", () => {
    // 物理的寸法が表示されることを確認
  });

  test("should calculate and display DPI", () => {
    // DPIが計算・表示されることを確認
  });

  test("should calculate print size", () => {
    // 印刷サイズが計算・表示されることを確認
  });

  test("should handle different unit specifiers", () => {
    // 異なる単位指定子（meter/unknown）が処理されることを確認
  });

  test("should display unit information", () => {
    // 単位情報が明確に表示されることを確認
  });
});
```

#### DPI計算テスト
```typescript
describe("PhysicalDimensionsCard DPI calculations", () => {
  test("should calculate DPI for meter units", () => {
    // メートル単位でのDPI計算を確認
  });

  test("should handle unknown units", () => {
    // 不明単位の処理を確認
  });

  test("should calculate print size in cm", () => {
    // センチメートル単位の印刷サイズ計算を確認
  });

  test("should calculate print size in inches", () => {
    // インチ単位の印刷サイズ計算を確認
  });
});
```

### OtherChunksCard コンポーネント

#### チャンク一覧表示テスト
```typescript
describe("OtherChunksCard", () => {
  test("should render chunk list", () => {
    // チャンク一覧が表示されることを確認
  });

  test("should display chunk type and size", () => {
    // チャンクタイプとサイズが表示されることを確認
  });

  test("should display chunk description", () => {
    // チャンクの説明が表示されることを確認
  });

  test("should indicate critical vs ancillary chunks", () => {
    // Critical/Ancillaryチャンクの区別が表示されることを確認
  });

  test("should handle empty chunk list", () => {
    // 空のチャンクリストの処理を確認
  });
});
```

#### チャンク分類テスト
```typescript
describe("OtherChunksCard chunk classification", () => {
  test("should classify critical chunks correctly", () => {
    // Criticalチャンクが正しく分類されることを確認
  });

  test("should classify ancillary chunks correctly", () => {
    // Ancillaryチャンクが正しく分類されることを確認
  });

  test("should display chunk size in appropriate units", () => {
    // チャンクサイズが適切な単位で表示されることを確認
  });
});
```

### MetadataDisplay メインコンポーネント

#### 統合表示テスト
```typescript
describe("MetadataDisplay", () => {
  test("should render all metadata cards", () => {
    // すべてのメタデータカードが表示されることを確認
  });

  test("should handle complete metadata", () => {
    // 完全なメタデータセットの表示を確認
  });

  test("should handle partial metadata", () => {
    // 部分的なメタデータセットの表示を確認
  });

  test("should handle empty metadata", () => {
    // 空のメタデータセットの表示を確認
  });

  test("should display loading state", () => {
    // ロード中状態の表示を確認
  });
});
```

#### エラーハンドリングテスト
```typescript
describe("MetadataDisplay error handling", () => {
  test("should display error state", () => {
    // エラー状態の表示を確認
  });

  test("should handle partial errors", () => {
    // 部分的なエラーの処理を確認
  });

  test("should recover from errors", () => {
    // エラーからの回復を確認
  });
});
```

## 統合テスト仕様

### メタデータ表示統合テスト

```typescript
describe("Metadata Display Integration", () => {
  test("should display complete PNG metadata", () => {
    // 完全なPNGメタデータの統合表示を確認
    // 1. 基本情報カード表示
    // 2. テキストメタデータカード表示
    // 3. タイムスタンプカード表示
    // 4. 物理的寸法カード表示
    // 5. その他チャンクカード表示
  });

  test("should handle real PNG file metadata", () => {
    // 実際のPNGファイルのメタデータ表示を確認
    // 1. ファイル解析
    // 2. メタデータ抽出
    // 3. 各カードでの表示
    // 4. 表示内容の検証
  });

  test("should handle card collapse/expand interactions", () => {
    // カードの折りたたみ/展開の統合動作を確認
    // 1. 初期状態確認
    // 2. 各カードの折りたたみ
    // 3. 状態保持確認
    // 4. 展開動作確認
  });
});
```

### レスポンシブ統合テスト

```typescript
describe("Responsive Integration", () => {
  test("should adapt layout for mobile", () => {
    // モバイル画面での統合レイアウトを確認
    // 1. 縦スクロールレイアウト
    // 2. カード配置最適化
    // 3. 情報密度調整
  });

  test("should adapt layout for desktop", () => {
    // デスクトップ画面での統合レイアウトを確認
    // 1. 効率的なカード配置
    // 2. 空間利用最適化
    // 3. 読みやすさ向上
  });
});
```

## E2Eテスト仕様

### ユーザー操作テスト

```typescript
describe("E2E Metadata Display", () => {
  test("should display metadata after file upload", () => {
    // ファイルアップロード後のメタデータ表示を確認
    // 1. ファイル選択
    // 2. アップロード完了
    // 3. メタデータ解析
    // 4. 各カード表示確認
    // 5. 情報内容検証
  });

  test("should allow card interaction", () => {
    // カードのインタラクション操作を確認
    // 1. カードの折りたたみクリック
    // 2. アニメーション確認
    // 3. コンテンツ表示/非表示
    // 4. アクセシビリティ確認
  });

  test("should handle text selection and copy", () => {
    // テキスト選択・コピー機能を確認
    // 1. メタデータテキスト選択
    // 2. コピー操作
    // 3. クリップボード内容確認
  });
});
```

### アクセシビリティテスト

```typescript
describe("E2E Accessibility", () => {
  test("should be navigable with keyboard", () => {
    // キーボードナビゲーションを確認
    // 1. Tabキーでフォーカス移動
    // 2. Enterキーでカード操作
    // 3. フォーカス表示確認
  });

  test("should work with screen readers", () => {
    // スクリーンリーダー対応を確認
    // 1. セマンティックHTML確認
    // 2. ARIA属性読み上げ
    // 3. 情報構造の理解
  });
});
```

### パフォーマンステスト

```typescript
describe("E2E Performance", () => {
  test("should render large metadata quickly", () => {
    // 大量メタデータの表示パフォーマンスを確認
    // 目標: 1秒以内での表示完了
  });

  test("should handle long text efficiently", () => {
    // 長いテキストの処理パフォーマンスを確認
    // 目標: 省略処理の瞬時実行
  });

  test("should maintain smooth animations", () => {
    // アニメーションのスムーズさを確認
    // 目標: 60FPSでの折りたたみアニメーション
  });
});
```

## テストデータ

### 完全なメタデータサンプル
```typescript
const completeMetadata: PngMetadata = {
  basicInfo: {
    fileName: "sample.png",
    fileSize: 1234567,
    width: 1920,
    height: 1080,
    bitDepth: 8,
    colorType: PngColorType.RGB,
    compressionMethod: 0,
    filterMethod: 0,
    interlaceMethod: 0,
  },
  textMetadata: [
    {
      keyword: "Title",
      text: "Sample Image",
    },
    {
      keyword: "Author", 
      text: "John Doe",
    },
    {
      keyword: "Description",
      text: "A sample PNG image with metadata",
      compressed: true,
    },
    {
      keyword: "Comment",
      text: "国際化テキストサンプル",
      languageTag: "ja-JP",
      translatedKeyword: "コメント",
    },
  ],
  timestamp: {
    year: 2024,
    month: 1,
    day: 15,
    hour: 14,
    minute: 30,
    second: 45,
    date: new Date(2024, 0, 15, 14, 30, 45),
  },
  physicalDimensions: {
    pixelsPerUnitX: 2835,
    pixelsPerUnitY: 2835,
    unitSpecifier: PngUnitSpecifier.METER,
  },
  otherChunks: [
    {
      type: "IDAT",
      size: 1000000,
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

### 部分的なメタデータサンプル
```typescript
const partialMetadata: PngMetadata = {
  basicInfo: {
    fileName: "minimal.png",
    fileSize: 5678,
    width: 100,
    height: 100,
    bitDepth: 8,
    colorType: PngColorType.PALETTE,
    compressionMethod: 0,
    filterMethod: 0,
    interlaceMethod: 0,
  },
  textMetadata: [],
  // timestamp, physicalDimensions は undefined
  otherChunks: [
    {
      type: "PLTE",
      size: 768,
      description: "Palette - パレット情報", 
      critical: true,
    },
  ],
};
```

### 空のメタデータサンプル
```typescript
const emptyMetadata: PngMetadata = {
  basicInfo: {
    fileName: "empty.png",
    fileSize: 100,
    width: 1,
    height: 1,
    bitDepth: 1,
    colorType: PngColorType.GRAYSCALE,
    compressionMethod: 0,
    filterMethod: 0,
    interlaceMethod: 0,
  },
  textMetadata: [],
  otherChunks: [],
};
```

## モックとセットアップ

### メタデータ表示レンダラー
```typescript
const renderMetadataDisplay = (metadata: PngMetadata, props = {}) => {
  const defaultProps = {
    loading: false,
    error: null,
  };
  
  return render(
    <MetadataDisplay 
      metadata={metadata} 
      {...defaultProps} 
      {...props} 
    />
  );
};
```

### カード表示テストヘルパー
```typescript
const expectCardToBeVisible = (cardTitle: string) => {
  const card = screen.getByRole("region", { name: new RegExp(cardTitle, "i") });
  expect(card).toBeInTheDocument();
  expect(card).toBeVisible();
};

const expectCardToBeCollapsed = (cardTitle: string) => {
  const card = screen.getByRole("region", { name: new RegExp(cardTitle, "i") });
  const content = card.querySelector('[data-testid="card-content"]');
  expect(content).not.toBeVisible();
};
```

### 日時テストヘルパー
```typescript
const createTimestamp = (daysAgo: number): PngTimestamp => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    date,
  };
};
```