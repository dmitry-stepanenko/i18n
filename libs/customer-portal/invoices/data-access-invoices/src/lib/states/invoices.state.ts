import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Navigate } from '@ngxs/router-plugin';
import { Action, State, StateContext } from '@ngxs/store';
import { isEqual } from 'lodash-es';
import { tap } from 'rxjs/operators';

import { SetTitle } from '@cosmos/meta';
import { collectRouteParams } from '@cosmos/router';
import { assertDefined } from '@cosmos/util-common';
import { SearchCriteria } from '@esp/common/types';
import { Order, OrderSearch } from '@esp/orders/types';

import { CustomerPortalInvoicesActions } from '../actions';
import { CustomerPortalInvoicesApiService } from '../api';

export interface InvoicesStateModel {
  currentInvoice: Order | null;
  invoiceObjectUrl: string | null;
  invoiceSafeUrl: SafeResourceUrl | null;
  total: number;
  criteria: SearchCriteria | null;
  invoices: OrderSearch[] | null;
}

type ThisStateContext = StateContext<InvoicesStateModel>;

const MAX_SUPPORTED_PROJECTS_SEARCH_RESULT_COUNT = 1000;

@State<InvoicesStateModel>({
  name: 'customerInvoices',
  defaults: {
    total: 0,
    criteria: null,
    invoices: null,
    currentInvoice: null,
    invoiceObjectUrl: null,
    invoiceSafeUrl: null,
  },
})
@Injectable()
export class CustomerPortalInvoicesState {
  constructor(
    private readonly _service: CustomerPortalInvoicesApiService,
    private readonly _router: Router,
    private readonly _sanitizer: DomSanitizer
  ) {}

  @Action(CustomerPortalInvoicesActions.GetInvoices, {
    cancelUncompleted: true,
  })
  getInvoices(
    ctx: ThisStateContext,
    action: CustomerPortalInvoicesActions.GetInvoices
  ) {
    this._redirectToSingleInvoice(ctx);
    /* prevent sending request if already have data for this search */
    if (isEqual(action.criteria, ctx.getState().criteria)) return;
    ctx.patchState({ invoices: null });
    return this._service
      .getSentInvoices(this._collectProjectId(), action.criteria)
      .pipe(
        tap((response) =>
          ctx.patchState({
            invoices: response.Results ?? [],
            criteria: action.criteria,
            total: Math.min(
              response.ResultsTotal ?? 0,
              MAX_SUPPORTED_PROJECTS_SEARCH_RESULT_COUNT
            ),
          })
        ),
        tap(() => this._redirectToSingleInvoice(ctx))
      );
  }

  @Action(CustomerPortalInvoicesActions.GetInvoiceDetails)
  getInvoiceDetails(
    ctx: ThisStateContext,
    action: CustomerPortalInvoicesActions.GetInvoiceDetails
  ) {
    /* prevent sending request if already have this invoice data */
    if (ctx.getState().currentInvoice?.Id === action.invoiceId) return;
    ctx.patchState({
      currentInvoice: null,
      invoiceObjectUrl: null,
      invoiceSafeUrl: null,
    });
    return this._service
      .getInvoiceDetails(this._collectProjectId(), action.invoiceId)
      .pipe(
        tap((currentInvoice) => {
          ctx.patchState({ currentInvoice });

          ctx.dispatch([
            new CustomerPortalInvoicesActions.GetInvoiceHtml(),
            new SetTitle(`Invoice #${currentInvoice.Number} - Portal`),
          ]);
        })
      );
  }

  @Action(CustomerPortalInvoicesActions.GetInvoiceHtml)
  getInvoiceHtml(ctx: ThisStateContext) {
    return this._service
      .getInvoiceHtml(
        this._collectProjectId(),
        ctx.getState().currentInvoice!.Id!
      )
      .pipe(
        tap((html) => {
          const blob = new Blob([html], { type: 'text/html' });
          const invoiceObjectUrl = URL.createObjectURL(blob);
          const invoiceSafeUrl =
            this._sanitizer.bypassSecurityTrustResourceUrl(invoiceObjectUrl);
          ctx.patchState({ invoiceObjectUrl, invoiceSafeUrl });
        })
      );
  }

  @Action(CustomerPortalInvoicesActions.RevokeInvoiceObjectUrl)
  revokeInvoiceObjectUrl(ctx: ThisStateContext): void {
    const { invoiceObjectUrl } = ctx.getState();
    invoiceObjectUrl && URL.revokeObjectURL(invoiceObjectUrl);
  }

  private _collectProjectId(): string {
    const { projectId } = collectRouteParams(this._router);
    global_notProduction &&
      assertDefined(
        projectId,
        'CustomerPortalInvoicesState: projectId should be defined on route params'
      );
    return projectId;
  }

  private _redirectToSingleInvoice(ctx: ThisStateContext): void {
    const state = ctx.getState();
    const invoiceId = state.invoices?.[0]?.Id;
    if (state.total === 1 && invoiceId) {
      ctx.dispatch(
        new Navigate([
          'projects',
          this._collectProjectId(),
          'invoices',
          invoiceId,
        ])
      );
    }
  }
}
