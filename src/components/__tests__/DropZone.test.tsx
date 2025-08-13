import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DropZone } from "../DropZone";

// Helper function to create drag events with files
const createDragEvent = (type: string, files: File[] = []) => {
  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
  });

  // Mock dataTransfer
  Object.defineProperty(event, "dataTransfer", {
    value: {
      files,
      items: {
        add: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
        length: files.length,
      },
      types: ["Files"],
      effectAllowed: "copy",
      dropEffect: "copy",
    },
    writable: false,
  });

  return event;
};

const createMockFile = (name: string, type: string) => {
  return new File(["test content"], name, { type });
};

describe("DropZone", () => {
  it("should render children", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={false}
      >
        <div>Drop files here</div>
      </DropZone>
    );
    
    expect(screen.getByText("Drop files here")).toBeInTheDocument();
  });

  it("should handle drag enter event", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={false}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    const dragEvent = createDragEvent("dragenter");
    
    fireEvent(dropZone, dragEvent);
    expect(mockOnDragStateChange).toHaveBeenCalledWith(true);
  });

  it("should handle drag over event", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={false}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    const dragEvent = createDragEvent("dragover");
    const preventDefaultSpy = vi.spyOn(dragEvent, "preventDefault");
    
    fireEvent(dropZone, dragEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should handle drag leave event", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={true}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    const dragEvent = createDragEvent("dragleave");
    
    fireEvent(dropZone, dragEvent);
    expect(mockOnDragStateChange).toHaveBeenCalledWith(false);
  });

  it("should handle drop event with valid files", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    const mockFile = createMockFile("test.png", "image/png");
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={true}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    const dropEvent = createDragEvent("drop", [mockFile]);
    const preventDefaultSpy = vi.spyOn(dropEvent, "preventDefault");
    
    fireEvent(dropZone, dropEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockOnDrop).toHaveBeenCalledWith([mockFile]);
    expect(mockOnDragStateChange).toHaveBeenCalledWith(false);
  });

  it("should prevent default behavior on drag events", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={false}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    
    // Test dragenter
    const dragEnterEvent = createDragEvent("dragenter");
    const preventDefaultSpy1 = vi.spyOn(dragEnterEvent, "preventDefault");
    fireEvent(dropZone, dragEnterEvent);
    expect(preventDefaultSpy1).toHaveBeenCalled();
    
    // Test dragover
    const dragOverEvent = createDragEvent("dragover");
    const preventDefaultSpy2 = vi.spyOn(dragOverEvent, "preventDefault");
    fireEvent(dropZone, dragOverEvent);
    expect(preventDefaultSpy2).toHaveBeenCalled();
  });

  it("should show drag state styling when isDragging is true", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={true}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    expect(dropZone).toHaveClass("border-primary", "bg-primary/5");
  });

  it("should remove drag state styling when isDragging is false", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={false}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    expect(dropZone).not.toHaveClass("border-primary", "bg-primary/5");
    expect(dropZone).toHaveClass("border-border");
  });

  it("should be disabled when disabled prop is true", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={false}
        disabled={true}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    expect(dropZone).toHaveClass("pointer-events-none", "opacity-50");
    
    // Events should not trigger when disabled
    const dragEvent = createDragEvent("dragenter");
    fireEvent(dropZone, dragEvent);
    expect(mockOnDragStateChange).not.toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={false}
        className="custom-drop-zone"
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    expect(dropZone).toHaveClass("custom-drop-zone");
  });

  it("should handle drop event with empty file list", () => {
    const mockOnDrop = vi.fn();
    const mockOnDragStateChange = vi.fn();
    
    render(
      <DropZone 
        onDrop={mockOnDrop} 
        onDragStateChange={mockOnDragStateChange}
        isDragging={true}
      >
        <div>Drop zone</div>
      </DropZone>
    );
    
    const dropZone = screen.getByTestId("drop-zone");
    const dropEvent = createDragEvent("drop", []);
    
    fireEvent(dropZone, dropEvent);
    
    expect(mockOnDrop).toHaveBeenCalledWith([]);
    expect(mockOnDragStateChange).toHaveBeenCalledWith(false);
  });
});