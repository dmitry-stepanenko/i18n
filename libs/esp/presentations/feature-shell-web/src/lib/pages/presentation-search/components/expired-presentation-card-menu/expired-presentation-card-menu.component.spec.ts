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
import {
  Presentation,
  PresentationProduct,
  PresentationSearch,
} from '@esp/presentations/types';

import { ExpiredPresentationCardMenuComponent } from './expired-presentation-card-menu.component';

const prefix = 'presentation-card-menu__';
const selectors = {
  presentationButton: dataCySelector(prefix + 'create-presentation-button'),
  collectionButton: dataCySelector(prefix + 'create-collection-button'),
};

const MOCKED_PRODUCTS = [
  { Id: 11, ProductId: 1, Name: 'Name1', DefaultMedia: {} },
  { Id: 12, ProductId: 2, Name: 'Name2', DefaultMedia: {} },
] as PresentationProduct[];

describe('ExpiredPresentationCardMenuComponent', () => {
  const createComponent = createComponentFactory({
    component: ExpiredPresentationCardMenuComponent,
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
      mockProvider(CollectionsDialogService),
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
      const { component, spectator } = testSetup();
      component['_products$'] = of(MOCKED_PRODUCTS);
      const flowStartSpy = jest.spyOn(
        spectator.inject(CreatePresentationFlow, true),
        'start'
      );
      spectator.click(selectors.presentationButton);

      // should be called with product ids and false as redirect after creation setting
      expect(flowStartSpy).toHaveBeenCalledWith({
        productIds: [1, 2],
        redirectAfterCreation: false,
      });
    });

    it('should open create collection dialog with proper settings when create collection option is clicked', () => {
      const { component, spectator } = testSetup();
      component['_products$'] = of(MOCKED_PRODUCTS);
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
});
