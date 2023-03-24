import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { fakeAsync } from '@angular/core/testing';
import { MAT_MOMENT_DATE_FORMATS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatLegacyTooltipHarness as MatTooltipHarness } from '@angular/material/legacy-tooltip/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  byText,
  createComponentFactory,
  mockProvider,
} from '@ngneat/spectator/jest';
import { Store } from '@ngxs/store';
import { MockComponents } from 'ng-mocks';
import { Subject, defer, of } from 'rxjs';
import { take } from 'rxjs/operators';

import { dataCySelector } from '@cosmos/testing';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import { OrdersMockDb } from '@esp/orders/mocks-orders';
import {
  MOCK_PRODUCT,
  MOCK_PROJECT,
  PresentationMockDb,
} from '@esp/presentations/mocks-presentations';
import { Presentation, PresentationStatus } from '@esp/presentations/types';
import { SettingsService } from '@esp/settings/data-access-settings';

import { PresentationPreviewComponent } from '../../components/presentation-preview';
import { PresentationLocalState } from '../../local-states';

import {
  PresentationProductsComponent,
  PresentationProductsModule,
} from './components/presentation-products';
import {
  PresentationSettingsLoaderComponent,
  PresentationSettingsLoaderModule,
} from './presentation-settings.loader';
import {
  PresentationSettingsPage,
  PresentationSettingsPageModule,
} from './presentation-settings.page';

describe('PresentationSettingsPage', () => {
  const createComponent = createComponentFactory({
    component: PresentationSettingsPage,
    imports: [
      RouterTestingModule,
      PresentationSettingsPageModule,
      CosUtilTranslationsTestingModule.forRoot(),
    ],
    providers: [
      mockProvider(Store, { select: () => of('test') }),
      mockProvider(SettingsService),
      { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
      mockProvider(DateAdapter, {
        localeChanges: of(void null),
        isDateInstance: jest.fn(),
      }),
    ],
    overrideModules: [
      [
        PresentationProductsModule,
        {
          set: {
            declarations: MockComponents(PresentationProductsComponent),
            exports: MockComponents(PresentationProductsComponent),
          },
        },
      ],
      [
        PresentationSettingsLoaderModule,
        {
          set: {
            declarations: MockComponents(PresentationSettingsLoaderComponent),
            exports: MockComponents(PresentationSettingsLoaderComponent),
          },
        },
      ],
    ],
  });

  // We'd want to simulate the "await" behavior for the HTTP response.
  const possibleHttpTimeout = 100;

  const testSetup = (options?: {
    presentation?: Presentation;
    isLoading?: boolean;
    hasLoaded?: boolean;
  }) => {
    const spectator = createComponent({
      providers: [
        mockProvider(PresentationLocalState, {
          presentation:
            options?.presentation || PresentationMockDb.presentation,
          isLoading: options?.isLoading ?? false,
          hasLoaded: options?.hasLoaded ?? true,
          quote: OrdersMockDb.order,
          project: MOCK_PROJECT,
          connect() {
            return of(this);
          },
          save(this: PresentationLocalState, presentation: Presentation) {
            // Carataker note: we're doing this because the `save()` method is used differently within
            // the `presentation-settings.page`. It's used as "fire & forget" and "fire & wait".
            const presentation$ = new Subject<Presentation>();
            setTimeout(() => {
              presentation$.next(presentation);
              this.presentation = presentation;
            }, possibleHttpTimeout);
            return presentation$.pipe(take(1));
          },
        }),
      ],
      detectChanges: false,
    });

    spectator.component.presentationPreview = defer(() =>
      of(PresentationPreviewComponent)
    );
    spectator.detectChanges();

    return {
      spectator,
      component: spectator.component,
      state: spectator.component.state,
      loader: TestbedHarnessEnvironment.loader(spectator.fixture),
    };
  };

  describe('Skeleton loader', () => {
    it('should show the skeleton before the presentation is loaded', () => {
      // Arrange & act
      const { spectator } = testSetup({
        hasLoaded: false,
        isLoading: true,
      });
      // Assert
      expect(spectator.query('esp-presentation-settings-loader')).toExist();
    });

    it('should render the presentation settings page when the presentation is loaded', () => {
      // Arrange & act
      const { spectator } = testSetup();
      // Assert
      expect(spectator.query('esp-presentation-settings-loader')).not.toExist();
      expect(spectator.query('.project__pg-title')).toExist();
    });
  });

  describe('Presentation status', () => {
    describe('PreShare', () => {
      it('Should display the Preview button in a disabled state until at least one visible product is in the presentation.', () => {
        // Arrange
        const { spectator, state } = testSetup();
        // Act
        state.presentation.Status = PresentationStatus.PreShare;
        spectator.detectComponentChanges();
        // Assert
        expect(state.presentation.Products.length).toEqual(0);
        const previewButton = spectator.query(
          'esp-presentation-action-bar > button.cos-stroked-button'
        );
        expect(previewButton).toExist();
        expect(previewButton).toBeDisabled();
      });

      it('Should display the preview button in an enabled state once at least one visible product is in the presentation', () => {
        // Arrange
        const { spectator, state } = testSetup({
          presentation: {
            ...PresentationMockDb.presentation,
            Products: Array(1).fill(MOCK_PRODUCT),
          },
        });
        // Act
        state.presentation.Status = PresentationStatus.PreShare;
        spectator.detectComponentChanges();
        // Assert
        expect(state.presentation.Products.length).toEqual(1);
        const previewButton = spectator.query(
          'esp-presentation-action-bar > button.cos-stroked-button'
        );
        expect(previewButton).toExist();
        expect(previewButton).not.toBeDisabled();
      });

      it('Should display the share button as a primary green button with the text “Share with Customer”', () => {
        // Arrange
        const { spectator, state } = testSetup();
        // Act
        state.presentation.Status = PresentationStatus.PreShare;
        spectator.detectComponentChanges();
        // Assert
        const shareButton = spectator.queryAll(
          'esp-presentation-action-bar > button'
        )?.[1];
        expect(shareButton).toHaveText('Share with Customer');
      });

      it('should show presentation settings and presentation preview', async () => {
        // Arrange
        const { spectator, state } = testSetup();

        await spectator.fixture.whenStable();

        // Act
        state.presentation.Status = PresentationStatus.PreShare;
        spectator.detectComponentChanges();
        // Assert
        expect(spectator.query('.proj-pres__settings')).toExist();
        expect(spectator.query('esp-presentation-preview')).toExist();
      });
    });

    describe('PostShare', () => {
      it('Should display the share button as secondary white button with the text “Share”', async () => {
        // Arrange
        const { spectator, state } = testSetup();
        await spectator.fixture.whenStable();
        // Act
        state.presentation.Status = PresentationStatus.PostShare;
        spectator.detectComponentChanges();
        const shareButton = spectator.query(
          `esp-presentation-action-bar ${dataCySelector(
            'share-presentation-button'
          )}`
        );

        // Assert
        expect(shareButton).toHaveClass(['cos-flat-button', 'cos-primary']);
        expect(shareButton).toHaveAttribute('color', 'primary');
        expect(shareButton).toHaveDescendant('i.fa.fa-share');
      });

      it('Should display the Edit button once a presentation has been shared', async () => {
        // Arrange
        const { spectator, state } = testSetup();
        await spectator.fixture.whenStable();
        // Act
        state.presentation.Status = PresentationStatus.PostShare;
        spectator.detectComponentChanges();
        const editButton = spectator.query(
          `esp-presentation-action-bar ${dataCySelector('edit-button')}`
        );

        // Assert
        expect(editButton).toHaveClass(['cos-stroked-button', 'cos-primary']);
        expect(editButton).toHaveAttribute('color', 'primary');
        expect(editButton).toHaveDescendant('i.fa.fa-pen');
      });
    });

    describe('QuoteRequested', () => {
      const createQuoteButtonSelector = byText('Create Quote', {
        selector: 'esp-presentation-action-bar button:nth-child(4)',
      });

      it('should show quote requests', async () => {
        // Arrange
        const { spectator, state } = testSetup();
        await spectator.fixture.whenStable();
        // Act
        state.presentation.Status = PresentationStatus.QuoteRequested;
        spectator.detectComponentChanges();

        // Assert
        expect(spectator.query('esp-presentation-quotes')).toExist();

        // Should be more tests there, but `esp-pres-quote-request` is a placeholder component now.
      });
    });
  });

  describe('Presentation Settings', () => {
    it('should display tootltip on presentation settings info icon', async () => {
      const { loader } = testSetup();
      const tooltips = await loader.getAllHarnesses(MatTooltipHarness);
      expect(tooltips.length).toBe(3);

      await tooltips[1].show();

      expect(await tooltips[1].getTooltipText()).toEqual(
        'Hiding a product detail here will apply to all products in the presentation. You can choose to display the hidden information for specific items by editing the individual product and turning the option on.'
      );
    });
    it('should display tootltip on expiration date', async () => {
      const { loader } = testSetup();
      const tooltips = await loader.getAllHarnesses(MatTooltipHarness);

      await tooltips[2].show();

      expect(await tooltips[2].getTooltipText()).toEqual(
        'You can pick a presentation expiration date up to 90 days out. The default is set to 30 days.'
      );
    });

    it('should display presentation settings description', () => {
      const { spectator } = testSetup();
      const description = spectator.query('.proj-pres__settings-description');
      expect(description.textContent.trim()).toEqual(
        'Hide these product details on all items in your presentation.'
      );
    });

    it('should render presentation settings when the presentation has the PreShare status', () => {
      // Arrange
      const { spectator, component } = testSetup();
      // Act
      component.state.presentation.Status = PresentationStatus.PreShare;
      spectator.detectComponentChanges();
      // Assert
      expect(
        spectator.query('.proj-pres__settings cos-card.presentation-settings')
      ).toExist();
    });
    it('Post Share - Should Hide the presentation settings section', async () => {
      // Arrange
      const { spectator, component } = testSetup();
      await spectator.fixture.whenStable();
      // Assert
      expect(
        spectator.query('.proj-pres__settings cos-card.presentation-settings')
      ).toBeVisible();

      // Act
      component.state.presentation.Status = PresentationStatus.PostShare;
      spectator.detectComponentChanges();
      // Assert
      expect(
        spectator.query('.proj-pres__settings cos-card.presentation-settings')
      ).not.toBeVisible();
    });

    describe('Sharing options', () => {
      it('should disable allow products variants when it is being updated and then enable it', fakeAsync(() => {
        // Arrange
        const { spectator, state } = testSetup();
        const toggle = spectator.query(
          '[data-cy=toggle-allow-product-variants]'
        );
        const checkbox = toggle.querySelector('.cos-slide-toggle-input');
        spectator.fixture.whenStable();
        // Act
        spectator.click(toggle);
        // Assert
        expect(checkbox.hasAttribute('disabled')).toEqual(true);
        spectator.tick(possibleHttpTimeout);
        spectator.detectComponentChanges();
        expect(checkbox.hasAttribute('disabled')).toEqual(false);
        expect(state.presentation.AllowProductVariants).toEqual(true);
      }));

      it('should allow a distributor to enter a personal note', () => {
        // Arrange
        const { spectator } = testSetup();
        const personalNoteInput = spectator.query('#sharing-personal-note');

        // Assert
        expect(personalNoteInput).toBeVisible();
        expect(personalNoteInput.tagName).toBe('TEXTAREA');
      });

      it('should show personal note input placeholder as: Here are some products that I think you might be interested in!', () => {
        // Arrange
        const { spectator } = testSetup();
        const personalNoteInput = spectator.query('#sharing-personal-note');

        // Assert
        expect(personalNoteInput).toHaveAttribute(
          'placeholder',
          'Here are some products that I think you might be interested in!'
        );
      });

      it('should display all 250 characters of the personal note if one was provided', fakeAsync(() => {
        // Arrange
        const { spectator } = testSetup();
        const textToType =
          'aaasdsadsdsatdfueivhvbuvbiebvewovweivwenoviwebovewuvweov weivbwevbweoiweweiefcdecvbucbawucvucqwcqwcvbabdbabdajkdbwkdbkjbkwjdbkjwbdakjdbsajdbaskdadakdadjabdksabdkjdakdbadadajdxadjkabdasdjasdksadbsaacasbc ajkcfbacwkcbascbksacbsajcbsakbcsajbcsakcsjcbasc';
        let textarea = spectator.query<HTMLTextAreaElement>(
          '#sharing-personal-note'
        );

        // Act
        spectator.typeInElement(textToType, textarea);
        spectator.tick(possibleHttpTimeout);
        textarea = spectator.query<HTMLTextAreaElement>(
          '#sharing-personal-note'
        );

        // Assert
        expect(textarea.value.length).toEqual(textToType.length);
        expect(textarea.value).toEqual(textToType);
      }));

      it('should display the correct count of words when Personal note input is populated with words', fakeAsync(() => {
        // Arrange
        const { spectator } = testSetup();
        let textarea = spectator.query<HTMLTextAreaElement>(
          '#sharing-personal-note'
        );

        // Act
        spectator.typeInElement('test', textarea);
        spectator.tick(possibleHttpTimeout);
        const wordCountArea = spectator.query('cos-hint');
        textarea = spectator.query<HTMLTextAreaElement>(
          '#sharing-personal-note'
        );

        // Assert
        expect(wordCountArea.innerHTML).toEqual(
          `${textarea.value.length}/${textarea.getAttribute('maxlength')}`
        );
      }));

      it('should save the note when the save note button is clicked', fakeAsync(() => {
        // Arrange
        const { spectator, component, state } = testSetup();
        const textarea = spectator.query<HTMLTextAreaElement>(
          '#sharing-personal-note'
        );
        const saveSpy = jest.spyOn(state, 'save');
        const saveNoteSpy = jest.spyOn(component, 'saveNote');
        const saveNoteButton = spectator.query('.presentation-note-save-btn');
        // Act
        textarea.value = 'Some test note';
        textarea.dispatchEvent(new KeyboardEvent('input'));
        spectator.detectComponentChanges();
        // Assert
        expect(component.form.value).toEqual({
          Note: 'Some test note',
          ExpirationDate: null,
        });
        spectator.click(saveNoteButton);
        spectator.tick(possibleHttpTimeout);
        expect(saveSpy).toHaveBeenCalled();
        expect(saveNoteSpy).toHaveBeenCalled();
        expect(state.presentation.Note).toEqual('Some test note');
      }));

      it('should demonstrate that their signature is included if they have the option enabled in the presentation', fakeAsync(() => {
        // Arrange
        const { component, spectator } = testSetup();
        const includeSignatureToggle = spectator.query(
          '[data-cy=toggle-include-signature]'
        );

        // Act
        spectator.click(includeSignatureToggle);

        // Assert
        spectator.tick(possibleHttpTimeout);
        spectator.detectComponentChanges();
        expect(component.state.presentation.ShowSignature).toEqual(true);
      }));

      it('should disable include signature when it is being updated and then enable it', fakeAsync(() => {
        // Arrange
        const { spectator, component } = testSetup();
        const toggle = spectator.query('[data-cy=toggle-include-signature]');
        const checkbox = toggle.querySelector('.cos-slide-toggle-input');
        // Act
        spectator.click(toggle);
        // Assert
        expect(checkbox.hasAttribute('disabled')).toEqual(true);
        spectator.tick(possibleHttpTimeout);
        spectator.detectComponentChanges();
        expect(checkbox.hasAttribute('disabled')).toEqual(false);
        expect(component.state.presentation.ShowSignature).toEqual(true);
      }));

      it("should have correct placeholder as 'Select a date' in the expiration date input", fakeAsync(() => {
        // Arrange
        const { spectator } = testSetup();
        const dateInput = spectator.query<HTMLInputElement>(
          '[data-cy=expiration-date-input]'
        );

        // Assert
        expect(dateInput.getAttribute('placeholder')).toEqual('Select a date');
      }));

      it('should by empty if no expiration date is selected', () => {
        // Arrange
        const { spectator } = testSetup();
        const input = spectator.query<HTMLInputElement>(
          '[data-cy=expiration-date-input]'
        );

        // Assert
        expect(input.valueAsDate).toBeNull();
      });
    });

    describe('Presentation Preview', () => {
      it('Post Share - Should Hide the preview settings section', async () => {
        // Arrange
        const { spectator, component } = testSetup();

        await spectator.fixture.whenStable();

        // Assert
        expect(spectator.query('esp-presentation-preview')).toBeVisible();

        // Act
        component.state.presentation.Status = PresentationStatus.PostShare;
        spectator.detectComponentChanges();
        // Assert
        expect(spectator.query('esp-presentation-preview')).not.toBeVisible();
      });
    });
  });
});
