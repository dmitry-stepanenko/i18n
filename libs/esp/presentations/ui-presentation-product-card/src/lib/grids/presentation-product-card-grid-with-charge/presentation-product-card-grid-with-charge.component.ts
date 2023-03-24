import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';

import { CosTableModule } from '@cosmos/components/table';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { ServiceCharge } from '@esp/orders/types';
import {
  LineItemCardViewModel,
  LineItemType,
  ProductGridViewModel,
} from '@esp/presentations/types';

export type PriceGridColumnDefinitions =
  | 'item'
  | 'quantity'
  | 'price'
  | 'totalPrice';

type GridData =
  | ServiceCharge
  | ProductGridViewModel
  | {
      Type: string;
      Value: string;
    }
  | undefined;

@Component({
  selector: 'esp-presentation-product-card-grid-with-charge',
  templateUrl: './presentation-product-card-grid-with-charge.component.html',
  styleUrls: ['../presentation-product-card-grid.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CosTableModule, CosmosUtilTranslationsModule],
  providers: [provideLanguageScopes(LanguageScope.EspPresentations)],
})
export class CosPresentationProductCardGridWithChargeComponent
  implements OnInit
{
  @Input() lineItem: LineItemCardViewModel = {
    Id: 0,
    Variants: [],
    TotalQuantity: 0,
    ProductId: 0,
    Type: LineItemType.Product,
  };
  @Input() columns: PriceGridColumnDefinitions[] = ['item', 'quantity'];
  @Input() showCharges = false;
  @Input() showTotals = false;
  @Input() withTotalUnits = true;

  data: GridData[] = [];

  ngOnInit(): void {
    this._setupDataForTable();
  }

  private _setupDataForTable(): void {
    const variants = this.lineItem.Variants?.length
      ? this.lineItem.Variants
      : this.lineItem.TotalQuantity > 0
      ? [
          {
            Quantity: this.lineItem.TotalQuantity,
            Description: '-',
          },
        ]
      : [];

    if (this.lineItem.Type === LineItemType.Service && variants.length > 0) {
      if (this.lineItem.Description) {
        variants[0].Description = this.lineItem.Description;
      }
      variants[0].Price = this.lineItem.Price;
    }

    const totalUnitsData = this.withTotalUnits
      ? [
          {
            Type: 'totals',
            Value: this.lineItem.TotalQuantity,
          },
        ]
      : [];

    this.data = (
      this.lineItem.TotalQuantity > 0 ? [...variants, ...totalUnitsData] : []
    ) as GridData[];

    if (this.showCharges) {
      const decorations = this.lineItem.Decorations ?? [];
      const collectedServiceCharges = decorations
        .filter((decoration) => Array.isArray(decoration.ServiceCharges))
        .map((decoration) => decoration.ServiceCharges)
        .flat();

      // combining the rows for display, variants, totals and charges
      this.data = [
        ...this.data,
        ...collectedServiceCharges,
        ...(this.lineItem.ServiceCharges || []),
      ];
    }
  }
}
