import { Injectable } from '@angular/core';
import { MatLegacyTabChangeEvent as MatTabChangeEvent } from '@angular/material/legacy-tabs';
import { Store } from '@ngxs/store';

import { fromSelector, writableProp } from '@cosmos/state';
import { SearchCriteria } from '@esp/common/types';
import {
  PresentationsSearchActions,
  PresentationsSearchQueries,
} from '@esp/presentations/data-access-presentations';
import { SearchPageLocalState } from '@esp/search/data-access-search-local-states';

import {
  PRESENTATION_TABS,
  isArchivedPresentationsTab,
  oldEspSortMenuOptions,
  sortMenuOptions,
} from './presentation-search.config';

const MAX_COUNT = 1000;

@Injectable()
export class PresentationSearchLocalState extends SearchPageLocalState<PresentationSearchLocalState> {
  readonly criteria = fromSelector(PresentationsSearchQueries.getCriteria);

  readonly presentations = fromSelector(
    PresentationsSearchQueries.getPresentations
  );

  readonly isLoading = fromSelector(PresentationsSearchQueries.isLoading);
  readonly hasLoaded = fromSelector(PresentationsSearchQueries.hasLoaded);

  readonly _total = fromSelector(PresentationsSearchQueries.getTotal);

  override sort = sortMenuOptions[0];

  override tabIndex = 0;

  // This is used to identify which action to dispatch when distributors switch between
  // tabs. We need to dispatch different actions based on the selected tab because they're
  // queries separate APIs. Active and closed presentations query Venus and archived presentations
  // query Esp Web. They have totally different search models.
  isArchivedPresentationsTab = writableProp(false);

  constructor(private readonly _store: Store) {
    super();
  }

  override get tab() {
    return PRESENTATION_TABS[this.tabIndex];
  }

  override setTab(event: MatTabChangeEvent): void {
    this.tabIndex = event.index;

    if (isArchivedPresentationsTab(event.index)) {
      // We have the `sort` criteria because `sortBy` filters are different on Venus
      // and Esp Web APIs. See the actual `oldEspSortMenuOptions`.
      this.sort = oldEspSortMenuOptions[0];
      this.isArchivedPresentationsTab = true;
    } else {
      this.sort = sortMenuOptions[0];
      this.isArchivedPresentationsTab = false;
    }

    this.from = 1;
  }

  get total() {
    return Math.min(this._total, MAX_COUNT);
  }

  override search(criteria: SearchCriteria): void {
    const Search = this.isArchivedPresentationsTab
      ? PresentationsSearchActions.SearchLegacyEspWeb
      : PresentationsSearchActions.Search;

    this._store.dispatch(new Search(criteria));
  }
}
