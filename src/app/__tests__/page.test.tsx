import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MainPage from "../page";
import { AppState } from "../../types/png-metadata";

// Mock the components
vi.mock("../../components/FileUploader", () => ({
  FileUploader: vi.fn(({ onFileSelect }) => (
    <div data-testid="file-uploader">
      <input 
        type="file" 
        aria-label="ファイル選択" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
      <div>FileUploader Mock</div>
    </div>
  ))
}));

vi.mock("../../components/MetadataDisplay", () => ({
  MetadataDisplay: vi.fn(() => <div data-testid="metadata-display">MetadataDisplay Mock</div>)
}));

vi.mock("../../components/ExportButton", () => ({
  ExportButton: vi.fn(() => <div data-testid="export-button">ExportButton Mock</div>)
}));

// Mock file processing functions
vi.mock("../../lib/file-validator", () => ({
  validateFile: vi.fn(),
  validatePngSignature: vi.fn()
}));

vi.mock("../../lib/png-parser", () => ({
  parseChunks: vi.fn(),
  extractMetadata: vi.fn()
}));

describe("MainPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render initial state with file uploader", () => {
      render(<MainPage />);
      
      expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
      expect(screen.getByText(/PNG メタデータ表示/)).toBeInTheDocument();
    });

    test("should render page header and footer", () => {
      render(<MainPage />);
      
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    test("should apply responsive classes correctly", () => {
      render(<MainPage />);
      
      const mainContent = screen.getByRole("main");
      expect(mainContent).toHaveClass("container", "mx-auto", "px-4");
    });

    test("should handle initial state prop", () => {
      render(<MainPage initialState={AppState.PARSING} />);
      
      expect(screen.getByTestId("processing-indicator")).toBeInTheDocument();
    });

    test("should toggle debug mode", () => {
      render(<MainPage debugMode={true} />);
      
      expect(screen.getByTestId("debug-panel")).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    test("should transition from IDLE to FILE_SELECTED", async () => {
      const user = userEvent.setup();
      render(<MainPage />);
      
      const fileInput = screen.getByLabelText(/ファイル選択/);
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByTestId("file-selected-indicator")).toBeInTheDocument();
      });
    });

    test("should transition from FILE_SELECTED to VALIDATING", async () => {
      const user = userEvent.setup();
      render(<MainPage initialState={AppState.FILE_SELECTED} />);
      
      const validateButton = screen.getByText(/検証開始/);
      await user.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("validating-indicator")).toBeInTheDocument();
      });
    });

    test("should transition from VALIDATING to PARSING", async () => {
      const { validateFile } = await import("../../lib/file-validator");
      vi.mocked(validateFile).mockResolvedValue({ isValid: true });
      
      render(<MainPage initialState={AppState.VALIDATING} />);
      
      await waitFor(() => {
        expect(screen.getByTestId("parsing-indicator")).toBeInTheDocument();
      }, { timeout: 500 });
    });

    test("should transition from PARSING to DISPLAYING_RESULTS", async () => {
      const { parseChunks } = await import("../../lib/png-parser");
      const { extractMetadata } = await import("../../lib/png-parser");
      
      vi.mocked(parseChunks).mockResolvedValue([]);
      vi.mocked(extractMetadata).mockResolvedValue({
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
      });
      
      render(<MainPage initialState={AppState.PARSING} />);
      
      await waitFor(() => {
        expect(screen.getByTestId("metadata-display")).toBeInTheDocument();
        expect(screen.getByTestId("export-button")).toBeInTheDocument();
      });
    });

    test("should handle error states correctly", async () => {
      const { validateFile } = await import("../../lib/file-validator");
      vi.mocked(validateFile).mockRejectedValue(new Error("Validation failed"));
      
      render(<MainPage initialState={AppState.VALIDATING} />);
      
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText(/検証に失敗しました/)).toBeInTheDocument();
      });
    });

    test("should maintain state consistency", () => {
      render(<MainPage />);
      
      const stateIndicator = screen.getByTestId("state-indicator");
      expect(stateIndicator).toHaveTextContent(AppState.IDLE);
    });

    test("should handle concurrent state changes", async () => {
      const user = userEvent.setup();
      render(<MainPage />);
      
      const fileInput = screen.getByLabelText(/ファイル選択/);
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });
      
      await user.upload(fileInput, file1);
      await user.upload(fileInput, file2);
      
      // Should process only the latest file
      await waitFor(() => {
        expect(screen.getByText("test2.png")).toBeInTheDocument();
      });
    });
  });

  describe("File Processing Integration", () => {
    test("should handle file selection correctly", async () => {
      const user = userEvent.setup();
      render(<MainPage />);
      
      const fileInput = screen.getByLabelText(/ファイル選択/);
      const file = new File(['png data'], 'test.png', { type: 'image/png' });
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByText("test.png")).toBeInTheDocument();
      });
    });

    test("should process PNG metadata correctly", async () => {
      const { validateFile } = await import("../../lib/file-validator");
      const { parseChunks, extractMetadata } = await import("../../lib/png-parser");
      
      vi.mocked(validateFile).mockResolvedValue({ isValid: true });
      vi.mocked(parseChunks).mockResolvedValue([]);
      vi.mocked(extractMetadata).mockResolvedValue({
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
      });
      
      const user = userEvent.setup();
      render(<MainPage />);
      
      const fileInput = screen.getByLabelText(/ファイル選択/);
      const file = new File(['png data'], 'test.png', { type: 'image/png' });
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByTestId("metadata-display")).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test("should display processing progress", async () => {
      render(<MainPage initialState={AppState.PARSING} />);
      
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText(/解析中/)).toBeInTheDocument();
    });

    test("should update progress indicators", async () => {
      render(<MainPage initialState={AppState.PARSING} />);
      
      const progressBar = screen.getByRole("progressbar");
      
      // Should start with some progress
      await waitFor(() => {
        expect(progressBar).toHaveAttribute("aria-valuenow");
      });
    });
  });

  describe("Error Handling Integration", () => {
    test("should handle file validation errors", async () => {
      const { validateFile } = await import("../../lib/file-validator");
      vi.mocked(validateFile).mockRejectedValue(new Error("Invalid file format"));
      
      const user = userEvent.setup();
      render(<MainPage />);
      
      const fileInput = screen.getByLabelText(/ファイル選択/);
      const file = new File(['invalid'], 'test.txt', { type: 'text/plain' });
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText(/ファイル形式が正しくありません/)).toBeInTheDocument();
      });
    });

    test("should handle PNG parsing errors", async () => {
      const { validateFile } = await import("../../lib/file-validator");
      const { parseChunks } = await import("../../lib/png-parser");
      
      vi.mocked(validateFile).mockResolvedValue({ isValid: true });
      vi.mocked(parseChunks).mockRejectedValue(new Error("Corrupted PNG"));
      
      render(<MainPage initialState={AppState.PARSING} />);
      
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText(/PNG解析に失敗しました/)).toBeInTheDocument();
      });
    });

    test("should handle memory errors", async () => {
      const { parseChunks } = await import("../../lib/png-parser");
      vi.mocked(parseChunks).mockRejectedValue(new Error("Memory limit exceeded"));
      
      render(<MainPage initialState={AppState.PARSING} />);
      
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText(/メモリ不足です/)).toBeInTheDocument();
      });
    });

    test("should recover from errors gracefully", async () => {
      const user = userEvent.setup();
      render(<MainPage initialState={AppState.VALIDATION_ERROR} />);
      
      const retryButton = screen.getByText(/再試行/);
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
      });
    });
  });

  describe("Performance Integration", () => {
    test("should process files within time limits", async () => {
      const { validateFile } = await import("../../lib/file-validator");
      const { parseChunks, extractMetadata } = await import("../../lib/png-parser");
      
      vi.mocked(validateFile).mockResolvedValue({ isValid: true });
      vi.mocked(parseChunks).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );
      vi.mocked(extractMetadata).mockResolvedValue({
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
      });
      
      const user = userEvent.setup();
      render(<MainPage />);
      
      const startTime = performance.now();
      const fileInput = screen.getByLabelText(/ファイル選択/);
      const file = new File(['small file'], 'test.png', { type: 'image/png' });
      
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByTestId("metadata-display")).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(3000); // 3秒以内
    });

    test("should maintain UI responsiveness", async () => {
      render(<MainPage initialState={AppState.PARSING} />);
      
      const button = screen.getByText(/キャンセル/);
      
      // UI should still respond during processing
      expect(button).not.toBeDisabled();
    });
  });

  describe("Accessibility Integration", () => {
    test("should have proper ARIA landmarks", () => {
      render(<MainPage />);
      
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    test("should provide live region updates", async () => {
      render(<MainPage initialState={AppState.PARSING} />);
      
      const liveRegion = screen.getByLabelText(/処理状況/);
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
    });

    test("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<MainPage />);
      
      // Should be able to navigate with Tab
      await user.tab();
      expect(document.activeElement).toHaveAttribute("type", "file");
    });

    test("should have proper focus management", async () => {
      const user = userEvent.setup();
      render(<MainPage />);
      
      const fileInput = screen.getByLabelText(/ファイル選択/);
      await user.click(fileInput);
      
      expect(fileInput).toHaveFocus();
    });
  });
});