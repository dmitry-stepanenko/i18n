import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CosSlideToggleModule } from '@cosmos/components/toggle';
import { LocalStateRenderStrategy } from '@cosmos/state';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';

import { PresentationProductImprintLocalState } from '../../presentation-product-imprint.local-state';

@Component({
  selector: 'esp-presentation-product-client-discount',
  templateUrl: './presentation-product-client-discount.component.html',
  styleUrls: ['./presentation-product-client-discount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PresentationProductImprintLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
  standalone: true,
  imports: [CommonModule, CosSlideToggleModule, CosmosUtilTranslationsModule],
})
export class PresentationProductClientDiscountComponent {
  constructor(public readonly state: PresentationProductImprintLocalState) {
    state.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });
  }

  toggleShowProductDiscount(): void {
    if (this.state.product) {
      this.state.patchProduct({
        Settings: {
          ...this.state.product.Settings,
          ShowProductDiscount: !this.state.product.Settings.ShowProductDiscount,
        },
      });
    }
  }
}
