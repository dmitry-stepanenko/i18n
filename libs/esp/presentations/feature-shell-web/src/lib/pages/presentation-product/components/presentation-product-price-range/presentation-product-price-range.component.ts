import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { CosCardModule } from '@cosmos/components/card';
import {
  CosCheckboxChange,
  CosCheckboxModule,
} from '@cosmos/components/checkbox';
import { CosFormFieldModule } from '@cosmos/components/form-field';
import { CosInputModule } from '@cosmos/components/input';
import { CosSlideToggleModule } from '@cosmos/components/toggle';
import { LocalStateRenderStrategy } from '@cosmos/state';
import {
  CalculatedPriceRangePipe,
  CalculatedPriceRangePipeModule,
} from '@cosmos/util-price-pipes';
import {
  CosmosTranslocoService,
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';

import { PresentationProductImprintLocalState } from '../../presentation-product-imprint.local-state';
import { PresentationProductLocalState } from '../../presentation-product.local-state';

@Component({
  selector: 'esp-presentation-product-price-range',
  templateUrl: './presentation-product-price-range.component.html',
  styleUrls: ['./presentation-product-price-range.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PresentationProductImprintLocalState,
    CalculatedPriceRangePipe,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    CosCardModule,
    CosCheckboxModule,
    CosInputModule,
    CosFormFieldModule,
    CosSlideToggleModule,

    CalculatedPriceRangePipeModule,
    CosmosUtilTranslationsModule,
  ],
})
export class PresentationProductPriceRangeComponent {
  readonly LanguageScope = LanguageScope;

  constructor(
    public readonly state: PresentationProductImprintLocalState,
    public readonly presentationProductState: PresentationProductLocalState,
    private readonly calculatedPriceRangePipe: CalculatedPriceRangePipe,
    private readonly _translocoService: CosmosTranslocoService
  ) {
    state.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });

    presentationProductState.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });
  }

  togglePriceRange(): void {
    if (this.state.product) {
      this.state.patchProduct({
        Settings: {
          ...this.state.product.Settings,
          ShowProductPriceRanges:
            !this.state.product.Settings.ShowProductPriceRanges,
        },
      });
    }
  }

  setupCustomPriceRange(event: Event): void {
    this.state.patchProduct({
      PriceRange: (event.target as HTMLInputElement).value,
    });
  }

  async toggleCustomPriceRange(event: CosCheckboxChange): Promise<void> {
    const priceRange = await firstValueFrom(
      this.calculatedPriceRangePipe.transform(
        this.presentationProductState.visiblePriceGrids,
        'espPresentations.presentation-product.presentation-product-price-range.price-from',
        [LanguageScope.EspPresentations]
      )
    );

    this.state.patchProduct({
      IsCustomPriceRange: event.checked,
      PriceRange: event.checked
        ? this.state.product?.PriceRange || priceRange
        : '',
    });
  }
}
