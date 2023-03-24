import { CosmosTranslocoService } from '@cosmos/util-translations';
import { PresentationProductSortOrder } from '@esp/presentations/types';

export const productSortOptions = (
  translocoService: CosmosTranslocoService
): {
  name: string;
  value?: PresentationProductSortOrder;
}[] => {
  const wrap = (key: string) =>
    translocoService.translate(
      `espPresentations.presentation-settings-page.presentation-products.${key}`
    );

  return [
    {
      name: wrap('sort'),
      value: 'None',
    },
    {
      name: wrap('newest-to-oldest'),
      value: 'Newest',
    },
    {
      name: wrap('oldest-to-newest'),
      value: 'Oldest',
    },
    {
      name: wrap('product-name'),
      value: 'NameAsc',
    },
    {
      name: wrap('product-number'),
      value: 'NumberAsc',
    },
    {
      name: wrap('profit'),
      value: 'ProfitAsc',
    },
    {
      name: wrap('price-high-to-low'),
      value: 'PriceDesc',
    },
    {
      name: wrap('price-low-to-high'),
      value: 'PriceAsc',
    },
    {
      name: wrap('cost-high-to-low'),
      value: 'CostDesc',
    },
    {
      name: wrap('cost-low-to-high'),
      value: 'CostAsc',
    },
    {
      name: wrap('supplier-name'),
      value: 'SupplierNameAsc',
    },
    {
      name: wrap('category'),
      value: 'CategoryAsc',
    },
  ];
};
