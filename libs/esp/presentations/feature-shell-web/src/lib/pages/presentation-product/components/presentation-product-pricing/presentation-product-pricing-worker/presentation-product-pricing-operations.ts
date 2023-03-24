import { Price, PriceGrid } from '@cosmos/types-common';
import {
  asNumber,
  calculateMargin,
  calculatePrice,
  roundUp,
  toFixedNumber,
} from '@cosmos/util-math';

import { PriceAdjustmentType } from './types';

class Operators {
  static add(a: number | string, b: number | string) {
    // 4.35 + 0.435 = 4.784999999999999
    return roundUp(asNumber(a) + asNumber(b));
  }

  static subtract(a: number | string, b: number | string): number {
    // 4.35 - 1 = 3.3499999999999996
    const result = asNumber(a) - asNumber(b);
    return result <= 0 ? 0 : roundUp(result);
  }

  static divide(a: number | string, b: number | string) {
    return roundUp(asNumber(a) / (asNumber(b) || 1));
  }
}

interface AdjustOptions {
  type: PriceAdjustmentType;
  priceGrids: PriceGrid[];
  amount: number;
  roundPricesToTwoDecimal?: boolean;
}

const additionAdjustmentTypes = [
  PriceAdjustmentType.AddFixedAmountToPrice,
  PriceAdjustmentType.AddFixedAmountToPriceFromNetCost,
  PriceAdjustmentType.AddFixedAmountToNetCost,

  PriceAdjustmentType.AddPercentageToPriceFromPrice,
  PriceAdjustmentType.AddPercentageToPriceFromNetCost,
  PriceAdjustmentType.AddPercentageToNetCost,
];

const subtractionAdjustmentTypes = [
  PriceAdjustmentType.SubtractFixedAmountToPrice,
  PriceAdjustmentType.SubtractFixedAmountToPriceFromNetCost,
  PriceAdjustmentType.SubtractFixedAmountToNetCost,

  PriceAdjustmentType.SubtractPercentageToPrice,
  PriceAdjustmentType.SubtractPercentageToPriceFromNetCost,
  PriceAdjustmentType.SubtractPercentageToNetCost,
];

function additionAdjustment({ type, priceGrids, amount }: AdjustOptions): void {
  switch (type) {
    case PriceAdjustmentType.AddFixedAmountToPrice:
      forEachPrice(priceGrids, (price) => {
        price.Price = Operators.add(price.Price, amount);
      });
      break;

    case PriceAdjustmentType.AddFixedAmountToPriceFromNetCost:
      forEachPrice(priceGrids, (price) => {
        price.Price = Operators.add(price.Cost, amount);
      });
      break;

    case PriceAdjustmentType.AddFixedAmountToNetCost:
      forEachPrice(priceGrids, (price) => {
        price.Cost = Operators.add(price.Cost, amount);
      });
      break;

    case PriceAdjustmentType.AddPercentageToPriceFromPrice:
      forEachPrice(priceGrids, (price) => {
        price.Price = Operators.add(price.Price, price.Price * (amount * 0.01));
      });
      break;

    case PriceAdjustmentType.AddPercentageToPriceFromNetCost:
      forEachPrice(priceGrids, (price) => {
        price.Price = Operators.add(price.Cost, price.Cost * (amount * 0.01));
      });
      break;

    case PriceAdjustmentType.AddPercentageToNetCost:
      forEachPrice(priceGrids, (price) => {
        price.Cost = Operators.add(price.Cost, price.Cost * (amount * 0.01));
      });
      break;

    default:
      break;
  }
}

function subtractionAdjustment({
  type,
  priceGrids,
  amount,
}: AdjustOptions): void {
  switch (type) {
    case PriceAdjustmentType.SubtractFixedAmountToPrice:
      forEachPrice(priceGrids, (price) => {
        price.Price = Operators.subtract(price.Price, amount);
      });
      break;

    case PriceAdjustmentType.SubtractFixedAmountToPriceFromNetCost:
      forEachPrice(priceGrids, (price) => {
        price.Price = Operators.subtract(price.Cost, amount);
      });
      break;

    case PriceAdjustmentType.SubtractFixedAmountToNetCost:
      forEachPrice(priceGrids, (price) => {
        price.Cost = Operators.subtract(price.Cost, amount);
      });
      break;

    case PriceAdjustmentType.SubtractPercentageToPrice:
      forEachPrice(priceGrids, (price) => {
        price.Price = Operators.subtract(
          price.Price,
          price.Price * (amount * 0.01)
        );
      });
      break;

    case PriceAdjustmentType.SubtractPercentageToPriceFromNetCost:
      forEachPrice(priceGrids, (price) => {
        // Given `cost` is 5.922
        // Given `price` is 9.87
        // Given `amount` is 10
        // 9.87 - (5.922 * (10 * 0.01)) = 9.2778
        price.Price = Operators.subtract(
          price.Cost,
          price.Cost * (amount * 0.01)
        );
      });
      break;

    case PriceAdjustmentType.SubtractPercentageToNetCost:
      forEachPrice(priceGrids, (price) => {
        price.Cost = Operators.subtract(
          price.Cost,
          price.Cost * (amount * 0.01)
        );
      });
      break;

    default:
      break;
  }
}

export function adjust({
  type,
  priceGrids,
  amount,
  roundPricesToTwoDecimal = false,
}: AdjustOptions): void {
  if (type === PriceAdjustmentType.ProfitMargin) {
    forEachPrice(priceGrids, (price) => {
      price.DiscountPercent = toFixedNumber(asNumber(amount) / 100);
    });
  } else if (additionAdjustmentTypes.includes(type)) {
    additionAdjustment({ type, priceGrids, amount });
  } else if (subtractionAdjustmentTypes.includes(type)) {
    subtractionAdjustment({ type, priceGrids, amount });
  }

  // The `ProfitMargin` is the only price adjustment type that changes margin and we have to recalculate
  // the price after the margin has been changed.
  if (type === PriceAdjustmentType.ProfitMargin) {
    forEachPrice(priceGrids, (price) => {
      price.Price = calculatePrice(price.Cost, price.DiscountPercent);
    });
  } else {
    // All other price adjustment types change the list price and we have to recalculate the margin after the price has been updated.
    forEachPrice(priceGrids, (price) => {
      price.DiscountPercent = calculateMargin(price.Price, price.Cost);
    });
  }

  if (roundPricesToTwoDecimal) {
    forEachPrice(priceGrids, (price) => {
      price.Price = roundUp(price.Price, 2);
    });
  }
}

function forEachPrice(
  priceGrids: PriceGrid[],
  callback: (price: Price) => void
): void {
  priceGrids.forEach(
    (priceGrid) => priceGrid.IsVisible && priceGrid.Prices.forEach(callback)
  );
}
