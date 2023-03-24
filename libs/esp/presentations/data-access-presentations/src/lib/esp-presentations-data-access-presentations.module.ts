import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import {
  PresentationProductsState,
  PresentationsSearchState,
  PresentationsState,
} from './states';

@NgModule({
  imports: [
    NgxsModule.forFeature([
      PresentationsSearchState,
      PresentationsState,
      PresentationProductsState,
    ]),
  ],
})
export class EspPresentationsDataAccessPresentationsModule {}
