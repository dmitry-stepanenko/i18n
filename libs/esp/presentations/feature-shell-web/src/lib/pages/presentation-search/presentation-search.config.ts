import type { SortOption, TabFilter } from '@esp/search/types-search';

// See below `createPresentationTabs` factory function which pushes
// the archived presentations tab after active & closed presentations.
// Its index is 2 and it's static.
const ARCHIVED_PRESENTATIONS_TAB_INDEX = 2;
export function isArchivedPresentationsTab(tabIndex: number): boolean {
  return tabIndex === ARCHIVED_PRESENTATIONS_TAB_INDEX;
}

export const PRESENTATION_TABS: TabFilter[] = [
  {
    name: 'Active Presentations',
    criteria: { status: 'active', type: 'default' },
  },
  {
    name: 'Expired Presentations',
    criteria: { status: 'closed', type: 'closed' },
  },
  {
    name: 'Archived Presentations',
    criteria: { type: 'all' },
  },
];

export const sortMenuOptions: SortOption[] = [
  {
    name: 'Last Updated',
    value: 'default',
  },
  {
    name: 'Oldest',
    value: 'create_asc',
  },
  {
    name: 'Newest',
    value: 'create_desc',
  },
  {
    name: 'Presentation Name: A-Z',
    value: 'az',
  },
  {
    name: 'Presentation Name: Z-A',
    value: 'za',
  },
];

export const oldEspSortMenuOptions: SortOption[] = [
  {
    name: 'Last Updated',
    value: '',
  },
  {
    name: 'Oldest',
    value: "{ updateDate: 'asc' }",
  },
  {
    name: 'Newest',
    value: "{ updateDate: 'desc' }",
  },
  {
    name: 'Presentation Name: A-Z',
    value: "{ nameSortKey: 'asc' }",
  },
  {
    name: 'Presentation Name: Z-A',
    value: "{ nameSortKey: 'desc' }",
  },
];
