import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule as MatDialogModule,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';

import { CosButtonModule } from '@cosmos/components/button';
import { CosInputModule } from '@cosmos/components/input';
import { CreateCollectionDialogResult } from '@esp/collections/feature-dialogs';

import { CreateNewPresentationDialogData } from './create-new-presentation.type';

// eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
@Component({
  selector: 'esp-create-new-presentation-dialog',
  templateUrl: './create-new-presentation.dialog.html',
  styleUrls: ['./create-new-presentation.dialog.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, CosButtonModule, CosInputModule],
})
export class CreateNewPresentationDialog {
  presentationlimit = 10;
  // To fix test cases, Should be removed when extended from ReactiveComponent
  state: any = { presentations: [] };

  constructor(
    private _dialogRef: MatDialogRef<
      CreateNewPresentationDialog,
      CreateCollectionDialogResult
    >,
    @Inject(MAT_DIALOG_DATA) private _data: CreateNewPresentationDialogData
  ) {}

  // eslint-disable-next-line
  showMore() {}
}
