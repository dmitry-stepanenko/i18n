import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule, CosCardPromptDirective } from '@cosmos/components/card';
import { CosPillModule } from '@cosmos/components/pill';
import { Nullable } from '@cosmos/types-common';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import {
  LineItemCardViewModel,
  LineItemType,
  ProductCardGridType,
  RequestChangesModel,
} from '@esp/presentations/types';
import { ThumbnailToOriginalPipe } from '@esp/products/util-product-image-url-pipe';
import { ProductImageComponentModule } from '@smartlink/products/ui-products';

import {
  CosPresentationProductCardGridWithChargeComponent,
  PriceGridColumnDefinitions,
} from './grids';

@Component({
  selector: 'esp-presentation-product-card',
  templateUrl: './presentation-product-card.component.html',
  styleUrls: ['./presentation-product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    CosCardModule,
    CosButtonModule,
    CosPillModule,
    ProductImageComponentModule,
    CosPresentationProductCardGridWithChargeComponent,
    ThumbnailToOriginalPipe,
    CosCardPromptDirective,
    CosmosUtilTranslationsModule,
  ],
  providers: [provideLanguageScopes(LanguageScope.EspPresentations)],
})
export class CosPresentationProductCardComponent {
  @Input() product: Nullable<LineItemCardViewModel> = null;
  @Input() gridColumns: PriceGridColumnDefinitions[] = ['item', 'quantity'];
  @Input() gridType: ProductCardGridType = ProductCardGridType.Standard;
  @Input() requestChanges: RequestChangesModel | null | undefined = null;
  @Input() headerText = '';

  readonly ProductCardGridType = ProductCardGridType;
  readonly LineItemType = LineItemType;
}
