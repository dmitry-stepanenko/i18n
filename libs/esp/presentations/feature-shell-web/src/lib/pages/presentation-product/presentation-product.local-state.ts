/// <reference types="jest" />
import {
  InjectFlags,
  Injectable,
  OnDestroy,
  ɵɵdirectiveInject as inject,
} from '@angular/core';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';

import {
  LocalState,
  asDispatch,
  fromSelector,
  stateBehavior,
} from '@cosmos/state';
import { Nullable } from '@cosmos/types-common';
import {
  PresentationsActions,
  PresentationsQueries,
} from '@esp/presentations/data-access-presentations';
import {
  PresentationProductActions,
  PresentationProductQueries,
} from '@esp/presentations/feature-products';
import { Presentation, PresentationProduct } from '@esp/presentations/types';
import {
  SupplierActions,
  SupplierQueries,
} from '@smartlink/suppliers/data-access-suppliers';

@Injectable()
export class PresentationProductLocalState
  extends LocalState<PresentationProductLocalState>
  implements OnDestroy
{
  private _delete = asDispatch(PresentationProductActions.Delete);
  private _supplier = fromSelector(SupplierQueries.getSupplier);

  hasLoaded = fromSelector(PresentationProductQueries.hasLoaded);
  isLoading = fromSelector(PresentationProductQueries.isLoading);
  isDirty = fromSelector(PresentationProductQueries.getIsDirty);

  product: Nullable<PresentationProduct> = fromSelector(
    PresentationProductQueries.getProduct
  );

  presentation: Nullable<Presentation> = fromSelector(
    PresentationsQueries.getPresentation
  );

  readonly currencyConversion = fromSelector(
    PresentationsQueries.getCurrencyConversion
  );

  getPresentation = asDispatch(PresentationsActions.Get);

  getAttributeValuesMap = fromSelector(
    PresentationProductQueries.getAttributeValuesMap
  );

  colors = fromSelector(PresentationProductQueries.getAttribute('PRCL'));
  sizes = fromSelector(PresentationProductQueries.getAttribute('SIZE'));
  shapes = fromSelector(PresentationProductQueries.getAttribute('SHAP'));
  materials = fromSelector(PresentationProductQueries.getAttribute('MTRL'));

  priceGrids = fromSelector(PresentationProductQueries.getPriceGrids);
  visiblePriceGrids = fromSelector(
    PresentationProductQueries.getVisiblePriceGrids
  );
  invisiblePriceGrids = fromSelector(
    PresentationProductQueries.getInvisiblePriceGrids
  );

  save = asDispatch(PresentationProductActions.Save);
  get = asDispatch(PresentationProductActions.Get);

  selectSupplier = asDispatch(SupplierActions.SelectSupplier);

  patchProduct = asDispatch(PresentationProductActions.PatchProduct);

  patchPriceGrid = asDispatch(PresentationProductActions.PatchPriceGrid);
  patchAttribute = asDispatch(PresentationProductActions.PatchAttribute);

  addCustomQuantity = asDispatch(PresentationProductActions.AddCustomQuantity);

  restoreToDefault = asDispatch(PresentationProductActions.RestoreToDefault);

  getOriginalPriceGrid = asDispatch(
    PresentationProductActions.GetOriginalPriceGrid
  );

  private _loadSupplier = stateBehavior<PresentationProductLocalState>(
    (state$) =>
      state$.pipe(
        map(({ product }) => product?.Supplier?.ExternalId),
        filter(Boolean),
        distinctUntilChanged(),
        tap((supplierId) => this.selectSupplier(supplierId))
      )
  );

  constructor() {
    super();

    if (ngDevMode) {
      ensureProvidedOnlyOnce();
    }
  }

  delete(): void {
    if (this.presentation && this.product) {
      this._delete(this.presentation?.Id, this.product);
    }
  }

  get supplier() {
    // TODO: fix type for cos-supplier-card
    return <any>{
      ...this._supplier,
      Rating: {
        Rating: this._supplier?.Ratings?.OverAll?.Rating,
        Transactions: this._supplier?.Ratings?.OverAll?.Companies,
      },
    };
  }
}

function ensureProvidedOnlyOnce() {
  if (
    // Do not execute that check within tests.
    typeof jest === 'undefined' &&
    inject(
      PresentationProductLocalState,
      InjectFlags.Optional | InjectFlags.SkipSelf
    ) !== null
  ) {
    throw new Error(
      'Seems like the `PresentationProductLocalState` is duplicated within `providers`. It should be declared only in `PresentationProductPage`.'
    );
  }
}
