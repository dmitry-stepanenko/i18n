import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatNativeDateModule, NativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { Router, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { firstValueFrom } from 'rxjs';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosCheckboxModule } from '@cosmos/components/checkbox';
import { CosPillModule } from '@cosmos/components/pill';
import { CosProductCardModule } from '@cosmos/components/product-card';
import { collectRouteParams } from '@cosmos/router';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { assertDefined } from '@cosmos/util-common';
import { TrustHtmlPipeModule } from '@cosmos/util-html-pipes';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { CustomerPortalOrdersApiService } from '@customer-portal/orders/data-access/api';

import { CustomerPortalInvoicePreviewLocalState } from './invoice-preview.local-state';

@Component({
  selector: 'customer-portal-invoice-preview',
  templateUrl: './invoice-preview.page.html',
  styleUrls: ['./invoice-preview.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  providers: [
    CustomerPortalInvoicePreviewLocalState,
    TitleCasePipe,
    provideLanguageScopes(LanguageScope.CustomerPortalInvoices),
  ],
  imports: [
    CommonModule,
    CosProductCardModule,
    CosCardModule,
    CosButtonModule,
    MatDialogModule,
    MatNativeDateModule,
    NativeDateModule,
    CosCheckboxModule,
    CosPillModule,
    MatDividerModule,
    RouterModule,
    NgxSkeletonLoaderModule,
    TrustHtmlPipeModule,
    CosmosUtilTranslationsModule,
  ],
})
export class CustomerPortalInvoicePreviewPage implements OnInit, OnDestroy {
  @ViewChild('iframe', { static: false }) iframe!: ElementRef;

  constructor(
    readonly state: CustomerPortalInvoicePreviewLocalState,
    private readonly _router: Router,
    private readonly _titleCasePipe: TitleCasePipe,
    private readonly _ordersApiService: CustomerPortalOrdersApiService
  ) {
    state.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });
  }

  ngOnInit(): void {
    const { invoiceId } = collectRouteParams(this._router);
    global_notProduction &&
      assertDefined(
        invoiceId,
        'CustomerPortalInvoicePreviewPage: invoiceId should be defined'
      );
    this.state.getInvoice(invoiceId);
  }

  ngOnDestroy(): void {
    this.state.revokeInvoiceObjectUrl();
  }

  print(): void {
    const contentWindow = this.iframe.nativeElement.contentWindow;

    contentWindow.focus();
    contentWindow.print();
  }

  async onDownload(): Promise<void> {
    if (!this.state.invoice) return;

    const type = this.state.invoice.Type;

    const title = `${this._titleCasePipe.transform(type)} #${
      this.state.invoice.Number
    }`;

    this.state.downloadingPdf = true;

    await firstValueFrom(
      this._ordersApiService.downloadPdf(
        this.state.projectId!,
        this.state.invoice.Id!,
        title,
        type
      )
    );

    this.state.downloadingPdf = false;
  }
}
