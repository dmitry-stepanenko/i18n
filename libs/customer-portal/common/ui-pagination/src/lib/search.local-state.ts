import { Injectable, InjectionToken } from '@angular/core';
import { isEqual } from 'lodash-es';
import {
  animationFrameScheduler,
  debounceTime,
  defer,
  distinctUntilChanged,
  map,
  mergeMap,
  tap,
} from 'rxjs';

import { Behavior, LocalState, stateBehavior } from '@cosmos/state';
import { Nullable } from '@cosmos/types-common';
import { SearchCriteria } from '@esp/common/types';

export const CUSTOMER_PORTAL_SEARCH_LOCAL_STATE =
  new InjectionToken<CustomerPortalSearchLocalState>(
    ngDevMode ? 'CUSTOMER_PORTAL_SEARCH_LOCAL_STATE' : ''
  );

@Injectable()
export abstract class CustomerPortalSearchLocalState<
  T extends object = any
> extends LocalState<T> {
  abstract search(criteria: SearchCriteria): void;

  abstract criteria: Nullable<SearchCriteria>;

  abstract total: Nullable<number>;
  abstract from: Nullable<number>;

  readonly _searchOnChanges: Behavior<CustomerPortalSearchLocalState<T>> =
    stateBehavior<CustomerPortalSearchLocalState<T>>((state$) =>
      defer(() => Promise.resolve()).pipe(
        mergeMap(() =>
          state$.pipe(
            map((state) => this._searchStateMapper(state)),
            debounceTime(0, animationFrameScheduler),
            distinctUntilChanged(isEqual),
            tap((criteria) =>
              this.search({
                ...this.criteria,
                ...criteria,
              })
            )
          )
        )
      )
    );

  protected _searchStateMapper(state: CustomerPortalSearchLocalState<T>) {
    return {
      from: state.from,
    };
  }
}
