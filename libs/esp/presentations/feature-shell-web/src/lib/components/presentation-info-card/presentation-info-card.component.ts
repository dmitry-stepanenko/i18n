import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { MatTooltipModule } from '@cosmos/components/tooltip';
import { FormControl } from '@cosmos/forms';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { CosDatePipe } from '@cosmos/util-i18n-dates';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { PresentationStatus } from '@esp/presentations/types';
import { ProjectsDialogService } from '@esp/projects/feature-dialogs';

import { PresentationLocalState } from '../../local-states';

@Component({
  selector: 'esp-presentation-info-card',
  templateUrl: './presentation-info-card.component.html',
  styleUrls: ['./presentation-info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PresentationLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
})
export class PresentationInfoCardComponent {
  readonly presentationPhase = new FormControl(PresentationStatus.PostShare);

  readonly PresentationStatus = PresentationStatus;

  constructor(
    readonly state: PresentationLocalState,
    private readonly _dialogService: ProjectsDialogService
  ) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });
  }

  async openEditDialog(): Promise<void> {
    if (!this.state.project) {
      return;
    }

    await firstValueFrom(
      this._dialogService.openProjectEditInfoDialog(this.state.project)
    );
  }
}

@NgModule({
  declarations: [PresentationInfoCardComponent],
  imports: [
    CommonModule,
    CosButtonModule,
    CosCardModule,
    CosDatePipe,
    MatTooltipModule,
    CosmosUtilTranslationsModule,
  ],
  exports: [PresentationInfoCardComponent],
})
export class PresentationInfoCardComponentModule {}
