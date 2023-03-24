import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  NgModule,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CosButtonModule } from '@cosmos/components/button';
import { CosFormFieldModule } from '@cosmos/components/form-field';
import { CosInputModule } from '@cosmos/components/input';
import { CosProductCardModule } from '@cosmos/components/product-card';
import { FormControl } from '@cosmos/forms';
import { LocalStateRenderStrategy } from '@cosmos/state';
import {
  CosmosTranslocoService,
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { MOCK_PRODUCT } from '@esp/presentations/mocks-presentations';
import {
  PresentationProduct,
  PresentationProductSortOrder,
  PresentationProductStatus,
  PresentationStatus,
} from '@esp/presentations/types';
import { PresentationProductStatusPipe } from '@esp/presentations/util-presentation-product-pipes';
import { ProductGalleryComponent } from '@esp/products/ui-product-gallery';
import { EspSearchSortModule } from '@esp/search/feature-search-elements';

import { NoProductsMessageComponent } from './components/no-products-message';
import { PresentationProductMapThroughPipeModule } from './pipes/presentation-product-map-through.pipe';
import { PresentationProductsLocalState } from './presentation-products.local-state';
import { productSortOptions } from './sort-options.config';
import { mapPresentationProduct } from './utils';

@UntilDestroy()
@Component({
  selector: 'esp-presentation-products',
  templateUrl: './presentation-products.component.html',
  styleUrls: ['./presentation-products.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PresentationProductsLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
})
export class PresentationProductsComponent {
  // TODO: get state of presentation for view and get recommended products
  presentationPhase = new FormControl('quote_requested');
  recommendedProducts = Array(4).fill(MOCK_PRODUCT);

  readonly mapProduct = mapPresentationProduct;
  readonly sortMenuOptions = productSortOptions(this._translocoService);
  readonly sort = new FormControl<PresentationProductSortOrder>('None');

  readonly PresentationStatus = PresentationStatus;
  readonly PresentationProductStatus = PresentationProductStatus;

  @Input()
  sortDisabled = false;

  @Input()
  isEditMode = false;

  constructor(
    readonly state: PresentationProductsLocalState,
    private readonly _translocoService: CosmosTranslocoService
  ) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });

    this.sort.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged(), untilDestroyed(this))
      .subscribe((value: PresentationProductSortOrder) => {
        if (value !== 'None') {
          this.sortProducts(value);
        }
        this.sort.setValue('None');
      });
  }

  sequenceProducts(event: CdkDragDrop<number>): void {
    const visibleProducts = this.state.visibleProducts || [];

    moveItemInArray(
      visibleProducts,
      event.previousContainer.data,
      event.container.data
    );

    const sequence = visibleProducts.map((product, index) => ({
      ...product,
      Sequence: index,
    }));

    this.state.sequenceProducts(this.state.presentation!.Id, sequence);
  }

  sortProducts(sortOrder: PresentationProductSortOrder): void {
    this.state.sortProducts(this.state.presentation!.Id, sortOrder);
  }

  updateProductVisibility(product: PresentationProduct): void {
    this.state.updateProductVisibility(
      this.state.presentation!.Id,
      product.Id,
      !product.IsVisible
    );
  }

  removeProduct(product: PresentationProduct): void {
    this.state.removeProduct(this.state.presentation!.Id, product.Id);
  }
}

@NgModule({
  declarations: [PresentationProductsComponent],
  imports: [
    CommonModule,
    RouterModule,
    DragDropModule,
    ReactiveFormsModule,

    MatTabsModule,
    MatMenuModule,

    CosButtonModule,
    CosFormFieldModule,
    CosInputModule,
    CosProductCardModule,

    EspSearchSortModule,
    NoProductsMessageComponent,
    ProductGalleryComponent,

    PresentationProductStatusPipe,
    PresentationProductMapThroughPipeModule,
    CosmosUtilTranslationsModule,
  ],
  exports: [PresentationProductsComponent],
})
export class PresentationProductsModule {}
