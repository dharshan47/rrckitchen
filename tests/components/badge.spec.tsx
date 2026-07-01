import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders with text", () => {
    render(<Badge>VEG</Badge>);
    expect(screen.getByText("VEG")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(<Badge variant="destructive">NONVEG</Badge>);
    expect(screen.getByText("NONVEG")).toBeInTheDocument();
  });

  it("renders outline variant with text", () => {
    render(<Badge variant="outline">NEW</Badge>);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Badge className="custom-test">TEST</Badge>);
    expect(screen.getByText("TEST").className).toContain("custom-test");
  });
});
