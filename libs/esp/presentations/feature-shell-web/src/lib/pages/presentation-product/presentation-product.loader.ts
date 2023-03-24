import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { CosCardModule } from '@cosmos/components/card';

@Component({
  selector: 'esp-presentation-product-loader',
  template: `<div class="skeleton-loader">
    <div class="presentation-product__back-to-presentation">
      <ngx-skeleton-loader
        class="mb-8 block"
        [theme]="{ width: '153px', height: '16px' }"
      ></ngx-skeleton-loader>
    </div>
    <div class="presentation-product-header flex items-end justify-between">
      <ngx-skeleton-loader
        class="block"
        [theme]="{ width: '300px', height: '28px' }"
      ></ngx-skeleton-loader>
      <div class="grid-gap-16 hidden md:flex">
        <ngx-skeleton-loader
          [theme]="{ height: '32px', width: '108px' }"
        ></ngx-skeleton-loader>
        <ngx-skeleton-loader
          [theme]="{ height: '32px', width: '141px' }"
        ></ngx-skeleton-loader>
      </div>
    </div>
    <hr class="mt-0" />
    <div class="presentation-product__prev-next mb-16">
      <ngx-skeleton-loader [theme]="{ width: '130px' }"></ngx-skeleton-loader>
      <ngx-skeleton-loader [theme]="{ width: '105px' }"></ngx-skeleton-loader>
    </div>
    <ngx-skeleton-loader
      class="block"
      [theme]="{ width: '30%', height: '24px' }"
    ></ngx-skeleton-loader>
    <ngx-skeleton-loader
      class="mb-8 block"
      [theme]="{ width: '92px' }"
    ></ngx-skeleton-loader>
    <div class="presentation-product__pg-content-body">
      <div>
        <ngx-skeleton-loader
          [theme]="{
            width: '100%',
            height: 'auto',
            display: 'block',
            'aspect-ratio': '1/1',
            'margin-bottom': '16px'
          }"
        ></ngx-skeleton-loader>
        <cos-card>
          <ngx-skeleton-loader
            [theme]="{ width: '75%', margin: '0px' }"
          ></ngx-skeleton-loader>
          <hr class="card-divider" />
          <ngx-skeleton-loader
            [theme]="{ width: '100px' }"
          ></ngx-skeleton-loader>
          <br />
          <ngx-skeleton-loader [theme]="{ width: '65%' }"></ngx-skeleton-loader>
          <br />
          <ngx-skeleton-loader
            [theme]="{ width: '200px' }"
          ></ngx-skeleton-loader>
          <br />
          <ngx-skeleton-loader [theme]="{ width: '65%' }"></ngx-skeleton-loader>
        </cos-card>
      </div>
      <div>
        <ngx-skeleton-loader
          [theme]="{ width: '200px', height: '22px' }"
        ></ngx-skeleton-loader
        ><br />
        <ngx-skeleton-loader [theme]="{ width: '130px' }"></ngx-skeleton-loader>
        <div>
          <ngx-skeleton-loader
            count="6"
            [theme]="{
              width: '82px',
              height: '82px',
              'margin-bottom': '40px',
              'margin-right': '16px'
            }"
          ></ngx-skeleton-loader>
        </div>
        <ngx-skeleton-loader [theme]="{ width: '160px' }"></ngx-skeleton-loader>
        <ngx-skeleton-loader [theme]="{ height: '32px' }"></ngx-skeleton-loader>
        <br /><br />
        <ngx-skeleton-loader [theme]="{ width: '160px' }"></ngx-skeleton-loader>
        <ngx-skeleton-loader [theme]="{ height: '92px' }"></ngx-skeleton-loader>
        <br /><br />
        <ngx-skeleton-loader [theme]="{ width: '160px' }"></ngx-skeleton-loader>
        <ngx-skeleton-loader [theme]="{ height: '92px' }"></ngx-skeleton-loader>
        <br />
        <hr />
        <br />
        <ngx-skeleton-loader [theme]="{ width: '130px' }"></ngx-skeleton-loader>
        <br />
        <ngx-skeleton-loader
          count="6"
          [theme]="{ width: '220px', display: 'block' }"
        ></ngx-skeleton-loader>
      </div>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentationProductLoaderComponent {}

@NgModule({
  declarations: [PresentationProductLoaderComponent],
  imports: [NgxSkeletonLoaderModule, CosCardModule],
  exports: [PresentationProductLoaderComponent],
})
export class PresentationProductLoaderModule {}
