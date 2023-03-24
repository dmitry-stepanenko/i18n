import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { first } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosCheckboxModule } from '@cosmos/components/checkbox';
import { CosFormFieldModule } from '@cosmos/components/form-field';
import { CosInputModule } from '@cosmos/components/input';
import { CosSlideToggleModule } from '@cosmos/components/toggle';
import { InputMaskDirective, createMask } from '@cosmos/input-mask';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { numericParser, percentageParser } from '@cosmos/util-common';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { unpatchedFromEvent } from '@cosmos/zone-less';

import { PresentationProductLocalState } from '../../presentation-product.local-state';
import { PresentationProductPriceGridsModule } from '../presentation-product-price-grids/presentation-product-price-grids.component';

import {
  PresentationProductPricingFromWorkerMessage,
  PresentationProductPricingToWorkerMessage,
  PriceAdjustmentType,
} from './presentation-product-pricing-worker/types';

const enum PriceAdjustmentRenderType {
  Numeric,
  Percentage,
}

interface PriceAdjustment {
  label: string;
  type: PriceAdjustmentType;
  renderType: PriceAdjustmentRenderType;
}

@UntilDestroy()
@Component({
  selector: 'esp-presentation-product-pricing',
  templateUrl: './presentation-product-pricing.component.html',
  styleUrls: ['./presentation-product-pricing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputMaskDirective,

    MatSelectModule,

    CosCardModule,
    CosButtonModule,
    CosInputModule,
    CosCheckboxModule,
    CosFormFieldModule,
    CosSlideToggleModule,

    PresentationProductPriceGridsModule,
    CosmosUtilTranslationsModule,
  ],
  providers: [provideLanguageScopes(LanguageScope.EspPresentations)],
})
export class PresentationProductPricingComponent
  implements AfterViewInit, OnDestroy
{
  readonly priceAdjustments: PriceAdjustment[] = [
    {
      label: 'profit-margin',
      type: PriceAdjustmentType.ProfitMargin,
      renderType: PriceAdjustmentRenderType.Percentage,
    },
    {
      label: 'add-fixed-amount-to-price',
      type: PriceAdjustmentType.AddFixedAmountToPrice,
      renderType: PriceAdjustmentRenderType.Numeric,
    },
    {
      label: 'add-fixed-amount-to-net-cost',
      type: PriceAdjustmentType.AddFixedAmountToNetCost,
      renderType: PriceAdjustmentRenderType.Numeric,
    },
    {
      label: 'add-fixed-amount-to-price-from-net-cost',
      type: PriceAdjustmentType.AddFixedAmountToPriceFromNetCost,
      renderType: PriceAdjustmentRenderType.Numeric,
    },
    {
      label: 'subtract-fixed-amount-to-price',
      type: PriceAdjustmentType.SubtractFixedAmountToPrice,
      renderType: PriceAdjustmentRenderType.Numeric,
    },
    {
      label: 'subtract-fixed-amount-to-net-cost',
      type: PriceAdjustmentType.SubtractFixedAmountToNetCost,
      renderType: PriceAdjustmentRenderType.Numeric,
    },
    {
      label: 'subtract-fixed-amount-to-price-from-net-cost',
      type: PriceAdjustmentType.SubtractFixedAmountToPriceFromNetCost,
      renderType: PriceAdjustmentRenderType.Numeric,
    },
    {
      label: 'add-percentage-to-price-form-net-cost',
      type: PriceAdjustmentType.AddPercentageToPriceFromNetCost,
      renderType: PriceAdjustmentRenderType.Percentage,
    },
    {
      label: 'add-percentage-to-price-from-price',
      type: PriceAdjustmentType.AddPercentageToPriceFromPrice,
      renderType: PriceAdjustmentRenderType.Percentage,
    },

    {
      label: 'add-percentage-to-net-cost',
      type: PriceAdjustmentType.AddPercentageToNetCost,
      renderType: PriceAdjustmentRenderType.Percentage,
    },
    {
      label: 'subtract-percentage-to-net-cost',
      type: PriceAdjustmentType.SubtractPercentageToNetCost,
      renderType: PriceAdjustmentRenderType.Percentage,
    },
    {
      label: 'subtract-percentage-to-price-from-net-cost',
      type: PriceAdjustmentType.SubtractPercentageToPriceFromNetCost,
      renderType: PriceAdjustmentRenderType.Percentage,
    },
    {
      label: 'subtract-percentage-to-price',
      type: PriceAdjustmentType.SubtractPercentageToPrice,
      renderType: PriceAdjustmentRenderType.Percentage,
    },
  ];

  priceAdjustment: PriceAdjustment | null = null;
  readonly priceAdjustmentValueControl = new FormControl(
    { value: '', disabled: true },
    [Validators.required]
  );

  readonly percentageMask = createMask({
    alias: 'percentage',
    digits: 3,
    rightAlign: false,
    allowMinus: false,
    showMaskOnFocus: false,
    showMaskOnHover: false,
    parser: percentageParser,
  });

  readonly numericMask = createMask({
    alias: 'numeric',
    rightAlign: false,
    allowMinus: false,
    showMaskOnFocus: false,
    showMaskOnHover: false,
    parser: numericParser,
  });

  private worker: Worker | null = null;

  constructor(public readonly state: PresentationProductLocalState) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });
  }

  ngAfterViewInit(): void {
    this.worker = new Worker(
      new URL(
        './presentation-product-pricing-worker/presentation-product-pricing.worker',
        import.meta.url
      )
    );
  }

  ngOnDestroy(): void {
    this.worker?.terminate();
  }

  get shouldRenderPercentageMask(): boolean {
    return (
      this.priceAdjustment !== null &&
      this.priceAdjustment.renderType === PriceAdjustmentRenderType.Percentage
    );
  }

  togglePricing(): void {
    if (this.state.product) {
      this.state.patchProduct({
        Settings: {
          ...this.state.product.Settings,
          ShowProductPricing: !this.state.product.Settings.ShowProductPricing,
        },
      });
    }
  }

  toggleRoundPricesToTwoDecimal(): void {
    if (this.state.product) {
      this.state.patchProduct({
        RoundPricesToTwoDecimal: !this.state.product.RoundPricesToTwoDecimal,
      });
    }
  }

  updatePriceAdjustment(priceAdjustment: PriceAdjustment): void {
    this.priceAdjustment = priceAdjustment;
    priceAdjustment !== null
      ? this.priceAdjustmentValueControl.enable()
      : this.priceAdjustmentValueControl.disable();
  }

  applyPriceAdjustment(): void {
    if (
      this.priceAdjustment === null ||
      this.priceAdjustmentValueControl.invalid
    ) {
      return;
    }

    const message: PresentationProductPricingToWorkerMessage = {
      ngDevMode,
      id: uuid(),
      type: this.priceAdjustment.type,
      priceGrids: this.state.priceGrids,
      amount: parseFloat(this.priceAdjustmentValueControl.value || ''),
      roundPricesToTwoDecimal:
        this.state.product?.RoundPricesToTwoDecimal ?? false,
    };

    this.worker && this.worker.postMessage(message);

    unpatchedFromEvent<
      MessageEvent<PresentationProductPricingFromWorkerMessage>
    >(this.worker!, 'message')
      .pipe(
        first(({ data }) => data.id === message.id),
        untilDestroyed(this)
      )
      .subscribe(({ data }) => {
        this.state.patchProduct({ PriceGrids: data.priceGrids });
      });
  }
}
