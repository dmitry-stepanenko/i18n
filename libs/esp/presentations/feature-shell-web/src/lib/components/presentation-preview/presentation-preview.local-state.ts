import { Injectable } from '@angular/core';

import { LocalState, fromSelector } from '@cosmos/state';
import { PresentationsQueries } from '@esp/presentations/data-access-presentations';
import { ProjectQueries } from '@esp/projects/data-access/store';

@Injectable()
export class PresentationPreviewLocalState extends LocalState<PresentationPreviewLocalState> {
  readonly project = fromSelector(ProjectQueries.getProject);

  readonly presentation = fromSelector(PresentationsQueries.getPresentation);
}
