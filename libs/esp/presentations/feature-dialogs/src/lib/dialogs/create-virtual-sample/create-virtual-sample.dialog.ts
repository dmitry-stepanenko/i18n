import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { LocalStateRenderStrategy } from '@cosmos/state';
import { assertDefined } from '@cosmos/util-common';
import { DesignStudioComponent } from '@esp/design-studio/feature-shell-web';

import { CreateVirtualSampleDialogLocalState } from './create-virtual-sample-dialog.local-state';
import { CreateVirtualSampleDialogData } from './create-virtual-sample.type';

@Component({
  selector: 'esp-create-virtual-sample-dialog',
  templateUrl: './create-virtual-sample.dialog.html',
  styleUrls: ['./create-virtual-sample.dialog.scss'],
  providers: [CreateVirtualSampleDialogLocalState],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DesignStudioComponent],
})
export class CreateVirtualSampleDialog implements OnInit {
  constructor(
    readonly state: CreateVirtualSampleDialogLocalState,
    @Inject(MAT_DIALOG_DATA) readonly data: CreateVirtualSampleDialogData
  ) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });
  }

  ngOnInit(): void {
    if (global_notProduction) {
      assertDefined(
        this.data.presentation,
        'CreateVirtualSampleDialog: presentation should be defined'
      );
      assertDefined(
        this.data.product,
        'CreateVirtualSampleDialog: product should be defined'
      );
    }

    this.state.load$({
      presentationId: this.data.presentation.Id,
      companyId: this.data.presentation.Customer.Id,
      product: this.data.product,
    });
  }
}
