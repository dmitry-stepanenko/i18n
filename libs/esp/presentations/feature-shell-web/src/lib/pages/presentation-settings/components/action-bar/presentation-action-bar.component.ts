import { CommonModule } from '@angular/common';
import {
  Attribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { firstValueFrom } from 'rxjs';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { CosAnalyticsService, TrackEvent } from '@cosmos/analytics/common';
import { CosButtonModule } from '@cosmos/components/button';
import { ConfigService } from '@cosmos/config';
import { FeatureFlagsModule } from '@cosmos/feature-flags';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { PresentationsDialogService } from '@esp/presentations/feature-dialogs';
import {
  Presentation,
  PresentationStatus,
  PresentationTrack,
} from '@esp/presentations/types';
import { Project } from '@esp/projects/types';

@Component({
  selector: 'esp-presentation-action-bar',
  templateUrl: './presentation-action-bar.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    FeatureFlagsModule,

    CosButtonModule,

    MatMenuModule,
    MatDialogModule,
    CosmosUtilTranslationsModule,
  ],
  providers: [provideLanguageScopes(LanguageScope.EspPresentations)],
})
export class PresentationActionBarComponent {
  @Input() presentation!: Presentation;
  @Input() project!: Project;
  @Input() editMode = false;
  @Input() status!: PresentationStatus;

  @Output() editModeChange = new EventEmitter<boolean>();

  PresentationStatus = PresentationStatus;

  readonly mobile: boolean;

  constructor(
    // eslint-disable-next-line @angular-eslint/no-attribute-decorator
    @Attribute('mobile') mobile: string | null,
    private readonly _analytics: CosAnalyticsService,
    private readonly tokenService: AuthTokenService,
    private readonly _dialogService: PresentationsDialogService,
    private readonly _configService: ConfigService
  ) {
    this.mobile = mobile === 'true';
  }

  previewPresentation() {
    this.captureEvent('Presentation Preview');

    window.open(
      `${this._configService.get<string>('customerPortalUrl')}/presentations/${
        this.presentation.Id
      }?token=${this.tokenService.token}`
    );
  }

  async sharePresentation() {
    await firstValueFrom(
      this._dialogService.openSharePresentation({
        presentation: this.presentation,
        project: this.project,
      })
    );
  }

  onEdit() {
    this.editMode = true;
    this.editModeChange.emit(this.editMode);
  }

  private captureEvent(action: 'Presentation Preview') {
    const event: TrackEvent<PresentationTrack> = {
      action: action,
      properties: {
        id: this.presentation.Id,
      },
    };
    this._analytics.track(event);
  }
}
