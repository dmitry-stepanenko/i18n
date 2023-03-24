import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { NgxsModule, Store } from '@ngxs/store';
import { InitialState } from '@ngxs/store/internals';

import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { EspPresentationsFeatureProductsModule } from '@esp/presentations/feature-products';
import { mockPresentationProduct } from '@esp/presentations/mocks-presentations';
import { PresentationProduct } from '@esp/presentations/types';

import { PresentationProductImprintLocalState } from '../../presentation-product-imprint.local-state';

import { PresentationProductClientDiscountComponent } from './presentation-product-client-discount.component';

const selectors = {
  cosToggleNativeCheckbox: dataCySelector('cos-toggle-native-input'),
  productPriceRangeSettings: dataCySelector('product-price-range-settings'),
  productCalculatedPriceRange: dataCySelector('product-calculated-price-range'),
  toggleClientDiscount: `${dataCySelector(
    'toggle-client-discount'
  )} ${dataCySelector('cos-toggle-native-input')}`,
  customPriceRangeInput: dataCySelector('custom-price-range-input'),
};

describe('PresentationProductClientDiscountComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationProductClientDiscountComponent,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      EspPresentationsFeatureProductsModule.forChild(),
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
    ],
    providers: [PresentationProductImprintLocalState],
  });

  const testSetup = function (options?: {
    productRecipe?: (product: PresentationProduct) => PresentationProduct;
  }) {
    const product = options?.productRecipe
      ? mockPresentationProduct(options?.productRecipe)
      : mockPresentationProduct();

    InitialState.set({
      presentationProduct: {
        items: {
          [product.Id]: {
            product,
            originalPriceGrids: product.PriceGrids,
            isDirty: false,
          },
        },
        itemIds: [product.Id],
        currentId: product.Id,
      },
    });

    const spectator = createComponent();
    const store = spectator.inject(Store);

    return { spectator, store, component: spectator.component };
  };

  it('should create', () => {
    const { component } = testSetup();
    expect(component).toBeTruthy();
  });

  it('should toggle the client discount when the checkbox is clicked', () => {
    // Arrange
    const { spectator, component } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Settings: {
          ...product.Settings,
          ShowProductDiscount: false,
        },
      }),
    });

    jest.spyOn(spectator.component, 'toggleShowProductDiscount');

    // Act
    spectator.click(selectors.cosToggleNativeCheckbox);

    // Assert
    expect(spectator.component.toggleShowProductDiscount).toHaveBeenCalled();
    expect(component.state.product.Settings.ShowProductDiscount).toEqual(true);
  });

  it('should use the presentation level setting by default.', () => {
    // Arrange
    const { spectator, component } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Settings: {
          ...product.Settings,
          ShowProductDiscount: true,
        },
      }),
    });
    const checkbox = spectator.query(selectors.cosToggleNativeCheckbox);

    // Assert
    expect(component.state.product.Settings.ShowProductDiscount).toEqual(true);
    expect(checkbox.getAttribute('type')).toEqual('checkbox');
    expect(checkbox.getAttribute('aria-checked')).toEqual('true');
  });
});
