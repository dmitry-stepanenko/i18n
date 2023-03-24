import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, startWith, switchMap, take } from 'rxjs';

import {
  CosAccordionComponent,
  CosAccordionModule,
} from '@cosmos/components/accordion';
import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import {
  CosInlineEditModule,
  CosInlineEditSaveEvent,
} from '@cosmos/components/inline-edit';
import { CosInputModule } from '@cosmos/components/input';
import { trackItem } from '@cosmos/core';
import { Currency, Nullable, PriceGrid } from '@cosmos/types-common';
import { ConfirmDialogService } from '@cosmos/ui-dialog';
import {
  CosmosTranslocoService,
  CosmosUtilTranslationsModule,
  LanguageScope,
} from '@cosmos/util-translations';
import { Presentation, PresentationProduct } from '@esp/presentations/types';
import { VisibleGridPricesComponent } from '@esp/presentations/ui-presentation-product-visible-grid-prices';

import { JoinAttributesPipe } from './pipes/join-attributes.pipe';

const MAX_PRICES_PER_PRICE_GRID = 10;

@UntilDestroy()
@Component({
  selector:
    'esp-visible-price-grids[presentation][product][currencyConversion][visiblePriceGrids]',
  templateUrl: './visible-price-grids.component.html',
  styleUrls: ['./visible-price-grids.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisiblePriceGridsComponent implements AfterViewInit {
  /** These bindings must be available. */
  @Input() presentation!: Presentation;
  @Input() product!: PresentationProduct;

  @Input() currencyConversion: Nullable<Currency>;

  @Input() visiblePriceGrids: PriceGrid[] = [];

  @Output() getOriginalPriceGrid = new EventEmitter<number>();

  @Output() addCustomQuantity = new EventEmitter<PriceGrid>();

  @Output() patchPriceGrid = new EventEmitter<
    [PriceGrid, Partial<PriceGrid>]
  >();

  @Output() restoreToDefault = new EventEmitter<PriceGrid>();

  readonly maxPricesPerPriceGrid = MAX_PRICES_PER_PRICE_GRID;

  readonly trackById = trackItem<PriceGrid>(['Id']);

  @ViewChildren(CosAccordionComponent)
  accordions!: QueryList<CosAccordionComponent>;

  private readonly _originalPriceGridsLoaded = new Set<number>();

  private readonly _confirmDialogService = inject(ConfirmDialogService);
  private readonly _translocoService = inject(CosmosTranslocoService);

  ngAfterViewInit(): void {
    // Watching `cos-accordion` re-renders so we know that price grids are added/removed.
    this.accordions.changes
      .pipe(startWith(this.accordions), untilDestroyed(this))
      .subscribe(() => {
        this.accordions.forEach((accordion, index) => {
          const priceGrid = this.visiblePriceGrids[index];
          // We don't wanna load original price grid each time the `cos-accordion` list re-renders,
          // we need to load it only once. This logic exists here since it shouldn't exist within the
          // state.
          if (this._originalPriceGridsLoaded.has(priceGrid.Id)) {
            return;
          }
          this.getOriginalPriceGrid.emit(priceGrid.Id);
          this._originalPriceGridsLoaded.add(priceGrid.Id);
        });
      });
  }

  confirmRestoreToDefault(priceGrid: PriceGrid): void {
    const getDialogTranslationKey = (key: string) =>
      this._translocoService.translate(
        `espPresentations.presentation-product.presentation-product-pricing.presentation-product-price-visible-price-grids.confirmation-dialog-restore-to-default.${key}`
      );

    this._translocoService
      .getLangChanges$([LanguageScope.EspPresentations])
      .pipe(
        take(1),
        switchMap(() =>
          this._confirmDialogService.confirm(
            {
              message: getDialogTranslationKey('message'),
              confirm: getDialogTranslationKey('confirm'),
              cancel: getDialogTranslationKey('cancel'),
            },
            {
              minWidth: '400px',
              width: '400px',
              disableClose: false,
            }
          )
        ),
        filter(Boolean),
        untilDestroyed(this)
      )
      .subscribe(() => this.restoreToDefault.emit(priceGrid));
  }

  updatePriceIncludes(priceGrid: PriceGrid, priceIncludes: string): void {
    this.patchPriceGrid.emit([priceGrid, { PriceIncludes: priceIncludes }]);
  }

  hidePriceGrid(priceGrid: PriceGrid): void {
    this.patchPriceGrid.emit([priceGrid, { IsVisible: false }]);
  }

  updatePriceGridDescription(
    event: CosInlineEditSaveEvent,
    priceGrid: PriceGrid
  ): void {
    this.patchPriceGrid.emit([priceGrid, { Description: event.value }]);
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    CosCardModule,
    CosInputModule,
    CosInlineEditModule,
    CosButtonModule,
    CosAccordionModule,

    VisibleGridPricesComponent,
    // CosmosUtilTranslationsModule,
    CosmosUtilTranslationsModule.withScopes(LanguageScope.EspPresentations),

    JoinAttributesPipe,
  ],
  declarations: [VisiblePriceGridsComponent],
  // providers: [provideLanguageScopes(LanguageScope.EspPresentations)],
  exports: [VisiblePriceGridsComponent],
})
export class VisiblePriceGridsModule {}
