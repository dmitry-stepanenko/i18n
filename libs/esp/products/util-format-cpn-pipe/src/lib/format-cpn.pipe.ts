import { NgModule, Pipe, PipeTransform } from '@angular/core';

import { Nullable } from '@cosmos/types-common';

@Pipe({
  name: 'formatCPN',
})
export class FormatCPNPipe implements PipeTransform {
  transform(id: Nullable<number>, companyId?: Nullable<number>): string {
    let ret = '';

    if (companyId && id && id > 0) {
      ret = 'CPN-' + (id + companyId).toString();
    }

    return ret;
  }
}

@NgModule({
  declarations: [FormatCPNPipe],
  exports: [FormatCPNPipe],
})
export class FormatCPNPipeModule {}
