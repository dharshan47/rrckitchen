/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";

const { Root, Header, Content, Footer } = CompoundMenuCard;

const baseItem = {
  id: "1",
  name: "Masala Dosa",
  price: 70,
  foodType: "VEG",
  timeSlot: "MORNING",
  kitchenName: "Thanjavur Kitchen",
  description: "Crispy masala dosa with chutney",
};

describe("CompoundMenuCard", () => {
  it("renders header with item name", () => {
    render(
      <Root item={baseItem} onAddToCart={() => {}}>
        <Header />
      </Root>
    );
    expect(screen.getByText("Masala Dosa")).toBeInTheDocument();
    expect(screen.getByText("Thanjavur Kitchen")).toBeInTheDocument();
    expect(screen.getByText("VEG")).toBeInTheDocument();
  });

  it("shows content when expanded", () => {
    render(
      <Root item={baseItem} onAddToCart={() => {}} defaultExpanded>
        <Content />
      </Root>
    );
    expect(screen.getByText("Crispy masala dosa with chutney")).toBeInTheDocument();
  });

  it("hides content when not expanded", () => {
    render(
      <Root item={baseItem} onAddToCart={() => {}}>
        <Content />
      </Root>
    );
    expect(screen.queryByText("Crispy masala dosa with chutney")).not.toBeInTheDocument();
  });

  it("renders footer with price and time slot", () => {
    render(
      <Root item={baseItem} onAddToCart={() => {}}>
        <Footer />
      </Root>
    );
    expect(screen.getByText("₹70")).toBeInTheDocument();
    expect(screen.getByText(/Morning/i)).toBeInTheDocument();
  });

  it("renders Add button in footer", () => {
    render(
      <Root item={baseItem} onAddToCart={() => {}}>
        <Footer />
      </Root>
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("calls onAddToCart when Add is clicked", async () => {
    const onAdd = vi.fn();
    render(
      <Root item={baseItem} onAddToCart={onAdd}>
        <Footer />
      </Root>
    );
    await userEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(onAdd).toHaveBeenCalledWith("1");
  });

  it("uses item without description and no Details button", () => {
    const noDesc = { ...baseItem, description: null };
    render(
      <Root item={noDesc} onAddToCart={() => {}}>
        <Footer />
      </Root>
    );
    expect(screen.queryByRole("button", { name: "Details" })).not.toBeInTheDocument();
  });
});
