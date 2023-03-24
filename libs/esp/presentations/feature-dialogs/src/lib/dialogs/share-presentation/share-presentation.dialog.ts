import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule as MatDialogModule,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as moment from 'moment';
import { Moment } from 'moment';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Observable, first, map, of, switchMap } from 'rxjs';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { CosAnalyticsService, TrackEvent } from '@cosmos/analytics/common';
import { CosButtonModule } from '@cosmos/components/button';
import { CosButtonGroupModule } from '@cosmos/components/button-group';
import { CosInputModule } from '@cosmos/components/input';
import { CosPillModule } from '@cosmos/components/pill';
import { CosSlideToggleModule } from '@cosmos/components/toggle';
import { ConfigService } from '@cosmos/config';
import { AbstractControl, FormBuilder } from '@cosmos/forms';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { assertDefined } from '@cosmos/util-common';
import { CosDatePipe } from '@cosmos/util-i18n-dates';
import {
  CosmosTranslocoService,
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { AuthFacade } from '@esp/auth/data-access-auth';
import { AutocompleteParams } from '@esp/autocomplete/types-autocomplete';
import { AsiEmailAutocompleteComponent } from '@esp/common/feature-email-autocomplete';
import { AsiPartyMultiAutocompleteComponentModule } from '@esp/common/feature-multi-autocomplete';
import { PresentationTrack } from '@esp/presentations/types';

import { SharePresentationLocalState } from './share-presentation.local-state';
import {
  SelectedView,
  ShareOptions,
  SharePresentationDialogData,
} from './share-presentation.type';

@UntilDestroy()
@Component({
  selector: 'esp-share-presentation-dialog',
  templateUrl: 'share-presentation.dialog.html',
  styleUrls: ['./share-presentation.dialog.scss'],
  providers: [
    SharePresentationLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    NgxSkeletonLoaderModule,
    CosButtonGroupModule,
    CosButtonModule,
    CosPillModule,
    CosInputModule,
    CosSlideToggleModule,
    AsiPartyMultiAutocompleteComponentModule,
    AsiEmailAutocompleteComponent,
    CosDatePipe,
    CosmosUtilTranslationsModule,
  ],
})
export class SharePresentationDialog implements OnInit {
  private readonly _domain = this._configService.get<string>(
    'myPromoOfficeDomain'
  );

  autoCompleteFilters: AutocompleteParams['filters'] = {};
  shareOptions = this.getShareOptions();
  selectedView = SelectedView.Email;

  shareForm = this._getShareFormGroup();
  settingsForm = this._getSettingsFormGroup();

  maxExpirationDate = moment.utc().add(90, 'days').toDate();
  minExpirationDate = moment.utc().add(1, 'days').toDate();
  isCopying = false;
  isSending = false;

  readonly expirationDateControl = this.settingsForm.get('ExpirationDate');

  constructor(
    readonly state: SharePresentationLocalState,
    @Inject(MAT_DIALOG_DATA)
    readonly data: SharePresentationDialogData,
    private readonly _analytics: CosAnalyticsService,
    private readonly _fb: FormBuilder,
    private readonly _tokenService: AuthTokenService,
    private readonly _authFacade: AuthFacade,
    private readonly _dialogRef: MatDialogRef<SharePresentationDialog>,
    private readonly _configService: ConfigService,
    private readonly _translocoService: CosmosTranslocoService
  ) {
    global_notProduction &&
      assertDefined(
        data.project,
        'SharePresentationDialog: data.project should be defined'
      );
    global_notProduction &&
      assertDefined(
        data.presentation,
        'SharePresentationDialog: data.presentation should be defined'
      );

    if (this.data.project.Customer.Id) {
      this.autoCompleteFilters = {
        CompanyBoost: {
          Terms: [this.data.project.Customer.Id],
          Behavior: 'Any',
        },
      };
    }

    state
      .connect(this, { renderStrategy: LocalStateRenderStrategy.Local })
      .pipe(
        first((state) => state.ready),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.shareForm.patchValue({
          Subject: this.state.subject!,
          PersonalNote: this.state.header!,
          To: [
            ...new Set(
              this.state.approverContact?.Emails.map(
                ({ Address }) => Address
              ).filter(Boolean) ?? []
            ),
          ],
        });
      });
  }

  ngOnInit(): void {
    this.state.compileEmailTemplates();
  }

  copyPreviewLink(): void {
    this.isCopying = true;
    this.state
      .generateShareLink()
      .pipe(
        switchMap(() =>
          this.settingsForm.dirty
            ? this.state.save({
                ...this.data.presentation,
                ...this.settingsForm.getRawValue(),
              })
            : of(void null)
        ),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this._captureEvent('Presentation Shared');
        this._dialogRef.close();
      });
  }

  previewPresentation(): void {
    const settings = encodeURIComponent(
      JSON.stringify(this.settingsForm.getRawValue())
    );

    this._captureEvent('Presentation Preview');

    const portalUrl = this._configService.get<string>('customerPortalUrl');
    window.open(
      `${portalUrl}/presentations/${this.data.presentation.Id}/products?token=${this._tokenService.token}&settings=${settings}`
    );
  }

  sendEmail(): void {
    this.isSending = true;
    this.state
      .save({
        ...this.data.presentation,
        ...this.settingsForm.value,
      })
      .pipe(
        switchMap(() =>
          this.state.sendPresentationEmail(this.shareForm.getRawValue())
        ),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this._captureEvent('Presentation Sent');
        this._dialogRef.close();
      });
  }

  updateSharingOption(): void {
    const showSignature = this.settingsForm.get('ShowSignature');

    showSignature?.setValue(!this.settingsForm.get('ShowSignature')?.value);
    showSignature?.markAsDirty();
  }

  toggleView(event: MatButtonToggleChange): void {
    this.selectedView = event.value;
  }

  private _captureEvent(
    action: 'Presentation Sent' | 'Presentation Shared' | 'Presentation Preview'
  ): void {
    const event: TrackEvent<PresentationTrack> = {
      action,
      properties: {
        id: this.data.presentation.Id!,
      },
    };
    this._analytics.track(event);
  }

  private _getSettingsFormGroup() {
    return this._fb.group({
      ShowSignature: [this.data.presentation.ShowSignature],
      ExpirationDate: [
        this.data.presentation.ExpirationDate,
        [this._createExpirationDateValidator()],
      ],
    });
  }

  private _getShareFormGroup() {
    return this._fb.group({
      To: [[] as string[], [Validators.required]],
      CC: [
        this.data.project?.ProjectEmail
          ? [`${this.data.project?.ProjectEmail}@${this._domain}`]
          : [],
      ],
      Subject: ['', [Validators.required]],
      PersonalNote: [''],
      ReplyTo: [
        [this._authFacade.user!.Email] as string[],
        Validators.required,
      ],
    });
  }

  // Gotta have it as a factory method to avoid re-ordering properties, e.g., it throws
  // that function is accessed before initialization. We wanna make it lazy.
  private _createExpirationDateValidator(): ValidatorFn {
    return (control: AbstractControl<Moment>): ValidationErrors | null => {
      const expirationDateDifference = moment
        .utc(this.minExpirationDate)
        .startOf('day')
        .diff(control.value, 'day', false);

      return expirationDateDifference > 0
        ? { invalidExpirationDate: true }
        : null;
    };
  }

  private getShareOptions(): Observable<ShareOptions[]> {
    return this._translocoService
      .getLangChanges$([LanguageScope.EspPresentations])
      .pipe(
        map(() => {
          return [
            {
              name: this._translocoService.translate(
                'espPresentations.share-presentation-dialog.share-via-email'
              ),
              value: SelectedView.Email,
            },
            {
              name: this._translocoService.translate(
                'espPresentations.share-presentation-dialog.share-via-link'
              ),
              value: SelectedView.Link,
            },
          ];
        })
      );
  }
}
