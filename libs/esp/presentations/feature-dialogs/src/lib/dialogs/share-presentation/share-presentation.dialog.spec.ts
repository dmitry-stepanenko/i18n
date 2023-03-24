import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDatepickerToggleHarness } from '@angular/material/datepicker/testing';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NgxsModule } from '@ngxs/store';
import * as moment from 'moment';
import { Subject, first, of } from 'rxjs';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { CosAnalyticsService, TrackEvent } from '@cosmos/analytics/common';
import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { provideI18nDateFormats } from '@cosmos/util-i18n-dates';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import { AuthFacade } from '@esp/auth/data-access-auth';
import { EspAutocompleteModule } from '@esp/autocomplete/data-access-autocomplete';
import { Presentation, PresentationTrack } from '@esp/presentations/types';

import { SharePresentationDialog } from './share-presentation.dialog';
import { SharePresentationLocalState } from './share-presentation.local-state';

const selectors = {
  title: dataCySelector('dialog-header'),
  subTitle: dataCySelector('dialog-sub-header'),
  closeButton: dataCySelector('dialog-close-button'),
  createButton: dataCySelector('create-button'),
  shareInput: dataCySelector('share-link-input'),
  shareLinkButton: dataCySelector('share-link-copy-btn'),
  subjectLineInput: dataCySelector('subject-line-input'),
  emailNoteInput: dataCySelector('email-note-input'),
  sendEmailButton: dataCySelector('send-email-button'),
  previewPresentationButton: dataCySelector('preview-presentation-button'),
  expirationDateInput: dataCySelector('expiration-date-input'),
  expirationDateHint: dataCySelector('expiration-date-hint'),
  expirationDateError: dataCySelector('expiration-date-error'),
  signatureToggle: dataCySelector('toggle-include-signature'),
  sharePresentationButton: dataCySelector('share-presentation-btn'),
};

const backdropClick$ = new Subject<void>();

describe('SharePresentationDialog', () => {
  const createComponent = createComponentFactory({
    component: SharePresentationDialog,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      EspAutocompleteModule,
      ConfigModule.forRoot({ customerPortalUrl: 'customerPortalUrl' }),
      CosUtilTranslationsTestingModule.forRoot(),
    ],
    providers: [
      provideI18nDateFormats(),
      mockProvider(AuthFacade, {
        user: { email: 'asiuser@asi.com' },
        profile$: of({}),
      }),
      mockProvider(AuthTokenService),
      mockProvider(CosAnalyticsService),
      {
        provide: MatDialogRef,
        useValue: {
          close: jest.fn(),
          backdropClick: () => backdropClick$,
        },
      },
    ],
  });

  const testSetup = (presentation?: Partial<Presentation>) => {
    const spectator = createComponent({
      providers: [
        mockProvider(SharePresentationLocalState, {
          ready: true,
          header: '',
          subject: '',
          save: () => of(null),
          sendPresentationEmail: () => of(null),
          generateShareLink: () => of(null),
          connect: () => of({ ready: true }),
          compileEmailTemplates: () => {},
        }),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            presentation: {
              Project: { Name: 'Test Project1', Id: '5311100' },
              ExpirationDate: new Date(),
              ShowSignature: true,
              ...presentation,
            },
            project: {
              Name: 'Test Project1',
              Id: '6311100',
              Customer: { Id: 0, Name: 'Customer' },
            },
          },
        },
      ],
    });

    const dialogRef = spectator.inject(MatDialogRef, true);
    const state = spectator.inject(SharePresentationLocalState, true);

    return {
      spectator,
      component: spectator.component,
      dialogRef,
      state,
    };
  };

  describe('SharePresentationDialog', () => {
    it('should create', () => {
      // Arrange
      const { component, spectator } = testSetup();

      // Assert
      expect(spectator).toBeTruthy();
      expect(component).toBeTruthy();
    });

    it('should close the modal by clicking the X button', () => {
      // Arrange
      const { dialogRef, spectator } = testSetup();
      const modalCloseBtn = spectator.query(selectors.closeButton);
      const closeSpy = jest.spyOn(dialogRef, 'close');

      // Act
      spectator.click(modalCloseBtn);

      // Assert
      expect(closeSpy).toHaveBeenCalledWith('');
    });

    describe('Tabs', () => {
      it('Should have a tab for Share via Email', (done) => {
        // Arrange
        const { component, spectator } = testSetup();
        const shareViaEmailTab = spectator.queryAll('mat-button-toggle')[0];

        component.shareOptions.pipe(first()).subscribe((shareOptions) => {
          // Assert
          expect(shareViaEmailTab).toBeVisible();
          expect(shareViaEmailTab.querySelector('button > span')).toHaveText(
            shareOptions[0].name
          );
          expect(shareOptions[0].name).toEqual('Share via Email');
          done();
        });
      });

      it('Should default to the Share via email tab', (done) => {
        // Arrange
        const { component, spectator } = testSetup();
        const tabs = spectator.queryAll('mat-button-toggle');
        const shareViaEmailTab = tabs[0];
        const shareViaLinkTab = tabs[1];

        component.shareOptions.pipe(first()).subscribe((shareOptions) => {
          // Assert
          expect(shareViaEmailTab).toHaveClass('mat-button-toggle-checked');
          expect(shareViaLinkTab).not.toHaveClass('mat-button-toggle-checked');
          expect(component.selectedView).toEqual(shareOptions[0].value);
          done();
        });
      });

      it('Should have a tab for Share via link', (done) => {
        // Arrange
        const { component, spectator } = testSetup();
        const shareViaLinkTab = spectator.queryAll('mat-button-toggle')[1];

        component.shareOptions.pipe(first()).subscribe((shareOptions) => {
          // Assert
          expect(shareViaLinkTab).toBeVisible();
          expect(shareViaLinkTab.querySelector('button > span')).toHaveText(
            shareOptions[1].name
          );
          expect(shareOptions[1].name).toEqual('Share via Link');
          done();
        });
      });
    });
    describe('Share Via Link', () => {
      describe('Preview Presentation', () => {
        it('Should have an option to preview the presentation', (done) => {
          // Arrange
          const { component, spectator } = testSetup();

          component.shareOptions.pipe(first()).subscribe((shareOptions) => {
            // Act
            component.toggleView({
              value: shareOptions[1].value,
            } as MatButtonToggleChange);
            spectator.detectComponentChanges();

            // Assert
            expect(component.selectedView).toEqual(shareOptions[1].value);

            const previewPresentationBtn = spectator.query(
              selectors.previewPresentationButton
            );

            // Assert
            expect(previewPresentationBtn).toBeVisible();
            expect(previewPresentationBtn).toHaveText('Preview Presentation');
            done();
          });
        });
      });

      describe('Copy Link', () => {
        it('Should generate the presentation URL when a user clicks this button if it has not previously been generated', (done) => {
          // Arrange
          const { component, spectator, state } = testSetup();

          // Act
          component.shareOptions.pipe(first()).subscribe((shareOptions) => {
            component.toggleView({
              value: shareOptions[1].value,
            } as MatButtonToggleChange);
            spectator.detectComponentChanges();

            // Assert
            expect(component.selectedView).toEqual(shareOptions[1].value);
            const shareLinkBtn = spectator.query(selectors.shareLinkButton);
            const serviceSpy = jest.spyOn(state, 'generateShareLink');

            // Assert
            expect(shareLinkBtn).toBeVisible();

            // Act
            spectator.click(shareLinkBtn);

            // Assert
            expect(serviceSpy).toHaveBeenCalled();
            done();
          });
        });

        it('should close the share dialog when the user clicks copy link primary action', () => {
          // Arrange
          const { component, spectator } = testSetup();
          const dialogRef = spectator.inject(MatDialogRef);
          const dialogCloseSpy = jest.spyOn(dialogRef, 'close');

          // Act
          component.copyPreviewLink();

          // Assert
          expect(dialogCloseSpy).toHaveBeenCalled();
        });

        it("should disable the 'Copy Link' button if the presentation is expired", (done) => {
          // Arrange
          const fiveDaysAgo = moment()
            .subtract(5, 'days')
            .toDate()
            .toDateString();
          const { component, spectator } = testSetup({
            ExpirationDate: fiveDaysAgo,
          });
          // Act
          component.shareOptions.pipe(first()).subscribe((shareOptions) => {
            component.toggleView({
              value: shareOptions[1].value,
            } as MatButtonToggleChange);
            spectator.detectComponentChanges();

            // Assert
            expect(spectator.query(selectors.shareLinkButton)).toBeDisabled();
            done();
          });
        });
      });
    });

    describe('Share Via Email', () => {
      describe('Add', () => {
        it('Preview Presentation - Should have an option to preview the presentation', () => {
          // Arrange
          const { spectator } = testSetup();
          const previewPresentationBtn = spectator.query(
            selectors.previewPresentationButton
          );

          // Assert
          expect(previewPresentationBtn).toBeVisible();
          expect(previewPresentationBtn).toHaveText('Preview Presentation');
        });
      });
      it('Recipients - Should allow users to enter email addresses', () => {
        // Arrange
        const { spectator } = testSetup();
        const autocompleteInputs = spectator.queryAll(
          'asi-party-multi-autocomplete'
        );

        // Assert
        expect(autocompleteInputs[0].querySelector('input')).toBeVisible();
        expect(autocompleteInputs[0].querySelector('input')).toHaveAttribute(
          'type',
          'email'
        );
      });

      it('Subject Line - Should display the presentation subject line', () => {
        // Arrange
        const { component, spectator } = testSetup();
        const subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );

        // Assert
        expect(subjectLineInput).toBeVisible();
        expect(subjectLineInput).toHaveValue(
          component.shareForm.get('Subject').value
        );
      });

      it('ENCORE-19238: Subject Line - Should display the correct watermark', () => {
        // Arrange
        const { spectator } = testSetup();
        const subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );

        // Assert
        expect(subjectLineInput).toBeVisible();
        expect(subjectLineInput.getAttribute('placeholder')).toEqual(
          'Enter Subject'
        );
      });

      it('Subject Line - Should allow a user to change the subject line', () => {
        // Arrange
        const textToType = 'test';
        const { component, spectator } = testSetup();
        let subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );

        // Assert
        expect(subjectLineInput).toHaveValue(
          component.shareForm.get('Subject').value
        );

        // Act
        spectator.typeInElement(textToType, subjectLineInput);
        spectator.detectComponentChanges();
        subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );

        // Assert
        expect(subjectLineInput).toHaveValue(
          component.shareForm.get('Subject').value
        );
        expect(component.shareForm.get('Subject').value).toEqual(textToType);
      });

      it('Subject Line - Should allow up to 255 characters in the subject line field', () => {
        // Arrange
        const { spectator } = testSetup();
        const subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );

        // Assert
        expect(subjectLineInput).toHaveAttribute('maxlength', '255');
      });

      it('Subject Line - Should highlight the input field when left blank', () => {
        // Arrange
        const { component, spectator } = testSetup();
        let subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );

        // Assert
        expect(subjectLineInput).toHaveValue(
          component.shareForm.get('Subject').value
        );

        // Act
        spectator.typeInElement('', subjectLineInput);
        spectator.detectComponentChanges();
        subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );
        spectator.blur(selectors.subjectLineInput);

        // Assert
        expect(subjectLineInput).toHaveAttribute('aria-invalid', 'true');
        expect(component.shareForm.get('Subject').value).toEqual('');
      });

      it('Subject Line - should be required', () => {
        // Arrange
        const { spectator } = testSetup();
        const subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );
        // Assert
        expect(subjectLineInput).toBeVisible();
        expect(subjectLineInput).toHaveAttribute('required');
      });

      it('Subject Line - should not enable share with customer primary action when left blank', () => {
        // Arrange
        const { spectator, component } = testSetup();

        // Act
        component.shareForm.controls.Subject.setValue('Subject');
        component.shareForm.controls.To.setValue(['testEmail1@asi.com']);
        spectator.detectComponentChanges();

        const subjectLineInput = spectator.query<HTMLInputElement>(
          selectors.subjectLineInput
        );
        const shareWithCustomerBtn = spectator.query<HTMLInputElement>(
          selectors.sharePresentationButton
        );

        // Assert
        expect(subjectLineInput).toHaveValue(
          component.shareForm.get('Subject').value
        );
        expect(subjectLineInput.value).not.toBeEmpty();
        expect(shareWithCustomerBtn).not.toBeDisabled();

        // Act
        spectator.typeInElement('', subjectLineInput);
        spectator.detectComponentChanges();

        // Assert
        expect(subjectLineInput.value).toEqual('');
        expect(shareWithCustomerBtn).toBeDisabled();
      });

      it('should allow the user to preview the pending changes in the presentation preview', () => {
        // Arrange
        const { component, spectator } = testSetup();
        const previewPresentationBtn = spectator.query(
          selectors.previewPresentationButton
        );
        jest.spyOn(component, 'previewPresentation');
        const settings = encodeURIComponent(
          JSON.stringify(component.settingsForm.getRawValue())
        );
        const windowSpy = jest.spyOn(window, 'open').mockImplementation();
        const tokenService = spectator.inject(AuthTokenService);

        // Assert
        expect(previewPresentationBtn).toBeVisible();

        // Act
        spectator.click(previewPresentationBtn);

        // Assert
        expect(component.previewPresentation).toHaveBeenCalled();
        expect(windowSpy).toHaveBeenCalledWith(
          `customerPortalUrl/presentations/${component.data.presentation.Id}/products?token=${tokenService.token}&settings=${settings}`
        );
      });

      it('should discard the pending changes if the user closes the modal without clicking the share primary action button', () => {
        // Arrange
        const { spectator } = testSetup();
        const modalCloseBtn = spectator.query(selectors.closeButton);
        const dialogRef = spectator.inject(MatDialogRef);
        const dialogCloseSpy = jest.spyOn(dialogRef, 'close');

        // Assert
        expect(modalCloseBtn).toBeVisible();

        // Act
        spectator.click(modalCloseBtn);

        // Assert
        expect(dialogCloseSpy).toHaveBeenCalledWith('');
      });

      it("should disable the 'Share with Customer' button if the presentation is expired", () => {
        // Arrange
        const fiveDaysAgo = moment()
          .subtract(5, 'days')
          .toDate()
          .toDateString();
        const { spectator } = testSetup({
          ExpirationDate: fiveDaysAgo,
        });
        // Assert
        expect(
          spectator.query(selectors.sharePresentationButton)
        ).toBeDisabled();
      });
    });

    describe('Signature', () => {
      it('should display the signature toggle', () => {
        // Arrange
        const { spectator } = testSetup();
        const signatureToggle = spectator.query<HTMLInputElement>(
          selectors.signatureToggle
        );
        // Assert
        expect(signatureToggle).toBeVisible();
        expect(signatureToggle).toHaveText('Include Signature');
      });

      it("should be using the presentation's current setting when you open the modal", () => {
        // Arrange
        const { spectator, component } = testSetup();
        const signatureToggle = spectator.query<HTMLInputElement>(
          selectors.signatureToggle
        );
        // Assert
        expect(component.data.presentation.ShowSignature).toBe(true);
        expect(signatureToggle).toBeVisible();
        expect(signatureToggle).toHaveClass('cos-checked');
      });
    });

    describe('Expiration Date', () => {
      it('should prepopulate with the expiration date set on the presentation settings', () => {
        // Arrange
        const { component, spectator } = testSetup();
        const expirationDatePicker = spectator.query(
          selectors.expirationDateInput
        );

        // Assert
        expect(expirationDatePicker).toHaveValue(
          moment(component.settingsForm.get('ExpirationDate').value).format(
            'MM/DD/YYYY'
          )
        );
      });

      it('should update the presentation expiration date when a new date is selected', () => {
        // Arrange
        const { component, spectator } = testSetup();
        const expirationDatePicker = spectator.query(
          selectors.expirationDateInput
        );

        // Act
        spectator.detectComponentChanges();

        // Assert
        expect(expirationDatePicker).toHaveValue(
          moment(component.settingsForm.get('ExpirationDate').value).format(
            'MM/DD/YYYY'
          )
        );
      });

      it('should have a maximum expiration date of 90 days out from the current date when sharing', () => {
        // Arrange
        const { component } = testSetup();
        const date = new Date();

        // Assert
        expect(component.maxExpirationDate.toDateString()).toEqual(
          moment(date).utc().add(90, 'days').toDate().toDateString()
        );
      });

      describe('Expiration date hint and validation [ENCORE-19244]', () => {
        it('should not show a hint if the presentation expiration date is in the future', () => {
          // Arrange
          const fiveDaysLater = moment.utc().add(5, 'days').toDate();

          testSetup({ ExpirationDate: fiveDaysLater });

          // Assert
          expect(selectors.expirationDateHint).not.toBeVisible();
        });

        it('should show a hint if the presentation expiration date is already in the past once the dialog is opened', () => {
          // Arrange
          const fiveDaysAgo = moment.utc().subtract(5, 'days').toDate();

          testSetup({ ExpirationDate: fiveDaysAgo });
          // Assert
          expect(selectors.expirationDateHint).toHaveText(
            'Expiration date is in the past. You must enter a future date.'
          );
        });

        it('should show error message when the selected expiration date is in the past', async () => {
          // Arrange
          const fiveDaysAgo = moment.utc().subtract(5, 'days').toDate();
          const { spectator } = testSetup({
            ExpirationDate: fiveDaysAgo,
          });
          const loader = TestbedHarnessEnvironment.loader(spectator.fixture);
          const harness = await loader.getHarness(MatDatepickerToggleHarness);
          // Act
          await harness.openCalendar();
          const calendar = await harness.getCalendar();
          if (new Date().getDate() === 1) {
            // on the first day of the month there's no previous date, so have to go to the previous month first
            await calendar.previous();
          }
          await calendar.selectCell({ today: false });
          // Assert
          expect(selectors.expirationDateError).toHaveText(
            'Expiration date is in the past. You must enter a future date.'
          );
        });
      });
    });

    describe('Email Note', () => {
      it('Should allow the user to provide a note that will be included in the email being sent', () => {
        // Arrange
        const textToType = 'test';
        const { component, spectator } = testSetup();
        let emailNoteInput = spectator.query<HTMLTextAreaElement>(
          selectors.emailNoteInput
        );

        // Assert
        expect(emailNoteInput).toBeVisible();
        expect(emailNoteInput).toHaveValue(
          component.shareForm.get('PersonalNote').value
        );
        expect(component.shareForm.get('PersonalNote').value).toEqual('');

        // Act
        spectator.typeInElement(textToType, emailNoteInput);
        spectator.detectComponentChanges();
        emailNoteInput = spectator.query<HTMLTextAreaElement>(
          selectors.emailNoteInput
        );

        // Assert
        expect(emailNoteInput).toHaveValue(
          component.shareForm.get('PersonalNote').value
        );
        expect(component.shareForm.get('PersonalNote').value).toEqual(
          textToType
        );
      });

      it('Should allow up to 250 characters in the personal note', () => {
        // Arrange
        const { spectator } = testSetup();
        const emailNoteInput = spectator.query<HTMLTextAreaElement>(
          selectors.emailNoteInput
        );

        // Assert
        expect(emailNoteInput).toHaveAttribute('maxlength', '250');
      });
    });

    describe('Share with customer', () => {
      it('Should send the email to the email addresses listed in the To & CC fields', () => {
        // Arrange
        const { component, state } = testSetup();
        const serviceSpy = jest.spyOn(state, 'sendPresentationEmail');

        // Act
        component.sendEmail();

        // Assert
        expect(serviceSpy).toHaveBeenCalledWith(component.shareForm.value);
      });

      it('should close the share dialog when the user clicks the share primary action button', () => {
        // Arrange
        const { component, dialogRef } = testSetup();
        const dialogCloseSpy = jest.spyOn(dialogRef, 'close');

        // Act
        component.sendEmail();

        // Assert
        expect(dialogCloseSpy).toHaveBeenCalled();
      });
    });

    describe('Stats', () => {
      it('should record Presentation Sent stat when email sent', () => {
        // Arrange
        const { component, spectator } = testSetup();
        const analyticsService = spectator.inject(CosAnalyticsService, true);

        const fnTrackStatEvent = jest
          .spyOn(analyticsService, 'track')
          .mockImplementation();

        const stat: TrackEvent<PresentationTrack> = {
          action: 'Presentation Sent',
          properties: {
            id: component.data.presentation.Id,
          },
        };

        // Act
        component.sendEmail();

        // Assert
        expect(fnTrackStatEvent).toHaveBeenCalledWith(stat);
      });

      it('should record Presentation Shared stat when link is copied', () => {
        // Arrange
        const { component, spectator } = testSetup();
        const analyticsService = spectator.inject(CosAnalyticsService, true);

        const fnTrackStatEvent = jest
          .spyOn(analyticsService, 'track')
          .mockImplementation();

        const stat: TrackEvent<PresentationTrack> = {
          action: 'Presentation Shared',
          properties: {
            id: component.data.presentation.Id,
          },
        };

        // Act
        component.copyPreviewLink();

        // Assert
        expect(fnTrackStatEvent).toHaveBeenCalledWith(stat);
      });

      it('should record Presentation Preview stat when preview link is clicked', () => {
        // Arrange
        const { component, spectator } = testSetup();
        const analyticsService = spectator.inject(CosAnalyticsService, true);

        const previewPresentationBtn = spectator.query(
          selectors.previewPresentationButton
        );

        const fnTrackStatEvent = jest
          .spyOn(analyticsService, 'track')
          .mockImplementation();

        const stat: TrackEvent<PresentationTrack> = {
          action: 'Presentation Preview',
          properties: {
            id: component.data.presentation.Id,
          },
        };

        // Act
        spectator.click(previewPresentationBtn);

        // Assert
        expect(fnTrackStatEvent).toHaveBeenCalledWith(stat);
      });
    });
  });
});
