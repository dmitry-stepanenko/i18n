import { Project } from '@esp/projects/types';

export const MOCK_PROJECT: Project = {
  Id: 500000362,
  Name: 'test presentation ravi1',
  Customer: { PrimaryBrandColor: '#6A7281 ', Id: 500163495, Name: 'bcvbcv' },
  InHandsDate: '2021-11-04T18:30:00',
  EventDate: '2021-11-24T18:30:00',
  EventType: 'Advertising',
  Budget: 1000.0,
  CurrencyTypeCode: 'USD',
  NumberOfAssignees: 10,
  StatusStep: 0,
  StatusName: 'Negotiating and Pitching',
  CreateDate: '2021-11-05T05:28:02.07',
  TenantId: 5907,
  OwnerId: 941,
  AccessLevel: 'Everyone',
  Access: [{ AccessLevel: 'Everyone', EntityId: 0, AccessType: 'ReadWrite' }],
  IsVisible: true,
  IsEditable: true,
  Collaborators: [
    { Id: 941, Name: 'Leigh Penny', IsTeam: false, Role: 'Owner' },
  ],
} as unknown as Project;
