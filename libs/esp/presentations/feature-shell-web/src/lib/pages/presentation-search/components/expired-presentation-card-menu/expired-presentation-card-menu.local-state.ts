import { Injectable } from '@angular/core';

import { LocalState, asDispatch, fromSelector } from '@cosmos/state';
import {
  PresentationsActions,
  PresentationsQueries,
} from '@esp/presentations/data-access-presentations';

@Injectable()
export class ExpiredPresentationCardMenuLocalState extends LocalState<ExpiredPresentationCardMenuLocalState> {
  readonly getPresentation = asDispatch(PresentationsActions.Get);
  readonly presentation = fromSelector(PresentationsQueries.getPresentation);
}
