import {
  createLoadingSelectorsFor,
  createPropertySelectors,
  createSelectorX,
} from '@cosmos/state';
import { AttributeValue, PriceGrid } from '@cosmos/types-common';
import {
  PresentationProduct,
  PresentationProductAttribute,
  PresentationProductCharge,
} from '@esp/presentations/types';

import {
  PresentationProductSet,
  PresentationProductState,
  PresentationProductStateModel,
} from '../states';

const imprintCriteriaCodes = [
  'ADCL',
  'ADLN',
  'ARTW',
  'IMCH',
  'IMCL',
  'IMLO',
  'IMMD',
  'IMOP',
  'IMSZ',
];

const productionTimeCodes = ['PRTM', 'RUSH', 'SDRU'];

export namespace PresentationProductQueries {
  export const { isLoading, hasLoaded, getLoadError } =
    createLoadingSelectorsFor<PresentationProductStateModel>(
      PresentationProductState
    );

  export const { items, currentId } =
    createPropertySelectors<PresentationProductStateModel>(
      PresentationProductState
    );

  export const getCurrent = createSelectorX(
    [items, currentId],

    (items, currentId) => (currentId && items?.[currentId]) || null
  );

  export const getProduct = createSelectorX(
    [getCurrent],
    (item: PresentationProductSet | null) => item?.product || null
  );

  export const getIsDirty = createSelectorX(
    [getCurrent],
    (item: PresentationProductSet | null) => item?.isDirty || null
  );

  export const getOriginalPriceGrids = createSelectorX(
    [getCurrent],
    (item: PresentationProductSet | null) => item?.originalPriceGrids || []
  );

  export const getAttributes = createSelectorX(
    [getProduct],
    (product: PresentationProduct | null) => product?.Attributes
  );

  export const getAttributeValuesMap = createSelectorX(
    [getAttributes],
    (attributes: PresentationProductAttribute[] | undefined) =>
      new Map(
        attributes?.flatMap((attribute) => {
          return (
            attribute.Values?.map((value) => [
              value.Id,
              { value, attribute },
            ]) || []
          );
        })
      )
  );

  export const getAttribute = (type: string) =>
    createSelectorX(
      [getAttributes],
      (attributes: PresentationProductAttribute[] | undefined) =>
        attributes?.find((attribute) => attribute.Type === type)
    );

  export const getPriceGrids = createSelectorX(
    [getProduct, getAttributeValuesMap],
    (product: PresentationProduct | null, valuesMap) =>
      product?.PriceGrids.map((priceGrid) => {
        const attributeByTypes: Record<
          string,
          {
            Name: string | undefined;
            Type: string;
            Values: Array<AttributeValue | undefined> | undefined;
          }
        > = {};
        const attributes = priceGrid.Attributes?.filter(function (id) {
          return valuesMap.get(id);
        }).map((id) => {
          return {
            ...valuesMap.get(id)?.value,
            Name: valuesMap.get(id)?.attribute.Name,
            Type: productionTimeCodes.includes(
              valuesMap.get(id)?.value.Type || ''
            )
              ? productionTimeCodes[0]
              : valuesMap.get(id)?.value.Type, // types for production time are different, but they should be treated as one
          };
        });
        const attributeTypes = [
          ...new Set(attributes?.map((attribute) => attribute?.Type)),
        ];

        attributes?.forEach((attr, i) => {
          if (!attr?.Type) return;
          attributeByTypes[attr?.Type] = {
            Name: attr.Name,
            Type: attr.Type,
            Values: attributes?.filter(
              (attribute) => attribute?.Type === attr?.Type
            ) as Array<AttributeValue | undefined>,
          };
        });

        const obj = {
          ...priceGrid,
          AttributeMap: attributes,
          AttributeTypes: attributeTypes,
          AttributeByTypes: attributeByTypes,
        } as PriceGrid;

        return obj;
      }) || []
  );

  export const getInvisiblePriceGrids = createSelectorX(
    [getPriceGrids],
    (priceGrids) =>
      priceGrids.filter((priceGrid) => priceGrid.IsVisible === false)
  );

  export const getVisiblePriceGrids = createSelectorX(
    [getPriceGrids],
    (priceGrids) => priceGrids.filter((priceGrid) => priceGrid.IsVisible)
  );

  export const getCharges = (visible: boolean) =>
    createSelectorX(
      [getProduct, getAttributeValuesMap],
      (product: PresentationProduct | null, valuesMap) => {
        const charges = product?.Charges.map((charge) => {
          const attributeByTypes: any = {};
          const attributes: any = charge.Attributes?.map(
            (id: number) => valuesMap.get(id)?.value
          );
          const attributeTypes: any = [
            ...new Set(attributes?.map((att: any) => att?.Type)),
          ];

          attributeTypes.forEach((type: any) => {
            if (!type) return;
            attributeByTypes[type] = attributes?.filter(
              (att: any) => att?.Type === type
            );
          });

          return {
            ...charge,
            AttributeMap: attributes,
            AttributeTypes: attributeTypes,
            AttributeByTypes: attributeByTypes,
          };
        });

        return charges?.filter((charge) => charge.IsVisible === visible) || [];
      }
    );

  export const getImprintCharges = (visible: boolean) =>
    createSelectorX(
      [getCharges(visible)],
      (charges: PresentationProductCharge[]) =>
        charges.filter(
          (charge) =>
            charge.Type &&
            imprintCriteriaCodes.some((c) => charge.AttributeTypes?.includes(c))
        ) || []
    );

  export const getVendorCharges = (visible: boolean) =>
    createSelectorX(
      [getCharges(visible)],
      (charges: PresentationProductCharge[]) =>
        charges.filter(
          (charge) =>
            charge.Type &&
            !imprintCriteriaCodes.some((c) =>
              charge.AttributeTypes?.includes(c)
            )
        ) || []
    );

  export const getOriginalPrices = (priceGridId: number) =>
    createSelectorX(
      [getOriginalPriceGrids],
      (originalPriceGrids) =>
        originalPriceGrids.find(({ Id }) => Id === priceGridId)?.Prices || []
    );
}
