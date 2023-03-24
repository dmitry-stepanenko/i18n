import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';

import {
  PresentationsActions,
  PresentationsQueries,
} from '@esp/presentations/data-access-presentations';
import { ProjectQueries } from '@esp/projects/data-access/store';
import { Project } from '@esp/projects/types';

@Injectable({ providedIn: 'root' })
export class ShouldCreatePresentationGuard implements CanActivate {
  constructor(private readonly router: Router, private readonly store: Store) {}

  canActivate(): Observable<boolean | UrlTree> {
    // Step 1: let's wait for the project to be set since it's set asynchronously.
    const project$ = this.store
      .select(ProjectQueries.getProject)
      .pipe(first((project): project is Project => Boolean(project)));

    // Step 2: let's search for presentations that are linked to that project.
    const search$ = project$.pipe(
      mergeMap((project) =>
        this.store
          .dispatch(
            new PresentationsActions.GetPresentationIdByProjectId(project.Id!)
          )
          .pipe(map(() => project))
      )
    );

    return search$.pipe(
      map((project) => {
        // Step 3: if there's any presentation that is linked to that project then let's redirect
        // the user to that specific presentation.
        const presentationId = this.store.selectSnapshot(
          PresentationsQueries.currentId
        );

        if (presentationId) {
          return this.router.createUrlTree([
            `/projects/${project.Id}/presentations/${presentationId}`,
          ]);
        } else {
          return true;
        }
      })
    );
  }
}
