import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { Actions, Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { Subject, of } from 'rxjs';

import { CosToastService } from '@cosmos/components/notification';
import { ConfigModule } from '@cosmos/config';
import { FeatureFlagsService } from '@cosmos/feature-flags';
import { dataCySelector } from '@cosmos/testing';
import { CreatePresentationFlow } from '@esp/presentations/feature-dialogs';
import { PresentationMockDb } from '@esp/presentations/mocks-presentations';
import { PresentationSearch } from '@esp/presentations/types';
import {
  EspSearchBoxModule,
  EspSearchPaginationModule,
  EspSearchSortModule,
  EspSearchTabsModule,
  SearchBoxComponent,
  SearchPaginationComponent,
  SearchSortComponent,
  SearchTabGroupComponent,
} from '@esp/search/feature-search-elements';

import {
  PresentationSearchLoaderComponent,
  PresentationSearchLoaderComponentModule,
} from './presentation-search.loader';
import { PresentationSearchLocalState } from './presentation-search.local-state';
import {
  PresentationSearchPage,
  PresentationSearchPageModule,
} from './presentation-search.page';

const presentation = {
  ...PresentationMockDb.presentation,
  Project: {
    Id: 1,
    Name: 'qwerty',
  },
} as unknown as PresentationSearch;

const selectors = {
  createPresentationButton: dataCySelector('create-presentation-button'),
  presentationCard: 'cos-presentation-card',
  presentationCardMenuTriggerButton: dataCySelector(
    'card-menu__trigger-button'
  ),
  sharePresentationButton: dataCySelector(
    'presentation-card-menu__share-button'
  ),
  previewPresentationButton: dataCySelector(
    'presentation-card-menu__preview-button'
  ),
  archivedPresentationDownloadPdfButton: dataCySelector(
    'presentation-card-menu__download-pdf-button'
  ),
  archivedPresentationCreatePresentationButton: dataCySelector(
    'presentation-card-menu__create-presentation-button'
  ),
};

describe('PresentationSearchPageComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationSearchPage,
    imports: [
      PresentationSearchPageModule,
      RouterTestingModule,
      HttpClientTestingModule,
      ConfigModule.forRoot({
        venusApiUrl: 'venusApiUrl',
        vulcanApiUrl: 'vulcanApiUrl',
      }),
    ],
    providers: [
      mockProvider(MatDialog),
      mockProvider(CosToastService),
      mockProvider(Store, {
        select: () => of('empty'),
      }),
      mockProvider(Actions),
      mockProvider(FeatureFlagsService, {
        isEnabled: () => true,
      }),
    ],
    overrideModules: [
      [
        EspSearchSortModule,
        {
          set: {
            declarations: MockComponents(SearchSortComponent),
            exports: MockComponents(SearchSortComponent),
          },
        },
      ],
      [
        EspSearchBoxModule,
        {
          set: {
            declarations: MockComponents(SearchBoxComponent),
            exports: MockComponents(SearchBoxComponent),
          },
        },
      ],
      [
        EspSearchTabsModule,
        {
          set: {
            declarations: MockComponents(SearchTabGroupComponent),
            exports: MockComponents(SearchTabGroupComponent),
          },
        },
      ],
      [
        EspSearchPaginationModule,
        {
          set: {
            declarations: MockComponents(SearchPaginationComponent),
            exports: MockComponents(SearchPaginationComponent),
          },
        },
      ],
      [
        PresentationSearchLoaderComponentModule,
        {
          set: {
            declarations: MockComponents(PresentationSearchLoaderComponent),
            exports: MockComponents(PresentationSearchLoaderComponent),
          },
        },
      ],
    ],
  });

  const testSetup = (options?: {
    hasLoaded?: boolean;
    isLoading?: boolean;
    presentations?: PresentationSearch[];
  }) => {
    const spectator = createComponent({
      providers: [
        mockProvider(CreatePresentationFlow, {
          flowFinished$: of(false),
        }),
        mockProvider(PresentationSearchLocalState, {
          hasLoaded: options?.hasLoaded,
          isLoading: options?.isLoading ?? false,
          presentations: options?.presentations,
          tabIndex: 0,
          connect() {
            return of(this);
          },
        }),
      ],
    });
    return { spectator, component: spectator.component };
  };

  it('should open create presentation dialog', () => {
    // Arrange
    const { spectator } = testSetup({
      hasLoaded: true,
      isLoading: false,
    });
    const createPresentationFlow = spectator.inject(
      CreatePresentationFlow,
      true
    );
    jest.spyOn(createPresentationFlow, 'start').mockImplementation();
    createPresentationFlow.flowFinished$ = new Subject<boolean>();
    // Act
    spectator.click(selectors.createPresentationButton);

    // Assert
    expect(createPresentationFlow.start).toHaveBeenCalled();
  });

  describe('Active Presentations', () => {
    it('should display the meatball menu when displayed on the Active Presentations tab', () => {
      // Arrange
      testSetup({
        hasLoaded: true,
        presentations: [{ ...presentation, IsEditable: true, IsVisible: true }],
      });
      // Assert
      expect(selectors.presentationCardMenuTriggerButton).toBeVisible();
    });

    it('should display all presentations that are in an open state', () => {
      // Arrange
      const { spectator, component } = testSetup({
        hasLoaded: true,
        presentations: [{ ...presentation, IsEditable: true, IsVisible: true }],
      });
      const presentationCards = spectator.queryAll(selectors.presentationCard);
      // Assert
      expect(presentationCards.length).toBeGreaterThan(0);
      expect(presentationCards).toHaveLength(
        component.state.presentations.length
      );
      expect(component.state.tabIndex).toEqual(0);
      presentationCards.forEach((card) => expect(card).toBeVisible());
    });

    it('should have preview and share presentation options from the presentation card 3 dot menu', () => {
      // Arrange
      const { spectator } = testSetup({
        hasLoaded: true,
        presentations: [{ ...presentation, IsEditable: true, IsVisible: true }],
      });

      const presentationCard = spectator.query(selectors.presentationCard)!;
      const presentationCardMenuTriggerButton =
        presentationCard.querySelector<HTMLButtonElement>(
          selectors.presentationCardMenuTriggerButton
        )!;

      // Act
      spectator.click(presentationCardMenuTriggerButton);
      spectator.detectComponentChanges();

      const overlayContainerElement = spectator
        .inject(OverlayContainer)
        .getContainerElement();

      const sharePresentationButton = overlayContainerElement.querySelector(
        selectors.sharePresentationButton
      );
      const presentationPreviewButton = overlayContainerElement.querySelector(
        selectors.previewPresentationButton
      );

      // Assert
      expect(sharePresentationButton).toBeVisible();
      expect(presentationPreviewButton).toBeVisible();

      expect(sharePresentationButton).toHaveText('Share Presentation');
      expect(presentationPreviewButton).toHaveText('Preview Presentation');
    });
  });

  describe('Expired Presentations', () => {
    it('should display all presentations that are in a expired state', () => {
      // Arrange
      const { spectator, component } = testSetup({
        hasLoaded: true,
        presentations: [
          { ...presentation, IsEditable: false, IsVisible: false },
        ],
      });

      // Act
      component.state.tabIndex = 1;
      spectator.detectComponentChanges();
      const presentationCards = spectator.queryAll(selectors.presentationCard);

      // Assert
      expect(presentationCards.length).toBeGreaterThan(0);
      expect(presentationCards).toHaveLength(
        component.state.presentations.length
      );
      expect(component.state.tabIndex).toEqual(1);
    });

    it('should have the 3 dot menu on the presentation card', () => {
      // Arrange
      const { component, spectator } = testSetup({
        hasLoaded: true,
        presentations: [
          { ...presentation, IsEditable: false, IsVisible: false },
        ],
      });
      // Act
      component.state.tabIndex = 1;
      spectator.detectComponentChanges();
      // Assert
      expect(selectors.presentationCardMenuTriggerButton).toBeVisible();
    });
  });

  describe('Archived Presentations', () => {
    it('should display download PDF and create presentation options from the 3-dot menu', () => {
      // Arrange
      const { component, spectator } = testSetup({
        hasLoaded: true,
        presentations: [presentation],
      });
      // Act
      component.state.tabIndex = 2;
      component.state.isArchivedPresentationsTab = true;
      spectator.detectComponentChanges();
      const presentationCard = spectator.query(selectors.presentationCard)!;
      const presentationCardMenuTriggerButton =
        presentationCard.querySelector<HTMLButtonElement>(
          selectors.presentationCardMenuTriggerButton
        )!;
      spectator.click(presentationCardMenuTriggerButton);
      // Assert
      expect(selectors.archivedPresentationDownloadPdfButton).toBeVisible();
      expect(
        selectors.archivedPresentationCreatePresentationButton
      ).toBeVisible();
    });
  });
});
