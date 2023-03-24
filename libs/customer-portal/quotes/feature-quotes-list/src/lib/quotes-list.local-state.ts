import { Injectable, OnDestroy } from '@angular/core';

import { asDispatch, fromSelector, urlQueryParameter } from '@cosmos/state';
import { CustomerPortalSearchLocalState } from '@customer-portal/common/ui-pagination';
import {
  CustomerPortalProjectDetailsQueries,
  CustomerPortalProjectQueries,
} from '@customer-portal/projects/data-access/store';
import {
  CustomerPortalQuotesSearchActions,
  CustomerPortalQuotesSearchQueries,
} from '@customer-portal/quotes/data-access/store';
import { SearchCriteria } from '@esp/common/types';

@Injectable()
export class CustomerPortalQuotesListLocalState
  extends CustomerPortalSearchLocalState<CustomerPortalQuotesListLocalState>
  implements OnDestroy
{
  override readonly criteria = fromSelector(
    CustomerPortalQuotesSearchQueries.getCriteria
  );

  override readonly total = fromSelector(
    CustomerPortalQuotesSearchQueries.getTotal
  );

  override from = urlQueryParameter<number>('page', {
    defaultValue: 1,
    debounceTime: 0,
    converter: {
      fromQuery: (queryParameters: string[], defaultValue: number) =>
        queryParameters.length > 0
          ? parseInt(queryParameters[0], 10)
          : defaultValue,
      toQuery: (value: number) => (value > 1 ? [value.toString()] : []),
    },
  });

  readonly quotes = fromSelector(
    CustomerPortalQuotesSearchQueries.getQuotesWithProductsOnly
  );

  readonly projectId = fromSelector(CustomerPortalProjectQueries.getProjectId);

  readonly quoteCount = fromSelector(
    CustomerPortalProjectDetailsQueries.getQuoteCount
  );

  private readonly _search = asDispatch(
    CustomerPortalQuotesSearchActions.Search
  );

  private readonly _prune = asDispatch(CustomerPortalQuotesSearchActions.Prune);

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // This is used to prune the state since the state is persisted between navigations.
    // If the user goes to some specific order and comes back again, then the page gets
    // rendered (with the old state data) and a flickering happens because the data is
    // loaded again.
    this._prune();
  }

  search(criteria: SearchCriteria<string>): void {
    this._search(criteria);
  }
}
