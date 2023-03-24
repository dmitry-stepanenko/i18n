import { Price, PriceGrid } from '@cosmos/types-common';
import { calculateMargin } from '@cosmos/util-math';

import { adjust } from './presentation-product-pricing-operations';
import { PriceAdjustmentType } from './types';

describe('Price adjustment operations', () => {
  const mockPriceGrid = (prices?: Price[]): PriceGrid =>
    <PriceGrid>{
      IsVisible: true,
      Prices: prices ?? [
        {
          Cost: 2.61,
          Price: 4.35,
          DiscountPercent: 0.4,
        },
      ],
    };

  it('PriceAdjustmentType.ProfitMargin', () => {
    // Arrange
    const amount = 60;
    const priceGrid = mockPriceGrid();
    // Act
    adjust({
      type: PriceAdjustmentType.ProfitMargin,
      priceGrids: [priceGrid],
      amount,
    });
    // Assert
    expect(priceGrid.Prices).toEqual([
      // The margin becomes 0.6, then we recalculate the price
      // Price = 2.61 / (1 - 0.6) = 6.5249999999999995
      { Cost: 2.61, Price: 6.525, DiscountPercent: 0.6 },
    ]);
  });

  describe('addition', () => {
    describe('fixed', () => {
      it('PriceAdjustmentType.AddFixedAmountToPrice', () => {
        // Arrange
        const amount = 10;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.AddFixedAmountToPrice,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Price = 4.35 + 10 = 14.35
          // Margin = (14.35 - 2.61) / 14.35 = 0.8181184668989547
          { Cost: 2.61, Price: 14.35, DiscountPercent: 0.82 },
        ]);
      });

      it('PriceAdjustmentType.AddFixedAmountToPriceFromNetCost', () => {
        // Arrange
        const amount = 10;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.AddFixedAmountToPriceFromNetCost,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Price = 2.61 + 10 = 12.61
          // Margin = (12.61 - 2.61) / 12.61 = 0.7930214115781127
          { Cost: 2.61, Price: 12.61, DiscountPercent: 0.79 },
        ]);
      });

      it('PriceAdjustmentType.AddFixedAmountToNetCost', () => {
        // Arrange
        const amount = 10;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.AddFixedAmountToNetCost,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Cost = 2.61 + 10 = 12.61
          // Margin = (4.35 - 12.61) / 4.35 = -1.8988505747126438
          { Cost: 12.61, Price: 4.35, DiscountPercent: -1.9 },
        ]);
      });
    });

    describe('percentage', () => {
      it('PriceAdjustmentType.AddPercentageToPriceFromPrice', () => {
        // Arrange
        const amount = 10;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.AddPercentageToPriceFromPrice,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Price = 4.35 + (4.35 * 10 * 0.01) = 4.784999999999999
          // Margin = (4.785 - 2.61) / 4.785 = 0.4545454545454546
          { Cost: 2.61, Price: 4.785, DiscountPercent: 0.45 },
        ]);
      });

      it('PriceAdjustmentType.AddPercentageToPriceFromNetCost', () => {
        // Arrange
        const amount = 10;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.AddPercentageToPriceFromNetCost,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Price = 2.61 + (2.61 * (10 * 0.01)) = 2.871
          // Margin = (2.871 - 2.61) / 0.0909 = 0.0909
          { Cost: 2.61, Price: 2.871, DiscountPercent: 0.09 },
        ]);
      });

      it('PriceAdjustmentType.AddPercentageToNetCost', () => {
        // Arrange
        const amount = 10;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.AddPercentageToNetCost,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Price = 2.61 + 2.61 * (10 * 0.01) = 2.871
          // Margin = (4.35 - 2.61) / 4.35 = 0.39999999999999997
          { Cost: 2.871, Price: 4.35, DiscountPercent: 0.34 },
        ]);
      });
    });
  });

  describe('subtraction', () => {
    describe('fixed', () => {
      it('PriceAdjustmentType.SubtractFixedAmountToPrice', () => {
        // Arrange
        const amount = 2;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.SubtractFixedAmountToPrice,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Price = 4.35 - 2 = 2.35
          // Margin = (2.35 - 2.61) / 2.35 = -0.11063829787234034
          { Cost: 2.61, Price: 2.35, DiscountPercent: -0.11 },
        ]);
      });

      it('PriceAdjustmentType.SubtractFixedAmountToPriceFromNetCost', () => {
        // Arrange
        const amount = 2;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.SubtractFixedAmountToPriceFromNetCost,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Price = 2.61 - 2 = 0.61
          // Margin = (0.61 - 2.61) / 0.61 = -3.278688524590164
          { Cost: 2.61, Price: 0.61, DiscountPercent: -3.3 },
        ]);
      });

      it('PriceAdjustmentType.SubtractFixedAmountToNetCost', () => {
        // Arrange
        const priceGrid = mockPriceGrid();
        const amount = 2;
        // Act
        adjust({
          type: PriceAdjustmentType.SubtractFixedAmountToNetCost,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Cost = 2.61 - 2 = 0.61
          // Margin = (4.35 - 0.61) / 0.61
          // Margin = (4.35 - 0.61) / 4.35 = 0.8597701149425288
          { Cost: 0.61, Price: 4.35, DiscountPercent: 0.86 },
        ]);
      });
    });

    describe('percentage', () => {
      it('PriceAdjustmentType.SubtractPercentageToPrice', () => {
        // Arrange
        const amount = 10;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.SubtractPercentageToPrice,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Price = 4.35 - 4.35 * (10 * 0.01) = 3.9149999999999996
          // Margin = (3.915 - 2.61) / 3.915 = 0.33333333333333337
          { Cost: 2.61, Price: 3.915, DiscountPercent: 0.33 },
        ]);
      });

      describe('PriceAdjustmentType.SubtractPercentageToPriceFromNetCost', () => {
        it('PriceAdjustmentType.SubtractPercentageToPriceFromNetCost', () => {
          // Arrange
          const amount = 10;
          const priceGrid = mockPriceGrid();
          // Act
          adjust({
            type: PriceAdjustmentType.SubtractPercentageToPriceFromNetCost,
            priceGrids: [priceGrid],
            amount,
          });
          // Assert
          expect(priceGrid.Prices).toEqual([
            // Price = 2.61 - (2.61 * 10 * 0.01) = 2.349
            // Margin = (2.349 - 2.61) / 2.349 = -0.1111
            { Cost: 2.61, Price: 2.349, DiscountPercent: -0.11 },
          ]);
        });

        it('https://asicentral.atlassian.net/browse/ENCORE-11342', () => {
          // Arrange
          const amount = 12;
          const priceGrid = mockPriceGrid([
            {
              Cost: 16.492,
              Price: 7.35,
              DiscountPercent: calculateMargin(16.492, 14.513),
            },
          ]);
          // Act
          adjust({
            type: PriceAdjustmentType.SubtractPercentageToPriceFromNetCost,
            priceGrids: [priceGrid],
            amount,
          });
          // Arrange
          expect(priceGrid.Prices).toEqual([
            { Cost: 16.492, Price: 14.513, DiscountPercent: -0.14 },
          ]);
        });
      });

      it('PriceAdjustmentType.SubtractPercentageToNetCost', () => {
        // Arrange
        const amount = 10;
        const priceGrid = mockPriceGrid();
        // Act
        adjust({
          type: PriceAdjustmentType.SubtractPercentageToNetCost,
          priceGrids: [priceGrid],
          amount,
        });
        // Assert
        expect(priceGrid.Prices).toEqual([
          // Cost = 2.61 - (2.61 * 10 * 0.01) = 2.3489999999999998
          // Margin = (4.35 - 2.349) / 4.35 = 0.4599999999999999
          { Cost: 2.349, Price: 4.35, DiscountPercent: 0.46 },
        ]);
      });
    });
  });
});
