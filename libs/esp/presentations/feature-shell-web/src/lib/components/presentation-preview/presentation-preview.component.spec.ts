import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { ConfigModule } from '@cosmos/config';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';

import { PresentationPreviewComponent } from './presentation-preview.component';
import { PresentationPreviewLocalState } from './presentation-preview.local-state';

const selectors = {
  matButtonToggleChecked: '.mat-button-toggle-checked',
  matButtonToggleLabelContent: '.mat-button-toggle-label-content',
};

describe('PresentationPreviewComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationPreviewComponent,
    imports: [
      ConfigModule.forRoot({ customerPortalUrl: 'customerPortalUrl' }),
      CosUtilTranslationsTestingModule.forRoot(),
    ],
    providers: [
      mockProvider(Store, {
        select: () => of('empty'),
      }),
      mockProvider(AuthTokenService, {
        token: 'authToken',
      }),
    ],
  });

  const testSetup = (products?: unknown[]) => {
    const spectator = createComponent({
      providers: [
        mockProvider(PresentationPreviewLocalState, {
          project: {
            Id: 123,
          },
          presentation: {
            Id: 999,
            Products: products || [
              {
                Id: 1,
                IsVisible: false,
              },
              {
                Id: 2,
                IsVisible: true,
              },
              {
                Id: 3,
                IsVisible: true,
              },
            ],
          },
          connect() {
            return of(this);
          },
        }),
      ],
    });
    return { spectator, component: spectator.component };
  };

  it('should order options as `Product Page` and `Landing Page`', async () => {
    // Arrange
    const { spectator } = testSetup();
    await spectator.fixture.whenStable();
    const toggleLabels = spectator.queryAll(
      selectors.matButtonToggleLabelContent
    );
    // Assert
    expect(toggleLabels.length).toEqual(2);
    expect(toggleLabels[0]).toHaveExactTrimmedText('Product Page');
    expect(toggleLabels[1]).toHaveExactTrimmedText('Landing Page');
  });

  it('should default to `Product Page` selected by default', async () => {
    // Arrange
    const { spectator } = testSetup();
    await spectator.fixture.whenStable();
    const matButtonToggleChecked = spectator.query(
      selectors.matButtonToggleChecked
    )!;
    const matButtonToggleCheckedLabelContent =
      matButtonToggleChecked.querySelector(
        selectors.matButtonToggleLabelContent
      );
    // Assert
    expect(matButtonToggleCheckedLabelContent).toHaveExactTrimmedText(
      'Product Page'
    );
  });

  it('should have only landing page tab if there are no products at all', async () => {
    // Arrange
    const { spectator } = testSetup(/* products */ []);
    await spectator.fixture.whenStable();
    const toggleLabels = spectator.queryAll(
      selectors.matButtonToggleLabelContent
    );
    // Assert
    expect(toggleLabels.length).toEqual(1);
    expect(toggleLabels[0]).toHaveExactTrimmedText('Landing Page');
  });

  it('tab URL should contain the first visible product', async () => {
    // Arrange
    const { spectator, component } = testSetup();
    await spectator.fixture.whenStable();
    // Assert
    // `Id: 2` is the first visible product, see `testSetup`.
    expect(component.previewOptions![0].value).toEqual(
      'customerPortalUrl/projects/123/presentations/999/products/2?token=authToken'
    );
  });
});
