import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosCheckboxModule } from '@cosmos/components/checkbox';
import { CosInputModule } from '@cosmos/components/input';
import { CosTableModule } from '@cosmos/components/table';
import { Currency, Nullable, PriceGrid } from '@cosmos/types-common';
import { Presentation, PresentationProduct } from '@esp/presentations/types';
import { InvisiblePriceGridsModule } from '@esp/presentations/ui-presentation-product-invisible-price-grids';
import { VisiblePriceGridsModule } from '@esp/presentations/ui-presentation-product-visible-price-grids';

import { PresentationProductLocalState } from '../../presentation-product.local-state';

@Component({
  selector:
    'esp-presentation-product-price-grids[presentation][product][currencyConversion][visiblePriceGrids][invisiblePriceGrids]',
  templateUrl: './presentation-product-price-grids.component.html',
  styleUrls: ['./presentation-product-price-grids.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentationProductPriceGridsComponent {
  /** These bindings must be available. */
  @Input() presentation!: Presentation;
  @Input() product!: PresentationProduct;

  /** The `currencyConversion` may be nullable because it may not exist. */
  @Input() currencyConversion: Nullable<Currency>;

  @Input() visiblePriceGrids: PriceGrid[] = [];
  @Input() invisiblePriceGrids: PriceGrid[] = [];

  constructor(private readonly _state: PresentationProductLocalState) {}

  getOriginalPriceGrid(priceGridId: number): void {
    this._state.getOriginalPriceGrid(
      this.presentation.Id,
      this.product.Id,
      priceGridId
    );
  }

  addCustomQuantity(priceGrid: PriceGrid): void {
    this._state.addCustomQuantity(priceGrid);
  }

  patchPriceGrid([priceGrid, patchSpec]: [
    PriceGrid,
    Partial<PriceGrid>
  ]): void {
    this._state.patchPriceGrid(priceGrid, patchSpec);
  }

  restoreToDefault(priceGrid: PriceGrid): void {
    this._state.restoreToDefault(priceGrid);
  }
}

@NgModule({
  declarations: [PresentationProductPriceGridsComponent],
  imports: [
    CommonModule,

    CosTableModule,
    CosInputModule,
    CosButtonModule,
    CosCardModule,
    CosCheckboxModule,

    VisiblePriceGridsModule,
    InvisiblePriceGridsModule,
  ],
  exports: [PresentationProductPriceGridsComponent],
})
export class PresentationProductPriceGridsModule {}
