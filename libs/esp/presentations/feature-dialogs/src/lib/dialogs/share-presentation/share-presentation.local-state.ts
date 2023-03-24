import { Inject, Injectable } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import * as moment from 'moment';
import { tap } from 'rxjs';
import { v4 as uuid } from 'uuid';

import {
  LocalState,
  asDispatch,
  fromSelector,
  stateEffect,
  writableProp,
} from '@cosmos/state';
import { ContactType } from '@cosmos/types-common';
import { AuthFacade } from '@esp/auth/data-access-auth';
import {
  EmailTemplateToWorkerMessage,
  NOT_SET,
  compileEmailTemplatesOnWorker,
} from '@esp/common/util-email-template-worker';
import { PresentationsActions } from '@esp/presentations/data-access-presentations';
import { ProjectQueries } from '@esp/projects/data-access/store';

import { SharePresentationDialogData } from './share-presentation.type';

@Injectable()
export class SharePresentationLocalState extends LocalState<SharePresentationLocalState> {
  generateShareLink = asDispatch(PresentationsActions.GenerateShareLink);
  sendPresentationEmail = asDispatch(
    PresentationsActions.SendPresentationEmail
  );
  save = asDispatch(PresentationsActions.Update);

  compileEmailTemplates = stateEffect(() => {
    const message: EmailTemplateToWorkerMessage = {
      id: uuid(),
      // `fields` are `['Customer', 'ExpirationDate', 'Project.Name', ...]`.
      fields: this.data.fields,
      // `inputs` are actual email templates where values need to be replaced in.
      inputs: {
        header: this.data.emailTemplate.Header!,
        subject: this.data.emailTemplate.Subject,
      },
      // `context` is a data that is passed to `Mustache.render`, so it's able to find and replace
      // template variables there, e.g., `{{ Project.Approver.Name }}`.
      context: {
        Customer: this.data.presentation.Customer!.Name,
        DistributorName: this.authFacade.user!.Name,
        // The `ExpirationDate` is always required since it's calculated automatically.
        ExpirationDate: moment(this.data.presentation.ExpirationDate)
          .utc()
          .format('l'),
        Project: {
          Name: this.data.project.Name,
          // The `InHandsDate` might be optional.
          InHandsDate: this.data.project.InHandsDate
            ? moment(this.data.project.InHandsDate).format('l')
            : NOT_SET,
          Approver: {
            Name:
              this.data.project.Contacts?.find((contact) =>
                contact.Types?.includes(ContactType.Acknowledgement)
              )?.Name ?? NOT_SET,
          },
          Owner: {
            Name: this.data.project.Owner.Name ?? NOT_SET,
            Email: this.data.project.Owner.Email ?? NOT_SET,
          },
        },
      },
    };

    return compileEmailTemplatesOnWorker(message).pipe(
      tap(({ data }) => {
        this.ready = true;
        // We know these fields will exist since we passed the same keys into `inputs`.
        this.header = data.outputs['header'];
        this.subject = data.outputs['subject'];
      })
    );
  });

  // Determines whether we can render `mat-dialog-content` within the share presentation dialog.
  // The dialog is ready when the presentation email template and merged fields have been loaded,
  // and subject with header have been compiled.
  ready = writableProp(false);
  header = writableProp<string | null>(null);
  subject = writableProp<string | null>(null);
  approverContact = fromSelector(ProjectQueries.getAcknowledgementContact);

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: SharePresentationDialogData,
    private readonly authFacade: AuthFacade
  ) {
    super();
  }
}
