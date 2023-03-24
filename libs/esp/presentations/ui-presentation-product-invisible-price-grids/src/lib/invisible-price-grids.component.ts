import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Store } from '@ngxs/store';

import { CosAccordionModule } from '@cosmos/components/accordion';
import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosInputModule } from '@cosmos/components/input';
import { CosTableModule } from '@cosmos/components/table';
import { trackItem } from '@cosmos/core';
import { Nullable, PriceGrid } from '@cosmos/types-common';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
} from '@cosmos/util-translations';
// I don't know why product actions in `feature-products` and not in data-access library...
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PresentationProductActions } from '@esp/presentations/feature-products';
import { PresentationProduct } from '@esp/presentations/types';
import { FormatPricePipeModule } from '@smartlink/products/util-format-price-pipe';

@Component({
  selector: 'esp-invisible-price-grids[product][invisiblePriceGrids]',
  templateUrl: './invisible-price-grids.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvisiblePriceGridsComponent implements OnChanges {
  @Input() product: Nullable<PresentationProduct> = null;
  @Input() invisiblePriceGrids: PriceGrid[] = [];

  readonly trackById = trackItem<PriceGrid>(['Id']);

  columnHeaders: string[] = [];
  dynamicColumnHeaders: string[] = [];

  readonly invisiblePriceGridsDisplayedColumns = [
    'size',
    'prcl',
    'minprice',
    'action',
  ];

  private readonly _store = inject(Store);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invisiblePriceGrids']?.currentValue) {
      this.getColumnHeaders();
    }
  }

  addAllPriceGrids(): void {
    this._store.dispatch(new PresentationProductActions.AddAllPriceGrids());
  }

  makePriceGridVisible(priceGrid: PriceGrid): void {
    this._store.dispatch(
      new PresentationProductActions.PatchPriceGrid(priceGrid, {
        IsVisible: true,
      })
    );
  }

  private getColumnHeaders(): void {
    const items = new Set<string>();

    this.invisiblePriceGrids.forEach((grid) => {
      grid.AttributeTypes?.forEach((type) => items.add(type));
    });

    this.dynamicColumnHeaders = [...items];

    const columnHeaders = ['minprice', 'action'];

    if (!items.size) {
      columnHeaders.unshift('description');
    }

    this.columnHeaders = [...items, ...columnHeaders];
  }
}

@NgModule({
  imports: [
    CommonModule,
    CosCardModule,
    CosTableModule,
    CosInputModule,
    CosButtonModule,
    CosAccordionModule,
    FormatPricePipeModule,
    CosmosUtilTranslationsModule.withScopes(LanguageScope.EspPresentations),
  ],
  declarations: [InvisiblePriceGridsComponent],
  exports: [InvisiblePriceGridsComponent],
})
export class InvisiblePriceGridsModule {}
