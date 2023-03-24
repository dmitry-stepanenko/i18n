import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@cosmos/config';
import { SearchCriteria, SearchResult } from '@esp/common/types';
import { Order, OrderSearch } from '@esp/orders/types';

@Injectable({ providedIn: 'root' })
export class CustomerPortalInvoicesApiService {
  private readonly _apiUrl = inject(ConfigService).get<string>('marsApiUrl');

  constructor(private readonly _http: HttpClient) {}

  getInvoiceDetails(projectId: string | number, invoiceId: string | number) {
    return this._http.get<Order>(
      `${this._apiUrl}/projects/${projectId}/orders/${invoiceId}`
    );
  }

  getInvoiceHtml(projectId: string | number, invoiceId: string | number) {
    return this._http.get<string>(
      `${this._apiUrl}/projects/${projectId}/orders/${invoiceId}/html/invoice`,
      {
        responseType: 'text' as 'json',
      }
    );
  }

  getSentInvoices(projectId: string | number, criteria: SearchCriteria) {
    /* body param keys starts with capital */
    const body = (Object.keys(criteria) as Array<keyof SearchCriteria>).reduce(
      (params, key) => {
        return {
          ...params,
          [key[0].toUpperCase() + key.slice(1)]: criteria[key],
        };
      },
      {}
    );

    return this._http.post<SearchResult<OrderSearch>>(
      `${this._apiUrl}/projects/${projectId}/orders/type/invoice`,
      body
    );
  }
}
