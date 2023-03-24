import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgModule,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { UntilDestroy } from '@ngneat/until-destroy';

import { CosAccordionModule } from '@cosmos/components/accordion';
import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosInlineEditModule } from '@cosmos/components/inline-edit';
import { CosInputModule } from '@cosmos/components/input';
import { PresentationProductCharge } from '@esp/presentations/types';
import { VisibleGridPricesComponent } from '@esp/presentations/ui-presentation-product-visible-grid-prices';

import { CHARGE_USAGE_LEVELS } from '../../pipes/charge-usage-level/charge-usage-level.pipe';
import { PresentationProductImprintLocalState } from '../../presentation-product-imprint.local-state';
import { PresentationProductChargesTableModule } from '../presentation-product-charges-table';

@UntilDestroy()
@Component({
  selector: 'esp-presentation-product-imprint-charges',
  templateUrl: './presentation-product-imprint-charges.component.html',
  styleUrls: ['./presentation-product-imprint-charges.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PresentationProductImprintLocalState],
})
export class PresentationProductImprintChargesComponent {
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

  toggleVisible(charge: PresentationProductCharge) {
    this.state.patchCharge(charge, { IsVisible: !charge.IsVisible });
  }
}

@NgModule({
  declarations: [PresentationProductImprintChargesComponent],
  imports: [
    CommonModule,
    FormsModule,

    MatSelectModule,

    CosAccordionModule,
    CosButtonModule,
    CosCardModule,
    CosInlineEditModule,
    CosInputModule,

    PresentationProductChargesTableModule,
    VisibleGridPricesComponent,
  ],
  exports: [PresentationProductImprintChargesComponent],
})
export class PresentationProductImprintChargesModule {}
