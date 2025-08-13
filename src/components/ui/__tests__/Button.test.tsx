import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "../Button";

describe("Button", () => {
  it("should render with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-bg-secondary");
    expect(button).toHaveClass("h-10");
  });

  it("should render with primary variant", () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole("button", { name: /primary/i });
    expect(button).toHaveClass("bg-primary");
  });

  it("should render with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toHaveClass("bg-gray-100");
  });

  it("should render with danger variant", () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole("button", { name: /danger/i });
    expect(button).toHaveClass("bg-red-600");
  });

  it("should render with ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button", { name: /ghost/i });
    expect(button).toHaveClass("bg-transparent");
  });

  it("should render with small size", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveClass("h-8");
  });

  it("should render with large size", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button", { name: /large/i });
    expect(button).toHaveClass("h-12");
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("should show loading state", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    
    // Loading spinner should be present
    const spinner = button.querySelector("svg");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  it("should show loading text when provided", () => {
    render(
      <Button loading loadingText="Saving...">
        Save
      </Button>
    );
    const button = screen.getByRole("button", { name: /saving.../i });
    expect(button).toBeInTheDocument();
  });

  it("should render with left icon", () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(
      <Button icon={icon} iconPosition="left">
        With Icon
      </Button>
    );
    
    const button = screen.getByRole("button", { name: /with icon/i });
    const iconElement = screen.getByTestId("test-icon");
    expect(button).toContainElement(iconElement);
  });

  it("should render with right icon", () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(
      <Button icon={icon} iconPosition="right">
        With Icon
      </Button>
    );
    
    const button = screen.getByRole("button", { name: /with icon/i });
    const iconElement = screen.getByTestId("test-icon");
    expect(button).toContainElement(iconElement);
  });

  it("should not show icon when loading", () => {
    const icon = <span data-testid="test-icon">Icon</span>;
    render(
      <Button icon={icon} loading>
        Loading
      </Button>
    );
    
    const iconElement = screen.queryByTestId("test-icon");
    expect(iconElement).not.toBeInTheDocument();
  });

  it("should render full width", () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole("button", { name: /full width/i });
    expect(button).toHaveClass("w-full");
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole("button", { name: /custom/i });
    expect(button).toHaveClass("custom-class");
  });

  it("should forward additional props", () => {
    render(<Button data-testid="custom-button">Test</Button>);
    const button = screen.getByTestId("custom-button");
    expect(button).toBeInTheDocument();
  });

  it("should be focusable and have proper focus styles", () => {
    render(<Button>Focusable</Button>);
    const button = screen.getByRole("button", { name: /focusable/i });
    
    button.focus();
    expect(button).toHaveFocus();
    expect(button).toHaveClass("focus-visible:ring-2");
  });
});