import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingIndicator } from "../LoadingIndicator";

describe("LoadingIndicator", () => {
  it("should render spinner without text", () => {
    render(<LoadingIndicator />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  it("should render with text below spinner", () => {
    render(<LoadingIndicator text="Loading..." />);
    
    const text = screen.getByText("Loading...");
    expect(text).toBeInTheDocument();
    
    const container = text.closest("div");
    expect(container).toHaveClass("flex-col");
  });

  it("should render with text to the right of spinner", () => {
    render(<LoadingIndicator text="Loading..." textPosition="right" />);
    
    const text = screen.getByText("Loading...");
    const container = text.closest("div");
    expect(container).toHaveClass("flex-row");
  });

  it("should render with small size", () => {
    render(<LoadingIndicator size="sm" />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toHaveClass("h-4", "w-4");
  });

  it("should render with medium size (default)", () => {
    render(<LoadingIndicator size="md" />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toHaveClass("h-6", "w-6");
  });

  it("should render with large size", () => {
    render(<LoadingIndicator size="lg" />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toHaveClass("h-8", "w-8");
  });

  it("should render with extra large size", () => {
    render(<LoadingIndicator size="xl" />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toHaveClass("h-12", "w-12");
  });

  it("should render with primary color (default)", () => {
    render(<LoadingIndicator text="Loading..." />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    const text = screen.getByText("Loading...");
    
    expect(spinner).toHaveClass("text-primary");
    expect(text).toHaveClass("text-primary");
  });

  it("should render with secondary color", () => {
    render(<LoadingIndicator color="secondary" text="Loading..." />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    const text = screen.getByText("Loading...");
    
    expect(spinner).toHaveClass("text-gray-600");
    expect(text).toHaveClass("text-gray-600");
  });

  it("should render with white color", () => {
    render(<LoadingIndicator color="white" text="Loading..." />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    const text = screen.getByText("Loading...");
    
    expect(spinner).toHaveClass("text-white");
    expect(text).toHaveClass("text-white");
  });

  it("should center content when centered prop is true", () => {
    render(<LoadingIndicator centered />);
    
    const container = screen.getByRole("img", { hidden: true }).closest("div");
    expect(container).toHaveClass("justify-center");
  });

  it("should apply custom className", () => {
    render(<LoadingIndicator className="custom-class" />);
    
    const container = screen.getByRole("img", { hidden: true }).closest("div");
    expect(container).toHaveClass("custom-class");
  });

  it("should have proper SVG structure", () => {
    render(<LoadingIndicator />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    expect(spinner.tagName).toBe("svg");
    
    // Check for circle and path elements
    const circle = spinner.querySelector("circle");
    const path = spinner.querySelector("path");
    
    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
    
    expect(circle).toHaveAttribute("opacity", "0.25");
    expect(path).toHaveAttribute("opacity", "0.75");
  });

  it("should have proper viewBox and stroke attributes", () => {
    render(<LoadingIndicator />);
    
    const spinner = screen.getByRole("img", { hidden: true });
    expect(spinner).toHaveAttribute("viewBox", "0 0 24 24");
    expect(spinner).toHaveAttribute("fill", "none");
    expect(spinner).toHaveAttribute("stroke", "currentColor");
  });
});