import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
import {
  CustomerPortalPresentationCartActions,
  CustomerPortalPresentationCartQueries,
  CustomerPortalPresentationCartViewModelQueries,
  CustomerPortalPresentationProductsQueries,
  CustomerPortalPresentationQueries,
} from '@customer-portal/presentations/data-access-presentations';
import { LineItemCardViewModel } from '@esp/presentations/types';

@Injectable()
export class PresentationCartLocalState extends LocalState<PresentationCartLocalState> {
  readonly cart = fromSelector(CustomerPortalPresentationCartQueries.getCart);
  readonly hasAnyVisibleItem = fromSelector(
    CustomerPortalPresentationCartQueries.getHasAnyVisibleItem
  );
  readonly lineItemCardViewModel: LineItemCardViewModel[] = fromSelector(
    CustomerPortalPresentationCartViewModelQueries.getLineItemCardViewModelSorted
  );
  readonly isLoading = fromSelector(
    CustomerPortalPresentationCartQueries.isLoading
  );
  readonly hasLoaded = fromSelector(
    CustomerPortalPresentationCartQueries.hasLoaded
  );
  readonly _removeCartProduct = asDispatch(
    CustomerPortalPresentationCartActions.RemoveProduct
  );

  readonly presentationId = fromSelector(
    CustomerPortalPresentationQueries.getPresentationId
  );

  readonly selectedProduct = fromSelector(
    CustomerPortalPresentationProductsQueries.getCurrentProduct
  );
}
