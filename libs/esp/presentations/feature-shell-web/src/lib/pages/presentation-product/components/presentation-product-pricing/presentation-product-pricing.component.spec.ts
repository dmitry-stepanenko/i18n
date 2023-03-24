import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NgxsModule, Store } from '@ngxs/store';
import { InitialState } from '@ngxs/store/internals';
import { of } from 'rxjs';

import { ConfigModule } from '@cosmos/config';
import { InputMaskLoader } from '@cosmos/input-mask';
import { dataCySelector } from '@cosmos/testing';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import { PresentationsState } from '@esp/presentations/data-access-presentations';
import {
  EspPresentationsFeatureProductsModule,
  PresentationProductQueries,
} from '@esp/presentations/feature-products';
import {
  PresentationMockDb,
  mockPresentationProduct,
} from '@esp/presentations/mocks-presentations';
import { PresentationProduct } from '@esp/presentations/types';

import { PresentationProductLocalState } from '../../presentation-product.local-state';

import { PresentationProductPricingComponent } from './presentation-product-pricing.component';

const selectors = {
  showProductPricingCheckbox: `${dataCySelector(
    'show-product-pricing-checkbox'
  )} ${dataCySelector('cos-toggle-native-input')}`,
  priceAdjustment: dataCySelector('price-adjustment-value'),
  priceAdjustmentSelect: dataCySelector('pricing-adjustment-select'),
  roundPricesToTwoDecimalCheckbox: `${dataCySelector(
    'round-prices-to-two-decimal'
  )} ${dataCySelector('cos-checkbox-native-input')}`,
  applyPriceAdjustmentButton: dataCySelector('apply-price-adjustment-button'),
};

describe('PresentationProductPricingComponent', () => {
  const presentation = PresentationMockDb.presentation;

  const createComponent = createComponentFactory({
    component: PresentationProductPricingComponent,
    imports: [
      HttpClientTestingModule,
      // The `PresentationsState` is required because `esp-presentation-product-price-grids` are
      // shown only when presentation and product are both defined.
      NgxsModule.forRoot([PresentationsState]),
      EspPresentationsFeatureProductsModule.forChild(),
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
      CosUtilTranslationsTestingModule.forRoot(),
    ],
    providers: [
      PresentationProductLocalState,
      mockProvider(MatDialog),
      mockProvider(InputMaskLoader, {
        getInputMask: () => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('inputmask_built');
          return of(window.Inputmask);
        },
      }),
    ],
  });

  const testSetup = function (options?: {
    productRecipe?: (product: PresentationProduct) => PresentationProduct;
  }) {
    const product = options?.productRecipe
      ? mockPresentationProduct(options?.productRecipe)
      : mockPresentationProduct();

    InitialState.set({
      presentations: {
        items: {
          [presentation.Id]: { presentation },
        },
        itemIds: [presentation.Id],
        currentId: presentation.Id,
      },
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
        loading: {
          inProgress: false,
          success: true,
        },
      },
    });

    const spectator = createComponent({});

    const store = spectator.inject(Store);

    return { spectator, store, component: spectator.component };
  };

  it('should create', () => {
    const { component } = testSetup();
    expect(component).toBeTruthy();
  });

  it('should show product pricing settings when `ShowProductPricing` is truthy', () => {
    // Arrange
    const { spectator, component } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Settings: {
          ...product.Settings,
          ShowProductPricing: false,
        },
      }),
    });

    // Act
    spectator.click(selectors.showProductPricingCheckbox);

    // Assert
    expect(spectator.query(selectors.priceAdjustment)).toBeVisible();
    expect(component.state.product!.Settings.ShowProductPricing).toEqual(true);
  });

  it('should allow a user to select the price adjustment type from a drop down', () => {
    // Arrange
    const { spectator, component } = testSetup();

    // Act
    const priceAdjustmentSelect = spectator.query<HTMLSelectElement>(
      selectors.priceAdjustmentSelect
    )!;

    // Assert
    expect(priceAdjustmentSelect).toBeVisible();
    expect(priceAdjustmentSelect.children).toHaveLength(
      component.priceAdjustments.length
    );
    for (let i = 0; i < priceAdjustmentSelect.children.length; i++) {
      expect(priceAdjustmentSelect.children[i].nodeName).toEqual('OPTION');
    }

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[0]);
    spectator.detectComponentChanges();

    // Assert
    expect(component.priceAdjustment).toEqual(component.priceAdjustments[0]);
  });

  it('should allow a user to adjust pricing by profit margin', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[0]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50 %');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to add a fixed amount to the List Price', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[1]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to add a fixed amount to the Net Cost', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[2]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to subtract a fixed amount to the List Price', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[4]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to subtract a fixed amount to the Net Cost', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[5]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to add a % of the net cost to the list price', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[7]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50 %');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to add a % of the list price to the list price', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[8]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50 %');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to subtract a % of the net cost from the net cost', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[10]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50 %');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to subtract a % of the net cost from the list price', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[11]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50 %');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('should allow a user to subtract a % of the list price from the list price', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    jest.spyOn(component, 'applyPriceAdjustment');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[12]);
    spectator.detectComponentChanges();
    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50 %');

    // Act
    spectator.click(selectors.applyPriceAdjustmentButton);

    // Assert
    expect(component.applyPriceAdjustment).toHaveBeenCalled();
  });

  it('Decimal Setting - Should default to rounding up to 2 decimals by default', () => {
    // Arrange
    const { component } = testSetup({
      productRecipe: (product) => ({
        ...product,
        RoundPricesToTwoDecimal: true,
      }),
    });

    // Act

    // Assert
    expect(component.state.product!.RoundPricesToTwoDecimal).toBeTruthy();
  });

  it('should toggle `RoundPricesToTwoDecimal`', () => {
    // Arrange
    const { spectator, store } = testSetup({
      productRecipe: (product) => ({
        ...product,
        RoundPricesToTwoDecimal: true,
      }),
    });

    // Act
    spectator.click(selectors.roundPricesToTwoDecimalCheckbox);

    // Assert
    expect(
      store.selectSnapshot(PresentationProductQueries.getProduct)
        .RoundPricesToTwoDecimal
    ).toEqual(false);
  });

  it("should display the 'Pricing' header correctly", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    const pricingHeader = spectator.query('.toggle-label');

    // Assert
    expect(pricingHeader).toBeVisible();
    expect(pricingHeader).toHaveText('Pricing');
  });

  it('should disable the input if there is no price adjustment type selected', async () => {
    // Arrange
    const { spectator, component } = testSetup();

    // Assert
    expect(spectator.query(selectors.priceAdjustment)).toBeDisabled();

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[0]);
    spectator.detectComponentChanges();

    // Assert
    expect(spectator.query(selectors.priceAdjustment)).not.toBeDisabled();
  });

  it('should toggle inputs with different masks considering the selected price adjustment type', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceAdjustment = spectator.query<HTMLInputElement>(
      selectors.priceAdjustment
    )!;

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[0]);
    spectator.detectComponentChanges();

    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50 %');

    // Act
    component.updatePriceAdjustment(component.priceAdjustments[1]);
    spectator.detectComponentChanges();

    spectator.typeInElement('50', priceAdjustment);

    // Assert
    expect(priceAdjustment.value).toEqual('50');
  });

  it('Should use the presentation Hide pricing if ShowProductPricing is false', () => {
    // Arrange
    const { spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Settings: {
          ...product.Settings,
          ShowProductPricing: false,
        },
      }),
    });

    // Assert
    expect(
      spectator.query(selectors.showProductPricingCheckbox)
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('Should use the presentation Show pricing if ShowProductPricing is true', () => {
    // Arrange
    const { spectator } = testSetup();

    // Assert
    expect(
      spectator.query(selectors.showProductPricingCheckbox)
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('Should hide applied and recommended price grid section on toggling pricing checkbox', () => {
    // Arrange
    const { spectator } = testSetup();

    // Assert
    expect('esp-presentation-product-price-grids').toBeVisible();
    expect('esp-invisible-price-grids').toBeVisible();
    expect('esp-visible-price-grids').toBeVisible();

    // Act
    spectator.click(selectors.showProductPricingCheckbox);
    spectator.detectComponentChanges();

    // Assert
    expect('esp-presentation-product-price-grids').not.toBeVisible();
    expect('esp-visible-price-grids').not.toBeVisible();
    expect('esp-invisible-price-grids').not.toBeVisible();
  });
});
