import { NgModule, Pipe, PipeTransform } from '@angular/core';

export const CHARGE_USAGE_LEVELS: { Code: string; Value: string }[] = [
  {
    Code: 'NONE',
    Value: 'Other',
  },
  {
    Code: 'PORD',
    Value: 'Per Order',
  },
  {
    Code: 'PQTY',
    Value: 'Per Quantity',
  },
];

@Pipe({ name: 'chargeUsageLevel' })
export class ChargeUsageLevelPipe implements PipeTransform {
  transform(chargeUsageCode: string): string {
    const obj = CHARGE_USAGE_LEVELS.find(
      (level) => level.Code === chargeUsageCode
    );

    return obj?.Value;
  }
}

@NgModule({
  declarations: [ChargeUsageLevelPipe],
  exports: [ChargeUsageLevelPipe],
})
export class ChargeUsageLevelPipeModule {}
