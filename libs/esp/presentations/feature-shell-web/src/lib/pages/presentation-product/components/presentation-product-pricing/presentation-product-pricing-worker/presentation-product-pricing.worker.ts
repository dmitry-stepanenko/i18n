/// <reference lib="webworker" />
import { adjust } from './presentation-product-pricing-operations';
import {
  PresentationProductPricingFromWorkerMessage,
  PresentationProductPricingToWorkerMessage,
} from './types';

addEventListener(
  'message',
  (message: MessageEvent<PresentationProductPricingToWorkerMessage>) => {
    const { id, ngDevMode, priceGrids, amount, type, roundPricesToTwoDecimal } =
      message.data;

    if (ngDevMode && !Array.isArray(priceGrids)) {
      throw new Error(
        `presentation-product-pricing.worker: expected data to be an array, got: ${priceGrids}`
      );
    }

    adjust({ type, priceGrids, amount, roundPricesToTwoDecimal });

    postMessage(<PresentationProductPricingFromWorkerMessage>{
      id,
      priceGrids,
    });
  }
);
