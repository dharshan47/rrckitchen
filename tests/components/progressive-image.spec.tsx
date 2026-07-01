import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressiveImage } from "@/components/patterns/progressive-image";

describe("ProgressiveImage", () => {
  it("renders with alt text when width/height provided", () => {
    render(<ProgressiveImage src="/test.jpg" alt="test image" width={200} height={150} priority />);
    expect(screen.getByAltText("test image")).toBeInTheDocument();
  });

  it("passes className to wrapper", () => {
    const { container } = render(
      <ProgressiveImage src="/test.jpg" alt="test" className="custom-class" width={200} height={150} priority />
    );
    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("renders Next/Image component with fill", () => {
    render(<ProgressiveImage src="/test.jpg" alt="fill-image" fill priority />);
    const img = screen.getByAltText("fill-image");
    expect(img.tagName).toBe("IMG");
  });
});
