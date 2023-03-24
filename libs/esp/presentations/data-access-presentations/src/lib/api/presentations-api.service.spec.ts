import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { SpectatorService, createServiceFactory } from '@ngneat/spectator/jest';

import { ConfigModule } from '@cosmos/config';
import {
  LikeDislike,
  PresentationEmail,
  PresentationProduct,
  PresentationProductSortOrder,
  ProductSequence,
} from '@esp/presentations/types';

import { PresentationsApiService } from './presentations-api.service';

const serviceParams = {
  presentationId: 45454,
  productId: 34343,
  productIds: [540637],
  isVisible: true,
  priceGridId: 9999,
};

const product = {
  Id: 43,
  ProductId: 674,
  IsVisible: true,
  ShowMinMaxRange: false,
  AdjustmentType: 'New',
} as PresentationProduct;

const presentationEmail = {
  ReplyTo: ['asi'],
  PersonalNote: '',
} as PresentationEmail;

const productSequence = [
  {
    Id: 7648,
    Sequence: 66,
  } as ProductSequence,
];

const presentationProductSortOrder = 'None ' as PresentationProductSortOrder;
const likeDisklike = 'None' as LikeDislike;
describe('PresentationsApiService', () => {
  let http: HttpTestingController;
  let presentationService: PresentationsApiService;
  let spectator: SpectatorService<PresentationsApiService>;

  const createService = createServiceFactory({
    service: PresentationsApiService,
    imports: [
      HttpClientTestingModule,
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
    ],
  });

  beforeEach(() => {
    spectator = createService();
    http = spectator.inject(HttpTestingController);
    presentationService = spectator.inject(PresentationsApiService);
  });

  it('should be created', () => {
    //Assert
    expect(spectator.service).toBeTruthy();
  });

  it('should call getQuote endpoint', () => {
    //Arrange
    presentationService.getQuote(serviceParams.presentationId).subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/quote`
    );
    //Assert
    expect(req.request.method).toEqual('GET');
    req.flush({});
    http.verify();
  });

  it('should call getProductById endpoint', () => {
    //Arrange
    presentationService
      .getProductById(serviceParams.presentationId, serviceParams.productId)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/${serviceParams.productId}`
    );
    //Assert
    expect(req.request.method).toEqual('GET');
    req.flush({});
    http.verify();
  });

  it('should call updateProduct endpoint', () => {
    //Arrange
    presentationService
      .updateProduct(serviceParams.presentationId, product)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/${product.Id}`
    );
    //Assert
    expect(req.request.method).toEqual('PUT');
    req.flush({});
    http.verify();
  });

  it('should call addProducts endpoint', () => {
    //Arrange
    presentationService
      .addProducts(serviceParams.presentationId, serviceParams.productIds)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products`
    );
    //Assert
    expect(req.request.method).toEqual('PUT');
    req.flush({});
    http.verify();
  });

  it('should call removeProducts endpoint', () => {
    //Arrange
    presentationService
      .removeProducts(serviceParams.presentationId, serviceParams.productIds)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/remove`
    );
    //Assert
    expect(req.request.method).toEqual('POST');
    req.flush({});
    http.verify();
  });

  it('should call removeProduct endpoint', () => {
    //Arrange
    presentationService
      .removeProduct(serviceParams.presentationId, serviceParams.productId)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/${serviceParams.productId}`
    );
    //Assert
    expect(req.request.method).toEqual('DELETE');
    req.flush({});
    http.verify();
  });

  it('should call shareLink endpoint', () => {
    //Arrange
    presentationService.shareLink(serviceParams.presentationId).subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/sharelink`
    );
    //Assert
    expect(req.request.method).toEqual('GET');
    req.flush({});
    http.verify();
  });

  it('should call generateShareLink endpoint', () => {
    //Arrange
    presentationService
      .generateShareLink(serviceParams.presentationId)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/sharelink`
    );
    //Assert
    expect(req.request.method).toEqual('POST');
    req.flush({});
    http.verify();
  });

  it('should call presentationEmail endpoint', () => {
    //Arrange
    presentationService
      .presentationEmail(serviceParams.presentationId, presentationEmail)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/email`
    );
    //Assert
    expect(req.request.method).toEqual('POST');
    req.flush({});
    http.verify();
  });

  it('should call sequenceProducts endpoint', () => {
    //Arrange
    presentationService
      .sequenceProducts(serviceParams.presentationId, productSequence)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/sort`
    );
    //Assert
    expect(req.request.method).toEqual('PUT');
    req.flush({});
    http.verify();
  });

  it('should call sortProducts endpoint', () => {
    //Arrange
    presentationService
      .sortProducts(serviceParams.presentationId, presentationProductSortOrder)
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/sort/${presentationProductSortOrder}`
    );
    //Assert
    expect(req.request.method).toEqual('PUT');
    req.flush({});
    http.verify();
  });

  it('should call updateProductVisibility endpoint', () => {
    //Arrange
    presentationService
      .updateProductVisibility(
        serviceParams.presentationId,
        serviceParams.productId,
        serviceParams.isVisible
      )
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/visibility`
    );
    //Assert
    expect(req.request.method).toEqual('PUT');
    req.flush({});
    http.verify();
  });

  it('should call updateProductDislike endpoint', () => {
    //Arrange
    presentationService
      .updateProductDislike(
        serviceParams.presentationId,
        serviceParams.productId,
        likeDisklike
      )
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/${serviceParams.productId}/like/${likeDisklike}`
    );
    //Assert
    expect(req.request.method).toEqual('PUT');
    req.flush({});
    http.verify();
  });

  it('should call getOriginalPriceGrid endpoint', () => {
    //Arrange
    presentationService
      .getOriginalPriceGrid(
        serviceParams.presentationId,
        serviceParams.productId,
        serviceParams.priceGridId
      )
      .subscribe();
    const req = http.expectOne(
      `${presentationService.uri}/${serviceParams.presentationId}/products/${serviceParams.productId}/priceGridOriginal/${serviceParams.priceGridId}`
    );
    //Assert
    expect(req.request.method).toEqual('GET');
    req.flush({});
    http.verify();
  });
});
