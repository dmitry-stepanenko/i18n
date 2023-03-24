import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from '@cosmos/config';
import { EspRestClient } from '@esp/common/data-access-rest-client';
import { SearchCriteria } from '@esp/common/types';
import { Presentation, PresentationView } from '@esp/presentations/types';

@Injectable({ providedIn: 'root' })
export class PresentationsService extends EspRestClient<Presentation> {
  override url = 'presentations';

  constructor(configService: ConfigService) {
    super(configService.get<string>('venusApiUrl'));
  }

  searchProducts(id: number, criteria: SearchCriteria = new SearchCriteria()) {
    let params = new HttpParams();
    const keys = <Array<keyof typeof criteria>>Object.keys(criteria);

    keys.forEach((key) => {
      if (typeof criteria[key] !== 'undefined') {
        params = params.append(
          key,
          typeof criteria[key] === 'object'
            ? JSON.stringify(criteria[key])
            : criteria[key]
        );
      }
    });

    return this.http.get<PresentationView>(`${this.uri}/${id}/products`, {
      params,
    });
  }
}
