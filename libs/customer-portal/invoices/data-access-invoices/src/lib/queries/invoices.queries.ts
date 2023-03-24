import { createPropertySelectors } from '@cosmos/state';

import { CustomerPortalInvoicesState, InvoicesStateModel } from '../states';

export namespace CustomerPortalInvoicesQueries {
  export const {
    total: getTotal,
    invoices: getInvoices,
    currentInvoice: getInvoiceDetails,
    criteria: getCriteria,
    invoiceSafeUrl: getInvoiceSafeUrl,
  } = createPropertySelectors<InvoicesStateModel>(CustomerPortalInvoicesState);
}
