import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve } from '@angular/router';
import { Store } from '@ngxs/store';

import { getParamsObject } from '@cosmos/core';
import { PresentationsActions } from '@esp/presentations/data-access-presentations';

@Injectable({ providedIn: 'root' })
export class LoadPresentationResolver implements Resolve<void>, CanActivate {
  constructor(private store: Store) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.getParams(route) !== null;
  }

  resolve(route: ActivatedRouteSnapshot): void {
    const params = this.getParams(route);

    params &&
      this.store.dispatch(new PresentationsActions.Get(params.presentationId));
  }

  private getParams(route: ActivatedRouteSnapshot) {
    const params = getParamsObject(route.paramMap, ['presentationId']);
    return (
      params && {
        presentationId: parseInt(params.presentationId, 10),
      }
    );
  }
}
