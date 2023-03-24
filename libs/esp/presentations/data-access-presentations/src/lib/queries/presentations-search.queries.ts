import {
  createLoadingSelectorsFor,
  createPropertySelectors,
} from '@cosmos/state';

import {
  PresentationSearchStateModel,
  PresentationsSearchState,
} from '../states';

export namespace PresentationsSearchQueries {
  export const { isLoading, hasLoaded, getLoadError } =
    createLoadingSelectorsFor<PresentationSearchStateModel>(
      PresentationsSearchState
    );

  export const {
    items: getPresentations,
    total: getTotal,
    criteria: getCriteria,
  } = createPropertySelectors<PresentationSearchStateModel>(
    PresentationsSearchState
  );
}
