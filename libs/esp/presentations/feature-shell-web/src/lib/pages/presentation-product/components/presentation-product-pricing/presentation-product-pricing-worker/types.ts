import { PriceGrid } from '@cosmos/types-common';

export interface PresentationProductPricingToWorkerMessage {
  id: string;
  ngDevMode: boolean;
  amount: number;
  priceGrids: PriceGrid[];
  type: PriceAdjustmentType;
  roundPricesToTwoDecimal: boolean;
}

export interface PresentationProductPricingFromWorkerMessage {
  id: string;
  priceGrids: PriceGrid[];
}

export enum PriceAdjustmentType {
  ProfitMargin,

  AddFixedAmountToPrice,
  AddFixedAmountToPriceFromNetCost,
  AddFixedAmountToNetCost,

  AddPercentageToPriceFromPrice,
  AddPercentageToPriceFromNetCost,
  AddPercentageToNetCost,

  SubtractFixedAmountToPrice,
  SubtractFixedAmountToPriceFromNetCost,
  SubtractFixedAmountToNetCost,

  SubtractPercentageToPrice,
  SubtractPercentageToPriceFromNetCost,
  SubtractPercentageToNetCost,
}
