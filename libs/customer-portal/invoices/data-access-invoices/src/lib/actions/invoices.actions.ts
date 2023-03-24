import { SearchCriteria } from '@esp/common/types';

const ACTION_SCOPE = '[Customer Invoices]';

export namespace CustomerPortalInvoicesActions {
  export class GetInvoices {
    static readonly type = `${ACTION_SCOPE} Get Invoices`;

    constructor(public criteria: SearchCriteria) {}
  }

  export class GetInvoiceDetails {
    static readonly type = `${ACTION_SCOPE} Get Invoice Details`;

    constructor(public invoiceId: number | string) {}
  }

  export class GetInvoiceHtml {
    static readonly type = `${ACTION_SCOPE} Get Invoice Html`;
  }

  export class RevokeInvoiceObjectUrl {
    static readonly type = `${ACTION_SCOPE} Revoke Invoice Object Url`;
  }
}
