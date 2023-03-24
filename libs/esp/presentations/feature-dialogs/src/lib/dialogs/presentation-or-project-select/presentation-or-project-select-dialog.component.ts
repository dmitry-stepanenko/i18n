import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule as MatDialogModule,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';

import { CosButtonModule } from '@cosmos/components/button';
import { CosDialogModule } from '@cosmos/components/dialog';
import { CosFormFieldModule } from '@cosmos/components/form-field';
import { CosInputModule } from '@cosmos/components/input';
import { CosPresentationCardModule } from '@cosmos/components/presentation-card';
import { trackItem } from '@cosmos/core';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { SearchCriteria } from '@esp/common/types';
import { CardsSelectionDialogComponentModule } from '@esp/common/ui-cards-selection-dialog';
import {
  AsiDetailsCardLoaderComponentModule,
  EspCommonUiDetailsCardComponentModule,
} from '@esp/common/ui-details-card';
import { AsiCompanyAvatarModule } from '@esp/companies/ui-company-avatar';
import { PresentationsActions } from '@esp/presentations/data-access-presentations';
import { PresentationSearch } from '@esp/presentations/types';
import { SEARCH_LOCAL_STATE } from '@esp/search/data-access-search-local-states';

import { PresentationOrProjectSelectDialogSearchLocalState } from './presentation-select.local-state';
import {
  PresentationOrProjectSelectDialogData,
  PresentationOrProjectSelectDialogResult,
} from './presentation-select.type';

@UntilDestroy()
@Component({
  selector: 'esp-presentation-or-project-select',
  templateUrl: './presentation-or-project-select-dialog.component.html',
  styleUrls: ['./presentation-or-project-select-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PresentationOrProjectSelectDialogSearchLocalState,
    {
      provide: SEARCH_LOCAL_STATE,
      useExisting: PresentationOrProjectSelectDialogSearchLocalState,
    },
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CosButtonModule,
    CosFormFieldModule,
    CosInputModule,
    CosPresentationCardModule,
    CosDialogModule,
    MatDialogModule,
    EspCommonUiDetailsCardComponentModule,
    AsiCompanyAvatarModule,
    CardsSelectionDialogComponentModule,
    AsiDetailsCardLoaderComponentModule,
  ],
})
export class PresentationOrProjectSelectDialog {
  readonly subheader = this._data.input.subheader;
  readonly title = this._data.input.title;
  readonly showProjects = this._data.input.showProjects ?? false;

  readonly trackById = trackItem<PresentationSearch>(['Id']);

  private _currentSearchTerm = '';
  private _loadingSave = false;

  constructor(
    private readonly _store: Store,
    private _dialogRef: MatDialogRef<
      PresentationOrProjectSelectDialog,
      PresentationOrProjectSelectDialogResult
    >,
    @Inject(MAT_DIALOG_DATA)
    private readonly _data: PresentationOrProjectSelectDialogData,
    readonly state: PresentationOrProjectSelectDialogSearchLocalState
  ) {
    this.state.customerId = _data.input.customerId;
    this.state.selectedPresentationId = _data.input.presentationId;
    state.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });
  }

  onSearch(term: string): void {
    this._currentSearchTerm = term;
    this.state.search({
      term,
      from: 1,
      editOnly: true,
    } as SearchCriteria);
  }

  onSelectPresentation(presentation: PresentationSearch): void {
    if (this._loadingSave) return;
    this._loadingSave = true;

    // verify if dialog could be closed at this point and this logic be moved to caller component
    if (this._data.input.checkedProducts) {
      this._store
        .dispatch(
          new PresentationsActions.AddProducts(
            presentation.Id,
            presentation.Project.Name,
            Array.from(this._data.input.checkedProducts.keys())
          )
        )
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.completeWithPresentation(presentation);
        });
    } else {
      this.completeWithPresentation(presentation);
    }
  }

  onCreateNewPresentation(): void {
    this._dialogRef.close({
      action: 'next',
      data: {},
    });
  }

  onPreviousStep(): void {
    this._dialogRef.close({
      data: {
        searchTerm: this._currentSearchTerm,
      },
      action: 'previous',
    });
  }

  private completeWithPresentation(presentation: PresentationSearch): void {
    this._dialogRef.close({
      action: 'next',
      data: {
        complete: true,
        selectedPresentation: presentation,
      },
    });
  }
}
