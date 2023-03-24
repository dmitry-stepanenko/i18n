import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfigService } from '@cosmos/config';
import type { PriceGrid } from '@cosmos/types-common';
import { HttpRequestOptions } from '@cosmos/util-http';
import { EspRestClient } from '@esp/common/data-access-rest-client';
import { Order } from '@esp/orders/types';
import {
  LikeDislike,
  Presentation,
  PresentationEmail,
  PresentationProduct,
  PresentationProductSortOrder,
  ProductSequence,
} from '@esp/presentations/types';

export interface AddProductsResponse {
  Presentation: Presentation;
  ProductsAdded: number[];
  ProductsDuplicated: number[];
  ProductsTruncated: number[];
  ProductSuppliersNotFound: number[];
  ProductsNotFound: number[];
}

@Injectable({ providedIn: 'root' })
export class PresentationsApiService extends EspRestClient<Presentation> {
  override url = 'presentations';

  protected override searchMethod = 'POST' as const;

  constructor(configService: ConfigService) {
    super(configService.get<string>('venusApiUrl'));
  }

  getQuote(
    presentationId: number,
    options?: HttpRequestOptions
  ): Observable<Order> {
    return this.http.get<Order>(`${this.uri}/${presentationId}/quote`, options);
  }

  getProductById(
    presentationId: number,
    productId: number,
    options?: HttpRequestOptions
  ) {
    return this.http.get<PresentationProduct>(
      `${this.uri}/${presentationId}/products/${productId}`,
      options
    );
  }

  updateProduct(presentationId: number, product: PresentationProduct) {
    return this.http.put<PresentationProduct>(
      `${this.uri}/${presentationId}/products/${product.Id}`,
      product
    );
  }

  addProducts(presentationId: number, productIds: number[]) {
    return this.http.put<AddProductsResponse>(
      `${this.uri}/${presentationId}/products`,
      productIds.map((ProductId) => ({ ProductId }))
    );
  }

  removeProducts(presentationId: number, productIds: number[]) {
    return this.http.post(
      `${this.uri}/${presentationId}/products/remove`,
      productIds
    );
  }

  removeProduct(presentationId: number, productId: number) {
    return this.http.delete<Presentation>(
      `${this.uri}/${presentationId}/products/${productId}`
    );
  }

  shareLink(presentationId: number) {
    return this.http.get<string>(`${this.uri}/${presentationId}/sharelink`, {});
  }

  generateShareLink(presentationId: number) {
    return this.http.post<string>(
      `${this.uri}/${presentationId}/sharelink`,
      {}
    );
  }

  presentationEmail(presentationId: number, data: PresentationEmail) {
    return this.http.post<PresentationEmail>(
      `${this.uri}/${presentationId}/email`,
      data
    );
  }

  sequenceProducts(presentationId: number, sequence: ProductSequence[]) {
    return this.http.put<Presentation>(
      `${this.uri}/${presentationId}/products/sort`,
      sequence
    );
  }

  sortProducts(
    presentationId: number,
    sortOrder: PresentationProductSortOrder
  ) {
    return this.http.put<Presentation>(
      `${this.uri}/${presentationId}/products/sort/${sortOrder}`,
      {}
    );
  }

  updateProductVisibility(
    presentationId: number,
    productId: number,
    isVisible: boolean
  ) {
    return this.http.put<PresentationProduct>(
      `${this.uri}/${presentationId}/products/visibility`,
      [{ Id: productId, IsVisible: isVisible }]
    );
  }

  updateProductDislike(
    presentationId: number,
    productId: number,
    likeDisklike: LikeDislike,
    options?: HttpRequestOptions
  ) {
    return this.http.put<PresentationProduct>(
      `${this.uri}/${presentationId}/products/${productId}/like/${likeDisklike}`,
      [],
      options
    );
  }

  getOriginalPriceGrid(
    presentationId: number,
    productId: number,
    priceGridId: number
  ) {
    return this.http.get<PriceGrid>(
      `${this.uri}/${presentationId}/products/${productId}/priceGridOriginal/${priceGridId}`
    );
  }
}
