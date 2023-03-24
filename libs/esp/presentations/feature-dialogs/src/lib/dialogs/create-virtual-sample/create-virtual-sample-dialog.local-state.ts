import { Injectable } from '@angular/core';
import { forkJoin, map, tap } from 'rxjs';

import { LocalState, stateEffect, writableProp } from '@cosmos/state';
import {
  CompaniesService,
  LegacyCompaniesEspWebApiService,
} from '@esp/companies/data-access-companies';
import { Artwork, DesignSearch } from '@esp/orders/types';
import { PresentationsApiService } from '@esp/presentations/data-access-presentations';
import { PresentationProduct, ProductMedia } from '@esp/presentations/types';
import { ProductsService } from '@smartlink/products/data-access-products';

export const DEFAULT_CANVAS_ACCEPTED_FILE_TYPES = [
  'jpeg',
  'jpg',
  'png',
  'gif',
  'svg',
  // 'tif',
  // 'tiff',
];

interface DesignStudioJointData {
  product: PresentationProduct;
  productMedia: ProductMedia[];
  companyArtworks: Artwork[];
  savedDesigns: DesignSearch[];
}

@Injectable()
export class CreateVirtualSampleDialogLocalState extends LocalState<CreateVirtualSampleDialogLocalState> {
  jointData = writableProp<DesignStudioJointData | null>(null);

  readonly load$ = stateEffect<{
    presentationId: number;
    companyId: number;
    product: PresentationProduct;
  }>(({ presentationId, companyId, product }) => {
    const product$ = this._presentationsApiService.getProductById(
      presentationId,
      product.Id
    );

    const productMedia$ = this._productsService.getProductMedia(
      product.ProductId
    );

    // TODO: add filter to only search for allowed filetypes from api
    const companyArtworks$ = this._companiesService
      .getMedia({
        id: companyId,
        from: 1,
        size: 50,
        status: 'active',
        term: '',
      })
      .pipe(
        map(
          (response) =>
            response.Results?.filter(
              (Artwork) =>
                Artwork.FileUrl &&
                DEFAULT_CANVAS_ACCEPTED_FILE_TYPES.includes(
                  Artwork.FileUrl.split('.').pop()?.toLowerCase() || ''
                )
            ) || []
        )
      );

    const savedDesigns$ = this._legacyCompaniesService
      .getDesigns({
        Parties: {
          Terms: [companyId],
        },
        Version: {
          // New API version.
          Terms: [1],
        },
      })
      .pipe(map((response) => response.Results || []));

    return forkJoin({
      product: product$,
      productMedia: productMedia$,
      companyArtworks: companyArtworks$,
      savedDesigns: savedDesigns$,
    }).pipe(
      tap((jointData: DesignStudioJointData) => (this.jointData = jointData))
    );
  });

  constructor(
    private readonly _productsService: ProductsService,
    private readonly _companiesService: CompaniesService,
    private readonly _legacyCompaniesService: LegacyCompaniesEspWebApiService,
    private readonly _presentationsApiService: PresentationsApiService
  ) {
    super();
  }
}
