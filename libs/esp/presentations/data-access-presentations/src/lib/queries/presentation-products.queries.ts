import {
  createLoadingSelectorsFor,
  createPropertySelectors,
  createSelectorX,
} from '@cosmos/state';
import { ProductLineItem } from '@esp/orders/types';
import { PresentationProductView } from '@esp/presentations/types';

import {
  PresentationProductsState,
  PresentationProductsStateModel,
} from '../states/presentation-products.state';

export namespace PresentationProductsQueries {
  export const { isLoading, hasLoaded, getLoadError } =
    createLoadingSelectorsFor<PresentationProductsStateModel>(
      PresentationProductsState
    );

  export const {
    products: getProducts,
    total: getTotal,
    criteria: getCriteria,
  } = createPropertySelectors<PresentationProductsStateModel>(
    PresentationProductsState
  );

  export const getPresentationProducts = createSelectorX(
    [getProducts],
    (products) =>
      products?.map((product: PresentationProductView) => {
        return {
          Type: 'product',
          Name: product?.Name,
          Number: product?.Number,
          ImageUrl: product?.DefaultMedia?.Url,
          Description: product?.Description,
          ProductId: product?.ProductId,
          Supplier: {
            Name: product?.Supplier?.Name,
            AsiNumber: product?.Supplier?.AsiNumber,
            ExternalId: product?.Supplier?.Id,
          },
        } as ProductLineItem;
      }) || []
  );

  export const getProductsSortedByName = createSelectorX(
    [getPresentationProducts],
    (products) =>
      products.sort((a, b) =>
        a.Name.toLowerCase() < b.Name.toLocaleLowerCase() ? -1 : 0
      )
  );
}
