import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';

import { CosButtonModule } from '@cosmos/components/button';
import {
  PresentationsActions,
  PresentationsQueries,
} from '@esp/presentations/data-access-presentations';
import { ProjectQueries } from '@esp/projects/data-access/store';

@UntilDestroy()
@Component({
  selector: 'esp-create-presentation',
  templateUrl: './create-presentation.page.html',
  styleUrls: ['./create-presentation.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePresentationPage {
  constructor(private readonly router: Router, private readonly store: Store) {}

  createPresentation(): void {
    const project = this.store.selectSnapshot(ProjectQueries.getProject);

    this.store
      .dispatch(new PresentationsActions.Create(project?.Id ?? null))
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const presentation = this.store.selectSnapshot(
          PresentationsQueries.getPresentation
        );

        this.router.navigateByUrl(
          `/projects/${project?.Id}/presentations/${presentation?.Id}`
        );
      });
  }
}

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: CreatePresentationPage }]),
    CosButtonModule,
  ],
  declarations: [CreatePresentationPage],
})
export class CreatePresentationPageModule {}
