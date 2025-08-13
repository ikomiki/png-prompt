import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FileUploader } from "../FileUploader";
import { ErrorType } from "@/types";

// Mock file creation helper
const createMockFile = (name: string, type: string, size: number = 1024) => {
  const file = new File(["test content"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

// Mock PNG file validation
vi.mock("@/lib/file-validator", () => ({
  validatePngFile: vi.fn(),
}));

const mockValidatePngFile = vi.mocked(
  (await import("@/lib/file-validator")).validatePngFile
);

describe("FileUploader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with initial state", () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
      />
    );
    
    expect(screen.getByText("PNGファイルをここにドロップするか")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ファイルを選択/i })).toBeInTheDocument();
  });

  it("should handle file selection from button", async () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    const mockFile = createMockFile("test.png", "image/png");
    
    mockValidatePngFile.mockResolvedValueOnce({
      valid: true,
      file: mockFile,
    });
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
      />
    );
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    // Wait for async validation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockValidatePngFile).toHaveBeenCalledWith(mockFile, {
      maxFileSize: 100 * 1024 * 1024, // default 100MB
    });
    expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile);
  });

  it("should handle file drop", async () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    const mockFile = createMockFile("test.png", "image/png");
    
    mockValidatePngFile.mockResolvedValueOnce({
      valid: true,
      file: mockFile,
    });
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
      />
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    
    // Create drop event
    const dropEvent = new DragEvent("drop", {
      bubbles: true,
      cancelable: true,
    });
    
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [mockFile],
      },
      writable: false,
    });
    
    fireEvent(dropZone, dropEvent);
    
    // Wait for async validation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockValidatePngFile).toHaveBeenCalledWith(mockFile, {
      maxFileSize: 100 * 1024 * 1024,
    });
    expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile);
  });

  it("should validate file type", async () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    const mockFile = createMockFile("test.jpg", "image/jpeg");
    
    mockValidatePngFile.mockResolvedValueOnce({
      valid: false,
      error: {
        type: ErrorType.INVALID_FILE_TYPE,
        message: "Invalid file type",
        details: "Only PNG files are supported",
      },
    });
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
      />
    );
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    // Wait for async validation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockValidatePngFile).toHaveBeenCalledWith(mockFile, {
      maxFileSize: 100 * 1024 * 1024,
    });
    expect(mockOnError).toHaveBeenCalledWith({
      type: ErrorType.INVALID_FILE_TYPE,
      message: "Invalid file type",
      details: "Only PNG files are supported",
    });
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it("should validate file size", async () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    const mockFile = createMockFile("huge.png", "image/png", 200 * 1024 * 1024); // 200MB
    
    mockValidatePngFile.mockResolvedValueOnce({
      valid: false,
      error: {
        type: ErrorType.FILE_TOO_LARGE,
        message: "File too large",
        details: "File size exceeds the maximum limit",
      },
    });
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
        maxFileSize={100 * 1024 * 1024} // 100MB
      />
    );
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    // Wait for async validation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockValidatePngFile).toHaveBeenCalledWith(mockFile, {
      maxFileSize: 100 * 1024 * 1024,
    });
    expect(mockOnError).toHaveBeenCalledWith({
      type: ErrorType.FILE_TOO_LARGE,
      message: "File too large",
      details: "File size exceeds the maximum limit",
    });
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it("should handle multiple files (take first only)", async () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    const mockFile1 = createMockFile("test1.png", "image/png");
    const mockFile2 = createMockFile("test2.png", "image/png");
    
    mockValidatePngFile.mockResolvedValueOnce({
      valid: true,
      file: mockFile1,
    });
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
      />
    );
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    Object.defineProperty(fileInput, "files", {
      value: [mockFile1, mockFile2],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    // Wait for async validation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Should only process the first file
    expect(mockValidatePngFile).toHaveBeenCalledWith(mockFile1, {
      maxFileSize: 100 * 1024 * 1024,
    });
    expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile1);
    expect(mockValidatePngFile).toHaveBeenCalledTimes(1);
  });

  it("should update drag state when dragging", () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
      />
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    
    // Initially not dragging
    expect(dropZone).not.toHaveClass("border-primary");
    
    // Trigger drag enter
    const dragEnterEvent = new DragEvent("dragenter", {
      bubbles: true,
      cancelable: true,
    });
    
    Object.defineProperty(dragEnterEvent, "dataTransfer", {
      value: { files: [] },
      writable: false,
    });
    
    fireEvent(dropZone, dragEnterEvent);
    
    // Should show dragging state
    expect(dropZone).toHaveClass("border-primary", "bg-primary/5");
  });

  it("should show selected file info", async () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    const mockFile = createMockFile("test.png", "image/png", 1024);
    
    mockValidatePngFile.mockResolvedValueOnce({
      valid: true,
      file: mockFile,
    });
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
      />
    );
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    // Wait for async validation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(screen.getByText("test.png")).toBeInTheDocument();
    expect(screen.getByText("1.0 KB")).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
        disabled={true}
      />
    );
    
    const button = screen.getByRole("button", { name: /ファイルを選択/i });
    const dropZone = screen.getByTestId("drop-zone");
    
    expect(button).toBeDisabled();
    expect(dropZone).toHaveClass("pointer-events-none", "opacity-50");
  });

  it("should apply custom className", () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
        className="custom-uploader"
      />
    );
    
    const container = screen.getByTestId("file-uploader");
    expect(container).toHaveClass("custom-uploader");
  });

  it("should clear error when new valid file is selected", async () => {
    const mockOnFileSelect = vi.fn();
    const mockOnError = vi.fn();
    
    const invalidFile = createMockFile("test.txt", "text/plain");
    const validFile = createMockFile("test.png", "image/png");
    
    // First file validation fails
    mockValidatePngFile.mockResolvedValueOnce({
      valid: false,
      error: {
        type: ErrorType.INVALID_FILE_TYPE,
        message: "Invalid file type",
        details: "Only PNG files are supported",
      },
    });
    
    // Second file validation succeeds
    mockValidatePngFile.mockResolvedValueOnce({
      valid: true,
      file: validFile,
    });
    
    render(
      <FileUploader 
        onFileSelect={mockOnFileSelect} 
        onError={mockOnError}
      />
    );
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    // Select invalid file first
    Object.defineProperty(fileInput, "files", {
      value: [invalidFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockOnError).toHaveBeenCalledWith({
      type: ErrorType.INVALID_FILE_TYPE,
      message: "Invalid file type",
      details: "Only PNG files are supported",
    });
    
    // Select valid file
    Object.defineProperty(fileInput, "files", {
      value: [validFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
    // Error should have been cleared (no additional error calls)
    expect(mockOnError).toHaveBeenCalledTimes(1);
  });
});