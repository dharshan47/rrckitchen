interface Strategy<TInput, TOutput> {
  execute(input: TInput): TOutput;
}

class StrategyContext<TInput, TOutput> {
  private strategy: Strategy<TInput, TOutput>;

  constructor(strategy: Strategy<TInput, TOutput>) {
    this.strategy = strategy;
  }

  setStrategy(strategy: Strategy<TInput, TOutput>) {
    this.strategy = strategy;
  }

  execute(input: TInput): TOutput {
    return this.strategy.execute(input);
  }
}

export type PriceCalculationStrategy = Strategy<
  { basePrice: number; qty: number; discounts?: Array<{ type: string; value: number }> },
  { subtotal: number; discount: number; total: number }
>;

export const noDiscountStrategy: PriceCalculationStrategy = {
  execute({ basePrice, qty }) {
    const subtotal = basePrice * qty;
    return { subtotal, discount: 0, total: subtotal };
  },
};

export const percentageDiscountStrategy = (percent: number): PriceCalculationStrategy => ({
  execute({ basePrice, qty, discounts = [] }) {
    const subtotal = basePrice * qty;
    const totalDiscount = discounts.reduce((acc, d) => {
      if (d.type === "percentage") return acc + subtotal * (d.value / 100);
      if (d.type === "fixed") return acc + d.value;
      return acc;
    }, 0);
    return { subtotal, discount: totalDiscount, total: Math.max(0, subtotal - totalDiscount) };
  },
});

export type FilterStrategy<T> = Strategy<T[], T[]>;

export const vegFilterStrategy: FilterStrategy<{ foodType: string }> = {
  execute(items) {
    return items.filter((i) => i.foodType === "VEG");
  },
};

export const nonVegFilterStrategy: FilterStrategy<{ foodType: string }> = {
  execute(items) {
    return items.filter((i) => i.foodType === "NONVEG");
  },
};

export const allFilterStrategy: FilterStrategy<{ foodType: string }> = {
  execute(items) {
    return items;
  },
};

export function createFilterStrategy(foodType: string): FilterStrategy<{ foodType: string }> {
  switch (foodType) {
    case "VEG": return vegFilterStrategy;
    case "NONVEG": return nonVegFilterStrategy;
    default: return allFilterStrategy;
  }
}

export { StrategyContext };
