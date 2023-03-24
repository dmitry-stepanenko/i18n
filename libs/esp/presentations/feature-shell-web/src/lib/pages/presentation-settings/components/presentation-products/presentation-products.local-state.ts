import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
import {
  PresentationsActions,
  PresentationsQueries,
} from '@esp/presentations/data-access-presentations';

@Injectable()
export class PresentationProductsLocalState extends LocalState<PresentationProductsLocalState> {
  readonly presentation = fromSelector(PresentationsQueries.getPresentation);

  readonly presentationStatus = fromSelector(
    PresentationsQueries.getPresentationStatus
  );

  readonly visibleProducts = fromSelector(
    PresentationsQueries.getVisibleProducts
  );

  readonly hiddenProducts = fromSelector(
    PresentationsQueries.getHiddenProducts
  );

  readonly dislikedProducts = fromSelector(
    PresentationsQueries.getDislikedProducts
  );

  readonly addedToCartProducts = fromSelector(
    PresentationsQueries.getAddedToCartProducts
  );

  readonly seenProducts = fromSelector(PresentationsQueries.getSeenProducts);

  readonly unseenProducts = fromSelector(
    PresentationsQueries.getUnseenProducts
  );

  readonly sortProducts = asDispatch(PresentationsActions.SortProducts);

  readonly sequenceProducts = asDispatch(PresentationsActions.SequenceProducts);

  readonly updateProductVisibility = asDispatch(
    PresentationsActions.UpdateProductVisibility
  );

  readonly removeProduct = asDispatch(PresentationsActions.RemoveProduct);
}
