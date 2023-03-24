import { StepInput, StepResult } from '@cosmos/dialog-flow';
import { PresentationSearch } from '@esp/presentations/types';
import { ProductSearchResultItem } from '@smartlink/models';

export type PresentationOrProjectSelectDialogData = StepInput<{
  subheader: string;
  checkedProducts: Map<number, ProductSearchResultItem> | null;
  title?: string;
  showProjects?: boolean;
  presentationId?: number;
  customerId?: number;
}>;

export type PresentationOrProjectSelectDialogResult = StepResult<{
  complete?: boolean;
  selectedPresentation?: PresentationSearch;
  searchTerm?: string;
}>;
