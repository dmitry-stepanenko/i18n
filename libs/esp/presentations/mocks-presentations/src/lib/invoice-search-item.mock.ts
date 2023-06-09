import { OrderSearch } from '@esp/orders/types';

export function mockInvoiceSearchItem(order: {
  Id?: string;
  Number?: string;
}): OrderSearch {
  return {
    Id: 502195008,
    Type: 'invoice',
    Number: '12302077-Enc',
    Salespersons: [
      {
        Id: 134577,
        Name: 'Frank Arsenault',
      },
    ],
    CreateDate: '2022-09-05T12:24:25.303Z',
    UpdateDate: '2022-09-26T14:14:51.1709635Z',
    Date: '2022-09-05T00:00:00Z',
    DueDate: '2022-09-30T00:00:00Z',
    SentDate: '2022-09-21T14:20:46.447Z',
    Status: 'Open',
    StatusColor: '#008000',
    Total: 0,
    AmountDue: 0,
    VendorCost: 0,
    ShippingCost: 0,
    CustomerPrice: 0,
    ShippingPrice: 0,
    Discount: 0,
    SalesTax: 0,
    MarginPercent: 0,
    AmountPaid: 0,
    CustomerId: '513558572',
    Customer: 'domi company',
    CustomerIconImagerUrl:
      'https://commonmedia.uat-asicentral.com/orders/Artwork/2be654114ed0434dae13b79c5628b656.jpg',
    CustomerPrimaryBrandColor: '#92ff9f ',
    BillingContact: 'Dominik Kalinowski',
    BillingContactEmail: 'dominik.kalinowski@test.valueadd.com',
    ShippingContact: 'Dominik Kalinowski',
    AcknowledgementContactEmail: '',
    ProjectId: 500008897,
    ProjectName: 'domi 2.09.22 18:50',
    ProjectEventType: 'Party',
    CurrencyCode: 'USD',
    CurrencySymbol: '$',
    ReorderType: 'New',
    CanRequestPayment: false,
    IsSentToQuickbooks: false,
    IsSentToSmartbooks: false,
    IsSentToProfitMaker: false,
    LineItems: [
      {
        Id: 504078664,
        ProductId: 550887460,
        Number: '11432',
        Name: '10oz Twizz Mug With Stainless Steel Straw',
        Description:
          'Twizz Mug 10oz volume in the size of 163*67mm, 116g per pc, with a 6*215mm  stainless straw for your',
        Quantity: 0,
        TotalPrice: 0,
        IsTaxable: false,
        ImageUrl: 'https://media.asicdn.com/images/jpgt/34840000/34840104.jpg',
        Supplier: 'A2A Promo',
        IsProduct: true,
        IsServiceCharge: false,
      },
    ],
    References: [
      {
        Id: 502194985,
        Type: 'order',
        Number: '213123',
        CreateDate: '0001-01-01T00:00:00Z',
        Date: '2022-09-05T00:00:00Z',
        Status: 'Open',
        StatusColor: '#008000',
        Total: 0,
        AmountDue: 0,
        VendorCost: 0,
        ShippingCost: 0,
        CustomerPrice: 0,
        ShippingPrice: 0,
        Discount: 0,
        SalesTax: 0,
        MarginPercent: 0,
        AmountPaid: 0,
        CurrencySymbol: '$',
        CanRequestPayment: false,
        IsSentToQuickbooks: false,
        IsSentToSmartbooks: false,
        IsSentToProfitMaker: false,
        ManagingCompanyId: 0,
        OwnerId: 0,
        TenantId: 0,
        IsEditable: false,
        ...order,
      },
    ],
    Supplier: 'A2A Promo',
    ManagingCompanyId: 0,
    OwnerId: 554457,
    TenantId: 500049971,
    VisibilityLevel: 'E',
    IsEditable: false,
  } as unknown as OrderSearch;
}
