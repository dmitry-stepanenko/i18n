import { Injectable } from '@angular/core';
import { Navigate } from '@ngxs/router-plugin';
import { Action, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { isEmpty, isEqual, xorWith } from 'lodash-es';
import { EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ToastActions } from '@cosmos/components/types-toast';
import {
  EntityStateModel,
  optimisticUpdate,
  setEntityStateItem,
  syncLoadProgress,
  updateItems,
} from '@cosmos/state';
import {
  CurrencyCode,
  IsCustomPrice,
  ModelWithLoadingStatus,
  Nullable,
  Price,
  PriceGrid,
} from '@cosmos/types-common';
import { PresentationsApiService } from '@esp/presentations/data-access-presentations';
import {
  PresentationProduct,
  PresentationProductAttribute,
  PresentationProductCharge,
} from '@esp/presentations/types';

import { PresentationProductActions } from '../../actions';

import { TOAST_MESSAGES } from './toast-messages';

const ACCEPTABLE_CACHE_SIZE = 5 as const;

export interface PresentationProductSet {
  product: PresentationProduct | null;
  originalPriceGrids: PriceGrid[];
  isDirty: boolean;
}

export interface PresentationProductStateModel
  extends ModelWithLoadingStatus,
    EntityStateModel<PresentationProductSet> {}

const defaultsState = (): PresentationProductStateModel => ({
  items: {},
  itemIds: [],
});

type LocalStateContext = StateContext<PresentationProductStateModel>;

@State<PresentationProductStateModel>({
  name: 'presentationProduct',
  defaults: defaultsState(),
})
@Injectable()
export class PresentationProductState {
  constructor(private readonly service: PresentationsApiService) {}

  @Action(PresentationProductActions.Get)
  get(ctx: LocalStateContext, action: PresentationProductActions.Get) {
    ctx.patchState({ currentId: action.productId });

    return this.service
      .getProductById(action.presentationId, action.productId, action.options)
      .pipe(
        tap((product) => {
          ctx.setState(
            setEntityStateItem(
              action.productId,
              {
                product,
                isDirty: false,
                originalPriceGrids: [],
              },
              {
                cacheSize: ACCEPTABLE_CACHE_SIZE,
              }
            )
          );
        }),
        syncLoadProgress(ctx),
        catchError((err) => {
          if (err.status === 500) ctx.dispatch(new Navigate(['not-found']));
          return EMPTY;
        })
      );
  }

  @Action(PresentationProductActions.Save)
  save(
    ctx: LocalStateContext,
    { product, presentationId }: PresentationProductActions.Save
  ) {
    return this.service.updateProduct(presentationId, product).pipe(
      optimisticUpdate<PresentationProduct>(product, {
        getValue: () => ctx.getState().items[product.Id].product!,
        setValue: (product: PresentationProduct) =>
          ctx.setState(
            setEntityStateItem(product.Id, { product, isDirty: false })
          ),
      }),
      tap((product) => {
        ctx.dispatch(
          new ToastActions.Show(
            product.Id
              ? TOAST_MESSAGES.PRODUCT_SAVE(product)
              : TOAST_MESSAGES.PRODUCT_UPDATE(product)
          )
        );
      }),
      catchError(() => {
        ctx.dispatch(new ToastActions.Show(TOAST_MESSAGES.PRODUCT_NOT_SAVED()));
        return EMPTY;
      })
    );
  }

  @Action(PresentationProductActions.PatchProduct)
  patchProduct(
    ctx: LocalStateContext,
    action: PresentationProductActions.PatchProduct
  ): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch(action.patchSpec),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.PatchCharge)
  patchCharge(
    ctx: LocalStateContext,
    action: PresentationProductActions.PatchCharge
  ): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          Charges: updateItem<PresentationProductCharge>(
            (charge) => charge?.Id === action.charge.Id,
            patch(action.patchSpec)
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.PatchAttribute)
  patchAttribute(
    ctx: LocalStateContext,
    action: PresentationProductActions.PatchAttribute
  ): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          Attributes: updateItem<PresentationProductAttribute>(
            (attribute) => attribute?.Id === action.attribute.Id,
            patch(action.patchSpec)
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.PatchPrice)
  patchPrice(
    ctx: LocalStateContext,
    action: PresentationProductActions.PatchPrice
  ): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          PriceGrids: updateItem<PriceGrid>(
            findPriceGrid(action.priceGrid),
            patch<PriceGrid>({
              Prices: updateItem(
                (price) => price === action.price,
                patch(action.patchSpec)
              ),
            })
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.PatchPriceGrid)
  patchPriceGrid(
    ctx: LocalStateContext,
    action: PresentationProductActions.PatchPriceGrid
  ): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          PriceGrids: updateItem<PriceGrid>(
            findPriceGrid(action.priceGrid),
            patch(action.patchSpec)
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.TogglePriceVisibility)
  togglePriceVisibility(
    ctx: LocalStateContext,
    action: PresentationProductActions.TogglePriceVisibility
  ): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          PriceGrids: updateItem<PriceGrid>(
            findPriceGrid(action.priceGrid),
            patch({
              Prices: updateItem<Price>(
                (price) => price === action.price,
                patch({ IsVisible: action.isVisible })
              ),
            })
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.RemovePrice)
  removePrice(
    ctx: LocalStateContext,
    action: PresentationProductActions.RemovePrice
  ): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          PriceGrids: updateItem<PriceGrid>(
            findPriceGrid(action.priceGrid),
            patch<PriceGrid>({
              Prices: removeItem((price) => price === action.price),
            })
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.ToggleVisibilityOfAllPrices)
  hideAllPrices(
    ctx: LocalStateContext,
    action: PresentationProductActions.ToggleVisibilityOfAllPrices
  ): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          PriceGrids: updateItem<PriceGrid>(
            findPriceGrid(action.priceGrid),
            patch({
              Prices: updateItems<Price>(
                (price) => !price![IsCustomPrice],
                patch({ IsVisible: action.isVisible })
              ),
            })
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.AddAllPriceGrids)
  addAllPriceGrids(ctx: LocalStateContext): void {
    const { currentId } = ctx.getState();

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          PriceGrids: updateItems<PriceGrid>(
            (priceGrid) => priceGrid!.IsVisible === false,
            patch({ IsVisible: true })
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.AddCustomQuantity)
  addCustomQuantity(
    ctx: LocalStateContext,
    action: PresentationProductActions.AddCustomQuantity
  ): void {
    const { currentId } = ctx.getState();

    const currencyCode = <CurrencyCode>action.priceGrid.Prices[0]?.CurrencyCode;

    ctx.setState(
      setEntityStateItem(currentId!, {
        product: patch({
          PriceGrids: updateItem<PriceGrid>(
            findPriceGrid(action.priceGrid),
            patch({
              Prices: append([createCustomPrice(currencyCode)]),
            })
          ),
        }),
        isDirty: true,
      })
    );
  }

  @Action(PresentationProductActions.RestoreToDefault)
  restoreToDefault(
    ctx: LocalStateContext,
    action: PresentationProductActions.RestoreToDefault
  ): void {
    const state = ctx.getState();
    const originalPrices: Nullable<Price[]> =
      getOriginalPricesIfTheyShouldBeRestored(state, action);

    if (originalPrices) {
      ctx.setState(
        setEntityStateItem(state.currentId!, {
          product: patch({
            PriceGrids: updateItem<PriceGrid>(
              findPriceGrid(action.priceGrid),
              patch<PriceGrid>({
                Prices: originalPrices,
              })
            ),
          }),
          isDirty: true,
        })
      );
    }
  }

  @Action(PresentationProductActions.GetOriginalPriceGrid)
  getOriginalPriceGrid(
    ctx: LocalStateContext,
    action: PresentationProductActions.GetOriginalPriceGrid
  ): void | Observable<PriceGrid> {
    const { items, currentId } = ctx.getState();
    const originalPriceGridHasBeenLoaded: PriceGrid | undefined = items[
      currentId!
    ]?.originalPriceGrids.find(({ Id }) => Id === action.priceGridId);
    // Do not make API call if the original price has been already loaded, we need
    // to load it only once.
    if (originalPriceGridHasBeenLoaded) {
      return;
    }

    return this.service
      .getOriginalPriceGrid(
        action.presentationId,
        action.productId,
        action.priceGridId
      )
      .pipe(
        tap((originalPriceGrid) =>
          ctx.setState(
            setEntityStateItem(action.productId, {
              originalPriceGrids: append([originalPriceGrid]),
            })
          )
        )
      );
  }
}

function findPriceGrid(predicate: PriceGrid) {
  // We're not able to search the price grid by reference, e.g. `priceGrid === action.priceGrid`,
  // since selectors return new objects with new properties (original objects are frozen).
  return function updateItemSelector(
    priceGrid: PriceGrid | undefined
  ): boolean {
    return priceGrid?.Id === predicate.Id;
  };
}

function getOriginalPricesIfTheyShouldBeRestored(
  state: PresentationProductStateModel,
  action: PresentationProductActions.RestoreToDefault
): Price[] | null {
  const { items, currentId } = state;
  const product: Nullable<PresentationProduct> = items[currentId!]?.product;
  const priceGrid: Nullable<PriceGrid> = product?.PriceGrids.find(
    ({ Id }) => Id === action.priceGrid.Id
  );
  const originalPriceGrid: Nullable<PriceGrid> = items[
    currentId!
  ]?.originalPriceGrids.find(({ Id }) => Id === action.priceGrid.Id);
  // Determine whether prices should be restored to their default values, we don't wanna
  // reset the state if prices haven't been changed, this will cause a whole re-render of the prices list.
  return priceGrid == null ||
    originalPriceGrid == null ||
    pricesAreEqual(priceGrid.Prices, originalPriceGrid.Prices)
    ? null
    : originalPriceGrid.Prices;

  function pricesAreEqual(a: Price[], b: Price[]) {
    return isEmpty(xorWith(a, b, isEqual));
  }
}

export function createCustomPrice(currencyCode?: CurrencyCode): Price {
  return {
    Sequence: 0,
    Quantity: {
      From: null!,
      To: null!,
    },
    Cost: null!,
    Price: null!,
    IsVisible: true,
    IsUndefined: false,
    CurrencyCode: currencyCode || 'USD',
    DiscountCode: 'R',
    [IsCustomPrice]: true,
  };
}
