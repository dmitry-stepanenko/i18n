import { randNumber, randPastDate } from '@ngneat/falso';

import { CompaniesMockDb } from '@esp/companies/mocks-companies';
import { Presentation, PresentationStatus } from '@esp/presentations/types';

const mockPresentation = (): Presentation => ({
  Id: 1,
  ProjectId: randNumber(),
  IsDeleted: false,
  Customer: CompaniesMockDb.Companies[0],
  Settings: {
    ShowProductColors: false,
    ShowProductSizes: false,
    ShowProductShape: false,
    ShowProductMaterial: false,
    ShowProductCPN: false,
    ShowProductImprintMethods: false,
    ShowProductPricing: false,
    ShowProductPriceGrids: false,
    ShowProductPriceRanges: false,
    ShowProductAdditionalCharges: false,
    ShowProductDiscount: false,
  },
  CreateDate: randPastDate().toISOString(),
  UpdateDate: null,
  Note: null,
  ExpirationDate: null,
  Status: PresentationStatus.PreShare,
  LastViewDate: null,
  SharedDate: null,
  NumberOfProductsDisliked: 0,
  NumberOfProductsQuoted: 0,
  Products: [],
  TenantId: randNumber(),
  OwnerId: randNumber(),
  Access: [],
  AccessLevel: 'Owner',
  IsVisible: false,
  IsEditable: false,
  AllowProductVariants: false,
  ShowSignature: false,
});

export class PresentationMockDb {
  static get presentation(): Presentation {
    return mockPresentation();
  }
}
