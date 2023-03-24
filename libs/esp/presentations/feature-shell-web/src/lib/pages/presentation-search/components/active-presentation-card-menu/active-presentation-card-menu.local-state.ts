import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
import {
  PresentationsActions,
  PresentationsQueries,
} from '@esp/presentations/data-access-presentations';
import {
  ProjectActions,
  ProjectQueries,
} from '@esp/projects/data-access/store';

@Injectable()
export class ActivePresentationCardMenuLocalState extends LocalState<ActivePresentationCardMenuLocalState> {
  readonly getPresentation = asDispatch(PresentationsActions.Get);
  readonly getProject = asDispatch(ProjectActions.Get);

  readonly presentation = fromSelector(PresentationsQueries.getPresentation);
  readonly project = fromSelector(ProjectQueries.getProject);
}
