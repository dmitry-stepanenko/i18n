import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve } from '@angular/router';
import { Store } from '@ngxs/store';

import { getParamsObject } from '@cosmos/core';
import { PresentationProductActions } from '@esp/presentations/feature-products';

@Injectable({ providedIn: 'root' })
export class LoadPresentationProductResolver
  implements Resolve<void>, CanActivate
{
  constructor(private store: Store) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.getParams(route) !== null;
  }

  resolve(route: ActivatedRouteSnapshot): void {
    const params = this.getParams(route);

    if (!params) return;

    this.store.dispatch(
      new PresentationProductActions.Get(
        params.presentationId,
        params.productId
      )
    );
  }

  private getParams(route: ActivatedRouteSnapshot) {
    const params = getParamsObject(route.paramMap, [
      'presentationId',
      'productId',
    ]);
    return params
      ? {
          presentationId: parseInt(params.presentationId, 10),
          productId: parseInt(params.productId, 10),
        }
      : null;
    //
  }
}
