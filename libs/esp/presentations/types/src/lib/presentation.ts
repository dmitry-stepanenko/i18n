import { Currency, CurrencyCode } from '@cosmos/types-common';
import { AccessLevel } from '@cosmos/types-party';
import { Company } from '@esp/parties/types';

import { PresentationProduct } from './presentation-product';
import { PresentationSettings } from './presentation-settings';

export enum PresentationStatus {
  // This is initial status.
  PreShare = 'PreShare',
  // This is after the presentation was sent.
  PostShare = 'PostShare',
  // This is after a cart was submitted.
  QuoteRequested = 'Quote Requested',
  // This is after the quote was sent from distributor.
  QuoteSent = 'Quote Sent',
}

export type PresentationProductSortOrder =
  | 'None'
  | 'PriceAsc'
  | 'PriceDesc'
  | 'NameAsc'
  | 'NameDesc'
  | 'Newest'
  | 'Oldest'
  | 'NumberAsc'
  | 'NumberDesc'
  | 'ProfitAsc'
  | 'ProfitDesc'
  | 'CostAsc'
  | 'CostDesc'
  | 'SupplierNameAsc'
  | 'SupplierNameDesc'
  | 'CategoryAsc'
  | 'CategoryDesc';

export interface Presentation {
  Id: number;
  ProjectId: number;
  IsDeleted: boolean;
  Customer: Company;
  Settings: PresentationSettings;
  CreateDate: string;
  UpdateDate: string | null;
  Note: string | null;
  ExpirationDate: Date | string | null;
  Status: PresentationStatus | null;
  LastViewDate: string | null;
  SharedDate: string | null;
  NumberOfProductsDisliked: number;
  NumberOfProductsQuoted: number;
  Products: PresentationProduct[];
  TenantId: number;
  OwnerId: number;
  AccessLevel: AccessLevel;
  Access: [];
  IsVisible: boolean;
  IsEditable: boolean;
  AllowProductVariants: boolean;
  ShowSignature: boolean;
  Quotes?: { QuoteId: number }[];

  // These properties don't exist for now on the API side.
  Currencies?: Currency[];
  CurrencyCode?: CurrencyCode;
  CurrencySymbol?: string;
  CurrencyRate?: number;
}
