import { DatePipe } from '@angular/common';

const datePipe = new DatePipe('en-US');

export function mapDateToPillLabel(isoDate: string | number): string {
  return datePipe.transform(new Date(isoDate), 'MM/dd/YYYY')!;
}
