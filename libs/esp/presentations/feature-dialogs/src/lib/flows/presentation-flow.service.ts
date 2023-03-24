import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { SearchCriteria } from '@esp/common/types';
import { CompaniesService } from '@esp/companies/data-access-companies';
import { CompanySearch } from '@esp/parties/types';
import { PresentationsApiService } from '@esp/presentations/data-access-presentations';
import { PresentationSearch } from '@esp/presentations/types';

export interface AddToPresentationDataAvailability {
  areAnyCustomersAvailable: boolean;
  areAnyPresentationsAvailable: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PresentationFlowService {
  constructor(
    private readonly _companiesService: CompaniesService,
    private readonly _presentationsService: PresentationsApiService
  ) {}

  getDataAvailabilityInfo(): Observable<AddToPresentationDataAvailability> {
    return forkJoin([
      this.areThereAnyCustomersAvailable(),
      this.areThereAnyPresentationsAvailable(),
    ]).pipe(
      map(([areAnyCustomersAvailable, areAnyPresentationsAvailable]) => ({
        areAnyCustomersAvailable,
        areAnyPresentationsAvailable,
      }))
    );
  }

  areThereAnyCustomersAvailable(): Observable<boolean> {
    return this._companiesService
      .query<CompanySearch>(
        new SearchCriteria({
          from: 1,
          size: 1,
          filters: {
            CompanyType: {
              terms: ['customer'],
            },
          },
          status: 'Active',
        })
      )
      .pipe(map((res) => !!res.ResultsTotal && res.ResultsTotal > 0));
  }

  private areThereAnyPresentationsAvailable(): Observable<boolean> {
    return this._presentationsService
      .query<PresentationSearch>(
        new SearchCriteria({
          from: 1,
          size: 1,
          status: 'Active',
          editOnly: true,
        })
      )
      .pipe(map((res) => !!res.ResultsTotal && res.ResultsTotal > 0));
  }
}
