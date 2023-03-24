import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NgxsModule } from '@ngxs/store';
import { EMPTY, of } from 'rxjs';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { CosAnalyticsService } from '@cosmos/analytics/common';
import { CosToastService } from '@cosmos/components/notification';
import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { DialogService } from '@cosmos/ui-dialog';
import { CollectionsDialogService } from '@esp/collections/feature-dialogs';
import { CreatePresentationFlow } from '@esp/presentations/feature-dialogs';
import { Presentation, PresentationSearch } from '@esp/presentations/types';

import { ActivePresentationCardMenuComponent } from './active-presentation-card-menu.component';

const prefix = 'presentation-card-menu__';
const selectors = {
  shareButton: dataCySelector(prefix + 'share-button'),
  previewButton: dataCySelector(prefix + 'preview-button'),
  presentationButton: dataCySelector(prefix + 'create-presentation-button'),
  collectionButton: dataCySelector(prefix + 'create-collection-button'),
};

describe('ActivePresentationCardMenuComponent', () => {
  const createComponent = createComponentFactory({
    component: ActivePresentationCardMenuComponent,
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

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  it('should open the share modal, when Share option is clicked', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const shareBtn = spectator.query(selectors.shareButton);
    jest.spyOn(component, 'sharePresentation').mockImplementation();

    // Assert
    expect(shareBtn).toBeVisible();
    expect(shareBtn).toHaveText('Share');

    // Act
    spectator.click(shareBtn!);

    // Re-Assert
    expect(component.sharePresentation).toHaveBeenCalled();
  });

  it('preview button should be visible', () => {
    const { spectator } = testSetup();
    expect(spectator.query(selectors.previewButton)).toBeVisible();
    expect(spectator.query(selectors.previewButton)).not.toBeDisabled();
  });

  it('preview button should be disabled', () => {
    const { spectator } = testSetup({
      presentation: {
        ProductCount: 0,
      } as unknown as Presentation,
    });

    expect(spectator.query(selectors.previewButton)).toBeVisible();
    expect(spectator.query(selectors.previewButton)).toBeDisabled();
  });

  it('should allow user to preview presentation when Preview button is clicked', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const previewButton = spectator.query(selectors.previewButton);
    const tokenService = spectator.inject(AuthTokenService);
    const analyticsService = spectator.inject(CosAnalyticsService);
    jest.spyOn(window, 'open').mockImplementation();
    jest.spyOn(analyticsService, 'track').mockImplementation();

    // Assert
    expect(previewButton).toBeVisible();

    // Act
    spectator.click(previewButton!);
    const event = {
      action: 'Presentation Preview',
      properties: {
        id: component.presentation.Id,
      },
    };

    // Assert
    expect(analyticsService.track).toHaveBeenCalledWith(event);
    expect(window.open).toHaveBeenCalledWith(
      `customerPortalUrl/presentations/${component.presentation.Id}?token=${tokenService.token}`
    );
  });
  it('create presentation button should be visible', () => {
    const { spectator } = testSetup();
    expect(spectator.query(selectors.presentationButton)).toBeVisible();
    expect(spectator.query(selectors.presentationButton)).not.toBeDisabled();
  });

  it('create presentation button should be disabled', () => {
    const { spectator } = testSetup({
      presentation: {
        ProductCount: 0,
      } as unknown as Presentation,
    });

    expect(spectator.query(selectors.presentationButton)).toBeVisible();
    expect(spectator.query(selectors.presentationButton)).toBeDisabled();
  });
  it('should start createPresentation flow, when create presentation option is clicked', () => {
    // Arrange
    const { spectator } = testSetup();
    const presentationBtn = spectator.query(selectors.presentationButton);
    const createPresentationStartSpy = jest.spyOn(
      spectator.inject(CreatePresentationFlow, true),
      'start'
    );

    // Assert
    expect(presentationBtn).toBeVisible();
    expect(presentationBtn).toHaveText('Create Presentation');

    // Act
    spectator.click(presentationBtn!);

    // Re-Assert
    expect(createPresentationStartSpy).toHaveBeenCalled();
  });
  it('create collection button should be visible', () => {
    const { spectator } = testSetup();
    expect(spectator.query(selectors.collectionButton)).toBeVisible();
    expect(spectator.query(selectors.collectionButton)).not.toBeDisabled();
  });

  it('create collection button should be disabled', () => {
    const { spectator } = testSetup({
      presentation: {
        ProductCount: 0,
      } as unknown as Presentation,
    });

    expect(spectator.query(selectors.collectionButton)).toBeVisible();
    expect(spectator.query(selectors.collectionButton)).toBeDisabled();
  });
  it('should open create Collection dialog, when create collection option is clicked', () => {
    // Arrange
    const { spectator } = testSetup();
    const collectionBtn = spectator.query(selectors.collectionButton);
    const createCollectionStartSpy = jest.spyOn(
      spectator.inject(CollectionsDialogService),
      'openCreateDialog'
    );

    // Assert
    expect(collectionBtn).toBeVisible();
    expect(collectionBtn).toHaveText('Create Collection');

    // Act
    spectator.click(collectionBtn!);

    // Re-Assert
    expect(createCollectionStartSpy).toHaveBeenCalled();
  });
});
