import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ErrorMessage } from "../ErrorMessage";

describe("ErrorMessage", () => {
  it("should render basic error message", () => {
    render(<ErrorMessage message="Something went wrong" />);
    
    const message = screen.getByText("Something went wrong");
    expect(message).toBeInTheDocument();
    expect(message).toHaveClass("text-red-800");
  });

  it("should render with details", () => {
    render(
      <ErrorMessage
        message="Error occurred"
        details="Detailed error information"
      />
    );
    
    const message = screen.getByText("Error occurred");
    const details = screen.getByText("Detailed error information");
    
    expect(message).toBeInTheDocument();
    expect(details).toBeInTheDocument();
  });

  it("should render with collapsible details", () => {
    render(
      <ErrorMessage
        message="Error occurred"
        details="Detailed error information"
        collapsible
      />
    );
    
    const summary = screen.getByText("詳細を表示");
    expect(summary).toBeInTheDocument();
    
    // Details should be hidden initially
    expect(screen.queryByText("Detailed error information")).not.toBeVisible();
    
    // Click to expand
    fireEvent.click(summary);
    expect(screen.getByText("Detailed error information")).toBeVisible();
  });

  it("should render warning variant", () => {
    render(<ErrorMessage message="Warning message" variant="warning" />);
    
    const container = screen.getByText("Warning message").closest("div");
    expect(container).toHaveClass("border-yellow-200", "bg-yellow-50");
    
    const message = screen.getByText("Warning message");
    expect(message).toHaveClass("text-yellow-800");
  });

  it("should render info variant", () => {
    render(<ErrorMessage message="Info message" variant="info" />);
    
    const container = screen.getByText("Info message").closest("div");
    expect(container).toHaveClass("border-blue-200", "bg-blue-50");
    
    const message = screen.getByText("Info message");
    expect(message).toHaveClass("text-blue-800");
  });

  it("should render with small size", () => {
    render(<ErrorMessage message="Small message" size="sm" />);
    
    const container = screen.getByText("Small message").closest("div");
    expect(container).toHaveClass("text-sm");
  });

  it("should render with large size", () => {
    render(<ErrorMessage message="Large message" size="lg" />);
    
    const container = screen.getByText("Large message").closest("div");
    expect(container).toHaveClass("text-lg");
  });

  it("should handle retry button click", () => {
    const handleRetry = vi.fn();
    render(
      <ErrorMessage
        message="Error occurred"
        onRetry={handleRetry}
        retryText="Try Again"
      />
    );
    
    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("should handle close button click", () => {
    const handleClose = vi.fn();
    render(<ErrorMessage message="Error occurred" onClose={handleClose} />);
    
    const closeButtons = screen.getAllByRole("button", { name: /閉じる/i });
    expect(closeButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(closeButtons[0]!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should handle close icon click", () => {
    const handleClose = vi.fn();
    render(<ErrorMessage message="Error occurred" onClose={handleClose} />);
    
    // The X icon button should be present
    const closeIconButton = screen.getByRole("button", { name: "" });
    expect(closeIconButton).toBeInTheDocument();
    
    fireEvent.click(closeIconButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should render without icon when showIcon is false", () => {
    render(<ErrorMessage message="No icon" showIcon={false} />);
    
    // Error icon should not be present
    const errorIcon = screen.queryByRole("img", { hidden: true });
    expect(errorIcon).not.toBeInTheDocument();
  });

  it("should render with custom className", () => {
    render(<ErrorMessage message="Custom" className="custom-class" />);
    
    const container = screen.getByText("Custom").closest("div");
    expect(container).toHaveClass("custom-class");
  });

  it("should render error icon for error variant", () => {
    render(<ErrorMessage message="Error" variant="error" />);
    
    const icon = screen.getByRole("img", { hidden: true });
    expect(icon).toHaveClass("text-red-400");
  });

  it("should render warning icon for warning variant", () => {
    render(<ErrorMessage message="Warning" variant="warning" />);
    
    const icon = screen.getByRole("img", { hidden: true });
    expect(icon).toHaveClass("text-yellow-400");
  });

  it("should render info icon for info variant", () => {
    render(<ErrorMessage message="Info" variant="info" />);
    
    const icon = screen.getByRole("img", { hidden: true });
    expect(icon).toHaveClass("text-blue-400");
  });

  it("should render both action buttons when both callbacks are provided", () => {
    const handleRetry = vi.fn();
    const handleClose = vi.fn();
    
    render(
      <ErrorMessage
        message="Error"
        onRetry={handleRetry}
        onClose={handleClose}
      />
    );
    
    const retryButton = screen.getByRole("button", { name: /再試行/i });
    const closeButton = screen.getByRole("button", { name: /閉じる/i });
    
    expect(retryButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
  });

  it("should handle multiline details", () => {
    const multilineDetails = "Line 1\nLine 2\nLine 3";
    render(
      <ErrorMessage message="Error" details={multilineDetails} />
    );
    
    const detailsElement = screen.getByText(multilineDetails);
    expect(detailsElement).toHaveClass("whitespace-pre-wrap");
  });

  it("should break long words in details", () => {
    const longDetails = "verylongwordthatshouldbebrokenproperly";
    render(<ErrorMessage message="Error" details={longDetails} />);
    
    const detailsElement = screen.getByText(longDetails);
    expect(detailsElement).toHaveClass("break-words");
  });
});