import { Price, PriceGrid } from '@cosmos/types-common';
import { HttpRequestOptions } from '@cosmos/util-http';
import {
  PresentationProduct,
  PresentationProductAttribute,
  PresentationProductCharge,
} from '@esp/presentations/types';

const ACTION_SCOPE = '[PresentationProduct]';

export namespace PresentationProductActions {
  export class Get {
    static readonly type = `${ACTION_SCOPE} Get product`;
    constructor(
      public presentationId: number,
      public productId: number,
      public options?: HttpRequestOptions
    ) {}
  }

  export class Save {
    static readonly type = `${ACTION_SCOPE} Save product`;
    constructor(
      public presentationId: number,
      public product: PresentationProduct
    ) {}
  }

  export class Delete {
    static readonly type = `${ACTION_SCOPE} Delete product`;
    constructor(
      public presentationId: number,
      public product: PresentationProduct
    ) {}
  }

  export class PatchProduct {
    static readonly type = `${ACTION_SCOPE} Patch product`;
    constructor(public patchSpec: Partial<PresentationProduct>) {}
  }

  export class PatchCharge {
    static readonly type = `${ACTION_SCOPE} Patch charge`;
    constructor(
      public charge: PresentationProductCharge,
      public patchSpec: Partial<PresentationProductCharge>
    ) {}
  }

  export class PatchAttribute {
    static readonly type = `${ACTION_SCOPE} Patch attribute`;
    constructor(
      public attribute: PresentationProductAttribute,
      public patchSpec: Partial<PresentationProductAttribute>
    ) {}
  }

  export class PatchPriceGrid {
    static readonly type = `${ACTION_SCOPE} Patch price grid`;
    constructor(
      public priceGrid: PriceGrid,
      public patchSpec: Partial<PriceGrid>
    ) {}
  }

  export class PatchPrice {
    static readonly type = `${ACTION_SCOPE} Patch price`;
    constructor(
      public priceGrid: PriceGrid,
      public price: Price,
      public patchSpec: Partial<Price>
    ) {}
  }

  export class TogglePriceVisibility {
    static readonly type = `${ACTION_SCOPE} Toggle price visibility`;
    constructor(
      public priceGrid: PriceGrid,
      public price: Price,
      public isVisible: boolean
    ) {}
  }

  export class RemovePrice {
    static readonly type = `${ACTION_SCOPE} Remove price`;
    constructor(public priceGrid: PriceGrid, public price: Price) {}
  }

  export class AddAllPriceGrids {
    static readonly type = `${ACTION_SCOPE} Add all price grids`;
  }

  export class ToggleVisibilityOfAllPrices {
    static readonly type = `${ACTION_SCOPE} Toggle visibility of all prices`;
    constructor(public priceGrid: PriceGrid, public isVisible: boolean) {}
  }

  export class AddCustomQuantity {
    static readonly type = `${ACTION_SCOPE} Add custom quantity`;
    constructor(public priceGrid: PriceGrid) {}
  }

  export class RestoreToDefault {
    static readonly type = `${ACTION_SCOPE} Restore price grid to default prices`;
    constructor(public priceGrid: PriceGrid) {}
  }

  export class GetOriginalPriceGrid {
    static readonly type = `${ACTION_SCOPE} Get original price grid`;
    constructor(
      public presentationId: number,
      public productId: number,
      public priceGridId: number
    ) {}
  }
}
