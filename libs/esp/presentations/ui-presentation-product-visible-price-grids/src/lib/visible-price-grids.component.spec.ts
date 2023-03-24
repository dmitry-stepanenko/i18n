import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Injectable } from '@angular/core';
import { SpectatorOverrides } from '@ngneat/spectator';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NgxsModule, Store } from '@ngxs/store';
import { InitialState } from '@ngxs/store/internals';
import { of } from 'rxjs';

import { ConfigModule } from '@cosmos/config';
import { mockVisiblePriceGrid } from '@cosmos/mocks-common';
import {
  LocalState,
  LocalStateRenderStrategy,
  asDispatch,
  fromSelector,
} from '@cosmos/state';
import { dataCySelector } from '@cosmos/testing';
import { PriceGrid, Range } from '@cosmos/types-common';
import { ConfirmDialogService } from '@cosmos/ui-dialog';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PresentationsQueries } from '@esp/presentations/data-access-presentations';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  EspPresentationsFeatureProductsModule,
  PresentationProductActions,
  PresentationProductQueries,
} from '@esp/presentations/feature-products';
import {
  PresentationMockDb,
  mockPresentationProduct,
} from '@esp/presentations/mocks-presentations';
import { PresentationProduct } from '@esp/presentations/types';
import { VisibleGridPricesComponent } from '@esp/presentations/ui-presentation-product-visible-grid-prices';

import { VisiblePriceGridsModule } from './visible-price-grids.component';

const selectors = {
  addAPriceGrid: dataCySelector('add-a-price-grid'),
  priceGridAccordion: dataCySelector('price-grid-accordion'),
  priceGridAccordionHeader: `${dataCySelector(
    'price-grid-accordion'
  )} .cos-accordion-header`,
  cosInlineEditDisplay: dataCySelector('cos-inline-edit-display'),
  cosInlineEditInput: dataCySelector('cos-inline-edit-input'),
  cosInlineEditStartEditing: dataCySelector('cos-inline-edit-start-editing'),
  cosInlineEditSaveButton: dataCySelector('cos-inline-edit-save-button'),
  priceGridJoinedAttributes: dataCySelector('price-grid-joined-attributes'),
  priceGridPriceRowQuantityInput: `${dataCySelector(
    'price-grid-price-row-quantity'
  )} input`,
  priceGridPriceRowNetCostInput: `${dataCySelector(
    'price-grid-price-row-net-cost'
  )} input`,
  priceGridPriceRowListPriceInput: `${dataCySelector(
    'price-grid-price-row-list-price'
  )} input`,
  priceGridPriceRowMarginInput: `${dataCySelector(
    'price-grid-price-row-margin'
  )} input`,
  priceGridPriceRowOriginalPrice: `cos-cell.cos-column-CostPerUnit > div.original-price`,
  addCustomQuantity: dataCySelector('add-custom-quantity'),
  priceIncludes: dataCySelector('price-includes'),
  resetPriceGrid: dataCySelector('reset-price-grid'),
  removePriceGrid: dataCySelector('remove-price-grid'),
  priceGridDescription: dataCySelector('price-grid-description'),
};

describe('VisiblePriceGridsComponent', () => {
  const presentation = PresentationMockDb.presentation;

  @Injectable()
  class TestLocalState extends LocalState<TestLocalState> {
    readonly presentation = fromSelector(PresentationsQueries.getPresentation);

    readonly product = fromSelector(PresentationProductQueries.getProduct);

    readonly currencyConversion = fromSelector(
      PresentationsQueries.getCurrencyConversion
    );

    readonly visiblePriceGrids = fromSelector(
      PresentationProductQueries.getVisiblePriceGrids
    );

    readonly getOriginalPriceGrid = asDispatch(
      PresentationProductActions.GetOriginalPriceGrid
    );

    readonly addCustomQuantity = asDispatch(
      PresentationProductActions.AddCustomQuantity
    );

    readonly patchPriceGrid = asDispatch(
      PresentationProductActions.PatchPriceGrid
    );

    readonly restoreToDefault = asDispatch(
      PresentationProductActions.RestoreToDefault
    );
  }

  @Component({
    template: `
      <esp-visible-price-grids
        *ngIf="state.product"
        [presentation]="state.presentation"
        [product]="state.product"
        [currencyConversion]="state.currencyConversion"
        [visiblePriceGrids]="state.visiblePriceGrids"
        (getOriginalPriceGrid)="getOriginalPriceGrid($event)"
        (addCustomQuantity)="addCustomQuantity($event)"
        (patchPriceGrid)="patchPriceGrid($event)"
        (restoreToDefault)="restoreToDefault($event)"
      ></esp-visible-price-grids>
    `,
    providers: [TestLocalState],
  })
  class TestComponent {
    constructor(readonly state: TestLocalState) {
      state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });
    }

    getOriginalPriceGrid(priceGridId: number): void {
      this.state.getOriginalPriceGrid(
        this.state.presentation!.Id,
        this.state.product!.Id,
        priceGridId
      );
    }

    addCustomQuantity(priceGrid: PriceGrid): void {
      this.state.addCustomQuantity(priceGrid);
    }

    patchPriceGrid([priceGrid, patchSpec]: [
      PriceGrid,
      Partial<PriceGrid>
    ]): void {
      this.state.patchPriceGrid(priceGrid, patchSpec);
    }

    restoreToDefault(priceGrid: PriceGrid): void {
      this.state.restoreToDefault(priceGrid);
    }
  }

  const createComponent = createComponentFactory({
    component: TestComponent,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      EspPresentationsFeatureProductsModule.forChild(),
      VisiblePriceGridsModule,
      VisibleGridPricesComponent,
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
      CosUtilTranslationsTestingModule.forRoot(),
    ],
    providers: [mockProvider(ConfirmDialogService)],
  });

  const testSetup = async (options?: {
    overrides?: SpectatorOverrides<TestComponent>;
    productRecipe?: (product: PresentationProduct) => PresentationProduct;
  }) => {
    const product = options?.productRecipe
      ? mockPresentationProduct(options?.productRecipe)
      : mockPresentationProduct();

    InitialState.set({
      presentations: {
        items: {
          [presentation.Id]: {
            presentation,
          },
        },
        itemsIds: [presentation.Id],
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
      },
    });

    const spectator = createComponent(options?.overrides);
    await spectator.fixture.whenStable();
    const store = spectator.inject(Store);

    const getProduct = () =>
      store.selectSnapshot(PresentationProductQueries.getProduct);

    const getPriceGrids = () =>
      store.selectSnapshot(PresentationProductQueries.getPriceGrids);

    const getFirstPriceGrid = () => getPriceGrids()[0];

    return {
      store,
      spectator,
      getProduct,
      getPriceGrids,
      getFirstPriceGrid,
      component: spectator.component,
    };
  };

  it('should render "Add a price grid" if there are no visible price grids', async () => {
    // Arrange
    const { spectator } = await testSetup({
      productRecipe: (product) => ({
        ...product,
        PriceGrids: [],
      }),
    });
    // Assert
    expect(spectator.query(selectors.addAPriceGrid)).toBeVisible();
  });

  it('should render a list of `cos-accordion`', async () => {
    // Arrange & act
    const { spectator } = await testSetup();
    // Assert
    expect(spectator.queryAll(selectors.priceGridAccordion).length).toEqual(1);
  });

  it('should display `Price Grid` if the description is empty', async () => {
    // Arrange & act
    const { spectator, getFirstPriceGrid } = await testSetup();
    // Assert
    expect(getFirstPriceGrid().Description).toEqual('');
    expect(spectator.query(selectors.cosInlineEditDisplay)).toHaveText(
      'Price Grid'
    );
  });

  it('should display price grid joined attributes', async () => {
    // Arrange
    const { spectator } = await testSetup({
      productRecipe: (product) => ({
        ...product,
        Attributes: [
          {
            Type: 'SIZE',
            Values: [
              {
                Id: 1,
                Value: 'XL',
              },
              {
                Id: 2,
                Value: '2XL',
              },
              {
                Id: 3,
                Value: '3XL',
              },
              {
                Id: 4,
                Value: '4XL',
              },
              {
                Id: 5,
                Value: '5XL',
              },
            ],
          },
        ],
        PriceGrids: [
          {
            Id: 0,
            IsVisible: true,
            Attributes: [1, 2, 3],
            Prices: [],
          },
        ],
      }),
    });

    // Assert
    expect(spectator.query(selectors.priceGridJoinedAttributes)).toHaveText(
      'XL 2XL 3XL'
    );
  });

  it('should update price grid description', async () => {
    // Arrange
    const { spectator, getFirstPriceGrid } = await testSetup({
      productRecipe: (product) => ({
        ...product,
        PriceGrids: [
          {
            Id: 0,
            IsVisible: true,
            Attributes: [1, 2, 3],
            Prices: [],
            Description: '',
          },
        ],
      }),
    });
    const newDescription = 'New price grid description';

    // Act
    spectator.click(selectors.priceGridAccordionHeader);
    spectator.click(selectors.cosInlineEditStartEditing);

    spectator.typeInElement(newDescription, selectors.cosInlineEditInput);
    spectator.click(selectors.cosInlineEditSaveButton);

    // Assert
    expect(getFirstPriceGrid().Description).toEqual(newDescription);
  });

  it('should add a custom quantity when the button is clicked', async () => {
    // Arrange
    const { spectator } = await testSetup();

    // Assert
    expect(spectator.queryAll('cos-table cos-row').length).toEqual(5);

    // Act
    spectator.click(selectors.addCustomQuantity);

    // Assert
    expect(spectator.queryAll('cos-table cos-row').length).toEqual(6);
  });

  it('should update price includes', async () => {
    // Arrange
    const { spectator, getFirstPriceGrid } = await testSetup();
    const newPriceIncludes = 'New price includes value';

    // Act
    spectator.typeInElement(newPriceIncludes, selectors.priceIncludes);

    // Assert
    expect(getFirstPriceGrid().PriceIncludes).toEqual(newPriceIncludes);
  });

  it('should restore prices to default values when they have been updated', async () => {
    // Arrange
    const { spectator, getFirstPriceGrid } = await testSetup({
      overrides: {
        providers: [
          mockProvider(ConfirmDialogService, {
            confirm: () => of(true),
          }),
        ],
      },
    });

    const {
      Quantity: originalQuantity,
      Cost: originalNetCost,
      Price: originalListPrice,
    } = getFirstPriceGrid().Prices[0];

    // Act
    spectator.typeInElement('200', selectors.priceGridPriceRowQuantityInput);
    spectator.blur(selectors.priceGridPriceRowQuantityInput);

    spectator.typeInElement('25', selectors.priceGridPriceRowNetCostInput);
    spectator.blur(selectors.priceGridPriceRowNetCostInput);

    spectator.typeInElement('40', selectors.priceGridPriceRowListPriceInput);
    spectator.blur(selectors.priceGridPriceRowListPriceInput);

    // Assert
    const [updatedPrice] = getFirstPriceGrid().Prices;
    expect(updatedPrice.Quantity).toEqual({ From: 200, To: 200 });
    expect(updatedPrice.Cost).toEqual(25);
    expect(updatedPrice.Price).toEqual(40);
    // (40 - 25) / 40 = 0.375
    expect(updatedPrice.DiscountPercent).toEqual(0.38);

    // Act
    spectator.click(selectors.resetPriceGrid);

    // Assert
    const [restoredPrice] = getFirstPriceGrid().Prices;
    expect(restoredPrice.Quantity).toEqual(originalQuantity);
    expect(restoredPrice.Cost).toEqual(originalNetCost);
    expect(restoredPrice.Price).toEqual(originalListPrice);
  });

  it('should display a confirmation prompt when the user clicks the Reset Price Grid button', async () => {
    // Arrange
    const { spectator } = await testSetup({
      overrides: {
        providers: [
          mockProvider(ConfirmDialogService, {
            confirm: () => of(true),
          }),
        ],
      },
    });
    const dialog = spectator.inject(ConfirmDialogService);
    const confirmSpy = jest.spyOn(dialog, 'confirm');

    // Act
    spectator.click(selectors.resetPriceGrid);

    // Assert
    expect(confirmSpy).toHaveBeenCalledWith(
      {
        message: 'Are you sure you want to restore prices?',
        confirm: 'Yes, Restore To Default',
        cancel: 'No, Do Not Restore',
      },
      {
        minWidth: '400px',
        width: '400px',
        disableClose: false,
      }
    );
  });

  it('should not reset the price grid if they click cancel', async () => {
    // Arrange
    const { spectator, getFirstPriceGrid } = await testSetup({
      overrides: {
        providers: [
          mockProvider(ConfirmDialogService, {
            confirm: () => of(false),
          }),
        ],
      },
    });

    // Act
    spectator.typeInElement('200', selectors.priceGridPriceRowQuantityInput);
    spectator.blur(selectors.priceGridPriceRowQuantityInput);

    spectator.typeInElement('25', selectors.priceGridPriceRowNetCostInput);
    spectator.blur(selectors.priceGridPriceRowNetCostInput);

    spectator.typeInElement('40', selectors.priceGridPriceRowListPriceInput);
    spectator.blur(selectors.priceGridPriceRowListPriceInput);

    // Assert
    const [updatedPrice] = getFirstPriceGrid().Prices;
    expect(updatedPrice.Quantity).toEqual({ From: 200, To: 200 });
    expect(updatedPrice.Cost).toEqual(25);
    expect(updatedPrice.Price).toEqual(40);
    // (40 - 25) / 40 = 0.375
    expect(updatedPrice.DiscountPercent).toEqual(0.38);

    // Act
    spectator.click(selectors.resetPriceGrid);

    // Assert
    const [restoredPrice] = getFirstPriceGrid().Prices;
    expect(restoredPrice.Quantity).toEqual(updatedPrice.Quantity);
    expect(restoredPrice.Cost).toEqual(updatedPrice.Cost);
    expect(restoredPrice.Price).toEqual(updatedPrice.Price);
  });

  it('should hide the price grid when the button is clicked', async () => {
    // Arrange
    const { spectator, getFirstPriceGrid } = await testSetup();

    // Assert
    expect(getFirstPriceGrid().IsVisible).toEqual(true);

    // Act
    spectator.click(selectors.removePriceGrid);

    // Assert
    expect(getFirstPriceGrid().IsVisible).toEqual(false);
  });

  it('Should display the price grid in a collapsed state by default', async () => {
    // Arrange
    const { spectator, getPriceGrids } = await testSetup();

    const accordians = spectator.queryAll(selectors.priceGridAccordion);

    // Assert
    expect(getPriceGrids().length).not.toEqual(0);
    expect(accordians.length).toBeGreaterThan(0);

    accordians.forEach((accordian) => {
      expect(accordian).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('should add a custom quantity when the button is clicked', async () => {
    // Arrange
    const { spectator } = await testSetup();

    const originalRowsLength = spectator.queryAll('cos-table cos-row').length;
    // Assert
    expect(originalRowsLength).toEqual(5);

    // Act
    spectator.click(selectors.addCustomQuantity);

    // Assert
    expect(spectator.queryAll('cos-table cos-row').length).toEqual(
      originalRowsLength + 1
    );
  });

  describe('Custom Price', () => {
    it('Should display a dash in place of the original price in the custom row', async () => {
      // Arrange
      const { spectator, getFirstPriceGrid } = await testSetup();

      // Assert
      const originalRowsLength = spectator.queryAll('cos-table cos-row').length;
      expect(originalRowsLength).toEqual(5);

      // Act
      spectator.click(selectors.addCustomQuantity);

      // Assert
      const originalPriceCells = spectator.queryAll(
        selectors.priceGridPriceRowOriginalPrice
      );
      expect(originalPriceCells.length).toEqual(originalRowsLength + 1);

      expect(
        originalPriceCells[originalPriceCells.length - 1]
      ).toHaveDescendant('mat-divider');
    });

    it('should allow a user to add up to 10 custom price rows', async () => {
      // Arrange
      const { component, spectator } = await testSetup();
      let addCustomQuantityBtn = spectator.query(selectors.addCustomQuantity)!;
      let originalRowsLength = spectator.queryAll('cos-table cos-row').length;

      // Assert
      expect(originalRowsLength).toEqual(5);
      expect(originalRowsLength).toBeLessThan(10);
      expect(addCustomQuantityBtn).not.toHaveAttribute('disabled');

      // Act
      spectator.click(addCustomQuantityBtn);
      spectator.click(addCustomQuantityBtn);
      spectator.click(addCustomQuantityBtn);
      spectator.click(addCustomQuantityBtn);
      spectator.click(addCustomQuantityBtn);
      spectator.detectComponentChanges();
      originalRowsLength = spectator.queryAll('cos-table cos-row').length;
      addCustomQuantityBtn = spectator.query(selectors.addCustomQuantity)!;

      // Assert
      expect(originalRowsLength).toEqual(10);
      expect(originalRowsLength).toEqual(10);
      expect(addCustomQuantityBtn).toHaveAttribute('disabled');
    });

    it('should allow users to delete custom quantity rows that have been added', async () => {
      // Arrange
      const { spectator } = await testSetup();
      let originalRowsLength = spectator.queryAll('cos-table cos-row').length;

      // Assert
      expect(originalRowsLength).toEqual(5);

      // Act
      spectator.click(selectors.addCustomQuantity);
      const newOriginalRows = spectator.queryAll('cos-table cos-row');

      // Assert
      expect(newOriginalRows.length).toEqual(originalRowsLength + 1);
      const newRows = newOriginalRows.filter((rows, index) => {
        return ![0, 1, 2, 3, 4].includes(index);
      });
      newRows.forEach((row) => {
        const removeBtn = row.querySelector('button')!;
        const removeBtnIcon = removeBtn.querySelector('i')!;
        expect(removeBtn).toBeVisible();
        expect(removeBtn).toHaveDescendant(removeBtnIcon);
        expect(removeBtnIcon).toHaveClass('fa fa-trash-alt text-lg');
      });

      // Act
      spectator.click(newRows[0].querySelector('button')!);
      originalRowsLength = spectator.queryAll('cos-table cos-row').length;

      // Assert
      expect(originalRowsLength).toEqual(newOriginalRows.length - 1);
      expect(originalRowsLength).toEqual(5);
    });

    it('Should allow a user to edit the net cost, proit margin, price of the custom row', async () => {
      // Arrange
      const { spectator } = await testSetup();
      const originalRowsLength = spectator.queryAll('cos-table cos-row').length;

      // Assert
      expect(originalRowsLength).toEqual(5);

      // Act
      spectator.click(selectors.addCustomQuantity);
      const newOriginalRows = spectator.queryAll('cos-table cos-row');

      // Assert
      expect(newOriginalRows.length).toEqual(originalRowsLength + 1);
      const newRows = newOriginalRows.filter((rows, index) => {
        return ![0, 1, 2, 3, 4].includes(index);
      });
      newRows.forEach((row) => {
        const discountCell = row.querySelectorAll('cos-cell')[0];
        const netCostCell = row.querySelectorAll('cos-cell')[1];
        const originalPrice = row.querySelectorAll('cos-cell')[2];
        const margin = row.querySelectorAll('cos-cell')[3];
        const discountPrice = row.querySelectorAll('cos-cell')[4];

        expect(discountCell.querySelector('input')).toBeVisible();
        expect(netCostCell.querySelector('input')).toBeVisible();
        expect(margin.querySelector('input')).toBeVisible();
        expect(discountPrice.querySelector('input')).toBeVisible();
        expect(originalPrice.querySelector('div')).toBeVisible();
      });
    });
  });
  it('should display the Quantity', async () => {
    // Arrange
    const { getFirstPriceGrid, spectator } = await testSetup();
    const { Quantity: originalQuantity } = getFirstPriceGrid().Prices[0];
    const [price] = getFirstPriceGrid().Prices;
    const priceGridPriceRowQuantityInput = spectator.query(
      selectors.priceGridPriceRowQuantityInput
    );

    // Assert
    expect(priceGridPriceRowQuantityInput).toBeVisible();
    expect(price.Quantity).toEqual(originalQuantity);
  });

  it('should display price rows in order by quantity in ascending order', async () => {
    // Arrange
    const { getFirstPriceGrid } = await testSetup();
    const prices = getFirstPriceGrid().Prices;

    // Assert
    prices.forEach((price: any, i: any) => {
      if (i < prices.length - 1) {
        const currentQuantity = getFirstPriceGrid().Prices[i].Quantity as Range;
        const nextQuantity = getFirstPriceGrid().Prices[i + 1]
          .Quantity as Range;
        expect(currentQuantity.From).toBeLessThan(nextQuantity.From);
        expect(currentQuantity.To).toBeLessThan(nextQuantity.To);
      }
    });
  });
  it('should display Price Grid Name', async () => {
    // Arrange & Act
    const { spectator, getFirstPriceGrid } = await testSetup({
      productRecipe: (product) => ({
        ...product,
        PriceGrids: mockVisiblePriceGrid(),
      }),
    });

    const priceGridDescriptionInput = spectator.query(
      selectors.priceGridDescription
    );
    // Assert
    expect(priceGridDescriptionInput).toHaveText(
      getFirstPriceGrid().Description
    );
  });
  it('should display the Price Includes information for each price grid', async () => {
    // Arrange
    const { getFirstPriceGrid, spectator } = await testSetup();
    const textAreaMaxlength = 30;
    const { PriceIncludes: originalPriceIncludes } = getFirstPriceGrid();
    const priceGridPriceIncludesTextArea = spectator.query(
      selectors.priceIncludes
    );

    // Assert
    expect(priceGridPriceIncludesTextArea).toBeVisible();
    expect(
      priceGridPriceIncludesTextArea!.getAttribute('ng-reflect-model')
    ).toEqual(originalPriceIncludes.slice(0, textAreaMaxlength));
  });

  it('should be able to edit input fields in the price grid', async () => {
    // Arrange
    const { spectator, getFirstPriceGrid } = await testSetup({
      overrides: {
        providers: [
          mockProvider(ConfirmDialogService, {
            confirm: () => of(true),
          }),
        ],
      },
    });

    // Act
    spectator.typeInElement('200', selectors.priceGridPriceRowQuantityInput);
    spectator.blur(selectors.priceGridPriceRowQuantityInput);

    spectator.typeInElement('25', selectors.priceGridPriceRowNetCostInput);
    spectator.blur(selectors.priceGridPriceRowNetCostInput);

    spectator.typeInElement('40', selectors.priceGridPriceRowListPriceInput);
    spectator.blur(selectors.priceGridPriceRowListPriceInput);

    // Assert
    const [updatedPrice] = getFirstPriceGrid().Prices;
    expect(updatedPrice.Quantity).toEqual({ From: 200, To: 200 });
    expect(updatedPrice.Cost).toEqual(25);
    expect(updatedPrice.Price).toEqual(40);
    // (40 - 25) / 40 = 0.375
    expect(updatedPrice.DiscountPercent).toEqual(0.38);

    // Act
    spectator.typeInElement('35', selectors.priceGridPriceRowMarginInput);
    spectator.blur(selectors.priceGridPriceRowMarginInput);

    // Assert
    const [latestUpdatedPrice] = getFirstPriceGrid().Prices;
    expect(latestUpdatedPrice.Quantity).toEqual(updatedPrice.Quantity);
    expect(latestUpdatedPrice.Cost).toEqual(updatedPrice.Cost);
    expect(latestUpdatedPrice.DiscountPercent).toEqual(0.35);
    //(38.462 - 25) = 0.350
    expect(latestUpdatedPrice.Price).toEqual(38.462);
  });
});
