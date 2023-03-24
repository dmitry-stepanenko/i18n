import { MediaLink } from '@cosmos/types-party';
import { Order, OrderMessageType, ProductLineItem } from '@esp/orders/types';
import {
  LineItemCardViewModel,
  LineItemType,
  ProductMedia,
} from '@esp/presentations/types';

export function quoteToProductCardViews(
  quote?: Order | null
): LineItemCardViewModel[] {
  return (
    (quote?.LineItems as ProductLineItem[] | undefined)?.map((lineItem) => {
      const imprintMethod = lineItem.Decorations?.find(
        (decoration) => decoration?.Decoration?.Type === 'IMMD'
      )?.Decoration.Value;

      const message = lineItem.Messages?.find(
        ({ Type }) => Type === OrderMessageType.Customization
      );

      return {
        Id: lineItem.Id,
        ProductId: lineItem.ProductId!,
        Name: lineItem.Name,
        ImageUrl: lineItem.ImageUrl,
        Variants: lineItem.Variants,
        TotalPrice: lineItem.Totals?.Amount,
        CurrencySymbol: lineItem.CurrencySymbol,
        ImprintMethod: imprintMethod
          ? {
              Value: imprintMethod,
              ValueType: 'IMMD',
            }
          : undefined,
        Media: lineItem.Decorations?.reduce(
          (acc: ProductMedia[], decoration) => [
            ...acc,
            ...(decoration.Artwork ?? []).map((art: MediaLink) => ({
              MediaId: art.MediaId,
              FileName: art.OriginalFileName || '',
              ImageUrl: art.FileUrl || '',
            })),
          ],
          []
        ),
        TotalQuantity: lineItem.Totals?.Units ?? 0,
        ServiceCharges: lineItem.ServiceCharges,
        Decorations: lineItem.Decorations,
        CurrencyCode: lineItem.CurrencyCode,
        Status: undefined,
        Comment: message?.Message,
        Type: LineItemType.Product,
      };
    }) ?? []
  );
}
