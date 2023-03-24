import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { compose, patch } from '@ngxs/store/operators';
import * as moment from 'moment';
import { EMPTY, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { ToastActions } from '@cosmos/components/types-toast';
import {
  EntityStateModel,
  copyToClipboard,
  optimisticUpdate,
  setEntityStateItem,
  syncLoadProgress,
} from '@cosmos/state';
import {
  ModelWithLoadingStatus,
  getDefaultOperationStatus,
} from '@cosmos/types-common';
import { Activity } from '@esp/activities/types';
import { SearchCriteria } from '@esp/common/types';
import { Order } from '@esp/orders/types';
import { Presentation, PresentationStatus } from '@esp/presentations/types';
import { ProjectsApiService } from '@esp/projects/data-access/api';

import { PresentationsActions } from '../../actions';
import { AddProductsResponse, PresentationsApiService } from '../../api';
import { TOAST_MESSAGES } from '../../constants';
import { PresentationsToastMessagesPresenter } from '../../services';

const ACCEPTABLE_CACHE_SIZE = 5;

export interface PresentationWrapper {
  presentation: Presentation;
  quote: Order;
  latestActivity?: Activity | null;
}

export interface PresentationsStateModel
  extends ModelWithLoadingStatus,
    EntityStateModel<PresentationWrapper> {
  latestAddProductsResponse?: AddProductsResponse | null;
}

type ThisStateContext = StateContext<PresentationsStateModel>;

@State<PresentationsStateModel>({
  name: 'presentations',
  defaults: {
    items: {},
    itemIds: [],
    loading: getDefaultOperationStatus(),
  },
})
@Injectable()
export class PresentationsState {
  constructor(
    private readonly _projectsApiService: ProjectsApiService,
    private readonly _presentationsApiService: PresentationsApiService,
    private readonly _presentationsToastMessagesPresenter: PresentationsToastMessagesPresenter
  ) {}

  @Action(PresentationsActions.Create)
  createPresentation(
    ctx: ThisStateContext,
    action: PresentationsActions.Create
  ) {
    return this._presentationsApiService
      .create(<Presentation>{
        ProjectId: action.projectId,
        Products: action.productIds.map((ProductId) => ({ ProductId })),
      })
      .pipe(
        tap((presentation) =>
          ctx.setState(
            compose(
              setEntityStateItem(
                presentation.Id,
                { presentation },
                {
                  cacheSize: ACCEPTABLE_CACHE_SIZE,
                }
              ),
              patch<PresentationsStateModel>({ currentId: presentation.Id })
            )
          )
        ),
        syncLoadProgress(ctx)
      );
  }

  @Action(PresentationsActions.Get)
  getPresentation(
    ctx: ThisStateContext,
    { presentationId, options }: PresentationsActions.Get
  ) {
    ctx.patchState({ currentId: presentationId });

    return this._presentationsApiService.get(presentationId, options).pipe(
      tap((presentation) =>
        ctx.setState(
          setEntityStateItem(
            presentationId,
            { presentation },
            {
              cacheSize: ACCEPTABLE_CACHE_SIZE,
            }
          )
        )
      ),
      switchMap((presentation) => {
        if (presentation.Quotes?.length) {
          return ctx
            .dispatch(
              new PresentationsActions.GetQuote(presentationId, options)
            )
            .pipe(
              catchError((error) => {
                if (error.status === 500) {
                  return of(presentation);
                } else {
                  throw error;
                }
              })
            );
        }

        return of(presentation);
      }),
      syncLoadProgress(ctx)
    );
  }

  @Action(PresentationsActions.GetPresentationIdByProjectId)
  getPresentationByProjectId(
    ctx: ThisStateContext,
    { projectId }: PresentationsActions.GetPresentationIdByProjectId
  ) {
    ctx.patchState({ currentId: null });

    return this._presentationsApiService
      .all<number>({ params: { projectId: projectId.toString() } })
      .pipe(
        syncLoadProgress(ctx),
        tap(([currentId]) => ctx.patchState({ currentId }))
      );
  }

  @Action(PresentationsActions.GetQuote)
  getQuote(
    ctx: ThisStateContext,
    { presentationId, options }: PresentationsActions.GetQuote
  ) {
    ctx.patchState({ currentId: presentationId });

    return this._presentationsApiService.getQuote(presentationId, options).pipe(
      tap((quote) =>
        ctx.setState(
          setEntityStateItem(
            presentationId,
            { quote },
            {
              cacheSize: ACCEPTABLE_CACHE_SIZE,
            }
          )
        )
      )
    );
  }

  @Action(PresentationsActions.PatchPresentation)
  patchPresentation(
    ctx: ThisStateContext,
    action: PresentationsActions.PatchPresentation
  ): void {
    ctx.setState(
      setEntityStateItem(
        action.presentationId,
        { presentation: patch(action.patchSpec) },
        {
          cacheSize: ACCEPTABLE_CACHE_SIZE,
        }
      )
    );
  }

  @Action(PresentationsActions.Update)
  update(ctx: ThisStateContext, { presentation }: PresentationsActions.Update) {
    return this._presentationsApiService.update(presentation).pipe(
      optimisticUpdate<Presentation>(presentation, {
        getValue: () => ctx.getState().items[presentation.Id].presentation,
        setValue: (updatedItem: Presentation) =>
          ctx.setState(
            setEntityStateItem(updatedItem.Id, { presentation: updatedItem })
          ),
      })
    );
  }

  @Action(PresentationsActions.GenerateShareLink)
  generateShareLink(ctx: ThisStateContext) {
    const presentationId = ctx.getState().currentId as number;
    return this._presentationsApiService.generateShareLink(presentationId).pipe(
      copyToClipboard((url) => url),
      tap((url) => {
        this._updateStatusAfterSharing(
          ctx,
          presentationId,
          ctx.getState().items[presentationId].presentation
        );
        ctx.dispatch(
          new ToastActions.Show(TOAST_MESSAGES.PRESENTATION_SHARED_BY_LINK())
        );
      })
    );
  }

  @Action(PresentationsActions.SendPresentationEmail)
  sendPresentationEmail(
    ctx: ThisStateContext,
    { presentationEmail }: PresentationsActions.SendPresentationEmail
  ) {
    const presentationId = ctx.getState().currentId as number;
    return this._presentationsApiService
      .presentationEmail(presentationId, presentationEmail)
      .pipe(
        tap(() => {
          this._updateStatusAfterSharing(
            ctx,
            presentationId,
            ctx.getState().items[presentationId].presentation
          );
          ctx.dispatch(
            new ToastActions.Show(TOAST_MESSAGES.PRESENTATION_SHARED_BY_EMAIL())
          );
        })
      );
  }

  @Action(PresentationsActions.AddProducts)
  addProducts(ctx: ThisStateContext, action: PresentationsActions.AddProducts) {
    ctx.patchState({ latestAddProductsResponse: null });

    return this._presentationsApiService
      .addProducts(action.presentationId, action.productIds)
      .pipe(
        tap((response) => {
          ctx.setState(
            setEntityStateItem(
              action.presentationId,
              { presentation: response.Presentation },
              {
                cacheSize: ACCEPTABLE_CACHE_SIZE,
              }
            )
          );

          ctx.patchState({ latestAddProductsResponse: response });

          this._presentationsToastMessagesPresenter.addProductsSucceeded(
            response,
            action.projectName
          );
        }),
        catchError(() => {
          this._presentationsToastMessagesPresenter.addProductsFailed(
            action.productIds
          );
          return EMPTY;
        }),
        syncLoadProgress(ctx)
      );
  }

  @Action(PresentationsActions.RemoveProduct)
  removeProduct(
    ctx: ThisStateContext,
    { presentationId, productId }: PresentationsActions.RemoveProduct
  ) {
    return this._presentationsApiService
      .removeProduct(presentationId, productId)
      .pipe(
        tap((presentation) =>
          ctx.setState(
            setEntityStateItem(
              presentationId,
              { presentation },
              {
                cacheSize: ACCEPTABLE_CACHE_SIZE,
              }
            )
          )
        ),
        catchError(() => {
          this._presentationsToastMessagesPresenter.productsNotDeleted();
          return EMPTY;
        })
      );
  }

  @Action(PresentationsActions.SequenceProducts)
  sequenceProducts(
    ctx: ThisStateContext,
    { presentationId, sequence }: PresentationsActions.SequenceProducts
  ) {
    return this._presentationsApiService
      .sequenceProducts(presentationId, sequence)
      .pipe(
        tap((presentation) =>
          ctx.setState(
            setEntityStateItem(
              presentationId,
              { presentation },
              {
                cacheSize: ACCEPTABLE_CACHE_SIZE,
              }
            )
          )
        ),
        catchError(() => {
          this._presentationsToastMessagesPresenter.productsNotSorted();
          return EMPTY;
        })
      );
  }

  @Action(PresentationsActions.SortProducts)
  sortProducts(
    ctx: ThisStateContext,
    { presentationId, sortOrder }: PresentationsActions.SortProducts
  ) {
    return this._presentationsApiService
      .sortProducts(presentationId, sortOrder)
      .pipe(
        tap((presentation) =>
          ctx.setState(
            setEntityStateItem(
              presentationId,
              { presentation },
              {
                cacheSize: ACCEPTABLE_CACHE_SIZE,
              }
            )
          )
        ),
        catchError(() => {
          this._presentationsToastMessagesPresenter.productsNotSorted();
          return EMPTY;
        })
      );
  }

  @Action(PresentationsActions.UpdatePresentationProductVisibility)
  updatePresentationProductVisibility(
    ctx: ThisStateContext,
    action: PresentationsActions.UpdatePresentationProductVisibility
  ) {
    // We have visible and hidden products on the UI, and we want to find the product by `action.productId`
    // within `presentation.Products` and update its `IsVisible` property.

    const { items, currentId } = ctx.getState();
    const presentation = currentId && items?.[currentId].presentation;

    if (presentation) {
      const newPresentation: Presentation = {
        ...presentation,
        Products: presentation.Products.map((product) =>
          product.Id === action.productId
            ? { ...product, IsVisible: action.isVisible }
            : product
        ),
      };

      ctx.setState(
        setEntityStateItem(
          newPresentation.Id,
          { presentation: newPresentation },
          {
            cacheSize: ACCEPTABLE_CACHE_SIZE,
          }
        )
      );
    }
  }

  @Action(PresentationsActions.UpdateProductVisibility)
  updateProductVisibility(
    ctx: ThisStateContext,
    action: PresentationsActions.UpdateProductVisibility
  ) {
    return this._presentationsApiService
      .updateProductVisibility(
        action.presentationId,
        action.productId,
        action.isVisible
      )
      .pipe(
        tap(() =>
          ctx.dispatch(
            new PresentationsActions.UpdatePresentationProductVisibility(
              action.productId,
              action.isVisible
            )
          )
        ),
        catchError(() => {
          this._presentationsToastMessagesPresenter.productsNotVisible(
            action.isVisible
          );
          return EMPTY;
        })
      );
  }

  @Action(PresentationsActions.PatchProduct)
  patchProduct(
    ctx: ThisStateContext,
    action: PresentationsActions.PatchProduct
  ): void {
    const state = ctx.getState();
    const presentation: Presentation | undefined =
      state.items[action.presentationId].presentation;

    if (presentation == null) {
      return;
    }

    const productToPatchIndex = presentation.Products.findIndex(
      (product) => product.Id === action.productId
    );

    if (productToPatchIndex === -1) {
      return;
    }

    const newPresentation: Presentation = {
      ...presentation,
      Products: presentation.Products.map((product, index) =>
        index === productToPatchIndex
          ? { ...product, ...action.patchSpec }
          : product
      ),
    };

    ctx.setState(
      setEntityStateItem(
        action.presentationId,
        { presentation: newPresentation },
        {
          cacheSize: ACCEPTABLE_CACHE_SIZE,
        }
      )
    );
  }

  @Action(PresentationsActions.GetRecentActivities)
  getRecentActivities(
    ctx: ThisStateContext,
    { presentationId, projectId }: PresentationsActions.GetRecentActivities
  ) {
    const criteria = new SearchCriteria({
      size: 1,
      filters: {
        Types: {
          terms: ['Presentation'],
          behavior: 'Any',
        },
      },
    });

    return this._projectsApiService.searchActivities(criteria, projectId).pipe(
      tap(({ Results }) => {
        const latestActivity = Results?.[0] || null;
        ctx.setState(setEntityStateItem(presentationId, { latestActivity }));
      })
    );
  }

  @Action(PresentationsActions.ChangeConversionRate)
  changeConversionRate(
    ctx: ThisStateContext,
    action: PresentationsActions.ChangeConversionRate
  ) {
    const { currentId, items } = ctx.getState();

    if (!currentId) {
      return;
    }

    const { presentation } = items[currentId];

    return ctx.dispatch(
      new PresentationsActions.Update({
        ...presentation,
        Currencies: action.currencies,
        CurrencyCode: action.currencyCode,
        CurrencySymbol: action.currencySymbol,
      })
    );
  }

  /**
   * This updates the presentation shared date after distributors send emails or copy
   * links. Note the shared date is being updated only locally. That's because the `SharedDate`
   * is updated separately on the backend side, but we don't wanna reload the presentation.
   */
  private _updateStatusAfterSharing(
    ctx: ThisStateContext,
    presentationId: number,
    currentPresentation: Presentation
  ): void {
    ctx.setState(
      setEntityStateItem(presentationId, {
        presentation: patch({
          Status:
            currentPresentation.Status === PresentationStatus.PreShare
              ? PresentationStatus.PostShare
              : currentPresentation.Status,
          // This always sets the new shared date whenever the email has been sent or link
          // has been copied. We don't wanna default to a currently existing `SharedDate`.
          SharedDate: moment().utc().toISOString(),
        }),
      })
    );
  }
}
