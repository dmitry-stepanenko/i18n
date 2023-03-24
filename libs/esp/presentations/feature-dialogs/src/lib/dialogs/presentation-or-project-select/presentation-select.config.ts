import { createDialogDef } from '@cosmos/ui-dialog';

import {
  PresentationOrProjectSelectDialogData,
  PresentationOrProjectSelectDialogResult,
} from './presentation-select.type';

export const presentationOrProjectSelectDialogDef = createDialogDef<
  PresentationOrProjectSelectDialogData,
  PresentationOrProjectSelectDialogResult
>({
  load: async () =>
    (await import(`./presentation-or-project-select-dialog.component`))
      .PresentationOrProjectSelectDialog,
  defaultConfig: {
    minWidth: '784px',
    width: '784px',
  },
});
