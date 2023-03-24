import { createComponentFactory } from '@ngneat/spectator/jest';

import { dataCySelector } from '@cosmos/testing';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import {
  LineItemType,
  ProductCardGridType,
  RequestChangesModel,
} from '@esp/presentations/types';

import { CosPresentationProductCardComponent } from './presentation-product-card.component';

const selectors = {
  productImage: dataCySelector('presentation-product-card__image'),
  productStatus: dataCySelector('presentation-product-card__status'),
  productImprintMethod: dataCySelector(
    'presentation-product-card__imprint-method'
  ),
  productArtworks: dataCySelector('presentation-product-card__artworks'),
  productCardGridWithCharge: dataCySelector(
    'presentation-product-card__grid-with-charge'
  ),
  productComment: dataCySelector('presentation-product-card__comment'),
  requestedChanges: dataCySelector(
    'presentation-product-card__request-changes'
  ),
};

describe('CosPresentationProductCardComponent', () => {
  const createComponent = createComponentFactory({
    component: CosPresentationProductCardComponent,
    imports: [CosUtilTranslationsTestingModule.forRoot()],
  });

  const testSetup = (options?: {
    gridType?: ProductCardGridType;
    requestedChanges?: RequestChangesModel;
  }) => {
    const spectator = createComponent({
      props: {
        product: {
          Name: 'Test Product',
          Type: LineItemType.Product,
          ImageUrl:
            'https://media.asicdn.com/images/jpgt/43100000/43107278.jpg',
          Quantity: 100,
          Media: [
            {
              ImageUrl:
                'https://media.asicdn.com/images/jpgt/43100000/43107278.jpg',
              FileName: 'Test File Name 1',
            },
            {
              ImageUrl:
                'https://media.asicdn.com/images/jpgt/43100000/43107278.jpg',
              FileName: 'Test File Name 2',
            },
          ],
          Variants: [{}],
          Comment: 'Test Comment',
          ImprintMethod: { Value: 'Test Imprint Method' },
          Status: 'Test Status',
        } as any,
        productCardGridType: options?.gridType,
        requestChanges: options?.requestedChanges,
      } as any,
    });

    return { spectator };
  };

  it('displays product data on card', () => {
    // Arrange
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query(selectors.productImage)).toExist();
    expect(spectator.query(selectors.productStatus)).toHaveExactTrimmedText(
      'Test Status'
    );
    expect(
      spectator.query(selectors.productImprintMethod)
    ).toHaveExactTrimmedText('Imprint Method: Test Imprint Method');
    expect(spectator.query(selectors.productArtworks)).toHaveExactTrimmedText(
      'Artwork: Test File Name 1 Test File Name 2'
    );
    expect(spectator.query(selectors.productComment)).toHaveExactTrimmedText(
      'Customization Comments:Test Comment'
    );
  });

  it('should display requested changes', () => {
    const { spectator } = testSetup({
      requestedChanges: {
        RequestChanges: 'Test Requested Changes',
        Name: 'Test Product',
      },
    });

    expect(spectator.query(selectors.requestedChanges)).toHaveExactTrimmedText(
      'Requested Changes:Test Requested Changes'
    );
  });

  it('should not display requested changes', () => {
    const { spectator } = testSetup();

    expect(spectator.query(selectors.requestedChanges)).not.toExist();
  });

  it('displays product grid with charge when data.productCardGridType = WithCharge', () => {
    const { spectator } = testSetup({
      gridType: ProductCardGridType.WithCharge,
    });

    expect(spectator.query(selectors.productCardGridWithCharge)).toExist();
  });
});
