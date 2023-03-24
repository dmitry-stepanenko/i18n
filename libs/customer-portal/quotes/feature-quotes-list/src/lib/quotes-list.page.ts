import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
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
import { CustomerPortalQuotesSearchState } from '@customer-portal/quotes/data-access/store';
import { LineItemSearch, OrderSearch } from '@esp/orders/types';
import { ProductImageComponentModule } from '@smartlink/products/ui-products';

import { CustomerPortalQuotesListLocalState } from './quotes-list.local-state';

@Component({
  selector: 'customer-portal-quotes-list-page',
  templateUrl: './quotes-list.page.html',
  styleUrls: ['./quotes-list.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    CustomerPortalQuotesListLocalState,
    {
      provide: CUSTOMER_PORTAL_SEARCH_LOCAL_STATE,
      useExisting: CustomerPortalQuotesListLocalState,
    },
    provideLanguageScopes(LanguageScope.CustomerPortalQuotes),
  ],
})
export class CustomerPortalQuotesListPage {
  constructor(
    private readonly _router: Router,
    readonly state: CustomerPortalQuotesListLocalState
  ) {
    state.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });
  }

  /**
   * This is used to silence the following warning:
   * The left side of this optional chain operation does not include 'null'
   * or 'undefined' in its type, therefore the '?.' operator can be replaced
   * with the '.' operator.
   * [imgSrc]="order.LineItems[1]?.ImageUrl"
   *                               ~~~~~~~~
   */
  fixMeGetLineItem(
    quote: OrderSearch,
    index: number
  ): LineItemSearch | undefined {
    return quote.LineItems[index];
  }

  goToQuote(quote: OrderSearch): void {
    this._router.navigateByUrl(
      `/projects/${this.state.projectId}/quotes/${quote.Id}`
    );
  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: CustomerPortalQuotesListPage },
    ]),
    NgxsModule.forFeature([CustomerPortalQuotesSearchState]),
    NgxSkeletonLoaderModule,
    MatTooltipModule,
    CosCardModule,
    CosButtonModule,
    CosPaginationModule,
    ProductImageComponentModule,
    CustomerPortalPaginationComponent,
    CosDatePipe,
    CosmosUtilTranslationsModule,
  ],
  declarations: [CustomerPortalQuotesListPage],
})
export class CustomerPortalQuotesListPageModule {}
