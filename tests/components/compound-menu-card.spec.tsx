/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card";

const { Root, Header, Footer } = CompoundMenuCard;

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
  it("renders header with item name and price", () => {
    render(
      <Root item={baseItem} onAddToCart={() => {}}>
        <Header />
      </Root>
    );
    expect(screen.getByText("Masala Dosa")).toBeInTheDocument();
    expect(screen.getByText("VEG")).toBeInTheDocument();
  });

  it("renders footer with time slot", () => {
    render(
      <Root item={baseItem} onAddToCart={() => {}}>
        <Footer />
      </Root>
    );
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
});
