import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { switchMap } from 'rxjs';

import { CollectionsDialogService } from '@esp/collections/feature-dialogs';
import { CreatePresentationFlow } from '@esp/presentations/feature-dialogs';
import { PresentationSearch } from '@esp/presentations/types';

import { ArchivedPresentationCardMenuService } from './archived-presentation-card-menu.service';

@UntilDestroy()
@Component({
  selector: 'esp-archived-presentation-card-menu',
  templateUrl: './archived-presentation-card-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatMenuModule],
})
export class ArchivedPresentationCardMenuComponent {
  @Input() presentation!: PresentationSearch;

  constructor(
    private readonly _createPresentationFlow: CreatePresentationFlow,
    private readonly _collectionsDialogService: CollectionsDialogService,
    private readonly _archivedPresentationCardMenuService: ArchivedPresentationCardMenuService
  ) {}

  downloadPdf(): void {
    this._archivedPresentationCardMenuService.downloadPdf(
      this.presentation.Id!
    );
  }

  createPresentation(): void {
    this._archivedPresentationCardMenuService
      .getArchivedPresentationProducts(this.presentation.Id)
      .pipe(untilDestroyed(this))
      .subscribe((products) => {
        this._createPresentationFlow.start({
          productIds: products.map(({ ProductId }) => ProductId),
          redirectAfterCreation: false,
        });
      });
  }

  createCollection(): void {
    this._archivedPresentationCardMenuService
      .getArchivedPresentationProducts(this.presentation.Id)
      .pipe(
        switchMap((products) =>
          this._collectionsDialogService.openCreateDialog({
            // sending payload with Ids of existing collection products cause 500
            products: products.map(({ Id, ...product }) => product),
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
