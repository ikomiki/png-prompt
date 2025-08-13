import React from "react";
import { render, screen } from "@testing-library/react";
import { TextMetadataCard } from "../TextMetadataCard";
import { PngTextMetadata } from "../../types/png-metadata";

describe("TextMetadataCard", () => {
  const mockTextMetadata: PngTextMetadata[] = [
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
  ];

  describe("テキスト表示テスト", () => {
    test("should render text metadata list", () => {
      render(<TextMetadataCard textMetadata={mockTextMetadata} />);
      
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Sample Image")).toBeInTheDocument();
      expect(screen.getByText("Author")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    test("should display keyword and text pairs", () => {
      render(<TextMetadataCard textMetadata={mockTextMetadata} />);
      
      const titleRow = screen.getByText("Title").closest("tr");
      expect(titleRow).toContainElement(screen.getByText("Sample Image"));
    });

    test("should handle empty text metadata", () => {
      render(<TextMetadataCard textMetadata={[]} />);
      
      expect(screen.getByText(/テキストメタデータはありません/)).toBeInTheDocument();
    });

    test("should display compression status", () => {
      render(<TextMetadataCard textMetadata={mockTextMetadata} />);
      
      expect(screen.getByText(/圧縮済み/)).toBeInTheDocument();
    });

    test("should display internationalization info", () => {
      render(<TextMetadataCard textMetadata={mockTextMetadata} />);
      
      expect(screen.getByText("ja-JP")).toBeInTheDocument();
      expect(screen.getByText("コメント")).toBeInTheDocument();
    });
  });

  describe("長いテキスト処理テスト", () => {
    const longTextMetadata: PngTextMetadata[] = [
      {
        keyword: "Description",
        text: "A".repeat(500), // 500文字の長いテキスト
      },
    ];

    test("should truncate very long text", () => {
      render(<TextMetadataCard textMetadata={longTextMetadata} />);
      
      const textElement = screen.getByText(/A{1,200}\.\.\.$/);
      expect(textElement).toBeInTheDocument();
    });

    test("should provide expand/collapse for long text", () => {
      render(<TextMetadataCard textMetadata={longTextMetadata} />);
      
      const expandButton = screen.getByRole("button", { name: /詳細を表示/ });
      expect(expandButton).toBeInTheDocument();
    });

    test("should handle multiline text", () => {
      const multilineMetadata: PngTextMetadata[] = [
        {
          keyword: "Description",
          text: "Line 1\nLine 2\nLine 3",
        },
      ];
      
      render(<TextMetadataCard textMetadata={multilineMetadata} />);
      
      expect(screen.getByText("Line 1")).toBeInTheDocument();
      expect(screen.getByText("Line 2")).toBeInTheDocument();
      expect(screen.getByText("Line 3")).toBeInTheDocument();
    });

    test("should handle special characters", () => {
      const specialCharMetadata: PngTextMetadata[] = [
        {
          keyword: "Special",
          text: "<script>alert('xss')</script>",
        },
      ];
      
      render(<TextMetadataCard textMetadata={specialCharMetadata} />);
      
      // XSSを防ぐため、エスケープされた形で表示される
      expect(screen.getByText(/&lt;script&gt;/)).toBeInTheDocument();
    });
  });
});