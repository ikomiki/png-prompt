import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportButton } from "../ExportButton";
import { PngMetadata, PngColorType, ExportFormat } from "../../types/png-metadata";

// Mock the export utils
vi.mock("../../lib/export-utils", () => ({
  exportToJSON: vi.fn(() => '{"test": "data"}'),
  exportToCSV: vi.fn(() => "test,data\n1,2"),
  exportToText: vi.fn(() => "Test Data"),
  downloadFile: vi.fn(),
  generateFilename: vi.fn(() => "test_20240315_143022.json"),
}));

describe("ExportButton", () => {
  const mockMetadata: PngMetadata = {
    basicInfo: {
      fileName: "test.png",
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
        text: "Test Image",
      },
    ],
    otherChunks: [
      {
        type: "IDAT",
        size: 1000000,
        description: "Image Data",
        critical: true,
      },
    ],
  };

  const mockOnExportComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render export button with default format", () => {
      render(<ExportButton metadata={mockMetadata} />);
      
      expect(screen.getByText("エクスポート")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("should display available export formats", () => {
      render(<ExportButton metadata={mockMetadata} />);
      
      const selector = screen.getByRole("combobox");
      fireEvent.click(selector);
      
      expect(screen.getByText("JSON")).toBeInTheDocument();
      expect(screen.getByText("CSV")).toBeInTheDocument();
      expect(screen.getByText("テキスト")).toBeInTheDocument();
    });

    test("should handle format selection", async () => {
      const user = userEvent.setup();
      render(<ExportButton metadata={mockMetadata} />);
      
      const selector = screen.getByRole("combobox");
      await user.selectOptions(selector, ExportFormat.CSV);
      
      expect(selector).toHaveValue(ExportFormat.CSV);
    });

    test("should disable button when exporting", () => {
      render(<ExportButton metadata={mockMetadata} isExporting={true} />);
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      expect(button).toBeDisabled();
    });

    test("should handle disabled state", () => {
      render(<ExportButton metadata={mockMetadata} disabled={true} />);
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      expect(button).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    test("should trigger export on button click", async () => {
      const user = userEvent.setup();
      render(
        <ExportButton 
          metadata={mockMetadata} 
          onExportComplete={mockOnExportComplete}
        />
      );
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      await user.click(button);
      
      await waitFor(() => {
        expect(mockOnExportComplete).toHaveBeenCalledWith(ExportFormat.JSON, true);
      });
    });

    test("should show progress during export", async () => {
      render(<ExportButton metadata={mockMetadata} isExporting={true} />);
      
      expect(screen.getByText("エクスポート中...")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    test("should call onExportComplete callback", async () => {
      const user = userEvent.setup();
      render(
        <ExportButton 
          metadata={mockMetadata}
          onExportComplete={mockOnExportComplete}
        />
      );
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      await user.click(button);
      
      await waitFor(() => {
        expect(mockOnExportComplete).toHaveBeenCalledWith(ExportFormat.JSON, true);
      });
    });

    test("should handle export cancellation", async () => {
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();
      
      render(
        <ExportButton 
          metadata={mockMetadata} 
          isExporting={true}
          onCancel={mockOnCancel}
        />
      );
      
      const cancelButton = screen.getByRole("button", { name: /キャンセル/ });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    test("should show success notification", async () => {
      const user = userEvent.setup();
      render(<ExportButton metadata={mockMetadata} />);
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/エクスポートが完了しました/)).toBeInTheDocument();
      });
    });

    test("should handle export errors", async () => {
      const user = userEvent.setup();
      
      // Mock export function to throw error
      const { exportToJSON } = await import("../../lib/export-utils");
      vi.mocked(exportToJSON).mockImplementation(() => {
        throw new Error("Export failed");
      });
      
      render(
        <ExportButton 
          metadata={mockMetadata}
          onExportComplete={mockOnExportComplete}
        />
      );
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/エクスポートに失敗しました/)).toBeInTheDocument();
        expect(mockOnExportComplete).toHaveBeenCalledWith(ExportFormat.JSON, false);
      });
    });
  });

  describe("Format Specific Tests", () => {
    test("should export JSON format correctly", async () => {
      const user = userEvent.setup();
      const { exportToJSON, downloadFile } = await import("../../lib/export-utils");
      
      render(<ExportButton metadata={mockMetadata} />);
      
      const selector = screen.getByRole("combobox");
      await user.selectOptions(selector, ExportFormat.JSON);
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      await user.click(button);
      
      await waitFor(() => {
        expect(exportToJSON).toHaveBeenCalledWith(mockMetadata);
        expect(downloadFile).toHaveBeenCalledWith(
          '{"test": "data"}',
          "test_20240315_143022.json",
          "application/json"
        );
      });
    });

    test("should export CSV format correctly", async () => {
      const user = userEvent.setup();
      const { exportToCSV, downloadFile } = await import("../../lib/export-utils");
      
      render(<ExportButton metadata={mockMetadata} />);
      
      const selector = screen.getByRole("combobox");
      await user.selectOptions(selector, ExportFormat.CSV);
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      await user.click(button);
      
      await waitFor(() => {
        expect(exportToCSV).toHaveBeenCalledWith(mockMetadata);
        expect(downloadFile).toHaveBeenCalledWith(
          "test,data\n1,2",
          expect.stringMatching(/\.csv$/),
          "text/csv"
        );
      });
    });

    test("should export text format correctly", async () => {
      const user = userEvent.setup();
      const { exportToText, downloadFile } = await import("../../lib/export-utils");
      
      render(<ExportButton metadata={mockMetadata} />);
      
      const selector = screen.getByRole("combobox");
      await user.selectOptions(selector, ExportFormat.TEXT);
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      await user.click(button);
      
      await waitFor(() => {
        expect(exportToText).toHaveBeenCalledWith(mockMetadata);
        expect(downloadFile).toHaveBeenCalledWith(
          "Test Data",
          expect.stringMatching(/\.txt$/),
          "text/plain"
        );
      });
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA attributes", () => {
      render(<ExportButton metadata={mockMetadata} />);
      
      const button = screen.getByRole("button", { name: /エクスポート/ });
      expect(button).toHaveAttribute("aria-label");
      
      const selector = screen.getByRole("combobox");
      expect(selector).toHaveAttribute("aria-label", "エクスポート形式を選択");
    });

    test("should be screen reader accessible", () => {
      render(<ExportButton metadata={mockMetadata} isExporting={true} />);
      
      expect(screen.getByLabelText(/エクスポート中/)).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    test("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<ExportButton metadata={mockMetadata} />);
      
      // Tab to selector
      await user.tab();
      expect(screen.getByRole("combobox")).toHaveFocus();
      
      // Tab to button
      await user.tab();
      expect(screen.getByRole("button", { name: /エクスポート/ })).toHaveFocus();
      
      // Enter should trigger export
      await user.keyboard("{Enter}");
      
      await waitFor(() => {
        expect(screen.getByText(/エクスポートが完了しました/)).toBeInTheDocument();
      });
    });
  });

  describe("Custom Props", () => {
    test("should handle availableFormats prop", () => {
      render(
        <ExportButton 
          metadata={mockMetadata}
          availableFormats={[ExportFormat.JSON, ExportFormat.CSV]}
        />
      );
      
      const selector = screen.getByRole("combobox");
      fireEvent.click(selector);
      
      expect(screen.getByText("JSON")).toBeInTheDocument();
      expect(screen.getByText("CSV")).toBeInTheDocument();
      expect(screen.queryByText("テキスト")).not.toBeInTheDocument();
    });

    test("should apply custom className", () => {
      render(
        <ExportButton 
          metadata={mockMetadata}
          className="custom-export-button"
        />
      );
      
      const container = screen.getByRole("button", { name: /エクスポート/ }).parentElement;
      expect(container).toHaveClass("custom-export-button");
    });
  });
});