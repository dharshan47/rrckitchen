import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkeletonCard } from "@/components/patterns/skeleton-card";

describe("SkeletonCard", () => {
  it("renders default skeleton", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it("renders menu-item variant", () => {
    const { container } = render(<SkeletonCard variant="menu-item" />);
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it("renders cart-item variant", () => {
    const { container } = render(<SkeletonCard variant="cart-item" />);
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it("renders multiple items with count prop", () => {
    const { container } = render(<SkeletonCard count={3} />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(9);
  });

  it("menu-item skeleton has rounded-3xl class", () => {
    const { container } = render(<SkeletonCard variant="menu-item" />);
    expect(container.querySelector(".rounded-3xl")).toBeInTheDocument();
  });

  it("cart-item skeleton has rounded-2xl class", () => {
    const { container } = render(<SkeletonCard variant="cart-item" />);
    expect(container.querySelector(".rounded-2xl")).toBeInTheDocument();
  });
});
