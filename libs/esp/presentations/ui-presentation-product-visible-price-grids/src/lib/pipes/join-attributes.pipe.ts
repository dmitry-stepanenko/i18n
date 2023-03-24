import { Pipe, PipeTransform } from '@angular/core';

import { Nullable, PriceGrid } from '@cosmos/types-common';
import {
  PresentationProduct,
  PresentationProductAttribute,
} from '@esp/presentations/types';

function filterProductPricingAttributes(
  attributes: PresentationProductAttribute[]
): PresentationProductAttribute[] {
  const productPricingAttributes = ['SIZE', 'SHAP', 'MTRL', 'PRCL'];

  return attributes.filter((attribute) =>
    productPricingAttributes.includes(attribute.Type!)
  );
}

@Pipe({ name: 'joinAttributes', standalone: true })
export class JoinAttributesPipe implements PipeTransform {
  /**
   * I go to priceGrids[0].Attributes (Array<number>)
   * I go to Product.Attributes (Array<object>)
   * const productPricingAttributes = [SIZE, SHAP, MTRL, PRCL] as const
   * I loop product pricing attributes and their .Values
   * I loop .Values and I compare the priceGrids[0].Attributes with .Values.Id
   * I take the Values[0].Value and comma delimit it
   */
  transform(
    product: Nullable<PresentationProduct>,
    priceGrid: PriceGrid
  ): string {
    const attributes = product?.Attributes || [];

    let joined = '';

    const attributeValues = filterProductPricingAttributes(attributes)
      .map((attribute) => attribute.Values)
      .flat();

    for (const attribute of priceGrid.Attributes || []) {
      for (const attributeValue of attributeValues) {
        if (attribute === attributeValue?.Id) {
          joined += ` ${attributeValue?.Value}`;
        }
      }
    }

    return joined.trim();
  }
}
