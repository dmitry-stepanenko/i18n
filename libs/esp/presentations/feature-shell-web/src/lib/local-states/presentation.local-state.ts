import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
import {
  PresentationsActions,
  PresentationsQueries,
} from '@esp/presentations/data-access-presentations';
import { ProjectQueries } from '@esp/projects/data-access/store';

@Injectable()
export class PresentationLocalState extends LocalState<PresentationLocalState> {
  save = asDispatch(PresentationsActions.Update);

  isLoading = fromSelector(PresentationsQueries.isLoading);
  hasLoaded = fromSelector(PresentationsQueries.hasLoaded);

  project = fromSelector(ProjectQueries.getProject);
  presentation = fromSelector(PresentationsQueries.getPresentation);

  readonly presentationExpired = fromSelector(
    PresentationsQueries.getPresentationExpired
  );

  quote = fromSelector(PresentationsQueries.getQuote);
}
