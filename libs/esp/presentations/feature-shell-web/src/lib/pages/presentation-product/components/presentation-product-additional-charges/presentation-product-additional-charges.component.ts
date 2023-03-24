import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { CosAccordionModule } from '@cosmos/components/accordion';
import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosCheckboxModule } from '@cosmos/components/checkbox';
import { CosFormFieldModule } from '@cosmos/components/form-field';
import { CosInlineEditModule } from '@cosmos/components/inline-edit';
import { CosInputModule } from '@cosmos/components/input';
import { CosTableModule } from '@cosmos/components/table';
import { CosSlideToggleModule } from '@cosmos/components/toggle';
import { PresentationProductCharge } from '@esp/presentations/types';
import { VisibleGridPricesComponent } from '@esp/presentations/ui-presentation-product-visible-grid-prices';

import { CHARGE_USAGE_LEVELS } from '../../pipes/charge-usage-level/charge-usage-level.pipe';
import { PresentationProductImprintLocalState } from '../../presentation-product-imprint.local-state';
import { PresentationProductChargesTableModule } from '../presentation-product-charges-table';

@Component({
  selector: 'esp-presentation-product-additional-charges',
  templateUrl: './presentation-product-additional-charges.component.html',
  styleUrls: ['./presentation-product-additional-charges.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PresentationProductImprintLocalState],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CosAccordionModule,
    CosButtonModule,
    CosCardModule,
    CosSlideToggleModule,
    CosTableModule,

    CosCheckboxModule,
    CosInlineEditModule,
    CosFormFieldModule,
    CosInputModule,

    MatSelectModule,

    VisibleGridPricesComponent,

    PresentationProductChargesTableModule,
  ],
})
export class PresentationProductAdditionalChargesComponent {
  chargeUsageLevels = CHARGE_USAGE_LEVELS;

  constructor(
    cdRef: ChangeDetectorRef,
    readonly state: PresentationProductImprintLocalState
  ) {
    this.state.connect(this, { cdRef });
  }

  addCustomQuantity(priceGrid: PresentationProductCharge) {
    console.log('add', priceGrid);
  }

  toggleAdditionalCharges(): void {
    this.state.patchProduct({
      Settings: {
        ...this.state.product!.Settings,
        ShowProductAdditionalCharges:
          !this.state.product!.Settings.ShowProductAdditionalCharges,
      },
    });
  }

  toggleVisible(charge: PresentationProductCharge) {
    this.state.patchCharge(charge, { IsVisible: !charge.IsVisible });
  }
}
