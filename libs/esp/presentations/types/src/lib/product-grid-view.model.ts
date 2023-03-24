export interface ProductGridViewModel {
  Quantity: number;
  Description: string;
  Price?: number;
}

export interface ProductGridViewPriceDataModel {
  TotalPrice: number;
  ChargeQuantity: number;
  ChargePrice: number;
  CurrencySymbol: string;
}

export enum ProductCardGridType {
  Standard = 'standard',
  WithCharge = 'withCharge',
}
