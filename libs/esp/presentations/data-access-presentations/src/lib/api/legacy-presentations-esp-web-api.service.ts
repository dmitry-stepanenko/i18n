import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '@cosmos/config';
import { SearchCriteria, SearchResult } from '@esp/common/types';
import { PresentationSearch } from '@esp/presentations/types';

@Injectable({ providedIn: 'root' })
export class LegacyPresentationsEspWebApiService {
  private readonly _apiUrl: string;

  constructor(
    private readonly _http: HttpClient,
    configService: ConfigService
  ) {
    this._apiUrl = configService.get<string>('espServiceApiUrl');
  }

  query(
    criteria: SearchCriteria<string>
  ): Observable<SearchResult<PresentationSearch>> {
    let params = new HttpParams();

    (Object.keys(criteria) as Array<keyof SearchCriteria>).forEach((key) => {
      if (typeof criteria[key] !== 'undefined') {
        params = params.append(
          key,
          typeof criteria[key] === 'object'
            ? JSON.stringify(criteria[key])
            : criteria[key]
        );
      }
    });

    return this._http.get(`${this._apiUrl}/presentations/search`, { params });
  }
}
