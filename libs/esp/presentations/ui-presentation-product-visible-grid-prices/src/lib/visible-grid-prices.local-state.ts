import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PresentationsQueries } from '@esp/presentations/data-access-presentations';
// I don't know why product actions in `feature-products` and not in data-access library...
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PresentationProductActions } from '@esp/presentations/feature-products';

@Injectable()
export class VisibleGridPricesLocalState extends LocalState<VisibleGridPricesLocalState> {
  readonly presentation = fromSelector(PresentationsQueries.getPresentation);

  readonly currencyConversion = fromSelector(
    PresentationsQueries.getCurrencyConversion
  );

  readonly patchPrice = asDispatch(PresentationProductActions.PatchPrice);

  readonly toggleVisibilityOfAllPrices = asDispatch(
    PresentationProductActions.ToggleVisibilityOfAllPrices
  );

  readonly togglePriceVisibility = asDispatch(
    PresentationProductActions.TogglePriceVisibility
  );

  readonly removePrice = asDispatch(PresentationProductActions.RemovePrice);
}
