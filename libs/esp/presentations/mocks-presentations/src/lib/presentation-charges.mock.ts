import { PresentationProductCharge } from '@esp/presentations/types';

export const MOCK_PRESENTATION_CHARGES: PresentationProductCharge[] = [
  {
    IsVisible: true,
    Name: 'Sample Charge',
    Type: 'SMCH',
    Description: 'Test Charge 2',
    UsageLevel: 'NONE',
    Prices: [
      {
        IsVisible: true,
        Cost: 30,
        CurrencyCode: 'CAD',
        DiscountCode: 'V',
        DiscountPercent: 0.8,
        IsUndefined: false,
        Price: 60.5,
        Quantity: { From: 2, To: 0 },
        Sequence: 0,
      },
    ],
    Attributes: [802999598, 802999599],
  },
  {
    IsVisible: true,
    Name: 'Product Option Charge',
    Type: 'PROP',
    Description: 'Test Charge 4',
    UsageLevel: 'PORD',
    Prices: [
      {
        IsVisible: true,
        Cost: 30,
        CurrencyCode: 'CAD',
        DiscountCode: 'V',
        DiscountPercent: 0.4,
        IsUndefined: false,
        Price: 57,
        Quantity: { From: 4, To: 0 },
        Sequence: 0,
      },
    ],
    Attributes: [769611084],
  },
] as PresentationProductCharge[];
