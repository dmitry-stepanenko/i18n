import { AttributeValue, Media, Price, PriceGrid } from '@cosmos/types-common';

import { PresentationSettings } from './presentation-settings';

export interface Currency {
  Code?: string;
  Name?: string;
  Description?: string;
  Symbol?: string;
  DecimalSeparator?: string;
  GroupSeparator?: string;
}

export enum LikeDislike {
  None = 'None',
  Liked = 'Liked',
  Disliked = 'Disliked',
}

export enum PresentationProductStatus {
  None = 'None',
  Viewed = 'Viewed',
  InCart = 'In Cart',
  QuoteRequested = 'Quote Requested',
}

export interface PresentationProduct {
  Id: number;
  ProductId: number;
  IsVisible: boolean;
  ShowMinMaxRange: boolean;
  AdjustmentType?: string;

  PriceRange?: string;
  IsCustomPriceRange?: boolean;

  Adjustment: number;
  RoundPricesToTwoDecimal: boolean;
  Sequence: number;
  Supplier?: {
    Id: number;
    Name: string;
    AsiNumber: string;
    ExternalId?: number;
  };
  Status?: PresentationProductStatus;
  StatusDate?: Date;
  Like?: LikeDislike;
  Note?: string;
  Name?: string;
  Description?: string;
  Summary?: string;
  Number?: string;
  DefaultMedia: Media;
  Media: Media[];
  Attributes: PresentationProductAttribute[];
  PriceGrids: PriceGrid[];
  Charges: any[];
  Currencies: Currency[];
  LowestPrice: Price;
  HighestPrice: Price;
  UpdateDate?: string;
  ExpirationDate?: string;
  PublishDate?: string;
  SKU?: any[];
  Settings: PresentationSettings;
  ImprintColors: string;
  ImprintLocations: string;
  ImprintSizes: string;
}

export interface PresentationProductCharge {
  CriteriaCode: string;
  Id: number;
  Name: string;
  Sequence: number;
  Description: string;
  IsRequired?: boolean;
  PriceIncludes?: string;
  Prices?: Price[];
  Type?: string;
  TypeCode?: string;
  UsageLevel?: string;
  UsageLevelCode?: string;
  IsVisible?: boolean;
  // Custom properties that are set on the frontend.
  AttributeMap?: Array<AttributeValue | undefined>;
  AttributeTypes?: string[];
  AttributeByTypes?: Record<string, AttributeValue[]>;
  Attributes?: number[];
  VendorCode?: string;
}

export interface PresentationProductAttribute {
  Id?: number;
  Name?: string;
  Description?: string;
  Type?: string;
  TypeGroup?: string;
  Roles?: number[];
  IsRequired?: boolean;
  IsMultiSelect?: boolean;
  Values?: AttributeValue[];
}

export interface ProductSequence {
  Id: number;
  Sequence: number;
}

export interface PresentationEmail {
  To: string[];
  CC: string[];
  BCC?: string[];
  ReplyTo: string[];
  PersonalNote: string;
}
