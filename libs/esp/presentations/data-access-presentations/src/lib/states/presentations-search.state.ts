import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { map, tap } from 'rxjs';

import { syncLoadProgress } from '@cosmos/state';
import { ModelWithLoadingStatus } from '@cosmos/types-common';
import { SearchCriteria } from '@esp/common/types';
import { PresentationSearch } from '@esp/presentations/types';

import { PresentationsSearchActions } from '../actions';
import { LegacyPresentationsEspWebApiService } from '../api/legacy-presentations-esp-web-api.service';
import { PresentationsApiService } from '../api/presentations-api.service';

export interface PresentationSearchStateModel extends ModelWithLoadingStatus {
  criteria: SearchCriteria | null;
  items: PresentationSearch[];
  total: number;
}

type ThisStateContext = StateContext<PresentationSearchStateModel>;

const defaultState = (): PresentationSearchStateModel => ({
  criteria: new SearchCriteria(),
  items: [],
  total: 0,
});

@State<PresentationSearchStateModel>({
  name: 'presentationsSearch',
  defaults: defaultState(),
})
@Injectable()
export class PresentationsSearchState {
  constructor(
    private readonly _presentationsApiService: PresentationsApiService,
    private readonly _legacyPresentationsEspWebApiService: LegacyPresentationsEspWebApiService
  ) {}

  /**
   * https://asicentral.atlassian.net/browse/ENCORE-3863
   * The tab click will run a query for presentation search passing the following filter params:
   * Filters: { Key: "ProjectId", Terms: [1234] } (where 1234 is the Project Id.)
   */
  @Action(PresentationsSearchActions.Search)
  search(
    ctx: ThisStateContext,
    { criteria }: PresentationsSearchActions.Search
  ) {
    ctx.patchState({
      criteria,
      items: [],
      total: 0,
    });

    return this._presentationsApiService
      .query<PresentationSearch>(criteria)
      .pipe(
        syncLoadProgress(ctx),
        tap((response) =>
          ctx.patchState({
            items: response?.Results,
            total: response?.ResultsTotal,
          })
        )
      );
  }

  /**
   * https://asicentral.atlassian.net/browse/ENCORE-25132
   * This is mostly the same as the above action but it goes to Esp Web API through babou.
   * This is used to load legacy presentations from Esp Web.
   */
  @Action(PresentationsSearchActions.SearchLegacyEspWeb)
  searchLegacyEspWeb(
    ctx: ThisStateContext,
    { criteria }: PresentationsSearchActions.SearchLegacyEspWeb
  ) {
    ctx.patchState({
      criteria,
      items: [],
      total: 0,
    });

    return this._legacyPresentationsEspWebApiService.query(criteria).pipe(
      syncLoadProgress(ctx),
      map((response) => {
        return {
          ...response,
          Results: response.Results?.map((presentation) => {
            return {
              ...presentation,
              Project: { Id: 0, Name: presentation.Name ?? '' },
              ProductCount: presentation.Products.length ?? 0,
              Products: [...presentation.Products.slice(0, 8)],
              Customer: {
                ...presentation.Customer,
                LogoMediaId: presentation.LogoMediaId,
                IconImageUrl:
                  presentation.IconImageUrl || presentation.LogoImageUrl,
                PrimaryBrandColor: presentation.PrimaryBrandColor,
              },
            };
          }),
        };
      }),
      tap((response) =>
        ctx.patchState({
          items: response?.Results || [],
          total: response?.ResultsTotal,
        })
      )
    );
  }

  @Action(PresentationsSearchActions.Reset)
  reset(ctx: ThisStateContext) {
    ctx.setState(defaultState());
  }
}
