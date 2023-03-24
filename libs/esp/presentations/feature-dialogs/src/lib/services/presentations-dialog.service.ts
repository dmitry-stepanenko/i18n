import { Injectable } from '@angular/core';
import { forkJoin, map, mergeMap } from 'rxjs';

import { DialogService } from '@cosmos/ui-dialog';
import { SettingsService } from '@esp/settings/data-access-settings';
import { OrderEmailTemplateType } from '@esp/settings/types';

import {
  BaseSharePresentationDialogData,
  CreateNewPresentationDialogData,
  createNewPresentationDialogDef,
  sharePresentationDialogDef,
} from '../dialogs';

@Injectable({
  providedIn: 'root',
})
export class PresentationsDialogService {
  constructor(
    private readonly dialog: DialogService,
    private readonly settingsService: SettingsService
  ) {}

  openCreatePresentation(data?: CreateNewPresentationDialogData) {
    return this.dialog.open(createNewPresentationDialogDef, data);
  }

  openSharePresentation(data?: BaseSharePresentationDialogData) {
    const emailTemplate$ = this.settingsService.getEncoreEmailTemplateByType(
      OrderEmailTemplateType.Presentation
    );

    const fields$ = this.settingsService
      .getEmailTemplateMergedFields()
      .pipe(
        map((fields) =>
          fields[OrderEmailTemplateType.Presentation].map(({ Code }) => Code)
        )
      );

    return forkJoin({ emailTemplate: emailTemplate$, fields: fields$ }).pipe(
      mergeMap(({ emailTemplate, fields }) =>
        this.dialog.open(sharePresentationDialogDef, {
          ...data,
          emailTemplate,
          fields,
        })
      )
    );
  }
}
