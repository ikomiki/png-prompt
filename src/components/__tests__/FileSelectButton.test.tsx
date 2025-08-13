import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FileSelectButton } from "../FileSelectButton";

// Mock file for testing
const createMockFile = (name: string, type: string) => {
  return new File(["test content"], name, { type });
};

describe("FileSelectButton", () => {
  it("should render button with default props", () => {
    const mockOnFileSelect = vi.fn();
    render(<FileSelectButton onFileSelect={mockOnFileSelect} />);
    
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("ファイルを選択");
  });

  it("should trigger file input click on button click", () => {
    const mockOnFileSelect = vi.fn();
    render(<FileSelectButton onFileSelect={mockOnFileSelect} />);
    
    const button = screen.getByRole("button");
    const fileInput = screen.getByTestId("file-input");
    
    const clickSpy = vi.spyOn(fileInput, "click");
    fireEvent.click(button);
    
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("should call onFileSelect when file is selected", () => {
    const mockOnFileSelect = vi.fn();
    render(<FileSelectButton onFileSelect={mockOnFileSelect} />);
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const mockFile = createMockFile("test.png", "image/png");
    
    Object.defineProperty(fileInput, "files", {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    expect(mockOnFileSelect).toHaveBeenCalledWith(mockFile);
  });

  it("should accept only specified file types", () => {
    const mockOnFileSelect = vi.fn();
    render(
      <FileSelectButton 
        onFileSelect={mockOnFileSelect} 
        accept="image/png,.png"
      />
    );
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    expect(fileInput).toHaveAttribute("accept", "image/png,.png");
  });

  it("should be disabled when disabled prop is true", () => {
    const mockOnFileSelect = vi.fn();
    render(
      <FileSelectButton 
        onFileSelect={mockOnFileSelect} 
        disabled 
      />
    );
    
    const button = screen.getByRole("button");
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    expect(button).toBeDisabled();
    expect(fileInput).toBeDisabled();
  });

  it("should render primary variant correctly", () => {
    const mockOnFileSelect = vi.fn();
    render(
      <FileSelectButton 
        onFileSelect={mockOnFileSelect} 
        variant="primary"
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-primary");
  });

  it("should render secondary variant correctly", () => {
    const mockOnFileSelect = vi.fn();
    render(
      <FileSelectButton 
        onFileSelect={mockOnFileSelect} 
        variant="secondary"
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-100");
  });

  it("should render small size correctly", () => {
    const mockOnFileSelect = vi.fn();
    render(
      <FileSelectButton 
        onFileSelect={mockOnFileSelect} 
        size="sm"
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-8");
  });

  it("should render large size correctly", () => {
    const mockOnFileSelect = vi.fn();
    render(
      <FileSelectButton 
        onFileSelect={mockOnFileSelect} 
        size="lg"
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-12");
  });

  it("should handle file input change with no files", () => {
    const mockOnFileSelect = vi.fn();
    render(<FileSelectButton onFileSelect={mockOnFileSelect} />);
    
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    
    Object.defineProperty(fileInput, "files", {
      value: [],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const mockOnFileSelect = vi.fn();
    render(
      <FileSelectButton 
        onFileSelect={mockOnFileSelect} 
        className="custom-class"
      />
    );
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });
});