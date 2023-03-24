import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosCollectionSectionModule } from '@cosmos/components/collection-section';
import { CosPaginationModule } from '@cosmos/components/pagination';
import { MatTooltipModule } from '@cosmos/components/tooltip';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { CosDatePipe } from '@cosmos/util-i18n-dates';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import {
  CUSTOMER_PORTAL_SEARCH_LOCAL_STATE,
  CustomerPortalPaginationComponent,
} from '@customer-portal/common/ui-pagination';
import { CustomerPortalInvoicesState } from '@customer-portal/invoices/data-access-invoices';
import { ProductImageComponentModule } from '@smartlink/products/ui-products';

import { CustomerPortalInvoicesLocalState } from './invoices.local-state';
import { RelatedOrderNumberPipe } from './related-order-number.pipe';
import { UrlToRelatedOrderPipe } from './url-to-related-order.pipe';

@Component({
  selector: 'customer-portal-invoices-page',
  templateUrl: './invoices.page.html',
  styleUrls: ['./invoices.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CustomerPortalInvoicesLocalState,
    {
      provide: CUSTOMER_PORTAL_SEARCH_LOCAL_STATE,
      useExisting: CustomerPortalInvoicesLocalState,
    },
    provideLanguageScopes(LanguageScope.CustomerPortalInvoices),
  ],
})
export class CustomerPortalInvoicesPage {
  constructor(readonly state: CustomerPortalInvoicesLocalState) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });
  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: CustomerPortalInvoicesPage },
    ]),
    NgxsModule.forFeature([CustomerPortalInvoicesState]),
    NgxSkeletonLoaderModule,
    MatTooltipModule,
    CosCardModule,
    CosButtonModule,
    CosPaginationModule,
    ProductImageComponentModule,
    CustomerPortalPaginationComponent,
    CosCollectionSectionModule,
    UrlToRelatedOrderPipe,
    RelatedOrderNumberPipe,
    CosDatePipe,
    CosmosUtilTranslationsModule,
  ],
  declarations: [CustomerPortalInvoicesPage],
})
export class CustomerPortalInvoicesPageModule {}
