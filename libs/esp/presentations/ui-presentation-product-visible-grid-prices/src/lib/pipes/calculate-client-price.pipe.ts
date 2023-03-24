import { Pipe, PipeTransform } from '@angular/core';

import { Currency, Price } from '@cosmos/types-common';
import { Presentation } from '@esp/presentations/types';
import { FormatPricePipe } from '@smartlink/products/util-format-price-pipe';

@Pipe({ name: 'calculateClientPrice', standalone: true })
export class CalculateClientPricePipe implements PipeTransform {
  private _formatPricePipe = new FormatPricePipe();

  transform(
    price: Price,
    presentation: Presentation,
    currencyConversion: Currency
  ): string {
    const value = price.Price! * (currencyConversion.ConversionRate || 1);

    // The formatted result is used to be displayed on the `ClientPrice` column.

    return this._formatPricePipe.transform(
      value,
      /* key */ undefined,
      /* showQuantity */ false,
      /* priceDefault */ 'QUR',
      presentation.CurrencyCode
    );
  }
}
