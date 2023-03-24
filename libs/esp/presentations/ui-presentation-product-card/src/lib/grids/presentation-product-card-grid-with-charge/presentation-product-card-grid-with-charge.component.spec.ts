import { createComponentFactory } from '@ngneat/spectator';

import { dataCySelector } from '@cosmos/testing';
import { LineItemType } from '@esp/presentations/types';

import { CosPresentationProductCardGridWithChargeComponent } from './presentation-product-card-grid-with-charge.component';

const selectors = {
  description: dataCySelector(
    'presentation-product-card-grid-with-charge__description'
  ),
  quantity: dataCySelector(
    'presentation-product-card-grid-with-charge__quantity'
  ),
  price: dataCySelector('presentation-product-card-grid-with-charge__price'),
  totalPrice: dataCySelector(
    'presentation-product-card-grid-with-charge__total-price'
  ),
};

describe('CosPresentationProductCardGridWithChargeComponent', () => {
  const createComponent = createComponentFactory({
    component: CosPresentationProductCardGridWithChargeComponent,
  });

  const testSetup = () => {
    const spectator = createComponent({
      props: {
        lineItem: {
          Id: 0,
          ProductId: 0,
          Variants: [
            { Description: 'Test Description 1', Quantity: 10, Price: 10 },
          ],
          TotalQuantity: 10,
          Type: LineItemType.Product,
        },
        columns: ['item', 'quantity', 'price', 'totalPrice'],
      },
    });

    return { spectator };
  };

  it('displays product data on grid', () => {
    const { spectator } = testSetup();

    expect(spectator.query(selectors.description)).toHaveExactTrimmedText(
      'Test Description 1'
    );
    expect(spectator.query(selectors.quantity)).toHaveExactTrimmedText('10');
    expect(spectator.query(selectors.price)).toHaveExactTrimmedText('$10.00');
    expect(spectator.query(selectors.totalPrice)).toHaveExactTrimmedText(
      '$100.00'
    );
  });
});
