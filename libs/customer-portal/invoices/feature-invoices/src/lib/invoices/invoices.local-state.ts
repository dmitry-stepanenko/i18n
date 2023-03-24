import { Injectable } from '@angular/core';

import { asDispatch, fromSelector, urlQueryParameter } from '@cosmos/state';
import { CustomerPortalSearchLocalState } from '@customer-portal/common/ui-pagination';
import {
  CustomerPortalInvoicesActions,
  CustomerPortalInvoicesQueries,
} from '@customer-portal/invoices/data-access-invoices';
import { SearchCriteria } from '@esp/common/types';
import { OrderSearch } from '@esp/orders/types';

@Injectable()
export class CustomerPortalInvoicesLocalState extends CustomerPortalSearchLocalState<CustomerPortalInvoicesLocalState> {
  override readonly criteria = fromSelector(
    CustomerPortalInvoicesQueries.getCriteria
  );

  override readonly total = fromSelector(
    CustomerPortalInvoicesQueries.getTotal
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

  readonly invoices: OrderSearch[] | null = fromSelector(
    CustomerPortalInvoicesQueries.getInvoices
  );

  private _getInvoices$ = asDispatch(CustomerPortalInvoicesActions.GetInvoices);

  override search(criteria: Omit<SearchCriteria, 'size'>): void {
    this._getInvoices$({ ...criteria, size: 10 });
  }
}
