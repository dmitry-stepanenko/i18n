import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NgxsModule, Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { EMPTY, asyncScheduler, of, scheduled, timer } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { CosAnalyticsService } from '@cosmos/analytics/common';
import { ConfigModule } from '@cosmos/config';
import { FeatureFlagsService } from '@cosmos/feature-flags';
import { dataCySelector } from '@cosmos/testing';
import { ConfirmDialogService } from '@cosmos/ui-dialog';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import {
  PresentationMockDb,
  mockPresentationProduct,
  mockPriceGridForAttributeHidden,
  mockProductForAttributeHidden,
} from '@esp/presentations/mocks-presentations';
import {
  Presentation,
  PresentationProduct,
  PresentationProductAttribute,
} from '@esp/presentations/types';
import {
  ProductDetailsImageComponent,
  ProductDetailsImageModule,
  ProductDetailsImagesSelectorComponent,
  ProductDetailsImagesSelectorModule,
} from '@esp/products/feature-product-details-image';

import {
  PresentationProductPriceGridsComponent,
  PresentationProductPriceGridsModule,
} from './components';
import {
  PresentationProductVariantComponent,
  PresentationProductVariantModule,
} from './components/presentation-product-variant';
import { PresentationProductLocalState } from './presentation-product.local-state';
import {
  PresentationProductPage,
  PresentationProductPageModule,
} from './presentation-product.page';

const selectors = {
  editProductDetailsTitle: dataCySelector('edit-product-details-title'),
  saveChangesButton: dataCySelector('save-changes-button'),
  cancelChangesButton: dataCySelector('cancel-changes-button'),
  noteTextarea: dataCySelector('presentation-product__customer-note-textarea'),
  noteLabel: dataCySelector('presentation-product__customer-note-label'),
  productNameInput: dataCySelector('presentation-product__product-name-input'),
  productNameLabel: dataCySelector('presentation-product__product-name-label'),
  summaryTextarea: dataCySelector('presentation-product__summary-textarea'),
  summaryLabel: dataCySelector('presentation-product__summary-label'),
  previewButton: dataCySelector('presentation-product__preview-button'),
  previousNextButtons: dataCySelector('presentation-product__prev-next'),
  previousButton: dataCySelector('presentation-product__prev'),
  nextButton: dataCySelector('presentation-product__next'),
  productVariantsTitle: dataCySelector('product-variants-title'),
};

describe('PresentationProductPage', () => {
  const createComponent = createComponentFactory({
    component: PresentationProductPage,
    imports: [
      NgxsModule.forRoot(),
      HttpClientTestingModule,
      PresentationProductPageModule,
      RouterTestingModule,
      CosUtilTranslationsTestingModule.forRoot(),
      ConfigModule.forRoot({
        venusApiUrl: 'someApiUrl',
        customerPortalUrl: 'customerPortalUrl',
      }),
    ],
    providers: [
      {
        provide: FeatureFlagsService,
        useValue: {
          isEnabled: () => true,
        },
      },
      mockProvider(MatDialog, {
        openDialogs: [],
      }),
      mockProvider(Store, {
        select: () => of('empty'),
      }),
    ],
    overrideModules: [
      [
        ProductDetailsImageModule,
        {
          set: {
            declarations: MockComponents(ProductDetailsImageComponent),
            exports: MockComponents(ProductDetailsImageComponent),
          },
        },
      ],
      [
        ProductDetailsImagesSelectorModule,
        {
          set: {
            declarations: MockComponents(ProductDetailsImagesSelectorComponent),
            exports: MockComponents(ProductDetailsImagesSelectorComponent),
          },
        },
      ],
      [
        PresentationProductVariantModule,
        {
          set: {
            declarations: MockComponents(PresentationProductVariantComponent),
            exports: MockComponents(PresentationProductVariantComponent),
          },
        },
      ],
      [
        PresentationProductPriceGridsModule,
        {
          set: {
            declarations: MockComponents(
              PresentationProductPriceGridsComponent
            ),
            exports: MockComponents(PresentationProductPriceGridsComponent),
          },
        },
      ],
    ],
  });

  const testSetup = (options?: Partial<PresentationProductLocalState>) => {
    const spectator = createComponent({
      providers: [
        mockProvider(ConfirmDialogService, {
          confirm: jest.fn(() => of()),
        }),
        mockProvider(PresentationProductLocalState, {
          hasLoaded: true,
          isLoading: false,
          product: mockPresentationProduct(),
          presentation: PresentationMockDb.presentation as Presentation,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          getPresentation: () => {},
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          get: () => {},
          connect() {
            return of(this);
          },
          ...options,
        }),
      ],
      detectChanges: false,
    });
    // @ts-expect-error readonly property.
    spectator.component.productImprint = EMPTY;
    spectator.component.productPricing = EMPTY;
    spectator.component.priceRange = EMPTY;
    spectator.component.clientDiscount = EMPTY;
    spectator.detectChanges();
    return { spectator, component: spectator.component };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  it("should display a loader when the page hasn't loaded", () => {
    // Arrange
    const { spectator } = testSetup({
      hasLoaded: false,
      isLoading: true,
      product: null,
    });
    const loader = spectator.query('esp-presentation-product-loader');
    // Assert
    expect(loader).toExist();
  });

  it("should display the header 'Edit Product details' correctly", () => {
    // Arrange
    const { spectator } = testSetup({
      hasLoaded: true,
      isLoading: false,
      product: mockPresentationProduct(),
    });

    const editProductsHeader = spectator.query(
      selectors.editProductDetailsTitle
    );

    // Assert
    expect(editProductsHeader).toBeVisible();
    expect(editProductsHeader).toHaveText('Edit Product Details');
  });

  it("should display the Sort Menu button correctly with text 'Product Detail Menu'", () => {
    // Arrange
    const { spectator } = testSetup({
      hasLoaded: true,
      isLoading: false,
      product: mockPresentationProduct(),
    });

    const sortMenuBtn = spectator.query('.presentation-product__mobile-menu');
    const sortMenuBtnIcon = spectator.query(
      '.presentation-product__mobile-menu > i'
    );

    // Assert
    expect(sortMenuBtn).toBeVisible();
    expect(sortMenuBtn).toHaveText('Product Detail Menu');
    expect(sortMenuBtn).toHaveDescendant(sortMenuBtnIcon);
    expect(sortMenuBtnIcon).toHaveClass('fa fa-ellipsis-h');
  });

  it("should display the menu options as 'Save Changes', 'Preview' and 'Next Product', respectively", () => {
    // Arrange
    const { spectator } = testSetup({
      hasLoaded: true,
      isLoading: false,
      product: mockPresentationProduct(),
    });

    const sortMenuBtn = spectator.query('.presentation-product__mobile-menu');
    spectator.click(sortMenuBtn);
    spectator.detectComponentChanges();
    const menuOptions = spectator.queryAll(
      '.presentation-product__mobile-controls > button'
    );
    const menuOptionsIcons = spectator.queryAll(
      '.presentation-product__mobile-controls > button > i'
    );

    // Assert

    // expect(menuOptions[0]).toHaveText('Cancel');
    // expect(menuOptions[0]).toHaveDescendant(menuOptionsIcons[0]);
    // expect(menuOptionsIcons[0]).toHaveClass('fa fa-times');
    expect(menuOptions[0]).toHaveText('Save');
    expect(menuOptions[0]).toHaveDescendant(menuOptionsIcons[0]);
    expect(menuOptionsIcons[0]).toHaveClass('fa fa-save');

    expect(menuOptions[1]).toHaveText('Preview');
    expect(menuOptions[1]).toHaveDescendant(menuOptionsIcons[1]);
    expect(menuOptionsIcons[1]).toHaveClass('fa fa-eye');
  });

  it('should display the presentation product content', () => {
    // Arrange
    const { spectator } = testSetup();

    const productContent = spectator.query('.presentation-product__pg-content');
    // Assert
    expect(productContent).toBeVisible();
  });

  it('should show the content header', () => {
    // Arrange
    const { spectator } = testSetup();

    const productContentHeader = spectator.query('.header-style-22');
    // Assert
    expect(productContentHeader).toBeVisible();
  });

  it('should display the Supplier info card', () => {
    // Arrange
    const { spectator } = testSetup();

    const infoCard = spectator.query('.supplier-info');
    const infoCardComponent = spectator.query('cos-supplier');
    // Assert
    expect(infoCard).toBeVisible();
    expect(infoCardComponent).toBeVisible();
  });

  it('should open supplier detail in a new tab', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const analyticsService = spectator.inject(CosAnalyticsService);
    const analyticsServiceSpy = jest
      .spyOn(analyticsService, 'track')
      .mockImplementation();
    const windowSpy = jest.spyOn(window, 'open').mockImplementation();

    // Act
    component.goToSupplier();

    // Assert
    expect(analyticsServiceSpy).toHaveBeenCalledWith({
      action: 'Supplier Clicked',
      properties: {
        id: component.state.product.Supplier.ExternalId,
        productId: component.state.product.Id,
      },
    });
    expect(windowSpy).toHaveBeenCalledWith(
      `/suppliers/${component.state.product.Supplier.ExternalId}`
    );
  });

  it("should display the info card caption correctly with text 'All supplier information is hidden from the customer presentation.'", () => {
    // Arrange
    const { spectator } = testSetup();

    const infoCardCaption = spectator.query('.header-style-12-shark.caption');
    const infoCardCaptionIcon = spectator.query(
      '.header-style-12-shark.caption > i'
    );

    // Assert
    expect(infoCardCaption).toBeVisible();
    expect(infoCardCaption).toHaveText(
      'All supplier information is hidden from the customer presentation.'
    );
    expect(infoCardCaption).toHaveDescendant(infoCardCaptionIcon);
    expect(infoCardCaptionIcon).toHaveClass('fa fa-eye-slash');
  });

  it("should display 'Product Details' header", () => {
    // Arrange
    const { spectator } = testSetup();

    const productDetailsHeader = spectator.queryAll('.header-style-18')[0];
    // Assert
    expect(productDetailsHeader).toBeVisible();
    expect(productDetailsHeader).toHaveText('Product Details');
  });

  it("should display the input 'Product Name' label correctly", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    const productNameInputLabel = spectator.query(selectors.productNameLabel);

    // Assert
    expect(productNameInputLabel).toBeVisible();
    expect(productNameInputLabel).toHaveText('Product Name');
  });

  it('Product Name input should be populated with the supplier product name by default', () => {
    // Arrange
    const presentationProduct = mockPresentationProduct();
    const { spectator } = testSetup();
    const productNameInput = spectator.query(selectors.productNameInput);
    // Assert
    expect(productNameInput).toBeVisible();
    expect(productNameInput).toHaveValue(presentationProduct.Name);
  });

  it('Product Name input should be an editable field', () => {
    // Arrange
    const { spectator } = testSetup();
    const productNameInput = spectator.query(selectors.productNameInput);

    // Assert
    expect(productNameInput).not.toHaveAttribute('disabled');
  });

  it('Product Name input should have a character limit of 60 characters', () => {
    // Arrange
    const { spectator } = testSetup();
    const productNameInput = spectator.query(selectors.productNameInput);

    // Assert
    expect(productNameInput.getAttribute('maxlength')).toEqual('60');
  });

  it('Product Name input should be required', () => {
    // Arrange
    const { spectator } = testSetup();
    const productNameInput = spectator.query(selectors.productNameInput);

    // Assert
    expect(productNameInput).toHaveAttribute('required');
  });

  it("should display the input component 'Enter a Product Name' correctly", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    const productNameInput = spectator.query(selectors.productNameInput);

    // Assert
    expect(productNameInput).toBeVisible();
    expect(productNameInput.getAttribute('placeholder')).toEqual(
      'Enter a Product Name'
    );
  });

  it("should display the input 'Summary' label correctly", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    const productSummaryInputLabel = spectator.query(selectors.summaryLabel);

    // Assert
    expect(productSummaryInputLabel).toBeVisible();
    expect(productSummaryInputLabel).toHaveText('Summary');
  });

  it('Summary input should be populated with the supplier product summary by default', () => {
    // Arrange
    const presentationProduct = mockPresentationProduct();
    const { spectator } = testSetup({
      product: presentationProduct,
    });
    const productSummaryInput = spectator.query(selectors.summaryTextarea);

    // Assert
    expect(productSummaryInput).toBeVisible();
    expect(productSummaryInput).toHaveValue(presentationProduct.Summary);
  });

  it('Summary input should be an editable field', () => {
    // Arrange
    const { spectator } = testSetup();
    const productSummaryInput = spectator.query(selectors.summaryTextarea);

    // Assert
    expect(productSummaryInput).not.toHaveAttribute('disabled');
  });

  it('Summary input should have a character limit of 130 characters', () => {
    // Arrange
    const { spectator } = testSetup();
    const productSummaryInput = spectator.query(selectors.summaryTextarea);

    // Assert
    expect(productSummaryInput.getAttribute('maxlength')).toEqual('130');
  });

  it("should display the input component 'Enter a Summary' correctly", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    const productDescriptionInput = spectator.query('.product-description');

    // Assert
    expect(productDescriptionInput).toBeVisible();
    expect(productDescriptionInput.getAttribute('placeholder')).toEqual(
      'Enter a Summary'
    );
  });

  it("should display the input 'Note to Customer' label correctly", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    const productNoteToCustomerInputLabel = spectator.query(
      selectors.noteLabel
    );

    // Assert
    expect(productNoteToCustomerInputLabel).toBeVisible();
    expect(productNoteToCustomerInputLabel).toHaveText('Note to Customer');
  });

  it('Note to Customer input should be empty by default', () => {
    // Arrange & Act
    const presentationProduct = { ...mockPresentationProduct(), Note: '' };
    const { spectator } = testSetup({
      product: presentationProduct,
    });

    // Act
    const productNoteToCustomerInput = spectator.queryAll(
      selectors.noteTextarea
    );

    // Assert
    expect(productNoteToCustomerInput).toBeVisible();
    expect(productNoteToCustomerInput).toHaveValue('');
  });

  it('should display the additional note (customer note) if one was entered on the presentation product', () => {
    // Arrange & Act
    const presentationProduct = {
      ...mockPresentationProduct(),
      Note: 'test note',
    };
    const { spectator } = testSetup({
      product: presentationProduct,
    });

    // Act
    const productNoteToCustomerInput = spectator.query(selectors.noteTextarea);

    // Assert
    expect(productNoteToCustomerInput).toBeVisible();
    expect(productNoteToCustomerInput).toHaveValue('test note');
  });

  it('Note to Customer input should be an editable field', () => {
    // Arrange
    const { spectator } = testSetup();
    const productNoteToCustomerInput = spectator
      .queryAll('cos-form-field')[2]
      .querySelector('textarea');

    // Assert
    expect(productNoteToCustomerInput).not.toHaveAttribute('disabled');
  });

  it('Note to Customer input should have a character limit of 250 characters', () => {
    // Arrange
    const { spectator } = testSetup();
    const productNoteToCustomerInput = spectator.query(selectors.noteTextarea);

    // Assert
    expect(productNoteToCustomerInput.getAttribute('maxlength')).toEqual('250');
  });

  it("should display the input component 'Enter a Note to Customer' correctly", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    const productNoteToCustomerInput = spectator.query(selectors.noteTextarea);

    // Assert
    expect(productNoteToCustomerInput).toBeVisible();
    expect(productNoteToCustomerInput.getAttribute('placeholder')).toEqual(
      'Enter a Note to Customer'
    );
  });

  it("should display the 'Product Variants' header correctly", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    const productVariantsHeader = spectator.query(
      selectors.productVariantsTitle
    );

    // Assert
    expect(productVariantsHeader).toBeVisible();
    expect(productVariantsHeader).toHaveText('Product Variants');
  });

  it('should disable the `Save changes` button until the save is completed', fakeAsync(() => {
    // Arrange
    const { spectator } = testSetup({
      isDirty: true,
      save: () => timer(1000).pipe(map(() => undefined)),
      product: { ...mockPresentationProduct(), Attributes: null },
    });

    const saveChangesButton = spectator.query(selectors.saveChangesButton);

    // Assert
    expect(saveChangesButton).not.toBeDisabled();

    // Act
    spectator.click(saveChangesButton);

    // Assert
    expect(saveChangesButton).toBeDisabled();

    // Act
    tick(1000);

    // Assert
    expect(saveChangesButton).not.toBeDisabled();
  }));

  it('should enable the Save Changes button when an unsaved change is pending and all required fields are populated', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const saveBtn = spectator.query(selectors.saveChangesButton);

    // Assert
    expect(saveBtn).toHaveAttribute('disabled');
    expect(component.canSave).toBeFalsy();

    // Act
    component.form.markAsDirty();
    spectator.detectComponentChanges();

    // Assert
    expect(saveBtn).not.toHaveAttribute('disabled');
    expect(component.canSave).toBeTruthy();
  });

  it('should not enable the Save Changes button when the product name field is blank', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const saveBtn = spectator.query(selectors.saveChangesButton);

    // Assert
    expect(saveBtn).toHaveAttribute('disabled');
    expect(component.canSave).toBeFalsy();

    // Act
    component.form.markAsDirty();
    spectator.detectComponentChanges();

    // Assert
    expect(saveBtn).not.toHaveAttribute('disabled');
    expect(component.canSave).toBeTruthy();
    const productNameInput = spectator.query(selectors.productNameInput);

    // Act
    spectator.typeInElement('', productNameInput);
    spectator.detectComponentChanges();

    // Assert
    expect(component.form.valid).toBeFalsy();
    expect(saveBtn).toHaveAttribute('disabled');
    expect(component.canSave).toBeFalsy();
  });

  describe('Preview button', () => {
    it('should open the preview PDP of the product currently being edited in a new tab', () => {
      // Arrange
      const { component, spectator } = testSetup();
      const previewBtn = spectator.query(
        '.presentation-product__preview-button'
      );
      const analyticsService = spectator.inject(CosAnalyticsService);
      const analyticsServiceSpy = jest
        .spyOn(analyticsService, 'track')
        .mockImplementation();
      const tokenService = spectator.inject(AuthTokenService);

      jest.spyOn(window, 'open').mockImplementation();

      // Assert
      expect(previewBtn).toBeVisible();

      // Act
      component.previewPresentationProduct();

      expect(analyticsServiceSpy).toHaveBeenCalledWith({
        action: 'Presentation Preview',
        properties: {
          id: component.state.presentation?.Id,
        },
      });

      // Assert
      expect(window.open).toHaveBeenCalledWith(
        `customerPortalUrl/presentations/${
          component.state.presentation!.Id
        }/products/${component.state.product!.Id}?token=${tokenService.token}`
      );
    });

    it('should prompt the user to confirm saving the changes', () => {
      // Arrange
      const { spectator } = testSetup({
        isDirty: true,
      });

      const previewBtn = spectator.query(
        '.presentation-product__preview-button'
      )!;
      const confirmDialogService = spectator.inject(ConfirmDialogService);
      const dialogSpy = jest.spyOn(confirmDialogService, 'confirm');

      // Act
      spectator.click(previewBtn);

      // Assert
      expect(dialogSpy).toHaveBeenCalledWith(
        {
          message: `Would you like to save your changes before opening the preview?`,
          confirm: 'Save Changes',
          cancel: 'Cancel',
        },
        {
          disableClose: false,
        }
      );
    });
  });

  xit('should show Color attribute / variant section when at least one value exist on the product', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.product.Attributes = [
      { Type: 'PRCL' } as PresentationProductAttribute,
    ];
    spectator.detectComponentChanges();

    // Assert
    // expect(component.color).toBeTruthy();
  });

  xit('should show Size attribute / variant section when at least one value exist on the product', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.product.Attributes = [
      { Type: 'SIZE' } as PresentationProductAttribute,
    ];
    spectator.detectComponentChanges();

    // Assert
    // expect(component.size).toBeTruthy();
  });

  xit('should show Shape attribute / variant section when at least one value exist on the product', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.product.Attributes = [
      { Type: 'PRSP' } as PresentationProductAttribute,
    ];
    spectator.detectComponentChanges();

    // Assert
    // expect(component.shape).toBeTruthy();
  });

  xit('should show Material attribute / variant section when at least one value exist on the product', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.product.Attributes = [
      { Type: 'MTRL' } as PresentationProductAttribute,
    ];
    spectator.detectComponentChanges();

    // Assert
    // expect(component.material).toBeTruthy();
  });

  describe('warning message during save', () => {
    // checkPriceGridForAttribute is a function that checks if you have a price grid selected that is based on Size, Material,
    // Shape, Color and Imprint Method that are not visible in the presentation. Returns true if its visible and false if not
    let product: PresentationProduct;
    beforeEach(() => {
      product = { ...mockProductForAttributeHidden() } as PresentationProduct;
    });
    it('should not show warning if price grid attribute not hidden', () => {
      const { component } = testSetup({
        product,
        visiblePriceGrids: mockPriceGridForAttributeHidden(),
      });

      expect(component.checkPriceGridForAttribute()).toBe(true);
    });

    it('should show warning if price grid attribute hidden', () => {
      product.Attributes.filter((a) => a.Id === 68889162)[0].Values.filter(
        (v) => v.Id === 769611274
      )[0].IsVisible = false;
      const { component } = testSetup({
        product,
        visiblePriceGrids: mockPriceGridForAttributeHidden(),
      });

      expect(component.checkPriceGridForAttribute()).toBe(false);
    });
  });

  describe('previous and next product navigation', () => {
    it('should allow user to return to the presentation edit screen', () => {
      const { component, spectator } = testSetup();

      const router = spectator.inject(Router);

      jest.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.backToPresentation();
      expect(router.navigate).toHaveBeenCalledWith([
        '/projects',
        component.state.presentation.ProjectId,
        'presentations',
        component.state.presentation.Id,
      ]);
    });

    it('should allow a user to navigate to the next product if there is another product after the currently viewed product', () => {
      const testMockProducts = new Array(5).fill(mockPresentationProduct());
      const { component, spectator } = testSetup({
        presentation: {
          ...PresentationMockDb.presentation,
          Products: [...testMockProducts],
        },
      });
      const route = spectator.inject(ActivatedRoute);
      const router = spectator.inject(Router);
      const routerSpy = jest
        .spyOn(router, 'navigate')
        .mockReturnValue(Promise.resolve(true));
      jest.spyOn(component, 'navigateToProduct');
      const productNextBtn = spectator.query(selectors.nextButton);

      if (component.state.presentation.Products.length < 2) {
        expect(selectors.previousNextButtons).not.toBeVisible();
      }
      if (component.state.presentation.Products.length > 1) {
        expect(selectors.previousNextButtons).toBeVisible();
        expect(productNextBtn).not.toHaveClass('disabled');
        expect(productNextBtn).toHaveText('Next Product');
      }

      spectator.click(productNextBtn);
      const nextProduct =
        component.state.presentation.Products[
          component.currentProductIndex + 1
        ];

      expect(component.navigateToProduct).toHaveBeenCalledWith(nextProduct);
      expect(routerSpy).toHaveBeenCalledWith(
        ['../../product', nextProduct.Id],
        {
          relativeTo: route,
        }
      );
    });

    // TODO
    // it('should allow a user to navigate to the previous product, if  there is another product before the product currently being viewed', () => {
    //   const testMockProducts = new Array(5).fill(mockPresentationProduct());
    //   const { component, spectator } = testSetup({
    //     presentation: {
    //       ...PresentationMockDb.presentation,
    //       Products: [...testMockProducts],
    //     },
    //   });
    //   const route = spectator.inject(ActivatedRoute);
    //   const router = spectator.inject(Router);
    //   const routerSpy = jest
    //     .spyOn(router, 'navigate')
    //     .mockReturnValue(Promise.resolve(true));
    //   jest.spyOn(component, 'navigateToProduct');
    //   const productPreviousBtn = spectator.query(selectors.previousButton);

    //   component.currentProductIndex = 2;
    //   spectator.detectChanges();
    //   console.log(219, component.currentProductIndex);

    //   if (component.state.presentation.Products.length < 2) {
    //     expect(selectors.previousNextButtons).not.toBeVisible();
    //   }
    //   if (component.state.presentation.Products.length > 1) {
    //     expect(selectors.previousNextButtons).toBeVisible();
    //     // component.currentProductIndex = 1;
    //     // spectator.detectChanges();
    //     console.log(220, component.currentProductIndex);
    //     // expect(productPreviousBtn).not.toHaveClass('disabled');
    //     expect(productPreviousBtn).toHaveText('Previous Product');
    //   }

    //   spectator.click(productPreviousBtn);
    //   const prevProduct =
    //     component.state.presentation.Products[
    //       component.currentProductIndex - 1
    //     ];

    //   expect(component.navigateToProduct).toHaveBeenCalledWith(prevProduct);
    //   expect(routerSpy).toHaveBeenCalledWith(
    //     ['../../product', prevProduct.Id],
    //     {
    //       relativeTo: route,
    //     }
    //   );
    // });

    it('should allow the user navigate to the previous and next product', () => {
      const testMockProducts = new Array(5).fill(mockPresentationProduct());

      const { component } = testSetup({
        presentation: {
          ...PresentationMockDb.presentation,
          Products: [...testMockProducts],
        },
      });
      if (component.state.presentation.Products.length < 2) {
        expect(selectors.previousNextButtons).not.toBeVisible();
      }
      if (component.state.presentation.Products.length > 1) {
        expect(selectors.previousNextButtons).toBeVisible();
        expect(selectors.nextButton).not.toHaveClass('disabled');
      }
    });
  });

  describe('checking the cancel button status', () => {
    it('should discard pending changes when the user clicks cancel', async () => {
      // Arrange
      const { component, spectator } = testSetup();
      const confirmDialogService = spectator.inject(ConfirmDialogService, true);
      jest
        .spyOn(confirmDialogService, 'confirm')
        .mockReturnValue(scheduled([true], asyncScheduler));

      jest.spyOn(component.form, 'reset');

      // Act
      await component.cancel();

      // Assert
      expect(component.form.reset).toHaveBeenCalledWith(
        component.state.product
      );
    });

    it('should display the cancel button for pending changes', () => {
      // Arrange
      const { spectator } = testSetup({
        isDirty: true,
      });

      const cancelChangesButton = spectator.query(
        selectors.cancelChangesButton
      );

      // Assert
      expect(cancelChangesButton).toBeVisible();
    });

    it('should prompt the user to confirm canceling the changes', () => {
      // Arrange
      const { spectator } = testSetup({
        isDirty: true,
      });

      const cancelChangesButton = spectator.query(
        selectors.cancelChangesButton
      );
      const confirmDialogService = spectator.inject(ConfirmDialogService);
      const dialogSpy = jest.spyOn(confirmDialogService, 'confirm');

      // Act
      spectator.click(cancelChangesButton);

      // Assert
      expect(dialogSpy).toHaveBeenCalledWith(
        {
          message: `You have made changes to this product. Are you sure you do not want to save your work?`,
          confirm: 'Yes',
          cancel: 'No',
        },
        {
          disableClose: false,
        }
      );
    });
  });
});
