import { Shareable } from '@cosmos/types-party';
import { Customer } from '@esp/projects/types';

export interface PresentationSearch extends Shareable {
  Id: number;
  Description?: string;
  Customer: Customer;
  UpdateDate?: string;
  CreateDate?: string;
  Products: { Id: number; ImageUrl?: string; ProductId?: number }[];
  ProductCount: number;
  Project: {
    Id: number;
    Name: string;
  };
  // the following properties are for ESP (archived) presentations api
  Name?: string;
  LogoMediaId?: number;
  LogoImageUrl?: string;
  IconImageUrl?: string;
  PrimaryBrandColor?: string;
}
