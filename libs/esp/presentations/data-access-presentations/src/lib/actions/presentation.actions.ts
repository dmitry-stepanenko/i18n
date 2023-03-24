import {
  Currency,
  CurrencyCode,
  CurrencySymbol,
  Nullable,
} from '@cosmos/types-common';
import { HttpRequestOptions } from '@cosmos/util-http';
import {
  Presentation,
  PresentationEmail,
  PresentationProduct,
  PresentationProductSortOrder,
  ProductSequence,
} from '@esp/presentations/types';

const ACTION_SCOPE = '[Presentations]';

export namespace PresentationsActions {
  export class Create {
    static readonly type = `${ACTION_SCOPE} Create presentation`;
    constructor(
      public projectId: Nullable<number>,
      public productIds: number[] = []
    ) {}
  }

  export class GetPresentationIdByProjectId {
    static readonly type = `${ACTION_SCOPE} Get presentation by Project Id`;
    constructor(public projectId: number) {}
  }

  export class Get {
    static readonly type = `${ACTION_SCOPE} Get presentation`;
    constructor(
      public presentationId: number,
      public options?: HttpRequestOptions
    ) {}
  }

  export class GetQuote {
    static readonly type = `${ACTION_SCOPE} Get presentation quote`;
    constructor(
      public presentationId: number,
      public options?: HttpRequestOptions
    ) {}
  }

  export class PatchPresentation {
    static readonly type = `${ACTION_SCOPE} Patch presentation`;
    constructor(
      public presentationId: number,
      public patchSpec: Partial<Presentation>
    ) {}
  }

  export class Update {
    static readonly type = `${ACTION_SCOPE} Update presentation`;
    constructor(public presentation: Presentation) {}
  }

  export class GenerateShareLink {
    static readonly type = `${ACTION_SCOPE} Generate share link`;
  }

  export class SendPresentationEmail {
    static readonly type = `${ACTION_SCOPE} Send presentation email`;

    constructor(public presentationEmail: PresentationEmail) {}
  }

  // https://asiservice.uat-asicentral.com/venus/swagger/index.html
  // Presentations -> `PUT /api/presentations/${id}/products`
  export class AddProducts {
    static readonly type = `${ACTION_SCOPE} Add products to an existing presentation`;
    constructor(
      public presentationId: number,
      public projectName: string,
      public productIds: number[]
    ) {}
  }

  export class RemoveProduct {
    static readonly type = `${ACTION_SCOPE} Remove product from an existing presentation`;
    constructor(public presentationId: number, public productId: number) {}
  }

  export class SequenceProducts {
    static readonly type = `${ACTION_SCOPE} Sequence products in a presentation`;
    constructor(
      public presentationId: number,
      public sequence: ProductSequence[]
    ) {}
  }

  export class SortProducts {
    static readonly type = `${ACTION_SCOPE} Sort products in a presentation`;
    constructor(
      public presentationId: number,
      public sortOrder: PresentationProductSortOrder
    ) {}
  }

  export class UpdatePresentationProductVisibility {
    static readonly type = `${ACTION_SCOPE} Update presentation product visibility`;
    constructor(public productId: number, public isVisible: boolean) {}
  }

  export class UpdateProductVisibility {
    static readonly type = `${ACTION_SCOPE} Update visibility for product`;
    constructor(
      public presentationId: number,
      public productId: number,
      public isVisible: boolean
    ) {}
  }

  export class PatchProduct {
    static readonly type = `${ACTION_SCOPE} Patch product`;

    constructor(
      public presentationId: number,
      public productId: number,
      public patchSpec: Partial<PresentationProduct>
    ) {}
  }

  export class GetRecentActivities {
    static readonly type = `${ACTION_SCOPE} Get Recent Activities`;

    constructor(public projectId: number, public presentationId: number) {}
  }

  // https://asicentral.atlassian.net/browse/ENCORE-31077
  export class ChangeConversionRate {
    static readonly type = `${ACTION_SCOPE} Change Conversion Rate`;

    constructor(
      readonly currencies: Currency[],
      readonly currencyCode: CurrencyCode,
      readonly currencySymbol: CurrencySymbol
    ) {}
  }
}
