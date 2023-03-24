import type { SortOption } from '@esp/search/types-search';

export interface PresentationSettings {
  presentationSort: SortOption;
  presentationSearchSort: SortOption;
  searchTabIndex?: number;
}
