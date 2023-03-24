import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
import {
  PresentationProductActions,
  PresentationProductQueries,
} from '@esp/presentations/feature-products';

@Injectable()
export class PresentationProductImprintLocalState extends LocalState<PresentationProductImprintLocalState> {
  product = fromSelector(PresentationProductQueries.getProduct);

  visibleImprintCharges = fromSelector(
    PresentationProductQueries.getImprintCharges(true)
  );
  invisibleImprintCharges = fromSelector(
    PresentationProductQueries.getImprintCharges(false)
  );

  visibleVendorCharges = fromSelector(
    PresentationProductQueries.getVendorCharges(true)
  );

  invisibleVendorCharges = fromSelector(
    PresentationProductQueries.getVendorCharges(false)
  );

  patchProduct = asDispatch(PresentationProductActions.PatchProduct);
  patchCharge = asDispatch(PresentationProductActions.PatchCharge);
  patchAttribute = asDispatch(PresentationProductActions.PatchAttribute);
}
