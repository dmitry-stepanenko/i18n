import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';

import { CosCardModule } from '@cosmos/components/card';
import { ProductLineItem } from '@esp/orders/types';
import { ProductImageComponentModule } from '@smartlink/products/ui-products';

@Component({
  selector: 'asi-presentation-quote-product-card',
  templateUrl: './presentation-quote-product-card.component.html',
  styleUrls: ['./presentation-quote-product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentationQuoteProductCardComponent {
  @Input() product!: ProductLineItem;
}

@NgModule({
  imports: [CommonModule, CosCardModule, ProductImageComponentModule],
  declarations: [PresentationQuoteProductCardComponent],
  exports: [PresentationQuoteProductCardComponent],
})
export class AsiPresentationQuoteProductCardModule {}
