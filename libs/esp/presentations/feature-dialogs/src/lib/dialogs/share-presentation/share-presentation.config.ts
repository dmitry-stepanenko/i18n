import { createDialogDef } from '@cosmos/ui-dialog';

import { SharePresentationDialogData } from './share-presentation.type';

export const sharePresentationDialogDef = createDialogDef<
  SharePresentationDialogData,
  null
>({
  load: async () =>
    (
      await import(
        /* webpackChunkName: 'share-presentation-dialog' */ './share-presentation.dialog'
      )
    ).SharePresentationDialog,
  defaultConfig: {
    disableClose: false,
    minWidth: '625px',
    width: '625px',
  },
});
