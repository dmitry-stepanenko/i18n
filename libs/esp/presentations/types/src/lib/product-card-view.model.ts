import { DecorationLineItem, ServiceCharge } from '@esp/orders/types';

import {
  ImprintMethodAttribute,
  ProductMedia,
} from './presentation-cart-product';
import { ProductGridViewModel } from './product-grid-view.model';

export interface LineItemCardViewModel {
  Id: number;
  Name?: string;
  ImageUrl?: string;
  Variants: ProductGridViewModel[];
  TotalQuantity: number;
  TotalPrice?: number;
  Status?: string;
  Media?: ProductMedia[];
  ImprintMethod?: ImprintMethodAttribute;
  Comment?: string;
  CurrencySymbol?: string;
  ServiceCharges?: ServiceCharge[];
  Decorations?: DecorationLineItem[];
  CurrencyCode?: string;
  IsVisible?: boolean;
  Description?: string;
  ProductId: number;

  // Business requirements wanna support showing non-product (e.g. service) line items
  // in product cards. They won't have images, but they may have the charge table
  Type: LineItemType;

  // The `Price` will exist only for service line items (not for product line items).
  Price?: number;
}

export enum LineItemType {
  Product = 'product',
  Service = 'service',
}
