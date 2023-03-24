import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { defer, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';

import { presentationProductsToCollectionProducts } from '@esp/collections/data-access-collections';
import { CollectionsDialogService } from '@esp/collections/feature-dialogs';
import { CreatePresentationFlow } from '@esp/presentations/feature-dialogs';
import { PresentationSearch } from '@esp/presentations/types';

import { ExpiredPresentationCardMenuLocalState } from './expired-presentation-card-menu.local-state';

@UntilDestroy()
@Component({
  selector: 'esp-expired-presentation-card-menu',
  templateUrl: './expired-presentation-card-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExpiredPresentationCardMenuLocalState],
  standalone: true,
  imports: [MatMenuModule],
})
export class ExpiredPresentationCardMenuComponent {
  @Input() presentation!: PresentationSearch;
  private _products$ = defer(() =>
    this._state
      .getPresentation(this.presentation.Id)
      .pipe(map(() => this._state.presentation!.Products))
  );

  constructor(
    private readonly _createPresentationFlow: CreatePresentationFlow,
    private readonly _collectionsDialogService: CollectionsDialogService,
    private readonly _state: ExpiredPresentationCardMenuLocalState
  ) {}

  createPresentation(): void {
    this._products$.pipe(untilDestroyed(this)).subscribe((products) =>
      this._createPresentationFlow.start({
        productIds: products.map(({ ProductId }) => ProductId),
        redirectAfterCreation: false,
      })
    );
  }

  createCollection(): void {
    this._products$
      .pipe(
        switchMap((products) =>
          this._collectionsDialogService.openCreateDialog({
            products: presentationProductsToCollectionProducts(products),
          })
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
