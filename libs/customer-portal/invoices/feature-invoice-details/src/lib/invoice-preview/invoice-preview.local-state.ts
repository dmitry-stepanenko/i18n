import { Injectable } from '@angular/core';

import {
  LocalState,
  asDispatch,
  fromSelector,
  writableProp,
} from '@cosmos/state';
import { CustomerPortalAuthQueries } from '@customer-portal/auth/data-access-auth';
import {
  CustomerPortalInvoicesActions,
  CustomerPortalInvoicesQueries,
} from '@customer-portal/invoices/data-access-invoices';
import {
  CustomerPortalProjectDetailsQueries,
  CustomerPortalProjectQueries,
} from '@customer-portal/projects/data-access/store';
import { Order } from '@esp/orders/types';

@Injectable()
export class CustomerPortalInvoicePreviewLocalState extends LocalState<CustomerPortalInvoicePreviewLocalState> {
  readonly getInvoice = asDispatch(
    CustomerPortalInvoicesActions.GetInvoiceDetails
  );

  readonly revokeInvoiceObjectUrl = asDispatch(
    CustomerPortalInvoicesActions.RevokeInvoiceObjectUrl
  );

  readonly invoice: Order | null = fromSelector(
    CustomerPortalInvoicesQueries.getInvoiceDetails
  );

  readonly invoiceSafeUrl = fromSelector(
    CustomerPortalInvoicesQueries.getInvoiceSafeUrl
  );

  readonly invoiceCount = fromSelector(
    CustomerPortalProjectDetailsQueries.getInvoiceCount
  );

  readonly accessCode = fromSelector(CustomerPortalAuthQueries.getAccessCode);

  readonly projectId = fromSelector(CustomerPortalProjectQueries.getProjectId);

  downloadingPdf = writableProp(false);
}
