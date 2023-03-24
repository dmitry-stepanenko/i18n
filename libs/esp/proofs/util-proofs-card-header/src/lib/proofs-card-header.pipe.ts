import { Pipe, PipeTransform, inject } from '@angular/core';
import { HashMap } from '@ngneat/transloco/lib/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProjectProof, ProjectProofStatus } from '@cosmos/types-common';
import { CosDatePipe } from '@cosmos/util-i18n-dates';
import {
  CosmosTranslocoService,
  LanguageScope,
} from '@cosmos/util-translations';

@Pipe({
  name: 'proofCardHeaderText',
  standalone: true,
})
export class ProofCardHeaderTextPipe implements PipeTransform {
  private readonly _cosDatePipe = inject(CosDatePipe);

  constructor(private readonly _translocoService: CosmosTranslocoService) {}

  transform(
    proof: ProjectProof,
    status?: ProjectProofStatus
  ): Observable<string> {
    const wrap = (key: string, params: HashMap) =>
      this._translocoService.translate(
        `espProofs.project-proofs-page.list.${key}`,
        {
          ...params,
        }
      );

    return this._translocoService
      .getLangChanges$([LanguageScope.EspProofs])
      .pipe(
        map(() => {
          switch (status) {
            case ProjectProofStatus.ReadyForReview:
              if (proof.ApproveByDate) {
                return wrap('approve-by-date', {
                  date: this._cosDatePipe.transform(
                    proof.ApproveByDate,
                    'longDate'
                  ),
                });
              }
              return wrap('proof-sent-on', {
                date: this._cosDatePipe.transform(proof.SharedDate, 'longDate'),
                senderName: proof.SenderName,
              });
            case ProjectProofStatus.Approved:
              return wrap('proof-approved', {
                date:
                  this._cosDatePipe.transform(proof.ApprovedDate, 'longDate') ??
                  '_',
                approvedBy: proof.ApprovedBy,
              });
            case ProjectProofStatus.ChangesRequested:
              return wrap('changes-requested', {
                date:
                  this._cosDatePipe.transform(
                    proof.ChangeRequestedDate,
                    'longDate'
                  ) ?? '',
                customerName: proof.CustomerName,
              });
            default:
              return '';
          }
        })
      );
  }
}
