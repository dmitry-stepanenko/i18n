import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NgxsModule } from '@ngxs/store';
import { EMPTY, of } from 'rxjs';

import { CosToastService } from '@cosmos/components/notification';
import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { DialogService } from '@cosmos/ui-dialog';
import { CollectionsDialogService } from '@esp/collections/feature-dialogs';
import { CreatePresentationFlow } from '@esp/presentations/feature-dialogs';
import { Presentation, PresentationSearch } from '@esp/presentations/types';

import { ArchivedPresentationCardMenuComponent } from './archived-presentation-card-menu.component';
import { ArchivedPresentationCardMenuService } from './archived-presentation-card-menu.service';

const prefix = 'presentation-card-menu__';
const selectors = {
  downloadPdfButton: dataCySelector(prefix + 'download-pdf-button'),
  presentationButton: dataCySelector(prefix + 'create-presentation-button'),
  collectionButton: dataCySelector(prefix + 'create-collection-button'),
};

const MOCKED_PRODUCTS = [
  {
    Id: 11,
    Name: 'Name1',
    ProductId: 1,
  },
  {
    Id: 12,
    Name: 'Name2',
    ProductId: 2,
  },
];

describe('ArchivedPresentationCardMenuComponent', () => {
  const createComponent = createComponentFactory({
    component: ArchivedPresentationCardMenuComponent,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      ConfigModule.forRoot({
        venusApiUrl: 'someApiUrl',
        vulcanApiUrl: 'vulcanApiUrl',
        customerPortalUrl: 'customerPortalUrl',
      }),
    ],
    providers: [
      mockProvider(DialogService, {
        open() {
          return of(EMPTY);
        },
      }),
      mockProvider(CosToastService),
      mockProvider(CreatePresentationFlow),
      mockProvider(CollectionsDialogService, {
        openCreateDialog: () => of(true),
      }),
    ],
  });

  const testSetup = (options?: { presentation?: Presentation }) => {
    const spectator = createComponent({
      props: {
        presentation: {
          ProductCount: 4,
          ...options?.presentation,
        } as unknown as PresentationSearch,
      },
      providers: [
        mockProvider(ArchivedPresentationCardMenuService, {
          getArchivedPresentationProducts: () => of(MOCKED_PRODUCTS),
        }),
      ],
    });

    const component = spectator.component;

    return { component, spectator };
  };
  describe('Presentation without products', () => {
    it('create presentation and collection buttons should be disabled', () => {
      const { spectator } = testSetup({
        presentation: {
          ProductCount: 0,
        } as unknown as Presentation,
      });
      expect(spectator.query(selectors.presentationButton)).toBeDisabled();
      expect(spectator.query(selectors.collectionButton)).toBeDisabled();
    });
  });

  describe('Presentation with products', () => {
    it('create presentation and collection buttons should not be disabled', () => {
      const { spectator } = testSetup();
      expect(spectator.query(selectors.presentationButton)).not.toBeDisabled();
      expect(spectator.query(selectors.collectionButton)).not.toBeDisabled();
    });

    it('should start presentation creation flow with proper settings when create presentation option is clicked', () => {
      // arrange
      const { spectator } = testSetup();
      const flowStartSpy = jest.spyOn(
        spectator.inject(CreatePresentationFlow, true),
        'start'
      );

      // act
      spectator.click(selectors.presentationButton);

      // assert
      // should be called with product ids and false as redirect after creation setting
      expect(flowStartSpy).toHaveBeenCalledWith({
        productIds: [1, 2],
        redirectAfterCreation: false,
      });
    });

    it('should open create collection dialog with proper settings when create collection option is clicked', () => {
      const { spectator } = testSetup();
      const openDialogSpy = jest.spyOn(
        spectator.inject(CollectionsDialogService),
        'openCreateDialog'
      );
      spectator.click(selectors.collectionButton);

      // should be called with product ids and false as redirect after creation setting
      expect(openDialogSpy).toHaveBeenCalledWith({
        products: [
          { ProductId: 1, Name: 'Name1' },
          { ProductId: 2, Name: 'Name2' },
        ],
      });
    });
  });

  it('should call downloadPdf method when download pdf option is clicked', () => {
    const { spectator } = testSetup();
    const downloadPdfSpy = jest.spyOn(
      spectator.inject(ArchivedPresentationCardMenuService),
      'downloadPdf'
    );
    spectator.click(selectors.downloadPdfButton);

    // should be called with product ids and false as redirect after creation setting
    expect(downloadPdfSpy).toHaveBeenCalled();
  });
});
