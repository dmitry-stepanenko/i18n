import { ProductSearchFilters } from '@esp/products/types';

export function encodeProductFilters(value: ProductSearchFilters): string[] {
  const values = value ? Object.entries(value).filter(([v]) => v != null) : [];

  return values?.length
    ? [encodeURIComponent(JSON.stringify(Object.fromEntries(values)))]
    : [];
}
