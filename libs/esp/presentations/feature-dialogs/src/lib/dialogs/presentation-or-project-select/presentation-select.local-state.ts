import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

import {
  createLoadingProp,
  noopErrorHandler,
  stateEffect,
  syncLocalStateLoadProgress,
  writableProp,
} from '@cosmos/state';
import { SearchCriteria } from '@esp/common/types';
import { PresentationsApiService } from '@esp/presentations/data-access-presentations';
import { PresentationSearch } from '@esp/presentations/types';
import { SearchLocalState } from '@esp/search/data-access-search-local-states';

interface PresentationsSearchLocalStateModel {
  criteria: SearchCriteria | null;
  items: PresentationSearch[];
  total: number;
}

const MAX_COUNT = 11;

@Injectable()
export class PresentationOrProjectSelectDialogSearchLocalState extends SearchLocalState<PresentationOrProjectSelectDialogSearchLocalState> {
  override term = '';
  override from = 1;
  customerId = writableProp<number | undefined>(undefined);
  selectedPresentationId = writableProp<number | undefined>(undefined);

  readonly loading = createLoadingProp();

  // Suppose the add-to presentation flow is started on the archived presentations
  // page. This state previously used `PresentationsSearchState`, but it conflicts
  // with the presentations search page when interacting with this state in this dialog.
  // Dispatching `PresentationsSearchState` actions will reload the page behind the dialog,
  // likely leading to a conflict. The dialog doesn't need to interact with the global state
  // since it was previously resetting it in `ngOnDestroy`. This means it requires presentations locally.
  private _searchState = writableProp<PresentationsSearchLocalStateModel>({
    criteria: new SearchCriteria(),
    items: [],
    total: 0,
  });

  private readonly _search$ = stateEffect(
    (criteria: SearchCriteria<string>) => {
      const newCriteria = {
        ...criteria,
        sortBy: 'default',
        filters: {
          ...criteria.filters,
          ...(this.customerId
            ? {
                CustomerId: {
                  terms: [this.customerId as number],
                },
              }
            : {}),
        },
      };
      this._searchState = {
        criteria: newCriteria,
        items: [],
        total: 0,
      };

      return this._presentationsApiService
        .query<PresentationSearch>(newCriteria)
        .pipe(
          syncLocalStateLoadProgress(this, 'loading'),
          tap(
            (response) =>
              (this._searchState = {
                ...this._searchState,
                items: response.Results!,
                total: response.ResultsTotal!,
              })
          )
        );
    },
    {
      cancelUncompleted: true,
      handleError: noopErrorHandler,
    }
  );

  constructor(
    private readonly _presentationsApiService: PresentationsApiService
  ) {
    super();
  }

  get total() {
    return this._searchState.total;
  }

  get presentations() {
    return this._searchState.items;
  }

  get criteria() {
    return this._searchState.criteria;
  }

  search({ term, editOnly = true }: SearchCriteria): void {
    this._search$({
      term,
      editOnly,
      from: 1,
      size: MAX_COUNT,
      status: 'active',
    });
  }
}
