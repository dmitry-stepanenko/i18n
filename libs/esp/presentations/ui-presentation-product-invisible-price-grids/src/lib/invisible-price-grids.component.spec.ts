import { createComponentFactory } from '@ngneat/spectator/jest';
import { NgxsModule } from '@ngxs/store';

import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import {
  mockInvisiblePriceGrid,
  mockInvisiblePriceGridWithQUR,
  mockInvisiblePriceGridWithTwoAttributes,
  mockPresentationProduct,
} from '@esp/presentations/mocks-presentations';

import {
  InvisiblePriceGridsComponent,
  InvisiblePriceGridsModule,
} from './invisible-price-grids.component';

const selectors = {
  cosCard: 'cos-card',
  cosTable: 'cos-table',
};

describe('InvisiblePriceGridsComponent', () => {
  const createComponent = createComponentFactory({
    component: InvisiblePriceGridsComponent,
    imports: [
      NgxsModule.forRoot(),
      InvisiblePriceGridsModule,
      CosUtilTranslationsTestingModule.forRoot(),
    ],
  });

  const testSetup = () => {
    const spectator = createComponent();
    return { spectator, component: spectator.component };
  };

  it('should not render the `cos-card` if there are no price grids', () => {
    // Arrange
    const { spectator } = testSetup();
    // Assert
    expect(spectator.query(selectors.cosCard)).not.toBeVisible();
  });

  it('should render the `cos-card` only if there are more than 1 price grid', () => {
    // Arrange
    const { spectator } = testSetup();
    // Act
    const product = mockPresentationProduct();
    spectator.setInput('product', product);
    spectator.setInput(
      'invisiblePriceGrids',
      product.PriceGrids.filter(({ IsVisible }) => IsVisible === false)
    );
    // Assert
    expect(product.PriceGrids.length).toBeGreaterThan(1);
    expect(spectator.query(selectors.cosCard)).toBeVisible();
  });

  it("should render the 'cos-table' only if there are any invisible price grids", () => {
    // Arrange
    const { spectator } = testSetup();
    // Assert
    expect(spectator.query(selectors.cosTable)).not.toBeVisible();
    // Act
    const product = mockPresentationProduct();
    spectator.setInput('product', product);
    spectator.setInput(
      'invisiblePriceGrids',
      product.PriceGrids.filter(({ IsVisible }) => IsVisible === false)
    );
    // Assert
    expect(spectator.component.invisiblePriceGrids.length).toBeGreaterThan(0);
    expect(spectator.query(selectors.cosTable)).toBeVisible();
  });

  it('should display min price in each price grid', () => {
    // Arrange
    const { spectator, component } = testSetup();
    // Act
    const product = mockPresentationProduct();
    spectator.setInput('product', product);
    spectator.setInput(
      'invisiblePriceGrids',
      product.PriceGrids.filter(({ IsVisible }) => IsVisible === false)
    );
    // Assert
    expect(spectator.component.invisiblePriceGrids.length).toBeGreaterThan(0);

    // Act
    const priceGridRows = spectator.queryAll('cos-row');

    component.invisiblePriceGrids.forEach((priceGrid, index) => {
      const minPriceColumn = priceGridRows[index].querySelector(
        'cos-cell.cos-column-minprice'
      );
      //Assert
      expect(minPriceColumn).toHaveText(
        `${priceGrid.Prices[priceGrid.Prices.length - 1]?.Price}`
      );
    });
  });

  it('should display QUR if the price grid is marked as QUR', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceGrids = mockInvisiblePriceGridWithQUR();
    // Assert
    expect(spectator.query(selectors.cosTable)).not.toBeVisible();

    // Act
    spectator.setInput(
      'product',
      mockPresentationProduct((product) => ({
        ...product,
        PriceGrids: priceGrids,
      }))
    );
    spectator.setInput('invisiblePriceGrids', priceGrids);

    // Assert
    expect(component.invisiblePriceGrids.length).toBeGreaterThan(0);
    expect(spectator.query(selectors.cosTable)).toBeVisible();

    // Act
    const priceGridRows = spectator.queryAll('cos-row');

    component.invisiblePriceGrids.forEach((priceGrid, index) => {
      const minPriceColumn = priceGridRows[index].querySelector(
        'cos-cell.cos-column-minprice'
      );
      // Assert
      expect(minPriceColumn).toHaveText('QUR');
    });
  });

  it('should allow users to add the price grid to the presentation', () => {
    // Arrange
    const { spectator, component } = testSetup();
    // Act
    const product = mockPresentationProduct();
    spectator.setInput('product', product);
    spectator.setInput(
      'invisiblePriceGrids',
      product.PriceGrids.filter(({ IsVisible }) => IsVisible === false)
    );
    // Assert
    expect(spectator.component.invisiblePriceGrids.length).toBeGreaterThan(0);

    const priceGridRows = spectator.queryAll('cos-row');

    component.invisiblePriceGrids.forEach((priceGrid, index) => {
      const addButton = priceGridRows[index].querySelector(
        'cos-cell.cos-column-action > button'
      )!;
      const addButtonIcon = addButton.querySelector('i');
      expect(addButtonIcon).toHaveClass('fa fa-plus');
      expect(addButton).toHaveText('Add');
    });
  });

  it('should generate a list of suggested price grids when more than 1 price grid is available on the product', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceGrids = mockInvisiblePriceGrid();

    // Assert
    expect(spectator.query(selectors.cosTable)).not.toBeVisible();

    // Act
    spectator.setInput(
      'product',
      mockPresentationProduct((product) => ({
        ...product,
        PriceGrids: priceGrids,
      }))
    );
    spectator.setInput('invisiblePriceGrids', priceGrids);

    // Assert
    expect(component.invisiblePriceGrids.length).toBeGreaterThan(0);
    expect(spectator.query(selectors.cosTable)).toBeVisible();

    const tableRows = spectator.queryAll('cos-row');
    expect(tableRows.length).toEqual(component.invisiblePriceGrids.length);
  });

  it('should display all of the attribute values associated with the price grid in that attribute’s column', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceGrids = mockInvisiblePriceGrid();

    // Assert
    expect(spectator.query(selectors.cosTable)).not.toBeVisible();

    // Act
    spectator.setInput(
      'product',
      mockPresentationProduct((product) => ({
        ...product,
        PriceGrids: priceGrids,
      }))
    );
    spectator.setInput('invisiblePriceGrids', priceGrids);

    // Assert
    expect(component.invisiblePriceGrids.length).toBeGreaterThan(0);
    expect(spectator.query(selectors.cosTable)).toBeVisible();

    const tableRows = spectator.queryAll('cos-row');
    expect(tableRows.length).toEqual(component.invisiblePriceGrids.length);

    tableRows.forEach((row, i) => {
      const attributeColumn = row.querySelector('cos-cell');
      if (i == 0) {
        expect(
          component.invisiblePriceGrids[i]!.AttributeByTypes!['IMMD']!
            .Values[0]!.Value
        ).toBe('Unimprinted');

        expect(attributeColumn).toHaveText('Unimprinted');
      } else {
        expect(
          component.invisiblePriceGrids[i].AttributeByTypes['IMMD'].Values[0]
            .Value
        ).toBe('Embroidery');
        expect(
          component.invisiblePriceGrids[i].AttributeByTypes['IMMD'].Values[1]
            .Value
        ).toBe('Acrylic');

        expect(attributeColumn).toHaveText('Embroidery,   Acrylic');
      }
    });
  });

  it('should display just one attribute / option name if the price grid only has one set for the variant', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceGrids = mockInvisiblePriceGrid();

    // Assert
    expect(spectator.query(selectors.cosTable)).not.toBeVisible();

    // Act
    spectator.setInput(
      'product',
      mockPresentationProduct((product) => ({
        ...product,
        PriceGrids: priceGrids,
      }))
    );
    spectator.setInput('invisiblePriceGrids', priceGrids);

    // Assert
    expect(component.invisiblePriceGrids.length).toBeGreaterThan(0);
    expect(spectator.query(selectors.cosTable)).toBeVisible();

    const tableRows = spectator.queryAll('cos-row');
    expect(tableRows.length).toEqual(component.invisiblePriceGrids.length);

    expect(component.invisiblePriceGrids[0].AttributeTypes!.length).toEqual(1);
    expect(component.columnHeaders.length).toEqual(3);
    expect(component.columnHeaders[0]).toEqual(
      component.invisiblePriceGrids[0].AttributeTypes![0]
    );
    expect(component.columnHeaders[1]).toEqual('minprice');
  });

  it('should display both attribute / option names if the price grid is based on two attributes/options in the variant', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const priceGrids = mockInvisiblePriceGridWithTwoAttributes();

    // Assert
    expect(spectator.query(selectors.cosTable)).not.toBeVisible();

    // Act
    spectator.setInput(
      'product',
      mockPresentationProduct((product) => ({
        ...product,
        PriceGrids: priceGrids,
      }))
    );
    spectator.setInput('invisiblePriceGrids', priceGrids);

    // Assert
    expect(component.invisiblePriceGrids.length).toBeGreaterThan(0);
    expect(spectator.query(selectors.cosTable)).toBeVisible();

    const tableRows = spectator.queryAll('cos-row');
    expect(tableRows.length).toEqual(component.invisiblePriceGrids.length);

    expect(component.invisiblePriceGrids[0].AttributeTypes!.length).toEqual(2);
    expect(component.columnHeaders.length).toEqual(4);
    expect(component.columnHeaders[0]).toEqual(
      component.invisiblePriceGrids[0].AttributeTypes![0]
    );
    expect(component.columnHeaders[1]).toEqual(
      component.invisiblePriceGrids[1].AttributeTypes![1]
    );
  });
});
