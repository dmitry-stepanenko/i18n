import { createDialogDef } from '@cosmos/ui-dialog';

import {
  CreateNewPresentationDialogData,
  CreateNewPresentationDialogResult,
} from './create-new-presentation.type';

export const createNewPresentationDialogDef = createDialogDef<
  CreateNewPresentationDialogData,
  CreateNewPresentationDialogResult
>({
  load: async () =>
    (await import(`./create-new-presentation.dialog`))
      .CreateNewPresentationDialog,
  defaultConfig: {
    minWidth: '626px',
    width: '626px',
  },
});
