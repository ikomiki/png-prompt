import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "../Card";

describe("Card", () => {
  it("should render with title and children", () => {
    render(
      <Card title="Test Card">
        <p>Card content</p>
      </Card>
    );
    
    const title = screen.getByText("Test Card");
    const content = screen.getByText("Card content");
    
    expect(title).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it("should render with icon", () => {
    const icon = <span data-testid="card-icon">Icon</span>;
    render(
      <Card title="Card with Icon" icon={icon}>
        <p>Content</p>
      </Card>
    );
    
    const iconElement = screen.getByTestId("card-icon");
    expect(iconElement).toBeInTheDocument();
  });

  it("should not be collapsible by default", () => {
    render(
      <Card title="Non-collapsible Card">
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("Non-collapsible Card").closest("div");
    expect(header).not.toHaveClass("cursor-pointer");
    expect(header).not.toHaveAttribute("role", "button");
    
    // Chevron should not be present
    const chevron = screen.queryByRole("img", { hidden: true });
    expect(chevron).not.toBeInTheDocument();
  });

  it("should be collapsible when collapsible prop is true", () => {
    render(
      <Card title="Collapsible Card" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("Collapsible Card").closest("div");
    expect(header).toHaveClass("cursor-pointer");
    expect(header).toHaveAttribute("role", "button");
    expect(header).toHaveAttribute("tabIndex", "0");
    
    // Chevron should be present
    const chevron = screen.getByRole("img", { hidden: true });
    expect(chevron).toBeInTheDocument();
  });

  it("should be expanded by default", () => {
    render(
      <Card title="Default Expanded" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const content = screen.getByText("Content");
    expect(content).toBeInTheDocument();
    
    const header = screen.getByText("Default Expanded").closest("div");
    expect(header).toHaveAttribute("aria-expanded", "true");
  });

  it("should be collapsed when defaultExpanded is false", () => {
    render(
      <Card title="Default Collapsed" collapsible defaultExpanded={false}>
        <p>Content</p>
      </Card>
    );
    
    const content = screen.queryByText("Content");
    expect(content).not.toBeInTheDocument();
    
    const header = screen.getByText("Default Collapsed").closest("div");
    expect(header).toHaveAttribute("aria-expanded", "false");
  });

  it("should toggle content on header click when collapsible", () => {
    render(
      <Card title="Toggle Card" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("Toggle Card").closest("div");
    const content = screen.getByText("Content");
    
    // Initially expanded
    expect(content).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(header!);
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    
    // Click to expand again
    fireEvent.click(header!);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should toggle content on Enter key when collapsible", () => {
    render(
      <Card title="Keyboard Card" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("Keyboard Card").closest("div") as HTMLElement;
    
    // Initially expanded
    expect(screen.getByText("Content")).toBeInTheDocument();
    
    // Press Enter to collapse
    fireEvent.keyDown(header, { key: "Enter" });
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    
    // Press Enter to expand again
    fireEvent.keyDown(header, { key: "Enter" });
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should toggle content on Space key when collapsible", () => {
    render(
      <Card title="Space Card" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("Space Card").closest("div") as HTMLElement;
    
    // Initially expanded
    expect(screen.getByText("Content")).toBeInTheDocument();
    
    // Press Space to collapse
    fireEvent.keyDown(header, { key: " " });
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("should not toggle on other keys", () => {
    render(
      <Card title="Other Key Card" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("Other Key Card").closest("div") as HTMLElement;
    
    // Initially expanded
    expect(screen.getByText("Content")).toBeInTheDocument();
    
    // Press other key - should not toggle
    fireEvent.keyDown(header, { key: "Tab" });
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should have proper ARIA attributes when collapsible", () => {
    render(
      <Card title="ARIA Card" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("ARIA Card").closest("div");
    const contentContainer = screen.getByText("Content").closest("div");
    
    expect(header).toHaveAttribute("aria-expanded", "true");
    expect(header).toHaveAttribute("aria-controls", "card-content-ARIA Card");
    expect(contentContainer).toHaveAttribute("id", "card-content-ARIA Card");
  });

  it("should not have ARIA attributes when not collapsible", () => {
    render(
      <Card title="Non-ARIA Card">
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("Non-ARIA Card").closest("div");
    const contentContainer = screen.getByText("Content").closest("div");
    
    expect(header).not.toHaveAttribute("aria-expanded");
    expect(header).not.toHaveAttribute("aria-controls");
    expect(contentContainer).not.toHaveAttribute("id");
  });

  it("should apply custom className", () => {
    render(
      <Card title="Custom Class Card" className="custom-class">
        <p>Content</p>
      </Card>
    );
    
    const cardContainer = screen.getByText("Custom Class Card").closest("div")?.parentElement;
    expect(cardContainer).toHaveClass("custom-class");
  });

  it("should have proper styling classes", () => {
    render(
      <Card title="Styled Card">
        <p>Content</p>
      </Card>
    );
    
    const cardContainer = screen.getByText("Styled Card").closest("div")?.parentElement;
    expect(cardContainer).toHaveClass("rounded-lg", "border", "border-border", "bg-bg-primary", "shadow-md");
  });

  it("should rotate chevron when collapsed/expanded", () => {
    render(
      <Card title="Chevron Card" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const header = screen.getByText("Chevron Card").closest("div");
    const chevronContainer = screen.getByRole("img", { hidden: true }).closest("div");
    
    // Initially expanded - chevron rotated 180 degrees
    expect(chevronContainer).toHaveClass("rotate-180");
    
    // Click to collapse
    fireEvent.click(header!);
    expect(chevronContainer).toHaveClass("rotate-0");
    
    // Click to expand again
    fireEvent.click(header!);
    expect(chevronContainer).toHaveClass("rotate-180");
  });

  it("should have proper content border when expanded", () => {
    render(
      <Card title="Border Card" collapsible>
        <p>Content</p>
      </Card>
    );
    
    const contentContainer = screen.getByText("Content").closest("div");
    expect(contentContainer).toHaveClass("border-t", "border-border", "p-4");
  });
});