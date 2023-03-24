import { ProjectStatus } from '@esp/projects/types';

export const MOCK_PROJECT_STATUSES: ProjectStatus[] = [
  {
    Name: 'Negotiating and Pitching',
    Step: 0,
    CreateDate: '2022-06-13T07:42:46.79Z',
  },
  {
    Name: 'Processing & Fulfillment',
    Step: 1,
    CreateDate: '2022-06-23T08:24:51.477Z',
  },
  {
    Name: 'Closed',
    Step: 2,
    CreateDate: '2022-06-27T08:24:51.477Z',
  },
  {
    CreateDate: '2022-07-24T00:11:44.647Z',
    Name: 'Processing & Fulfillment',
    Step: 1,
  },
  {
    Name: 'Closed',
    Step: 2,
    CreateDate: '2022-07-26T00:14:57Z',
  },
];
