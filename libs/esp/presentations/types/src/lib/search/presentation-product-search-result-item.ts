import { Supplier } from '@cosmos/components/types-supplier';

export interface PresentationView {
  Products: PresentationProductView[];
}

export interface PresentationProductView {
  Adjustment: number;
  AdjustmentType: string;
  DefaultMedia: {
    Url: string;
  };
  Description: string;
  Id: number;
  ImprintColors: string;
  ImprintLocations: string;
  ImprintSizes: string;
  IsCustomPriceRange: boolean;
  IsVisible: boolean;
  Like: string;
  Name: string;
  Number: string;
  ProductId: number;
  PublishDate: string;
  RoundPricesToTwoDecimal: boolean;
  Sequence: number;
  ShowMinMaxRange: boolean;
  Status: string;
  StatusDate: string;
  Summary: string;
  Supplier: Supplier;
  UpdateDate: string;
}
