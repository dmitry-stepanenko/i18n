import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { PresentationProductState } from './states';

@NgModule()
export class EspPresentationsFeatureProductsModule {
  static forChild(): ModuleWithProviders<ChildEspPresentationsUiFeatureProductsModule> {
    return { ngModule: ChildEspPresentationsUiFeatureProductsModule };
  }
}

@NgModule({
  imports: [NgxsModule.forFeature([PresentationProductState])],
})
export class ChildEspPresentationsUiFeatureProductsModule {}
