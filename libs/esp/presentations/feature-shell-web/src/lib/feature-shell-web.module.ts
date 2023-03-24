import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PendingChangesGuard } from '@esp/common/util-pending-changes-guard';
import { SmartlinkSuppliersModule } from '@smartlink/suppliers/data-access-suppliers';

import { PresentationsRoutingModule } from './presentations-routing.module';

@NgModule({
  imports: [CommonModule, SmartlinkSuppliersModule, PresentationsRoutingModule],
  providers: [PendingChangesGuard],
})
export class EspPresentationsFeatureShellWebModule {}
