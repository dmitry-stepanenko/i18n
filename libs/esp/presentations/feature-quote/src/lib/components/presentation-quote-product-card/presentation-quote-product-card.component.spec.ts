import { createComponentFactory } from '@ngneat/spectator';

import { dataCySelector } from '@cosmos/testing';
import { ProductLineItem } from '@esp/orders/types';

import {
  AsiPresentationQuoteProductCardModule,
  PresentationQuoteProductCardComponent,
} from './presentation-quote-product-card.component';

const selectors = {
  image: dataCySelector('presentation-quote-product-card__image'),
  productName: dataCySelector('presentation-quote-product-card__product-name'),
  imprintMethod: dataCySelector(
    'presentation-quote-product-card__imprint-method'
  ),
  artwork: dataCySelector('presentation-quote-product-card__artwork'),
  variantsTableItemHeader: dataCySelector(
    'presentation-quote-product-card__variant-table-item-header'
  ),
  variantsTableQuantityHeader: dataCySelector(
    'presentation-quote-product-card__variant-table-quantity-header'
  ),
  variantsTableItemRows: dataCySelector(
    'presentation-quote-product-card__variant-table-item-rows'
  ),
  variantsTableQuantityRows: dataCySelector(
    'presentation-quote-product-card__variant-table-quantity-rows'
  ),
  customizationComment: dataCySelector(
    'presentation-quote-product-card__customization-comment'
  ),
};

const product = {
  Name: 'Product name',
  ImprintMethod: 'Imprint Value',
  Artwork: 'Artwork Value',
  CustomizationComment: 'Customization Comment',
  Variants: [
    {
      Description: 'White - Adjustable/Polyester',
      Quantity: 44,
    },
    {
      Description: 'Gold - Adjustable/Polyester',
      Quantity: 44,
    },
  ],
} as any;

describe('PresentationQuoteProductCardComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationQuoteProductCardComponent,
    imports: [AsiPresentationQuoteProductCardModule],
  });

  const testSetup = (options?: { product?: ProductLineItem }) => {
    const spectator = createComponent({
      props: {
        product: options?.product || product,
      },
    });

    return {
      spectator,
      component: spectator.component,
    };
  };

  it('should create', () => {
    const { component } = testSetup();
    expect(component).toBeTruthy();
  });

  it('should display product name', () => {
    const { spectator } = testSetup();
    expect(spectator.query(selectors.productName)).toBeVisible();
    expect(spectator.query(selectors.productName)).toHaveExactTrimmedText(
      product.Name
    );
  });

  it('should display imprint method', () => {
    const { spectator } = testSetup();
    expect(spectator.query(selectors.imprintMethod)).toBeVisible();
    expect(spectator.query(selectors.imprintMethod)).toHaveExactTrimmedText(
      product.ImprintMethod
    );
  });

  it('should display artwork', () => {
    const { spectator } = testSetup();
    expect(spectator.query(selectors.artwork)).toBeVisible();
    expect(spectator.query(selectors.artwork)).toHaveExactTrimmedText(
      product.Artwork
    );
  });

  xit('should display customization comments', () => {
    const { spectator } = testSetup();
    expect(
      spectator.queryAll(selectors.customizationComment).length
    ).toHaveExactTrimmedText('Customization Comments');
  });
});
