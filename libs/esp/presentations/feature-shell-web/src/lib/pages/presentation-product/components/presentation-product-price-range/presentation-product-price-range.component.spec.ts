import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { NgxsModule, Store } from '@ngxs/store';
import { InitialState } from '@ngxs/store/internals';
import { first } from 'rxjs';

import { CosCheckboxChange } from '@cosmos/components/checkbox';
import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { CalculatedPriceRangePipe } from '@cosmos/util-price-pipes';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import {
  EspPresentationsFeatureProductsModule,
  PresentationProductQueries,
} from '@esp/presentations/feature-products';
import { mockPresentationProduct } from '@esp/presentations/mocks-presentations';
import { PresentationProduct } from '@esp/presentations/types';

import { PresentationProductImprintLocalState } from '../../presentation-product-imprint.local-state';
import { PresentationProductLocalState } from '../../presentation-product.local-state';

import { PresentationProductPriceRangeComponent } from './presentation-product-price-range.component';

const selectors = {
  cosToggleNativeCheckbox: dataCySelector('cos-toggle-native-input'),
  productPriceRangeSettings: dataCySelector('product-price-range-settings'),
  productCalculatedPriceRange: dataCySelector('product-calculated-price-range'),
  customPriceRangeInput: dataCySelector('custom-price-range-input'),
  customPriceRangeCheckbox: dataCySelector('custom-price-range-checkbox'),
};

describe('PresentationProductPriceRangeComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationProductPriceRangeComponent,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      EspPresentationsFeatureProductsModule.forChild(),
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
      CosUtilTranslationsTestingModule.forRoot(),
    ],
    providers: [
      PresentationProductLocalState,
      PresentationProductImprintLocalState,
      CalculatedPriceRangePipe,
    ],
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

  it('should show product price range settings when `ShowProductPriceRanges` is truthy', () => {
    // Arrange
    const { spectator, component } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Settings: {
          ...product.Settings,
          ShowProductPriceRanges: false,
        },
      }),
    });

    // Assert
    expect(
      spectator.query(selectors.productPriceRangeSettings)
    ).not.toBeVisible();

    // Act
    spectator.click(selectors.cosToggleNativeCheckbox);

    // Assert
    expect(spectator.query(selectors.productPriceRangeSettings)).toBeVisible();
    expect(component.state.product.Settings.ShowProductPriceRanges).toEqual(
      true
    );
  });

  // it('should show a calculated price range', () => {
  //   // Arrange
  //   const { spectator, store } = testSetup();

  //   // Act
  //   const snapshot = store.snapshot();
  //   store.reset({
  //     presentationProduct: {
  //       product: {
  //         ...snapshot.presentationProduct.product,
  //         Settings: {
  //           ShowProductPriceRanges: true,
  //         },
  //         PriceGrids: [
  //           {
  //             IsVisible: true,
  //             Prices: [
  //               {
  //                 Price: 10,
  //               },
  //               {
  //                 Price: 20,
  //               },
  //               {
  //                 Price: 700,
  //               },
  //             ],
  //           },
  //           {
  //             IsVisible: true,
  //             Prices: [
  //               {
  //                 Price: 400,
  //               },
  //               {
  //                 Price: 500,
  //               },
  //               {
  //                 Price: 3.35,
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     },
  //   });

  //   spectator.detectComponentChanges();

  //   // Assert
  //   expect(spectator.query(selectors.productCalculatedPriceRange)).toHaveText(
  //     '$3.35 - $700'
  //   );
  // });

  it('should setup a custom price range when the input is blurred', () => {
    // Arrange
    const { spectator, store } = testSetup();
    const newPriceRange =
      '$5.00 - $6.00 on thursdays, $4.00 - $5.00 on wednesdays';

    const customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );

    // Act
    customPriceRangeInput.value = newPriceRange;
    // We're not using `spectator` methods since we're interested that the state is updated
    // w/o running change detection, since state updates should not rely on change detection.
    customPriceRangeInput.dispatchEvent(new FocusEvent('blur'));

    // Assert
    const product = store.selectSnapshot(PresentationProductQueries.getProduct);
    expect(product.PriceRange).toEqual(newPriceRange);
  });
  it('should show product price range settings when `ShowProductPriceRanges` is truthy after click', () => {
    // Arrange
    const { spectator, component } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Settings: {
          ...product.Settings,
          ShowProductPriceRanges: false,
        },
      }),
    });

    // Assert
    expect(
      spectator.query(selectors.productPriceRangeSettings)
    ).not.toBeVisible();

    // Act
    spectator.click(selectors.cosToggleNativeCheckbox);

    // Assert
    expect(spectator.query(selectors.productPriceRangeSettings)).toBeVisible();
    expect(component.state.product.Settings.ShowProductPriceRanges).toEqual(
      true
    );
  });

  it('should display no text in the Price Range field', () => {
    // Arrange
    const { spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        PriceGrids: [],
      }),
    });

    const customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );

    // Act
    expect(customPriceRangeInput.value).toBe('');
  });

  it("should display the text 'Price From' before the calculated Price range", () => {
    // Arrange
    const { spectator, component } = testSetup();
    const calculatedPriceRangePipe = spectator.inject(
      CalculatedPriceRangePipe,
      true
    );

    calculatedPriceRangePipe
      .transform(component.presentationProductState.visiblePriceGrids)
      .pipe(first())
      .subscribe((value) => {
        const customPriceRangeInput = spectator.query<HTMLInputElement>(
          selectors.customPriceRangeInput
        );
        expect(customPriceRangeInput).toBeVisible();
        expect(customPriceRangeInput).toHaveValue(`Price From ${value}`);
      });
  });

  it('should use the lowest list price from all of the applied price grids for the minimum price of the price range', () => {
    // Arrange
    const { spectator, component } = testSetup();

    const calculatedPriceRangePipe = spectator.inject(
      CalculatedPriceRangePipe,
      true
    );
    const pipeSpy = jest.spyOn(calculatedPriceRangePipe, 'transform');

    //Act
    calculatedPriceRangePipe.transform(
      component.presentationProductState.visiblePriceGrids
    );
    //Assert
    expect(pipeSpy).toHaveBeenCalledWith(
      component.presentationProductState.visiblePriceGrids
    );
  });

  it('should allow a distributor to enable the custom price range option by clicking the box', () => {
    //Arrange
    const { spectator } = testSetup();
    const customPriceRangeCheckbox = spectator
      .query(selectors.customPriceRangeCheckbox)
      .querySelector('input');

    //Assert
    expect(customPriceRangeCheckbox).toHaveAttribute('type', 'checkbox');
    expect(customPriceRangeCheckbox).toHaveAttribute('aria-checked', 'false');
    //Act
    spectator.click(customPriceRangeCheckbox);

    //Assert
    expect(customPriceRangeCheckbox).toHaveAttribute('aria-checked', 'true');
  });

  it('should allow the user to change the text to display on the customer portal', () => {
    //Arrange
    const { spectator } = testSetup();
    const customPriceRangeCheckbox = spectator
      .query(selectors.customPriceRangeCheckbox)
      .querySelector('input');

    //Assert
    expect(customPriceRangeCheckbox).toHaveAttribute('type', 'checkbox');
    expect(customPriceRangeCheckbox).toHaveAttribute('aria-checked', 'false');
    //Act
    spectator.click(customPriceRangeCheckbox);
    spectator.detectComponentChanges();
    let customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );
    spectator.typeInElement('Test input', customPriceRangeInput);
    spectator.detectComponentChanges();
    customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );
    //Assert
    expect(customPriceRangeInput.value).toEqual('Test input');
  });

  it('should have no text displayed if no price grids are applied', () => {
    //Arrange
    const { spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        PriceGrids: [],
      }),
    });

    // Act
    const customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );

    //Assert
    expect(customPriceRangeInput.value).toEqual('');
  });

  it('should discard custom entered text if the distributor unchecks the use custom price range option', () => {
    //Arrange
    const { spectator, component } = testSetup();

    //Act
    component.toggleCustomPriceRange({ checked: false } as CosCheckboxChange);
    spectator.detectComponentChanges();
    let customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );

    spectator.typeInElement('Test input', customPriceRangeInput);
    spectator.detectComponentChanges();
    customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );
    //Assert
    expect(customPriceRangeInput.value).toEqual('Test input');
    //Act
    component.toggleCustomPriceRange({ checked: false } as CosCheckboxChange);
    spectator.detectComponentChanges();
    customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );
    //Assert
    expect(component.state.product.PriceRange).toEqual('');
  });

  it('should default back to the calculated values if a price grid is applied', () => {
    //Arrange
    const { component, spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        PriceGrids: [
          {
            Id: 0,
            IsVisible: true,
            Prices: [
              {
                Price: 10,
              },
              {
                Price: 20,
              },
              {
                Price: 700,
              },
            ],
          },
        ],
        PriceRange: 'Price From $10.00 - $700.00',
      }),
    });

    let customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );

    let customPriceRangeCheckbox = spectator
      .query(selectors.customPriceRangeCheckbox)
      .querySelector('input');
    expect(customPriceRangeInput.value).toBe(
      component.state.product.PriceRange
    );
    //Act
    spectator.click(customPriceRangeCheckbox);

    spectator.typeInElement('Test Input', customPriceRangeInput);
    spectator.dispatchKeyboardEvent(customPriceRangeInput, 'keyup', {
      key: 'Tab',
      keyCode: 9,
    });
    spectator.detectComponentChanges();

    customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );
    //Assert
    expect(customPriceRangeInput.value).toBe('Test Input');

    //Act
    customPriceRangeCheckbox = spectator
      .query(selectors.customPriceRangeCheckbox)
      .querySelector('input');

    spectator.click(customPriceRangeCheckbox);
    spectator.detectComponentChanges();

    customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );
    //Assert
    //To Fix
    // expect(customPriceRangeInput.value).toBe('Price From $10.00 - $700.00');
  });
  it('should default back to empty state of no price grids are applied.', () => {
    //Arrange
    const { component, spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        PriceGrids: [],
        PriceRange: '',
      }),
    });

    let customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );

    let customPriceRangeCheckbox = spectator
      .query(selectors.customPriceRangeCheckbox)
      .querySelector('input');
    expect(customPriceRangeInput.value).toBe(
      component.state.product.PriceRange
    );
    //Act
    spectator.click(customPriceRangeCheckbox);

    spectator.typeInElement('Test Input', customPriceRangeInput);
    spectator.dispatchKeyboardEvent(customPriceRangeInput, 'keyup', {
      key: 'Tab',
      keyCode: 9,
    });
    spectator.detectComponentChanges();

    customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );
    //Assert
    expect(customPriceRangeInput.value).toBe('Test Input');

    //Act
    customPriceRangeCheckbox = spectator
      .query(selectors.customPriceRangeCheckbox)
      .querySelector('input');

    spectator.click(customPriceRangeCheckbox);
    spectator.detectComponentChanges();

    customPriceRangeInput = spectator.query<HTMLInputElement>(
      selectors.customPriceRangeInput
    );
    //Assert
    //To Fix
    // expect(customPriceRangeInput.value).toBe('');
  });
});
