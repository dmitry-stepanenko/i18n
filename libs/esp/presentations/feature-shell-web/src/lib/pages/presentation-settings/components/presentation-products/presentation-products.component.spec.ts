import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, flush } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { Actions, NgxsModule, Store, ofActionDispatched } from '@ngxs/store';
import { EMPTY, of } from 'rxjs';

import { CosProductCardComponent } from '@cosmos/components/product-card';
import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import {
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import {
  EspPresentationsDataAccessPresentationsModule,
  PresentationsActions,
  PresentationsApiService,
  PresentationsState,
} from '@esp/presentations/data-access-presentations';
import {
  PresentationMockDb,
  mockPresentationProduct,
} from '@esp/presentations/mocks-presentations';
import {
  LikeDislike,
  PresentationProduct,
  PresentationProductStatus,
  PresentationStatus,
} from '@esp/presentations/types';
import { PresentationProductStatusPipe } from '@esp/presentations/util-presentation-product-pipes';

import {
  PresentationProductsComponent,
  PresentationProductsModule,
} from './presentation-products.component';

const presentation = PresentationMockDb.presentation;

const selectors = {
  productCard: 'cos-product-card',
  actionsMenuButton: 'button.actions-menu-btn',
  presentationProductsGrid: '.presentation-products-grid',
  searchSort: '.search-sort',
  visibleProducts: dataCySelector('visible-products'),
  hiddenProducts: dataCySelector('hidden-products'),
  showInPresentation: dataCySelector('show-in-presentation'),
  matTabLabels: '.mat-tab-labels',
  matTabLabelContent: '.mat-tab-label-content',
  removeFromPresentation: dataCySelector('remove-from-presentation'),
  cosProductCardActionsMenuButton: dataCySelector(
    'cos-product-card-action-menu-button'
  ),
  cosProductCardIndicator: '.cos-product-card-indicator',
  cosProducCardDetailsQuoteRequestedText: dataCySelector(
    'cos-product-card-details__quote-requested-text'
  ),
};

describe('PresentationProductsComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationProductsComponent,
    imports: [
      RouterTestingModule,
      HttpClientTestingModule,
      NgxsModule.forRoot([PresentationsState]),
      PresentationProductsModule,
      EspPresentationsDataAccessPresentationsModule,
      ConfigModule.forRoot({
        ardorApiUrl: 'ardorApiUrl',
        venusApiUrl: 'venusApiUrl',
        siriusApiUrl: 'siriusApiUrl',
      }),
      CosUtilTranslationsTestingModule.forRoot(),
    ],
    providers: [
      mockProvider(PresentationsApiService, {
        updateProductVisibility: () => of('Observable that emits nothing.'),
        removeProduct: () => EMPTY,
        sortProducts: () => EMPTY,
      }),
      PresentationProductStatusPipe,
      provideLanguageScopes(LanguageScope.EspPresentations),
    ],
  });

  const testSetup = (options?: { visibleProducts?: PresentationProduct[] }) => {
    const visibleProducts: PresentationProduct[] = [];
    const hiddenProducts: PresentationProduct[] = [];

    for (let index = 1; index <= 3; index++) {
      // We'll have 3 visible products with IDs `[1, 2, 3]`.
      visibleProducts.push(
        mockPresentationProduct((product) => {
          product.Id = index;
          product.IsVisible = true;
          return product;
        })
      );
    }

    for (let index = 4; index <= 7; index++) {
      // We'll have 4 hidden products with IDs `[4, 5, 6, 7]`.
      hiddenProducts.push(
        mockPresentationProduct((product) => {
          product.Id = index;
          product.IsVisible = false;
          return product;
        })
      );
    }

    const products = (options?.visibleProducts || visibleProducts).concat(
      hiddenProducts
    );
    // Do not run the change detection before we call `store.reset` since local state properties
    // will equal `undefined`.
    const spectator = createComponent({
      detectChanges: false,
      props: {
        sortDisabled: true,
      },
    });
    const store = spectator.inject(Store);
    const actions$ = spectator.inject(Actions);
    store.reset({
      presentations: {
        items: {
          [presentation.Id]: {
            presentation: {
              ...presentation,
              Products: products,
            },
          },
        },
        itemIds: [presentation.Id],
        currentId: presentation.Id,
      },
    });

    spectator.detectComponentChanges();

    return {
      spectator,
      store,
      actions$,
      component: spectator.component,
      state: spectator.component.state,
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    // Arrange
    const { component } = testSetup();
    // Assert
    expect(component).toBeTruthy();
  });

  it("should display the header 'Edit Products' correctly", () => {
    // Arrange
    const { spectator } = testSetup();
    const header = spectator.query('.header-style-22');

    // Assert
    expect(header).toBeVisible();
    expect(header).toHaveText('Edit Products');
  });

  it("should display the Tabs correctly as 'All Products' and 'Hidden' respectively", () => {
    // Arrange
    const { spectator } = testSetup();
    const tabHeaders = spectator.queryAll('.mat-tab-label-content');

    // Assert
    expect(tabHeaders).toBeVisible();
    expect(tabHeaders).toHaveLength(2);
    expect(tabHeaders[0]).toHaveText('All Products');
    expect(tabHeaders[1]).toHaveText('Hidden');
  });

  describe('Sort By menu', () => {
    it("should display 'Sort By' menu label", () => {
      // Arrange
      const { spectator } = testSetup();
      const sortByMenuLabel = spectator.query(
        `${selectors.searchSort} > label`
      );

      // Assert
      expect(sortByMenuLabel).toBeVisible();
    });

    it('should display the Sort By select control', () => {
      // Arrange
      const { spectator } = testSetup();
      const sortByControl = spectator.query(
        `${selectors.searchSort} > .cos-form-field-input-wrapper > select`
      );

      expect(sortByControl).toBeVisible();
    });

    it('should display correct menu options', () => {
      // Arrange
      const { component, spectator } = testSetup();
      const sortByOptions = spectator
        .query(
          `${selectors.searchSort} > .cos-form-field-input-wrapper > select`
        )!
        .querySelectorAll('option');

      // Assert
      expect(sortByOptions).toHaveLength(component.sortMenuOptions.length);
      sortByOptions.forEach((sortByOption, index) => {
        expect(sortByOption).toHaveText(component.sortMenuOptions[index].name);
      });
    });
    it("should call the store's dispatch when the sort value is changed", () => {
      // Arrange
      const { spectator, store, component, state } = testSetup();

      const sortByControl = spectator.query(
        `${selectors.searchSort} > .cos-form-field-input-wrapper > select`
      ) as HTMLSelectElement;

      expect(sortByControl).toBeVisible();

      expect(sortByControl).toHaveSelectedOptions('None');
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      //Act
      spectator.selectOption(
        sortByControl,
        component.sortMenuOptions[1].value!
      );
      component.sortProducts(component.sortMenuOptions[1].value!);
      spectator.detectComponentChanges();
      //Assert
      expect(dispatchSpy).toHaveBeenCalledWith(
        new PresentationsActions.SortProducts(
          state.presentation!.Id,
          component.sortMenuOptions[1].value!
        )
      );
      expect(sortByControl).toHaveSelectedOptions(
        component.sortMenuOptions[1].value!
      );
    });
    it('Post Share - should hide the sort drop down', () => {
      // Arrange
      const { spectator, state, store } = testSetup();

      // Assert
      expect(spectator.query(selectors.searchSort)).toBeVisible();

      // Act
      store.dispatch(
        new PresentationsActions.PatchPresentation(state.presentation!.Id, {
          Status: PresentationStatus.PostShare,
        })
      );
      spectator.detectComponentChanges();

      // Assert
      expect(spectator.query(selectors.searchSort)).not.toBeVisible();
    });
  });

  it('should display the product cards when products are available', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const productCards = spectator.queryAll('cos-product-card');

    // Assert
    expect(productCards).toBeVisible();
    expect(productCards).toHaveLength(component.state.visibleProducts!.length);
  });
  it('Post Share - should hide the "hide from presentation" and "delete from presentation" option in the 3 dot menu', () => {
    // Arrange
    const { spectator, state, store } = testSetup();
    let productCards = spectator.queryAll(selectors.productCard);
    // Assert
    expect(productCards.length).toEqual(state.visibleProducts!.length);

    let actionMenus = productCards.map((productCard) =>
      productCard.querySelector(selectors.actionsMenuButton)
    );

    // Assert
    expect(actionMenus.length).toEqual(productCards.length);

    // Act
    spectator.click(actionMenus[0]!);

    const productCardActions = spectator.queryAll('.cos-menu-item');
    // Assert
    // expect(productCardActions[0]).toContainText('Add to Order');
    expect(productCardActions[0]).toContainText('Hide from Presentation');
    expect(productCardActions[1]).toContainText('Delete from Presentation');

    // Act
    store.dispatch(
      new PresentationsActions.PatchPresentation(state.presentation!.Id, {
        Status: PresentationStatus.PostShare,
      })
    );
    spectator.detectComponentChanges();
    productCards = spectator.queryAll(selectors.productCard);
    actionMenus = productCards.map((productCard) =>
      productCard.querySelector(selectors.actionsMenuButton)
    );

    // Assert
    expect(actionMenus[0]).not.toExist();
    // expect(spectator.query('.add-to-presentation')).not.toBeVisible();
    // expect(spectator.query('.remove-from-presentation')).not.toBeVisible();
  });

  it("should display the following options against each product card: 'Add to Order', 'Hide from Presentation' and 'Delete from Presentation' along with their respective icons", () => {
    // Arrange
    const { spectator } = testSetup();
    const menuTriggerBtn = spectator
      .queryAll('.cos-product-card-actions')[0]
      .querySelector('.mat-menu-trigger.actions-menu-btn')!;

    // Assert
    expect(menuTriggerBtn).toBeVisible();

    // Act now
    spectator.click(menuTriggerBtn);
    spectator.detectComponentChanges();
    const menuOptions = spectator.queryAll('.cos-menu-item');
    const menuOptionsIcons = spectator.queryAll('.cos-menu-item > i');

    // Re-Assert
    // expect(menuOptionsIcons[0]).toHaveClass('fa fa-file-invoice');
    expect(menuOptionsIcons[0]).toHaveClass('fa fa-eye-slash');
    expect(menuOptionsIcons[1]).toHaveClass('fa fa-trash-alt');
    // expect(menuOptions[0]).toHaveDescendant(menuOptionsIcons[0]);
    expect(menuOptions[0]).toHaveDescendant(menuOptionsIcons[0]);
    expect(menuOptions[1]).toHaveDescendant(menuOptionsIcons[1]);
    // expect(menuOptions[0]).toHaveText('Add to Order');
    expect(menuOptions[0]).toHaveText('Hide from Presentation');
    expect(menuOptions[1]).toHaveText('Delete from Presentation');
  });

  it('should allow a user to hide a product from the presentation if they have edit rights to the project', () => {
    // Arrange
    const { component, spectator, store } = testSetup();
    const menuTriggerBtn = spectator
      .queryAll('.cos-product-card-actions')[0]
      .querySelector('.mat-menu-trigger.actions-menu-btn')!;
    jest.spyOn(component, 'updateProductVisibility');
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    // Act
    spectator.click(menuTriggerBtn);
    spectator.detectComponentChanges();
    const menuOptions = spectator.queryAll('.cos-menu-item');
    spectator.click(menuOptions[0]);
    spectator.detectComponentChanges();

    // Re-Assert
    expect(component.updateProductVisibility).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should delete the product when `Delete from presentation` button is clicked', () => {
    // Arrange
    const { component, spectator, state, store } = testSetup();
    const menuTriggerBtn = spectator
      .queryAll('.cos-product-card-actions')[0]
      .querySelector(selectors.cosProductCardActionsMenuButton)!;
    jest.spyOn(component, 'removeProduct');
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    // Act
    spectator.click(menuTriggerBtn);
    spectator.click(selectors.removeFromPresentation);

    // Re-Assert
    expect(component.removeProduct).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(
      new PresentationsActions.RemoveProduct(
        state.presentation!.Id,
        state.visibleProducts![0].Id
      )
    );
  });

  it("should redirect the user to appropriate product's page for a specific product", () => {
    // Arrange
    const { component, spectator } = testSetup();
    const productCardsLinks = spectator.queryAll(
      `${selectors.presentationProductsGrid} > .cursor-pointer`
    );

    // Assert
    expect(productCardsLinks).toHaveLength(
      component.state.visibleProducts!.length
    );
    // productCardsLinks.forEach((link, index) => {
    //   expect(link.getAttribute('ng-reflect-router-link')).toEqual(
    //     `/presentations,${presentation.Id},product,${
    //       component.state.visibleProducts![index].Id
    //     }`
    //   );
    // });
  });

  describe('3 dot menu and its actions', () => {
    it('should display a 3 dot menu on each product', () => {
      // Arrange
      const { spectator, state } = testSetup();
      const productCards = spectator.queryAll(selectors.productCard);
      // Assert
      expect(productCards.length).toEqual(state.visibleProducts!.length);

      const actionMenus = productCards.map((productCard) =>
        productCard.querySelector(selectors.actionsMenuButton)
      );

      // Assert
      expect(actionMenus.length).toEqual(productCards.length);

      // Act
      spectator.click(actionMenus[0]!);

      const productCardActions = spectator.queryAll('.cos-menu-item');
      // Assert
      // expect(productCardActions[0]).toContainText('Add to Order');
      expect(productCardActions[0]).toContainText('Hide from Presentation');
      expect(productCardActions[1]).toContainText('Delete from Presentation');
    });

    it('should switch to `Hidden` tab and display 3 dots menu on each product', fakeAsync(() => {
      // Arrange
      const { spectator, state } = testSetup();
      const matTabLabelsContainer = spectator.query(selectors.matTabLabels);
      // Assert
      expect(matTabLabelsContainer!.children.length).toEqual(2);
      const [allProductsMatTabLabel, hiddenProductsMatTabLabel] =
        matTabLabelsContainer!.children;
      expect(allProductsMatTabLabel).toContainText('All Products');
      expect(hiddenProductsMatTabLabel).toContainText('Hidden');
      // Act
      spectator.click(hiddenProductsMatTabLabel);
      // Wait for animations to flush.
      spectator.tick();
      spectator.detectComponentChanges();
      // Assert
      expect(spectator.query(dataCySelector('hidden-products'))).toExist();
      const actionMenus = spectator
        .queryAll(selectors.productCard)
        .map((productCard) =>
          productCard.querySelector(selectors.actionsMenuButton)
        );
      expect(actionMenus.length).toEqual(state.hiddenProducts!.length);
      flush();
    }));

    it('Post Share - should disable drag & drop', () => {
      // Arrange
      const { spectator, state, store } = testSetup();
      let productCards = spectator.queryAll(CosProductCardComponent);

      // Assert
      expect(productCards.length).toBeGreaterThan(0);
      expect(productCards).toHaveLength(state.visibleProducts!.length);
      productCards.forEach((productCard) =>
        expect(productCard.isDraggable).toEqual(true)
      );

      // Act
      store.dispatch(
        new PresentationsActions.PatchPresentation(state.presentation!.Id, {
          Status: PresentationStatus.PostShare,
        })
      );
      spectator.detectComponentChanges();
      productCards = spectator.queryAll(CosProductCardComponent);

      // Assert
      expect(productCards.length).toBeGreaterThan(0);
      productCards.forEach((productCard) =>
        expect(productCard.isDraggable).toEqual(false)
      );
    });
  });

  describe('visible products', () => {
    it('should allow a user to hide a product from the presentation', () => {
      // Arrange
      const { spectator, component, state, actions$ } = testSetup();
      const updateProductVisibilitySpy = jest.spyOn(
        component,
        'updateProductVisibility'
      );
      const subscribeSpy = jest.fn();
      const subscription = actions$
        .pipe(
          ofActionDispatched(
            PresentationsActions.UpdatePresentationProductVisibility
          )
        )
        .subscribe(subscribeSpy);

      // Act
      spectator.click(spectator.query(selectors.actionsMenuButton)!);
      spectator.click(
        spectator.query(dataCySelector('hide-from-presentation'))!
      );

      const productCards = spectator.queryAll(selectors.productCard);

      try {
        // Assert
        expect(updateProductVisibilitySpy).toHaveBeenCalled();
        // Ensure that the `UpdatePresentationProductVisibility` has been dispatched.
        expect(subscribeSpy).toHaveBeenCalledWith({
          productId: 1,
          isVisible: false,
        });
        // We had 3 visible products initially.
        expect(state.visibleProducts!.length).toEqual(2);
        expect(productCards.length).toEqual(state.visibleProducts!.length);
        // We had 4 hidden products initially.
        expect(state.hiddenProducts!.length).toEqual(5);
      } finally {
        updateProductVisibilitySpy.mockRestore();
        subscription.unsubscribe();
      }
    });
  });

  describe('hidden products', () => {
    it('should display all of the hidden products added to the presentation', fakeAsync(() => {
      // Arrange
      const { spectator, state } = testSetup();
      const matTabLabelsContainer = spectator.query(selectors.matTabLabels);
      // Assert
      expect(matTabLabelsContainer!.children.length).toEqual(2);
      const [allProductsMatTabLabel, hiddenProductsMatTabLabel] =
        matTabLabelsContainer!.children;
      expect(allProductsMatTabLabel).toContainText('All Products');
      expect(hiddenProductsMatTabLabel).toContainText('Hidden');
      // Act
      spectator.click(hiddenProductsMatTabLabel);
      // Wait for animations to flush.
      spectator.tick();
      spectator.detectComponentChanges();
      // Assert
      expect(spectator.query(dataCySelector('hidden-products'))).toExist();
      const hiddenProductCards = spectator.queryAll(selectors.productCard);
      expect(hiddenProductCards.length).toEqual(state.hiddenProducts!.length);
      flush();
    }));

    it('should allow a user to make a product visible', fakeAsync(() => {
      // Arrange
      const { spectator, state } = testSetup();
      const matTabLabelsContainer = spectator.query(selectors.matTabLabels);
      const [allProductsMatTabLabel, hiddenProductsMatTabLabel] =
        matTabLabelsContainer!.children;
      // Act
      spectator.click(hiddenProductsMatTabLabel);
      // Wait for animations to flush.
      spectator.tick();
      spectator.detectComponentChanges();

      // Assert
      expect(state.visibleProducts!.length).toEqual(3);
      expect(state.hiddenProducts!.length).toEqual(4);

      spectator.click(spectator.query(selectors.actionsMenuButton)!);
      spectator.click(spectator.query(selectors.showInPresentation)!);

      // Assert
      expect(state.visibleProducts!.length).toEqual(4);
      expect(state.hiddenProducts!.length).toEqual(3);

      // Act
      spectator.click(allProductsMatTabLabel);
      // Wait for animations to flush.
      spectator.tick();
      spectator.detectComponentChanges();

      // Assert
      expect(
        spectator.query(selectors.visibleProducts)!.children.length
      ).toEqual(state.visibleProducts!.length);
      flush();
    }));

    it("should delete the product when 'Delete from presentation' button is clicked", fakeAsync(() => {
      // Arrange
      const { spectator, state, component, store } = testSetup();
      const matTabLabelsContainer = spectator.query(selectors.matTabLabels);
      const hiddenProductsMatTabLabel = matTabLabelsContainer!.children[1];
      // Act
      spectator.click(hiddenProductsMatTabLabel);
      spectator.tick();
      spectator.detectComponentChanges();

      // Arrange
      const menuTriggerBtn = spectator
        .queryAll('.cos-product-card-actions')[0]
        .querySelector('.mat-menu-trigger.actions-menu-btn');
      jest.spyOn(component, 'removeProduct');
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      // Act
      spectator.click(menuTriggerBtn!);
      spectator.detectComponentChanges();
      const menuOptions = spectator.queryAll('.cos-menu-item');
      spectator.click(menuOptions[1]);
      spectator.detectComponentChanges();

      // Re-Assert
      expect(component.removeProduct).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(
        new PresentationsActions.RemoveProduct(
          state.presentation!.Id,
          state.hiddenProducts![0].Id
        )
      );
      flush();
    }));
  });

  describe('product status (https://asicentral.atlassian.net/browse/ENCORE-13585)', () => {
    // https://asicentral.atlassian.net/browse/ENCORE-13585
    // 1. Should display the viewed icon on the product cards in the presentation editor if a product has been viewed.
    //   1.1 Should display the disliked icon instead if the product has been both viewed & disliked.
    //     1.2 Should display the shopping cart icon if the product has been added to the shopping cart.
    //       1.3 Should display the Quote Requested card treatment if the product has been quote requested. Regardless of if the product has been viewed or disliked.

    const prerequisites = [
      {
        name: '(1.3) should display the quote requested status',
        updateProduct: (product: PresentationProduct) => {
          product.Status = PresentationProductStatus.QuoteRequested;
        },
        expectedIcon: 'check',
        additionalExpectation: (visibleProductElements: Element) => {
          const productElements =
            visibleProductElements.querySelectorAll('div');
          // Assert
          expect(productElements.length).toBeGreaterThan(0);
          productElements.forEach((productElement) => {
            expect(
              productElement.querySelector(
                selectors.cosProducCardDetailsQuoteRequestedText
              )
            ).toBeDefined();
          });
        },
      },
      {
        name: '(1.2) should display the shopping cart status',
        updateProduct: (product: PresentationProduct) => {
          product.Status = PresentationProductStatus.InCart;
        },
        expectedIcon: 'shopping-cart',
      },
      {
        name: '(1.1) should display the disliked icon if the product has been both viewed & disliked',
        updateProduct: (product: PresentationProduct) => {
          product.Like = LikeDislike.Disliked;
        },
        expectedIcon: 'thumbs-down',
      },
    ];

    for (const prerequisite of prerequisites) {
      it(prerequisite.name, () => {
        // Arrange & act
        const visibleProducts = [
          mockPresentationProduct((product) => {
            product.IsVisible = true;
            prerequisite.updateProduct(product);
            return product;
          }),
        ];

        const { spectator } = testSetup({ visibleProducts });
        const visibleProductElements = spectator.query(
          selectors.visibleProducts
        )!;
        const productCardIndicators = visibleProductElements.querySelectorAll(
          selectors.cosProductCardIndicator
        );

        // Assert
        expect(productCardIndicators.length).toBeGreaterThan(0);
        productCardIndicators.forEach((productCardIndicator) => {
          const icon = productCardIndicator.querySelector('i');
          expect(icon).toHaveClass(`fa-${prerequisite.expectedIcon}`);
        });
        prerequisite.additionalExpectation?.(visibleProductElements);
      });
    }
  });

  describe('Order of product tabs (https://asicentral.atlassian.net/browse/ENCORE-27788)', () => {
    it('should render the tabs in the order mentioned in ACs', () => {
      // Arrange
      const tabs = [
        'All Products',
        'Added to Cart',
        'Disliked Products',
        'Seen Products',
        'Unseen Products',
        'Hidden',
      ];
      const { component, spectator, store } = testSetup();
      const products = [
        {
          IsVisible: true,
        },
        {
          IsVisible: true,
          Status: PresentationProductStatus.InCart,
        },
        {
          IsVisible: true,
          Like: LikeDislike.Disliked,
        },
        {
          IsVisible: true,
          Status: PresentationProductStatus.Viewed,
        },
        {
          IsVisible: true,
          Status: PresentationProductStatus.None,
        },
        {
          IsVisible: false,
        },
      ] as PresentationProduct[];

      // Act
      store.dispatch(
        new PresentationsActions.PatchPresentation(
          component.state.presentation!.Id,
          {
            Products: products,
          }
        )
      );
      spectator.detectComponentChanges();
      // Assert
      const matTabLabels = spectator.queryAll(selectors.matTabLabelContent);
      expect(matTabLabels.length).toEqual(tabs.length);
      matTabLabels.forEach((matTabLabel, index) =>
        expect(matTabLabel.textContent).toEqual(tabs[index])
      );
    });
  });
});
