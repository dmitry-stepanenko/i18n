import {
  createLoadingSelectorsFor,
  createPropertySelectors,
  createSelectorX,
} from '@cosmos/state';
import {
  LikeDislike,
  PresentationProductStatus,
} from '@esp/presentations/types';

import { PresentationsState, PresentationsStateModel } from '../states';

export namespace PresentationsQueries {
  export const { isLoading, hasLoaded, getLoadError } =
    createLoadingSelectorsFor<PresentationsStateModel>(PresentationsState);

  export const {
    items,
    currentId,
    latestAddProductsResponse: getLatestAddProductsResponse,
  } = createPropertySelectors<PresentationsStateModel>(PresentationsState);

  export const getCurrentItem = createSelectorX(
    [items, currentId],
    (items, currentId) => (currentId && items?.[currentId]) || null
  );

  export const { presentation: getPresentation, quote: getQuote } =
    createPropertySelectors(getCurrentItem);

  export const getPresentationById = (presentationId: number) =>
    createSelectorX([items], (items) => items?.[presentationId].presentation);

  export const getPresentationStatus = createSelectorX(
    [getPresentation],
    (presentation) => (presentation ? presentation.Status : null)
  );

  export const getPresentationExpired = createSelectorX(
    [getPresentation],
    (presentation) => {
      if (presentation?.ExpirationDate) {
        return (
          new Date().getTime() > new Date(presentation.ExpirationDate).getTime()
        );
      } else {
        return false;
      }
    }
  );

  export const getPresentationProducts = createSelectorX(
    [getPresentation],
    (presentation) => presentation?.Products
  );

  export const getVisibleProducts = createSelectorX(
    [getPresentationProducts],
    (products) => products?.filter((product) => product.IsVisible)
  );

  export const getHiddenProducts = createSelectorX(
    [getPresentationProducts],
    (products) => products?.filter((product) => !product.IsVisible)
  );

  export const getDislikedProducts = createSelectorX(
    [getVisibleProducts],
    (products) =>
      products?.filter((product) => product.Like === LikeDislike.Disliked)
  );

  export const getAddedToCartProducts = createSelectorX(
    [getVisibleProducts],
    (products) =>
      products?.filter(
        (product) => product.Status === PresentationProductStatus.InCart
      )
  );

  export const getSeenProducts = createSelectorX(
    [getVisibleProducts],
    (products) =>
      // We're checking for both statuses because the product may have `In Cart` status.
      // But the product cannot be added to a cart w/o being viewed, which means it's seen too.
      products?.filter(
        (product) =>
          product.Status === PresentationProductStatus.Viewed ||
          product.Status === PresentationProductStatus.InCart
      )
  );

  export const getUnseenProducts = createSelectorX(
    [getVisibleProducts],
    (products) =>
      products?.filter(
        (product) => product.Status === PresentationProductStatus.None
      )
  );

  export const getCurrencyConversion = createSelectorX(
    [getPresentation],
    (presentation) => {
      if (!presentation) {
        return null;
      }

      const currencyConversion = presentation.Currencies?.find(
        (currency) => currency.CurrencyCode !== presentation.CurrencyCode
      );

      return currencyConversion || null;
    }
  );
}
