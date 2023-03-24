import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
import {
  CurrentOrderViewModelQueries,
  OrderActions,
} from '@esp/orders/data-access-orders';
import { LineItemCardViewModel } from '@esp/presentations/types';

@Injectable()
export class PresentationQuoteLocalState extends LocalState<PresentationQuoteLocalState> {
  isLoading = fromSelector(CurrentOrderViewModelQueries.isLoading);
  hasLoaded = fromSelector(CurrentOrderViewModelQueries.hasLoaded);
  productCards?: LineItemCardViewModel[] = fromSelector(
    CurrentOrderViewModelQueries.productCards
  );

  quote = fromSelector(CurrentOrderViewModelQueries.getCurrentOrderDomainModel);

  loadQuote = asDispatch(OrderActions.LoadOrder);
}
