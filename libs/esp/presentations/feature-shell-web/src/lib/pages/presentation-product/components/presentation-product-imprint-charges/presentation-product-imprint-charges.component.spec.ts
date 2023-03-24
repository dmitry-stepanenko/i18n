import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { TRANSLOCO_MISSING_HANDLER } from '@ngneat/transloco';
import { NgxsModule, Store } from '@ngxs/store';
import { InitialState } from '@ngxs/store/internals';

import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { EspPresentationsFeatureProductsModule } from '@esp/presentations/feature-products';
import {
  MOCK_PRODUCT_ATTRIBUTES,
  MOCK_PRODUCT_CHARGES,
  mockPresentationProduct,
} from '@esp/presentations/mocks-presentations';
import { PresentationProduct } from '@esp/presentations/types';

import { PresentationProductImprintLocalState } from '../../presentation-product-imprint.local-state';
import { PresentationProductLocalState } from '../../presentation-product.local-state';
import { PresentationProductChargesTableModule } from '../presentation-product-charges-table';

import {
  PresentationProductImprintChargesComponent,
  PresentationProductImprintChargesModule,
} from './presentation-product-imprint-charges.component';

const selectors = {
  vendorImprintChargeAccordion: dataCySelector('price-grid-accordion'),
  priceGridPriceRowQuantityInput: `${dataCySelector(
    'price-grid-price-row-quantity'
  )} input`,
  priceGridPriceRowNetCostInput: `${dataCySelector(
    'price-grid-price-row-net-cost'
  )} input`,
  priceGridPriceRowListPriceInput: `${dataCySelector(
    'price-grid-price-row-list-price'
  )} input`,
};

describe('PresentationProductImprintChargesComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationProductImprintChargesComponent,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      EspPresentationsFeatureProductsModule.forChild(),
      PresentationProductImprintChargesModule,
      PresentationProductChargesTableModule,
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
    ],
    providers: [
      { provide: TRANSLOCO_MISSING_HANDLER, useValue: { handle() {} } },
      PresentationProductImprintLocalState,
      PresentationProductLocalState,
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
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  describe('Vendor Imprint Charges section tests', () => {
    const attributesCharges = {
      Attributes: MOCK_PRODUCT_ATTRIBUTES,
      Charges: MOCK_PRODUCT_CHARGES,
    };

    it('should display selected Imprint charges', () => {
      // Arrange
      const { component, spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });

      const imprintChargesAccordions = spectator.queryAll(
        selectors.vendorImprintChargeAccordion
      );

      // Assert
      expect(imprintChargesAccordions).toHaveLength(
        component.state.visibleImprintCharges.length
      );
    });

    it('should allow a user to edit the charge name', () => {
      // Arrange
      const { spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });
      const imprintChargeAccordion = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelector('.cos-accordion-header')!;

      // Act
      spectator.click(imprintChargeAccordion);
      spectator.detectComponentChanges();
      const imprintChargeAccordionNameEditBtn = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelector('button.cos-edit')!;
      const imprintChargeAccordionNameEditBtnIcon = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelector('button.cos-edit > i')!;
      let editChargeNameSection = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelector('cos-inline-edit > div.cos-inline-edit');

      // Assert
      expect(imprintChargeAccordionNameEditBtn).toBeVisible();
      expect(imprintChargeAccordionNameEditBtn).toHaveDescendant(
        imprintChargeAccordionNameEditBtnIcon
      );
      expect(imprintChargeAccordionNameEditBtnIcon).toHaveClass(
        'fas fa-pencil-alt'
      );
      expect(editChargeNameSection).not.toHaveClass(
        'cos-inline-edit--editState'
      );

      // Act again
      spectator.click(imprintChargeAccordionNameEditBtn);
      spectator.detectComponentChanges();
      editChargeNameSection = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelector('cos-inline-edit > div.cos-inline-edit');

      // Assert
      expect(editChargeNameSection).toHaveClass('cos-inline-edit--editState');
    });

    it('Charge name input should support up to 100 characters maximum in edit mode', () => {
      // Arrange
      const { spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });
      const imprintChargeAccordion = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelector('.cos-accordion-header')!;

      // Act
      spectator.click(imprintChargeAccordion);
      spectator.detectComponentChanges();
      const imprintChargeAccordionNameEditBtn = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelector('button.cos-edit')!;

      // Act again
      spectator.click(imprintChargeAccordionNameEditBtn);
      spectator.detectComponentChanges();
      const imprintChargeAccordionNameEditInput = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelector('input.cos-input')!;

      // Assert
      expect(
        imprintChargeAccordionNameEditInput.getAttribute('maxlength')
      ).toEqual('100');
    });

    it('should allow a user to change the charge QTY selection', () => {
      // Arrange
      const { spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });
      const chargeQuantityInput = spectator
        .queryAll('esp-visible-grid-prices')[0]
        .querySelector(selectors.priceGridPriceRowQuantityInput)!;

      // Assert
      expect(chargeQuantityInput).toBeVisible();
      expect(chargeQuantityInput.tagName).toEqual('INPUT');
      expect(chargeQuantityInput).not.toHaveAttribute('disabled');
    });

    it('should display Usage Level Select options as Per Product, Per Quantity, Other', () => {
      // Arrange
      const { component, spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });
      const usageLevelSelectOptions = spectator
        .queryAll(selectors.vendorImprintChargeAccordion)[0]
        .querySelectorAll('select.usage-level-select > option');

      // Assert
      expect(usageLevelSelectOptions).toHaveLength(
        component.chargeUsageLevels.length
      );
      expect(usageLevelSelectOptions).toHaveLength(3);
      expect(usageLevelSelectOptions[0].textContent!.trim()).toEqual(
        component.chargeUsageLevels[0].Value
      );
      expect(usageLevelSelectOptions[1].textContent!.trim()).toEqual(
        component.chargeUsageLevels[1].Value
      );
      expect(usageLevelSelectOptions[2].textContent!.trim()).toEqual(
        component.chargeUsageLevels[2].Value
      );
      expect(usageLevelSelectOptions[0].textContent!.trim()).toEqual('Other');
      expect(usageLevelSelectOptions[1].textContent!.trim()).toEqual(
        'Per Order'
      );
      expect(usageLevelSelectOptions[2].textContent!.trim()).toEqual(
        'Per Quantity'
      );
    });

    it('should allow a user to change the net cost', () => {
      // Arrange
      const { spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });
      const netCostInput = spectator
        .queryAll('esp-visible-grid-prices')[0]
        .querySelector(selectors.priceGridPriceRowNetCostInput)!;

      // Assert
      expect(netCostInput).toBeVisible();
      expect(netCostInput.tagName).toEqual('INPUT');
      expect(netCostInput).not.toHaveAttribute('disabled');
    });

    it('should allow a user to change the price', () => {
      // Arrange
      const { spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });
      const priceInput = spectator
        .queryAll('esp-visible-grid-prices')[0]
        .querySelector(selectors.priceGridPriceRowListPriceInput)!;

      // Assert
      expect(priceInput).toBeVisible();
      expect(priceInput.tagName).toEqual('INPUT');
      expect(priceInput).not.toHaveAttribute('disabled');
    });

    it('should display the original list price', () => {
      // Arrange
      const { spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });
      const originalListPriceDisplay = spectator
        .queryAll('esp-visible-grid-prices')[0]
        .querySelector('cos-cell.cdk-column-CostPerUnit > div');

      // Assert
      expect(originalListPriceDisplay).toBeVisible();
    });
  });

  describe('Vendor Imprint Charges - Invisible Charges test', () => {
    it('should not display a vendor imprint charge if the charge is applied to the presentation product', () => {
      // Arrange
      const invisibleCharges = MOCK_PRODUCT_CHARGES.map((productCharge) => ({
        ...productCharge,
        IsVisible: false,
      }));
      const attributesCharges = {
        Attributes: MOCK_PRODUCT_ATTRIBUTES,
        Charges: invisibleCharges,
      };
      const { component, spectator } = testSetup({
        productRecipe: (product) => ({
          ...product,
          ...attributesCharges,
        }),
      });
      let rows = spectator.queryAll('tr.cos-row');
      const currentRowsCount = rows.length;
      const currentChargesLength =
        component.state.invisibleImprintCharges.length;

      // Assert
      expect(rows).toHaveLength(currentChargesLength);
      expect(currentChargesLength).toEqual(11);
      expect(currentRowsCount).toEqual(11);

      // Act
      spectator.click(rows[0].querySelector('button')!);
      spectator.detectChanges();
      spectator.detectComponentChanges();
      rows = spectator.queryAll('tr.cos-row');
      const modifiedChargesLength =
        component.state.invisibleImprintCharges.length;

      // Assert
      expect(rows).toHaveLength(currentRowsCount - 1);
      expect(modifiedChargesLength).toEqual(currentChargesLength - 1);
    });
  });
});
