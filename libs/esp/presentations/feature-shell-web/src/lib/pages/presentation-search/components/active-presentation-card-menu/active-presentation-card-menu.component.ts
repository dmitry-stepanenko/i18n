import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, forkJoin } from 'rxjs';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { CosAnalyticsService, TrackEvent } from '@cosmos/analytics/common';
import { ConfigService } from '@cosmos/config';
import { presentationProductsToCollectionProducts } from '@esp/collections/data-access-collections';
import { CollectionsDialogService } from '@esp/collections/feature-dialogs';
import {
  CreatePresentationFlow,
  PresentationsDialogService,
} from '@esp/presentations/feature-dialogs';
import {
  PresentationSearch,
  PresentationTrack,
} from '@esp/presentations/types';

import { ActivePresentationCardMenuLocalState } from './active-presentation-card-menu.local-state';

@UntilDestroy()
@Component({
  selector: 'esp-active-presentation-card-menu',
  templateUrl: './active-presentation-card-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ActivePresentationCardMenuLocalState],
  standalone: true,
  imports: [MatMenuModule],
})
export class ActivePresentationCardMenuComponent {
  @Input() presentation!: PresentationSearch;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _tokenService: AuthTokenService,
    private readonly _analytics: CosAnalyticsService,
    private readonly _dialogService: PresentationsDialogService,
    private readonly _state: ActivePresentationCardMenuLocalState,
    private readonly _createPresentationFlow: CreatePresentationFlow,
    private readonly _collectionsDialogService: CollectionsDialogService
  ) {}

  previewPresentation(): void {
    this._captureEvent('Presentation Preview');
    window.open(
      `${this._configService.get<string>('customerPortalUrl')}/presentations/${
        this.presentation.Id
      }?token=${this._tokenService.token}`
    );
  }

  async sharePresentation() {
    await firstValueFrom(
      forkJoin([
        this._state.getPresentation(this.presentation.Id),
        this._state.getProject(this.presentation.Project.Id),
      ])
    );

    await firstValueFrom(
      this._dialogService.openSharePresentation({
        presentation: this._state.presentation!,
        project: {
          ...this._state.project!,
          Customer: this.presentation.Customer,
        },
      })
    );
  }

  private _captureEvent(action: 'Presentation Preview'): void {
    const event: TrackEvent<PresentationTrack> = {
      action: action,
      properties: {
        id: this.presentation?.Id,
      },
    };
    this._analytics.track(event);
  }

  createPresentation() {
    this._state
      .getPresentation(this.presentation.Id)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const productIds = this._state.presentation?.Products.map(
          (p) => p.ProductId
        );
        this._createPresentationFlow.start({
          productIds,
          redirectAfterCreation: false,
        });
      });
  }

  createCollection() {
    this._state
      .getPresentation(this.presentation.Id)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const presentation = this._state.presentation;
        const products = presentation?.Products
          ? presentationProductsToCollectionProducts(presentation.Products)
          : null;
        this._collectionsDialogService
          .openCreateDialog(products ? { products } : null, false)
          .pipe(untilDestroyed(this))
          .subscribe();
      });
  }
}
