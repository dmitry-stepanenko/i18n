import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { Router } from '@angular/router';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Navigate } from '@ngxs/router-plugin';
import { Actions, NgxsModule, Store } from '@ngxs/store';
import * as moment from 'moment';
import { of, throwError } from 'rxjs';

import { ToastActions } from '@cosmos/components/types-toast';
import { NgxsActionCollector } from '@cosmos/testing';
import { TOAST_MESSAGES } from '@esp/presentations/data-access-presentations';
import { mockPresentationProduct } from '@esp/presentations/mocks-presentations';
import {
  Presentation,
  PresentationProduct,
  PresentationSettings,
  PresentationStatus,
} from '@esp/presentations/types';

import { PresentationsActions } from '../../actions';
import { PresentationsApiService } from '../../api/presentations-api.service';
import { PresentationsQueries } from '../../queries';
import { ConfigureProductsButtonComponent } from '../../services/presentations-toast-messages-presenter';

import { PresentationsState } from './presentations.state';

const MOCK_GENERATED_LINK = 'link';
const MOCK_EMAIL = {
  To: [],
  CC: [],
  BCC: [],
  ReplyTo: [],
  PersonalNote: 'test',
};

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: () => Promise.resolve(),
  },
});

describe('PresentationsState', () => {
  const createService = createServiceFactory({
    imports: [
      NgxsModule.forRoot([PresentationsState]),
      NgxsActionCollector.collectActions(),
      HttpClientTestingModule,
    ],
    service: PresentationsState,
    providers: [
      mockProvider(Router, {
        navigate: jest.fn(),
      }),
      mockProvider(PresentationsApiService, {
        generateShareLink: () => of(MOCK_GENERATED_LINK),
        presentationEmail: () => of(MOCK_EMAIL),
      }),
    ],
  });

  const testSetup = () => {
    const spectator = createService();

    const actions$ = spectator.inject(Actions);
    const http = spectator.inject(HttpTestingController);
    const router = spectator.inject(Router);
    const state = spectator.inject(PresentationsState);
    const presentationsService = spectator.inject(PresentationsApiService);
    const actionCollector = spectator.inject(NgxsActionCollector);
    const actionsDispatched = actionCollector.dispatched;
    const store = spectator.inject(Store);

    function getDispatchedActionsOfType<T>(actionType: Type<T>): T[] {
      return actionsDispatched.filter((item) => item instanceof actionType);
    }

    const getHiddenProducts = (): PresentationProduct[] =>
      store.selectSnapshot(PresentationsQueries.getHiddenProducts);
    const getVisibleProducts = (): PresentationProduct[] =>
      store.selectSnapshot(PresentationsQueries.getVisibleProducts);
    const getPresentation = (): Presentation =>
      store.selectSnapshot(PresentationsQueries.getPresentation);

    const hiddenPresentationProduct = mockPresentationProduct((product) => {
      product.Id = 2;
      product.IsVisible = false;
      return product;
    });
    const visiblePresentationProduct = mockPresentationProduct((product) => {
      product.Id = 1;
      product.IsVisible = true;
      return product;
    });
    return {
      spectator,
      store,
      getHiddenProducts,
      getVisibleProducts,
      getPresentation,
      hiddenPresentationProduct,
      visiblePresentationProduct,
      http,
      presentationsService,
      router,
      state,
      actions$,
      actionsDispatched,
      getShowToastActionsDispatched: () =>
        getDispatchedActionsOfType<ToastActions.Show>(ToastActions.Show),
      getNavigateActionsDispatched: () =>
        getDispatchedActionsOfType<Navigate>(Navigate),
    };
  };

  it('should update product visibility', () => {
    // Arrange
    const {
      store,
      hiddenPresentationProduct,
      visiblePresentationProduct,
      getHiddenProducts,
      getVisibleProducts,
    } = testSetup();

    // Act
    store.reset({
      presentations: {
        items: {
          '1': {
            presentation: {
              Id: 1,
              Products: [hiddenPresentationProduct, visiblePresentationProduct],
            },
          },
        },
        itemIds: [1],
        currentId: 1,
      },
    });

    // Assert
    expect(getVisibleProducts()).toEqual([visiblePresentationProduct]);

    // Act
    store.dispatch(
      new PresentationsActions.UpdatePresentationProductVisibility(
        visiblePresentationProduct.Id,
        !visiblePresentationProduct.IsVisible
      )
    );

    // Assert
    expect(getVisibleProducts()).toEqual([]);

    const hiddenProducts = getHiddenProducts();
    const productThatWasVisibleBefore = hiddenProducts.find(
      (product) => product.Id === visiblePresentationProduct.Id
    )!;

    // Assert
    expect(hiddenProducts.length).toEqual(2);
    expect(productThatWasVisibleBefore).not.toBeUndefined();
    expect(productThatWasVisibleBefore.IsVisible).toEqual(false);
  });

  describe('Add Products to Presentation', () => {
    it('should display success message toast when products are added successfully', () => {
      //Arrange
      const { getShowToastActionsDispatched, store, presentationsService } =
        testSetup();
      const projectName = 'Test';
      const productIds = [1, 2, 3];
      const duration = 8e3;

      jest.spyOn(presentationsService, 'addProducts').mockReturnValue(
        of({
          Presentation: {
            Id: 1,
            ProjectId: 11,
          } as Presentation,
          ProductsAdded: productIds,
          ProductsDuplicated: [],
          ProductsTruncated: [],
          ProductSuppliersNotFound: [],
          ProductsNotFound: [],
        })
      );
      //Act
      store.dispatch(
        new PresentationsActions.AddProducts(1, projectName, productIds)
      );

      //Assert
      const toastActions = getShowToastActionsDispatched();
      expect(toastActions).toEqual([
        {
          payload: {
            title: 'Success',
            body: `${productIds.length} product(s) added to ${projectName}`,
            type: 'confirm',
            component: ConfigureProductsButtonComponent,
            componentData: {
              presentationId: 1,
              projectId: 11,
            },
          },
          config: {
            duration,
            dismissible: true,
          },
        },
      ]);
    });
    it('should display error message toast when some products are duplicated', () => {
      //Arrange
      const { getShowToastActionsDispatched, store, presentationsService } =
        testSetup();
      const projectName = 'Test';
      const productIds = [1, 2, 3];
      const duplicatedProductIds = [2, 3];

      jest.spyOn(presentationsService, 'addProducts').mockReturnValue(
        of({
          Presentation: {
            Id: 1,
            ProjectId: 11,
          } as Presentation,
          ProductsAdded: [],
          ProductsDuplicated: duplicatedProductIds,
          ProductsTruncated: [],
          ProductSuppliersNotFound: [],
          ProductsNotFound: [],
        })
      );

      //Act
      store.dispatch(
        new PresentationsActions.AddProducts(1, projectName, productIds)
      );

      //Assert
      const toastActions = getShowToastActionsDispatched();
      expect(toastActions).toEqual([
        {
          payload: {
            title: 'Error: Products not added!',
            body: `${duplicatedProductIds.length} product(s) already exist in ${projectName}!`,
            type: 'error',
          },
          config: { duration: 8e3 },
        },
      ]);
    });
    it('should display error message toast when some products are truncated', () => {
      //Arrange
      const { getShowToastActionsDispatched, store, presentationsService } =
        testSetup();
      const projectName = 'Test';
      const productIds = [1, 2, 3];
      const ProductsTruncated = [2, 3];

      jest.spyOn(presentationsService, 'addProducts').mockReturnValue(
        of({
          Presentation: {
            Id: 1,
            ProjectId: 11,
          } as Presentation,
          ProductsAdded: [],
          ProductsDuplicated: [],
          ProductsTruncated: ProductsTruncated,
          ProductSuppliersNotFound: [],
          ProductsNotFound: [],
        })
      );

      //Act
      store.dispatch(
        new PresentationsActions.AddProducts(1, projectName, productIds)
      );

      //Assert
      const toastActions = getShowToastActionsDispatched();
      expect(toastActions).toEqual([
        {
          payload: {
            title: 'Error: Too many products',
            body: `${
              ProductsTruncated.length
            } product(s) were unable to be added. ${250} product per presentation limit reached.`,
            type: 'error',
          },
          config: { duration: 8e3 },
        },
      ]);
    });

    it('should display error message toast, when some products are failed to be added', () => {
      //Arrange
      const { getShowToastActionsDispatched, store, presentationsService } =
        testSetup();
      const projectName = 'Test';
      const productIds = [1, 2, 3];
      jest
        .spyOn(presentationsService, 'addProducts')
        .mockReturnValue(throwError(() => new Error('test')));
      //Act
      store.dispatch(
        new PresentationsActions.AddProducts(1, projectName, productIds)
      );

      //Assert
      const toastActions = getShowToastActionsDispatched();
      expect(toastActions).toEqual([
        {
          payload: {
            title: 'Error!',
            body: `${productIds.length} product(s) failed to add, please try again.`,
            type: 'error',
          },
        },
      ]);
    });
  });
  it('should update presentation settings', () => {
    // Arrange
    const { store, presentationsService, getPresentation } = testSetup();
    const settings: PresentationSettings = {
      ShowProductColors: true,
      ShowProductSizes: true,
      ShowProductShape: true,
      ShowProductMaterial: true,
      ShowProductCPN: true,
      ShowProductImprintMethods: true,
      ShowProductPricing: true,
      ShowProductPriceGrids: true,
      ShowProductPriceRanges: true,
      ShowProductAdditionalCharges: true,
      ShowProductDiscount: true,
    };

    store.reset({
      presentations: {
        items: {
          '1': {
            presentation: {
              Id: 1,
              Settings: settings,
            },
          },
        },
        itemIds: [1],
        currentId: 1,
      },
    });
    const presentation = {
      Id: 1,
      Settings: {
        ...settings,
        ShowProductColors: false,
        ShowProductSizes: false,
        ShowProductShape: false,
        ShowProductMaterial: false,
        ShowProductCPN: false,
        ShowProductImprintMethods: false,
        ShowProductPricing: false,
        ShowProductPriceGrids: false,
        ShowProductPriceRanges: false,
        ShowProductAdditionalCharges: false,
      },
    } as Presentation;

    jest
      .spyOn(presentationsService, 'update')
      .mockReturnValue(of(presentation));

    // Act
    store.dispatch(new PresentationsActions.Update(presentation));

    // Assert
    expect(getPresentation()).toEqual(presentation);
  });

  describe('Copy Link', () => {
    it('should send post for link generation for current presentation', () => {
      // Arrange
      const { store, presentationsService } = testSetup();
      store.reset({
        presentations: {
          items: {
            '1': {
              presentation: {
                Id: 1,
                Status: PresentationStatus.PreShare,
              },
            },
          },
          itemIds: [1],
          currentId: 1,
        },
      });
      const serviceSpy = jest.spyOn(presentationsService, 'generateShareLink');

      // Act
      store.dispatch(new PresentationsActions.GenerateShareLink());

      // Assert
      expect(serviceSpy).toHaveBeenCalledWith(1);
    });

    describe('pre-shared', () => {
      it('Should update status after sharing', () => {
        // Arrange
        const { store, getPresentation } = testSetup();
        store.reset({
          presentations: {
            items: {
              '1': {
                presentation: {
                  Id: 1,
                  Status: PresentationStatus.PreShare,
                },
              },
            },
            itemIds: [1],
            currentId: 1,
          },
        });

        // Act
        store.dispatch(new PresentationsActions.GenerateShareLink());

        // Assert
        expect(getPresentation().Status).toEqual(PresentationStatus.PostShare);
        expect(getPresentation().SharedDate).not.toBeFalsy();
      });
    });

    it('should display confirmation toast message after successful generating share link', () => {
      // Arrange
      const { store, getShowToastActionsDispatched } = testSetup();
      store.reset({
        presentations: {
          items: {
            '1': {
              presentation: {
                Id: 1,
              },
            },
          },
          itemIds: [1],
          currentId: 1,
        },
      });

      // Act
      store.dispatch(new PresentationsActions.GenerateShareLink());

      // Assert
      expect(getShowToastActionsDispatched()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            payload: TOAST_MESSAGES.PRESENTATION_SHARED_BY_LINK(),
          }),
        ])
      );
    });

    it('should copy link to clipboard', () => {
      // Arrange
      const { spectator, store } = testSetup();
      store.reset({
        presentations: {
          items: {
            '1': {
              presentation: {
                Id: 1,
              },
            },
          },
          itemIds: [1],
          currentId: 1,
        },
      });
      jest.spyOn(navigator.clipboard, 'writeText');

      // Act
      store.dispatch(new PresentationsActions.GenerateShareLink());

      // Assert
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        MOCK_GENERATED_LINK
      );
    });
  });

  describe('Share Via Email', () => {
    it('should send passed email for current presentation', () => {
      // Arrange
      const { store, presentationsService } = testSetup();
      store.reset({
        presentations: {
          items: {
            '1': {
              presentation: {
                Id: 1,
                Status: PresentationStatus.PreShare,
              },
            },
          },
          itemIds: [1],
          currentId: 1,
        },
      });
      const serviceSpy = jest.spyOn(presentationsService, 'presentationEmail');

      // Act
      store.dispatch(
        new PresentationsActions.SendPresentationEmail(MOCK_EMAIL)
      );

      // Assert
      expect(serviceSpy).toHaveBeenCalledWith(1, MOCK_EMAIL);
    });

    it('should update shared date after sharing the presentation', () => {
      // Arrange
      const { store, getPresentation } = testSetup();
      const sharedDate5DaysAgo = moment()
        .utc()
        .subtract(5, 'days')
        .toISOString();

      store.reset({
        presentations: {
          items: {
            '1': {
              presentation: {
                Id: 1,
                Status: PresentationStatus.QuoteRequested,
                SharedDate: sharedDate5DaysAgo,
              },
            },
          },
          itemIds: [1],
          currentId: 1,
        },
      });

      // Act
      store.dispatch(
        new PresentationsActions.SendPresentationEmail(MOCK_EMAIL)
      );

      // Assert
      // `isSame` checks whether the `SharedDate` points to the todays day. Since the
      // previous `SharedDate` points to `5 days ago`.
      const isToday = moment(getPresentation().SharedDate).isSame(
        moment(),
        'day'
      );
      expect(isToday).toEqual(true);
    });

    it('should display confirmation toast message after successful generating share link', () => {
      // Arrange
      const { store, getShowToastActionsDispatched } = testSetup();
      store.reset({
        presentations: {
          items: {
            '1': {
              presentation: {
                Id: 1,
              },
            },
          },
          itemIds: [1],
          currentId: 1,
        },
      });

      // Act
      store.dispatch(
        new PresentationsActions.SendPresentationEmail(MOCK_EMAIL)
      );

      // Assert
      expect(getShowToastActionsDispatched()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            payload: TOAST_MESSAGES.PRESENTATION_SHARED_BY_EMAIL(),
          }),
        ])
      );
    });
  });
});
