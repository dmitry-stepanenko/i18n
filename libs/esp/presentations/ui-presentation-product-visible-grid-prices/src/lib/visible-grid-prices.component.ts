import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCheckboxModule } from '@cosmos/components/checkbox';
import { CosInputModule } from '@cosmos/components/input';
import { CosTableModule } from '@cosmos/components/table';
import { whenChanged } from '@cosmos/core';
import { InputMaskDirective } from '@cosmos/input-mask';
import { LocalStateRenderStrategy } from '@cosmos/state';
import {
  IsCustomPrice,
  Nullable,
  Price,
  PriceGrid,
} from '@cosmos/types-common';
import { calculateMargin, calculatePrice } from '@cosmos/util-math';
import {
  TruncateValuePipe,
  TruncateValueToNumberPipe,
} from '@cosmos/util-price-pipes';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
// I don't know why product actions in `feature-products` and not in data-access library...
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PresentationProductQueries } from '@esp/presentations/feature-products';
import { FormatPricePipeModule } from '@smartlink/products/util-format-price-pipe';

import { GridCellMarginInputComponent } from './components/grid-cell-margin-input';
import { GridCellNetCostInputComponent } from './components/grid-cell-net-cost-input';
import { GridCellPriceInputComponent } from './components/grid-cell-price-input';
import { GridCellQuantityInputComponent } from './components/grid-cell-quantity-input';
import { CalculateClientPricePipe } from './pipes/calculate-client-price.pipe';
import { VisibleGridPricesLocalState } from './visible-grid-prices.local-state';

@Component({
  selector: 'esp-visible-grid-prices',
  templateUrl: './visible-grid-prices.component.html',
  styleUrls: ['./visible-grid-prices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    VisibleGridPricesLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    InputMaskDirective,

    CosTableModule,
    CosInputModule,
    CosButtonModule,
    CosCheckboxModule,

    GridCellPriceInputComponent,
    GridCellMarginInputComponent,
    GridCellNetCostInputComponent,
    GridCellQuantityInputComponent,
    CosmosUtilTranslationsModule,

    FormatPricePipeModule,
    TruncateValuePipe,
    TruncateValueToNumberPipe,

    CalculateClientPricePipe,
  ],
})
export class VisibleGridPricesComponent implements OnChanges {
  @Input() priceGrid: Nullable<PriceGrid> = null;

  readonly priceGridColumns = this._resolvePriceGridColumns();

  originalPrices$: Observable<Price[]> = of([]);

  constructor(
    readonly state: VisibleGridPricesLocalState,
    private readonly _store: Store
  ) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });
  }

  ngOnChanges(changes: SimpleChanges): void {
    whenChanged(this, 'priceGrid', changes, () => {
      this.originalPrices$ = this._store.select(
        PresentationProductQueries.getOriginalPrices(this.priceGrid!.Id)
      );
    });
  }

  get allSupplierPricesAreVisible(): boolean {
    const supplierPrices = this.priceGrid?.Prices.filter(
      (price) => !price[IsCustomPrice]
    );

    return !!supplierPrices?.every((price) => price.IsVisible);
  }

  updateQuantity(
    priceGrid: PriceGrid,
    price: Price,
    newQuantity: number
  ): void {
    this.state.patchPrice(priceGrid, price, {
      Quantity: {
        From: newQuantity,
        To: newQuantity,
      },
    });
  }

  updateNetCost(priceGrid: PriceGrid, price: Price, newNetCost: number): void {
    if (price.Price === null || newNetCost === null) {
      this.state.patchPrice(priceGrid, price, { Cost: newNetCost });
    } else {
      this.state.patchPrice(priceGrid, price, {
        Cost: newNetCost,
        DiscountPercent: calculateMargin(price.Price!, newNetCost),
      });
    }
  }

  updateMargin(priceGrid: PriceGrid, price: Price, newMargin: number): void {
    this.state.patchPrice(priceGrid, price, {
      DiscountPercent: newMargin,
      Price: calculatePrice(price.Cost!, newMargin),
    });
  }

  updatePrice(priceGrid: PriceGrid, price: Price, newPrice: number): void {
    if (newPrice === null || price.Cost === null) {
      this.state.patchPrice(priceGrid, price, { Price: newPrice });
    } else {
      this.state.patchPrice(priceGrid, price, {
        Price: newPrice,
        DiscountPercent: calculateMargin(newPrice, price.Cost!),
      });
    }
  }

  toggleVisibilityOfAllPrices(priceGrid: PriceGrid): void {
    this.state.toggleVisibilityOfAllPrices(
      priceGrid,
      !this.allSupplierPricesAreVisible
    );
  }

  togglePriceVisibility(priceGrid: PriceGrid, price: Price): void {
    this.state.togglePriceVisibility(priceGrid, price, !price.IsVisible);
  }

  removePrice(priceGrid: PriceGrid, price: Price): void {
    this.state.removePrice(priceGrid, price);
  }

  private _resolvePriceGridColumns(): string[] {
    const columns = [
      'Quantity',
      'Cost',
      'CostPerUnit',
      'DiscountPercent',
      'Price',
    ];

    // We have to show this column if the grid currency doesn't equal the presentation currency.
    if (this.state.currencyConversion) {
      columns.push('ClientPrice');
    }

    return columns.concat('IsVisible');
  }
}
