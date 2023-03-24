import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';

import { CosButtonModule } from '@cosmos/components/button';
import { CosTableModule } from '@cosmos/components/table';
import { PresentationProductCharge } from '@esp/presentations/types';
import { FormatPricePipeModule } from '@smartlink/products/util-format-price-pipe';

import { ChargeUsageLevelPipeModule } from '../../pipes/charge-usage-level/charge-usage-level.pipe';

class ChargeTableItem {
  Id: number;
  charge: string;
  quantity: string;
  price: string;
}

@Component({
  selector: 'esp-presentation-product-charges-table',
  templateUrl: './presentation-product-charges-table.component.html',
  styleUrls: ['./presentation-product-charges-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentationProductChargesTableComponent {
  displayedColumns2 = ['charge', 'quantity', 'price', 'action'];

  @Input() dataSource: PresentationProductCharge[];

  @Output() action = new EventEmitter<PresentationProductCharge>();

  addCharge(charge: PresentationProductCharge): void {
    this.action.emit(charge);
  }
}

@NgModule({
  declarations: [PresentationProductChargesTableComponent],
  imports: [
    CommonModule,
    CosButtonModule,
    CosTableModule,
    ChargeUsageLevelPipeModule,
    FormatPricePipeModule,
  ],
  exports: [PresentationProductChargesTableComponent],
})
export class PresentationProductChargesTableModule {}
