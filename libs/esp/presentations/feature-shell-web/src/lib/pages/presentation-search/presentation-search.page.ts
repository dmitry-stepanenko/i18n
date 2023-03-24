import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { Router, RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { CosButtonModule } from '@cosmos/components/button';
import { CosPresentationCardModule } from '@cosmos/components/presentation-card';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { InformationDialogService } from '@cosmos/ui-dialog';
import { CreatePresentationFlow } from '@esp/presentations/feature-dialogs';
import { PresentationSearch } from '@esp/presentations/types';
import { SEARCH_LOCAL_STATE } from '@esp/search/data-access-search-local-states';
import {
  EspSearchBoxModule,
  EspSearchPaginationModule,
  EspSearchSortModule,
  EspSearchTabsModule,
} from '@esp/search/feature-search-elements';

import { ActivePresentationCardMenuComponent } from './components/active-presentation-card-menu';
import { ArchivedPresentationCardMenuComponent } from './components/archived-presentation-card-menu';
import { ExpiredPresentationCardMenuComponent } from './components/expired-presentation-card-menu';
import {
  PRESENTATION_TABS,
  isArchivedPresentationsTab,
  oldEspSortMenuOptions,
  sortMenuOptions,
} from './presentation-search.config';
import { PresentationSearchLoaderComponentModule } from './presentation-search.loader';
import { PresentationSearchLocalState } from './presentation-search.local-state';

@UntilDestroy()
@Component({
  selector: 'esp-presentation-search',
  templateUrl: './presentation-search.page.html',
  styleUrls: ['./presentation-search.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CreatePresentationFlow,
    PresentationSearchLocalState,
    {
      provide: SEARCH_LOCAL_STATE,
      useExisting: PresentationSearchLocalState,
    },
  ],
})
export class PresentationSearchPage {
  readonly tabs = PRESENTATION_TABS;

  sortMenuOptions = sortMenuOptions;

  constructor(
    readonly state: PresentationSearchLocalState,
    private readonly _createPresentationFlow: CreatePresentationFlow,
    private readonly _router: Router,
    private readonly _infoDialogService: InformationDialogService
  ) {
    state.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });
    this.refreshAfterPresentationCreation();
  }

  refreshAfterPresentationCreation() {
    this._createPresentationFlow.flowFinished$
      .pipe(untilDestroyed(this))
      .subscribe((finished) => {
        if (finished) {
          this._infoDialogService
            .openInformationDialog({
              title: 'Waiting for data update...',
            })
            .then(() => this.state.search(this.state.criteria!));
        }
      });
  }

  updateSortMenuOptions(tabIndex: number): void {
    if (isArchivedPresentationsTab(tabIndex)) {
      this.sortMenuOptions = oldEspSortMenuOptions;
    } else {
      this.sortMenuOptions = sortMenuOptions;
    }
  }

  createPresentation() {
    this._createPresentationFlow.start();
  }

  navigateToPresentation(presentation: PresentationSearch) {
    // Act as no-op for archived presentations, they don't have detail pages.
    if (isArchivedPresentationsTab(this.state.tabIndex)) {
      return;
    }

    this._router.navigateByUrl(
      `/projects/${presentation?.Project.Id}/presentations/${presentation?.Id}`
    );
  }
}

@NgModule({
  declarations: [PresentationSearchPage],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: PresentationSearchPage }]),

    MatDialogModule,

    CosButtonModule,
    CosPresentationCardModule,

    EspSearchBoxModule,
    EspSearchPaginationModule,
    EspSearchSortModule,
    EspSearchTabsModule,

    PresentationSearchLoaderComponentModule,
    ActivePresentationCardMenuComponent,
    ArchivedPresentationCardMenuComponent,
    ExpiredPresentationCardMenuComponent,
  ],
  exports: [PresentationSearchPage],
})
export class PresentationSearchPageModule {}
