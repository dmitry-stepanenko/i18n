import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SpectatorOverrides } from '@ngneat/spectator';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { NgxsModule, Store } from '@ngxs/store';
import { InitialState } from '@ngxs/store/internals';
import { of } from 'rxjs';

import { ConfigModule } from '@cosmos/config';
import { Price, PriceGrid } from '@cosmos/types-common';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
// I don't know why product actions in `feature-products` and not in data-access library...
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { EspPresentationsFeatureProductsModule } from '@esp/presentations/feature-products';
import {
  MOCK_PRICES,
  mockPresentationProduct,
} from '@esp/presentations/mocks-presentations';
import { PresentationProduct } from '@esp/presentations/types';

import { VisibleGridPricesComponent } from './visible-grid-prices.component';

const queries = {
  cosRow: 'cos-row',
};

describe('VisibleGridPricesComponent', () => {
  const createComponent = createComponentFactory({
    component: VisibleGridPricesComponent,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      EspPresentationsFeatureProductsModule.forChild(),
      VisibleGridPricesComponent,
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
      CosUtilTranslationsTestingModule.forRoot(),
    ],
  });
  const testSetup = (options?: {
    overrides?: SpectatorOverrides<VisibleGridPricesComponent>;
    productRecipe?: (product: PresentationProduct) => PresentationProduct;
  }) => {
    const product = options?.productRecipe
      ? mockPresentationProduct(options?.productRecipe)
      : mockPresentationProduct();

    InitialState.set({
      presentationProduct: {
        product,
        items: {
          [product.Id]: {
            product,
            originalPriceGrids: product.PriceGrids,
            isDirty: false,
          },
        },
        itemIds: [product.Id],
        currentId: product.Id,
        originalPriceGrids: product.PriceGrids,
      },
    });

    const spectator = createComponent({
      props: {
        priceGrid: {
          Prices: MOCK_PRICES,
        } as PriceGrid,
      },
    });
    const store = spectator.inject(Store);

    return {
      spectator,
      store,
      component: spectator.component,
    };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();
    expect(component).toBeTruthy();
  });

  it('Should allow a user to toggle visibility of a row in the price grid', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const originalPrices = component.priceGrid!.Prices;

    component.originalPrices$ = of(originalPrices);
    spectator.detectComponentChanges();

    const rowCells = spectator
      .query(queries.cosRow)!
      .querySelectorAll('cos-cell');
    const spyFn = jest.spyOn(component, 'togglePriceVisibility');

    // Assert
    expect(rowCells.length).toEqual(6);
    const visibleButton = rowCells[5].querySelector('button')!;
    const visibleButtonIcon = visibleButton.querySelector('i');

    // Act
    spectator.click(visibleButton);
    spectator.detectComponentChanges();

    // Assert
    expect(visibleButtonIcon).toHaveClass('fa fa-eye cos-text--blue');
    expect(visibleButtonIcon).not.toBeDisabled();
    expect(spyFn).toBeCalled();
  });

  it('Custom Price - should allow a user to edit the quantity, net cost, discount Price and profit margin of the custom row', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const originalPrices = component.priceGrid!.Prices;

    const pricesWithCustomRow = [
      ...component.priceGrid!.Prices,
      {
        Sequence: 0,
        Quantity: {
          From: null,
          To: null,
        },
        Cost: null,
        Price: null,
        IsVisible: true,
        IsUndefined: false,
        CurrencyCode: 'USD',
        DiscountCode: 'R',
      },
    ];
    component.priceGrid!.Prices = pricesWithCustomRow as Price[];
    spectator.detectComponentChanges();

    // Assert
    const priceRows = spectator.queryAll('cos-row');
    expect(priceRows.length).toEqual(originalPrices.length + 1);

    // Arrange
    const customRow = priceRows[5];
    const quantityCell = customRow.querySelectorAll('cos-cell')[0];
    const netCostCell = customRow.querySelectorAll('cos-cell')[1];
    const originalPrice = customRow.querySelectorAll('cos-cell')[2];
    const margin = customRow.querySelectorAll('cos-cell')[3];
    const discountPrice = customRow.querySelectorAll('cos-cell')[4];

    // Assert
    expect(quantityCell.querySelector('input')).toBeVisible();
    expect(netCostCell.querySelector('input')).toBeVisible();
    expect(margin.querySelector('input')).toBeVisible();
    expect(discountPrice.querySelector('input')).toBeVisible();
    expect(originalPrice.querySelector('div')).toBeVisible();
  });
});
