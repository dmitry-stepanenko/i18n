import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NgxsModule } from '@ngxs/store';

import { dataCySelector } from '@cosmos/testing';
import { LineItemCardViewModel } from '@esp/presentations/types';

import { PresentationCartLocalState } from './presentation-cart.local-state';
import { PresentationCartPage } from './presentation-cart.page';

const selectors = {
  productHeader: dataCySelector('product-card-header'),
  productName: dataCySelector('product-card-content-name'),
  editProductButton: dataCySelector('cart-product__edit-button'),
  productCard: dataCySelector('cart-product'),
  reviewButton: dataCySelector('review-button'),
};

describe('PresentationCartPage', () => {
  const testSetup = (options?: {
    lineItemCardViewModel?: Partial<LineItemCardViewModel>[];
    hasAnyVisibleItem?: boolean;
  }) => {
    const spectator = createComponent({
      providers: [
        mockProvider(PresentationCartLocalState, {
          lineItemCardViewModel: options?.lineItemCardViewModel,
          hasLoaded: true,
          isLoading: false,
          cart: options?.lineItemCardViewModel ?? [
            { Id: 1, IsVisible: true, Name: 'Name' },
          ],
          hasAnyVisibleItem: options?.hasAnyVisibleItem,
        }),
      ],
    });
    return { spectator, component: spectator.component };
  };

  const createComponent = createComponentFactory({
    component: PresentationCartPage,
    imports: [RouterTestingModule, NgxsModule.forRoot()],
  });

  describe('hidden products behavior', () => {
    it('edit button should be visible for visible products', () => {
      const { spectator } = testSetup({
        lineItemCardViewModel: [
          { Id: 1, IsVisible: true, Name: 'Visible' },
          { Id: 2, IsVisible: false, Name: 'Hidden' },
          { Id: 3, IsVisible: true, Name: 'Visible' },
        ],
      });

      const products = spectator.queryAll(selectors.productCard);
      products.forEach((product) => {
        const hasEditButton = !!product.querySelector(
          selectors.editProductButton
        );
        const productIsVisible = product
          .querySelector(selectors.productName)!
          .textContent!.includes('Visible');
        expect(productIsVisible).toEqual(hasEditButton);
      });
    });

    it('user can request a quote if there is at least one visible product in cart', () => {
      testSetup({
        hasAnyVisibleItem: true,
      });
      expect(selectors.reviewButton).toExist();
    });

    it('user cannot request a quote if there is no visible products in cart', () => {
      testSetup({
        hasAnyVisibleItem: false,
      });
      expect(selectors.reviewButton).not.toExist();
    });
  });
});
