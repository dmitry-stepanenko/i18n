import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { NgxsModule } from '@ngxs/store';
import { InitialState } from '@ngxs/store/internals';
import { MockComponents } from 'ng-mocks';

import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { EspPresentationsFeatureProductsModule } from '@esp/presentations/feature-products';
import { mockPresentationProduct } from '@esp/presentations/mocks-presentations';
import { PresentationProduct } from '@esp/presentations/types';

import { PresentationProductImprintLocalState } from '../../presentation-product-imprint.local-state';
import {
  PresentationProductChargesTableComponent,
  PresentationProductChargesTableModule,
} from '../presentation-product-charges-table';

import { PresentationProductAdditionalChargesComponent } from './presentation-product-additional-charges.component';

const selectors = {
  addACustomCharge: dataCySelector('add-a-custom-charge'),
};

describe('PresentationProductAdditionalChargesComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationProductAdditionalChargesComponent,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      EspPresentationsFeatureProductsModule.forChild(),
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
    ],
    overrideModules: [
      [
        PresentationProductChargesTableModule,
        {
          set: {
            declarations: MockComponents(
              PresentationProductChargesTableComponent
            ),
            exports: MockComponents(PresentationProductChargesTableComponent),
          },
        },
      ],
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
    return { spectator, component: spectator.component };
  };

  it('should create', () => {
    expect(() => testSetup()).not.toThrow();
  });

  it("should display the toggle component with correct label as 'Additional Charges'", () => {
    // Arrange
    const { spectator } = testSetup();
    const toggleElem = spectator.query('.cos-slide-toggle');

    // Assert
    expect(toggleElem).toBeVisible();
    expect(spectator.query('label.cos-slide-toggle-label')).toHaveText(
      'Additional Charges'
    );
  });

  xit('should display the `Add a custom charge` button', () => {
    // Arrange & act
    const { spectator } = testSetup();
    // Assert
    expect(spectator.query(selectors.addACustomCharge)).toHaveText(
      'Add a custom charge'
    );
  });
});
