import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { switchMap, tap } from 'rxjs/operators';

import { Supplier } from '@cosmos/components/types-supplier';
import { syncLoadProgress } from '@cosmos/state';
import { ModelWithLoadingStatus } from '@cosmos/types-common';
import { SearchCriteria } from '@esp/common/types';
import {
  PresentationProductView,
  PresentationView,
} from '@esp/presentations/types';
import type { SearchStateModel } from '@esp/search/types-search';
import { SuppliersService } from '@esp/suppliers/data-access-suppliers';

import { PresentationProductsActions } from '../actions';
import { PresentationsService } from '../services/presentation.service';

export interface PresentationProductsStateModel
  extends SearchStateModel<PresentationView>,
    ModelWithLoadingStatus {
  products: PresentationProductView[];
  total: number;
}

type ThisStateContext = StateContext<PresentationProductsStateModel>;

const defaultState = (): PresentationProductsStateModel => ({
  loading: undefined,
  products: [],
  total: 0,
  criteria: new SearchCriteria({ size: 48 }),
});

@State<PresentationProductsStateModel>({
  name: 'presentationProducts',
  defaults: defaultState(),
})
@Injectable()
export class PresentationProductsState {
  constructor(
    private readonly _service: PresentationsService,
    private readonly _supplierService: SuppliersService
  ) {}

  @Action(PresentationProductsActions.Search)
  search(
    ctx: ThisStateContext,
    { id, criteria }: PresentationProductsActions.Search
  ) {
    ctx.patchState({
      criteria,
      products: [],
      total: 0,
    });

    return this._service.searchProducts(id, criteria).pipe(
      syncLoadProgress(ctx),
      switchMap((presentation) => {
        const ids = presentation.Products?.map(
          (product) => product.Supplier?.ExternalId
        );
        return this._supplierService
          .supplierDetails({ Filters: { SupplierIds: { Terms: [...ids] } } })
          .pipe(
            tap((suppliers) => {
              ctx.patchState({
                products: presentation.Products.map((product) => {
                  return {
                    ...product,
                    Supplier: suppliers.Results.find(
                      (supplier: Supplier) =>
                        supplier.Id === product.Supplier?.ExternalId
                    ) as Supplier,
                  };
                }),
              });
            })
          );
      })
    );
  }

  @Action(PresentationProductsActions.Clear)
  clear(ctx: ThisStateContext) {
    ctx.patchState({
      products: [],
      total: 0,
    });
  }
}
