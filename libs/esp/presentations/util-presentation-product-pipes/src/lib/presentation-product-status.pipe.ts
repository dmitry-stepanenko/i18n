import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import type { Nullable, StatusObject } from '@cosmos/types-common';
import {
  CosmosTranslocoService,
  LanguageScope,
} from '@cosmos/util-translations';
import {
  PresentationProduct,
  PresentationProductStatus,
} from '@esp/presentations/types';

@Pipe({ name: 'presentationProductStatus', standalone: true })
export class PresentationProductStatusPipe implements PipeTransform {
  constructor(private _translocoService: CosmosTranslocoService) {}

  transform(
    product: Nullable<PresentationProduct>,
    hideViewedIcon = false
  ): Observable<StatusObject | null> {
    const keyPrefix = 'espPresentations.util-presentation-product-pipe';
    if (product == null) {
      return of(null);
    }

    return this._translocoService
      .getLangChanges$([LanguageScope.EspPresentations])
      .pipe(
        map(() => {
          // https://asicentral.atlassian.net/browse/ENCORE-13585
          // 1. Should display the viewed icon on the product cards in the presentation editor if a product has been viewed.
          //   1.1 Should display the disliked icon instead if the product has been both viewed & disliked.
          //     1.2 Should display the shopping cart icon if the product has been added to the shopping cart.
          //       1.3 Should display the Quote Requested card treatment if the product has been quote requested. Regardless of if the product has been viewed or disliked.

          // Considering the above requirements we should go down up.
          if (product.Status === PresentationProductStatus.QuoteRequested) {
            // 1.3 If the product has been quote requested.
            return {
              Label: '',
              Icon: 'check',
              Color: 'blue',
              Tooltip: this._translocoService.translate(
                `${keyPrefix}.quote-requested-tooltip`
              ),
              WrapperLabel: this._translocoService.translate(
                `${keyPrefix}.quote-requested-wrapper-label`
              ),
            };
          } else if (product.Status === PresentationProductStatus.InCart) {
            // 1.2 If the product has been added to the shopping cart.
            return {
              Label: '',
              Icon: 'shopping-cart',
              Color: 'gray',
              Tooltip: this._translocoService.translate(
                `${keyPrefix}.added-to-cart-tooltip`
              ),
            };
          } else if (product.Like === 'Disliked') {
            // 1.1 If  the product has been both viewed & disliked.
            return {
              Label: '',
              Icon: 'thumbs-down',
              Color: 'red',
              Tooltip: this._translocoService.translate(
                `${keyPrefix}.disliked-tooltip`
              ),
            };
          } else if (
            product.Status === PresentationProductStatus.Viewed &&
            !hideViewedIcon
          ) {
            // 1. If the product has been viewed, but nothing more.
            return { Label: '', Icon: 'eye', Color: 'gray' };
          } else {
            return null;
          }
        })
      );
  }
}
