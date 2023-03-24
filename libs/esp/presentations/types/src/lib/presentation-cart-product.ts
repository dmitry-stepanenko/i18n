export interface PresentationCartProduct {
  Id: number;
  Name?: string;
  ImageUrl?: string;
  ProductId: number;
  PresentationProductId: number;
  Quantity: number;
  Description?: string;
  Cost: number;
  Price: number;
  CurrencyCode?: string;
  Media: ProductMedia[];
  ProductDetails?: ProductDetails[];
  Comment?: string;
  GroupingId: string;
  ImprintMethod?: ImprintMethodAttribute;
  Status?: string;
  IsVisible?: boolean;
}

export interface ProductMedia {
  MediaId: number;
  FileName: string;
  ImageUrl: string;
  FileSize?: number;
}

export interface ProductDetails {
  Quantity: number;
  Attributes: ProductDetailsAttributes[];
}

export interface ProductDetailsAttributes {
  AttributeId: number;
  AttributeValueId: number;
  AttributeName: string;
}

export interface ImprintMethodAttribute {
  ValueType: string;
  Value: string;
}
