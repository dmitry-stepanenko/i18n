import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { LookupTypeQueries } from '@esp/lookup/data-access-lookup';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PresentationsQueries } from '@esp/presentations/data-access-presentations';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  PresentationProductActions,
  PresentationProductQueries,
} from '@esp/presentations/feature-products';

export const IMPRINT_METHOD_TYPE = 'IMMD';

@Injectable()
export class PPImprintLocalState extends LocalState<PPImprintLocalState> {
  readonly presentation = fromSelector(PresentationsQueries.getPresentation);

  readonly product = fromSelector(PresentationProductQueries.getProduct);

  readonly imprintMethod = fromSelector(
    PresentationProductQueries.getAttribute(IMPRINT_METHOD_TYPE)
  );

  readonly decorations = fromSelector(LookupTypeQueries.lookups.Decorations);

  readonly patchProduct = asDispatch(PresentationProductActions.PatchProduct);

  readonly patchAttribute = asDispatch(
    PresentationProductActions.PatchAttribute
  );

  readonly getOriginalPriceGrid = asDispatch(
    PresentationProductActions.GetOriginalPriceGrid
  );
}
