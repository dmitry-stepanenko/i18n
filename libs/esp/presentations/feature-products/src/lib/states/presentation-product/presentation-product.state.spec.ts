import { PresentationProductSet } from '.';

import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Actions, NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';

import { Price, PriceGrid } from '@cosmos/types-common';
import { PresentationsApiService } from '@esp/presentations/data-access-presentations';
import { mockPresentationProduct } from '@esp/presentations/mocks-presentations';
import {
  PresentationProduct,
  PresentationProductCharge,
} from '@esp/presentations/types';

import { PresentationProductActions } from '../../actions';
import { PresentationProductQueries } from '../../queries';

import {
  PresentationProductState,
  createCustomPrice,
} from './presentation-product.state';

describe('PresentationProductState', () => {
  const createService = createServiceFactory({
    service: PresentationProductState,
    imports: [NgxsModule.forRoot([PresentationProductState])],
  });

  const testSetup = (properties?: Partial<PresentationsApiService>) => {
    const mockedPresentationProduct = mockPresentationProduct();
    const spectator = createService({
      providers: [
        mockProvider(PresentationsApiService, {
          getProductById: () => of(mockedPresentationProduct),
          ...properties,
        }),
      ],
    });
    const store = spectator.inject(Store);
    const actions$ = spectator.inject(Actions);
    return { spectator, store, actions$, mockedPresentationProduct };
  };

  it('should create', () => {
    expect(() => testSetup()).not.toThrow();
  });

  it('should set the product', () => {
    // Arrange
    const { store } = testSetup();

    // Act
    store.dispatch(new PresentationProductActions.Get(1, 1));

    // Assert
    const state = store.selectSnapshot<PresentationProductSet | null>(
      PresentationProductQueries.getCurrent
    );
    expect(state?.product).toBeDefined();
  });

  it('should patch the charge', () => {
    // Arrange
    const { store } = testSetup();

    const charge = {
      Id: 123,
      IsVisible: true,
      Name: 'Set-up Charge',
    } as PresentationProductCharge;

    const newName = 'Set-up Charge New Name';

    // Act
    store.dispatch(new PresentationProductActions.Get(1, 1));

    store.dispatch(
      new PresentationProductActions.PatchProduct({
        Charges: [charge],
      })
    );

    store.dispatch(
      new PresentationProductActions.PatchCharge(charge, {
        Name: newName,
      })
    );

    // Assert
    const charges = store.selectSnapshot(
      PresentationProductQueries.getCharges(true)
    );
    expect(charges[0].Name).toEqual(newName);
  });

  it('should patch the price', () => {
    // Arrange
    const { store } = testSetup();

    const price = {
      Cost: 500,
      Price: 500,
    } as Price;

    const priceGrid = {
      Id: 123,
      IsVisible: true,
      Prices: [price],
    };

    // Act
    store.dispatch(new PresentationProductActions.Get(1, 1));

    store.dispatch(
      new PresentationProductActions.PatchProduct({
        PriceGrids: [priceGrid],
      })
    );

    store.dispatch(
      new PresentationProductActions.PatchPrice(priceGrid, price, {
        Cost: 100,
        Price: 200,
      })
    );

    // Assert
    const [{ Prices }] = store.selectSnapshot(
      PresentationProductQueries.getPriceGrids
    );
    expect(Prices[0].Cost).toEqual(100);
    expect(Prices[0].Price).toEqual(200);
  });

  it('should toggle price visibility', () => {
    // Arrange
    const { store } = testSetup();

    const price = {
      IsVisible: true,
    } as Price;

    const priceGrid = {
      Id: 123,
      IsVisible: true,
      Prices: [price],
    };

    // Act
    store.dispatch(new PresentationProductActions.Get(1, 1));

    store.dispatch(
      new PresentationProductActions.PatchProduct({
        PriceGrids: [priceGrid],
      })
    );

    store.dispatch(
      new PresentationProductActions.TogglePriceVisibility(
        priceGrid,
        price,
        false
      )
    );

    // Assert
    const [{ Prices }] = store.selectSnapshot(
      PresentationProductQueries.getPriceGrids
    );
    expect(Prices[0].IsVisible).toEqual(false);
  });

  it('should remove the price', () => {
    // Arrange
    const { store } = testSetup();

    const price = { Cost: 100 } as Price;

    const priceGrid = {
      Id: 123,
      IsVisible: true,
      Prices: [price],
    } as PriceGrid;

    // Act
    store.dispatch(new PresentationProductActions.Get(1, 1));

    store.dispatch(
      new PresentationProductActions.PatchProduct({
        PriceGrids: [priceGrid],
      })
    );

    store.dispatch(
      new PresentationProductActions.RemovePrice(priceGrid, price)
    );

    // Assert
    const [{ Prices }] = store.selectSnapshot(
      PresentationProductQueries.getPriceGrids
    );
    expect(Prices).toEqual([]);
  });

  it('should toggle the visibility of all prices', () => {
    // Arrange
    const { store } = testSetup();

    const priceGrid = {
      Id: 123,
      IsVisible: true,
      Prices: [{ IsVisible: false }, { IsVisible: false }],
    } as PriceGrid;

    // Act
    store.dispatch(new PresentationProductActions.Get(1, 1));

    store.dispatch(
      new PresentationProductActions.PatchProduct({
        PriceGrids: [priceGrid],
      })
    );

    store.dispatch(
      new PresentationProductActions.ToggleVisibilityOfAllPrices(
        priceGrid,
        /* isVisible */ true
      )
    );

    // Assert
    const [{ Prices }] = store.selectSnapshot(
      PresentationProductQueries.getPriceGrids
    );

    Prices.forEach((price: PresentationProduct) =>
      expect(price.IsVisible).toEqual(true)
    );
  });

  it('should make all price grids visible', () => {
    // Arrange
    const { store } = testSetup();

    // Act
    store.dispatch(new PresentationProductActions.Get(1, 1));

    store.dispatch(
      new PresentationProductActions.PatchProduct({
        PriceGrids: [
          {
            Id: 123,
            IsVisible: false,
            Prices: [],
          },
          {
            Id: 456,
            IsVisible: false,
            Prices: [],
          },
        ],
      })
    );

    store.dispatch(new PresentationProductActions.AddAllPriceGrids());

    // Assert
    const priceGrids = store.selectSnapshot(
      PresentationProductQueries.getPriceGrids
    );

    priceGrids.forEach((priceGrid: any) =>
      expect(priceGrid.IsVisible).toEqual(true)
    );
  });

  it('should add a custom quantity', () => {
    // Arrange
    const { store } = testSetup();

    const priceGrid = {
      Id: 123,
      IsVisible: true,
      Prices: [],
    } as PriceGrid;

    // Act
    store.dispatch(new PresentationProductActions.Get(1, 1));

    store.dispatch(
      new PresentationProductActions.PatchProduct({
        PriceGrids: [priceGrid],
      })
    );

    store.dispatch(new PresentationProductActions.AddCustomQuantity(priceGrid));

    // Assert
    const [{ Prices }] = store.selectSnapshot(
      PresentationProductQueries.getPriceGrids
    );

    expect(Prices[0]).toEqual(createCustomPrice());
  });

  it('should restore prices to their original values', () => {
    // Arrange
    const priceGrid = {
      Id: 123,
      IsVisible: true,
      Prices: [
        {
          Cost: 100,
          Price: 200,
          DiscountPercent: 0.5,
        },
      ],
    };

    const { store, mockedPresentationProduct } = testSetup({
      getProductById: () =>
        of({
          ...mockedPresentationProduct,
          PriceGrids: [priceGrid],
        }),
      getOriginalPriceGrid: () => of(priceGrid),
    });

    // Act
    store.dispatch([
      new PresentationProductActions.Get(1, 1),
      new PresentationProductActions.GetOriginalPriceGrid(1, 1, 1),
    ]);

    store.dispatch(
      new PresentationProductActions.PatchPriceGrid(priceGrid, {
        Prices: [{ Cost: 500 }, { Cost: 600 }],
      })
    );

    // Assert
    expect(
      store.selectSnapshot(PresentationProductQueries.getPriceGrids)[0].Prices
    ).toEqual([{ Cost: 500 }, { Cost: 600 }]);

    // Act
    store.dispatch(new PresentationProductActions.RestoreToDefault(priceGrid));

    // Assert
    expect(
      store.selectSnapshot(PresentationProductQueries.getPriceGrids)[0].Prices
    ).toEqual([
      {
        Cost: 100,
        Price: 200,
        DiscountPercent: 0.5,
      },
    ]);
  });
});
