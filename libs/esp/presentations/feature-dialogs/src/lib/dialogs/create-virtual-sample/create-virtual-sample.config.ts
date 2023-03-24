import { firstValueFrom } from 'rxjs';

import { Media, Nullable } from '@cosmos/types-common';
import { createDialogDef } from '@cosmos/ui-dialog';
import {
  LazyLoadedScripts,
  LazyLoadingScriptService,
} from '@cosmos/util-lazy-load-script';

import { CreateVirtualSampleDialogData } from './create-virtual-sample.type';

export const createVirtualSampleDialogDef = createDialogDef<
  CreateVirtualSampleDialogData,
  Nullable<Media>
>({
  load: async (injector) => {
    const lazyLoadingScriptService = injector.get(LazyLoadingScriptService);

    await firstValueFrom(
      lazyLoadingScriptService.loadScript(LazyLoadedScripts.Fabric)
    );

    return (
      await import(
        /* webpackChunkName: 'create-virtual-sample-dialog' */ './create-virtual-sample.dialog'
      )
    ).CreateVirtualSampleDialog;
  },
  defaultConfig: {
    disableClose: false,
    minWidth: '70vw',
    minHeight: '90vh',
  },
});
