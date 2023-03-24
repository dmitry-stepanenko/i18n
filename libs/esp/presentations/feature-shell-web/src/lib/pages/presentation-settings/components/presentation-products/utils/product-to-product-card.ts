import type { ProductCard } from '@cosmos/components/types-product-card';
import type { Price, Range } from '@cosmos/types-common';
import { PresentationProduct } from '@esp/presentations/types';

export function mapPresentationProduct(
  product: PresentationProduct
): ProductCard {
  const mappedProduct: { Price?: Price; ImageUrl: string; Supplier?: null } = {
    ImageUrl: product.DefaultMedia?.Url ?? '',
    Supplier: null,
  };

  if (product.HighestPrice) {
    mappedProduct.Price = {
      ...product.HighestPrice,
      Quantity: (product.HighestPrice?.Quantity as Range)?.['From'],
    };
  } else {
    // QUR display
    mappedProduct.Price = {
      Price: undefined,
    };
  }

  return {
    ...product,
    ...mappedProduct,
  } as ProductCard;
}
