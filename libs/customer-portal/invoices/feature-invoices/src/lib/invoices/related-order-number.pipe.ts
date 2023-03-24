import { Pipe, PipeTransform } from '@angular/core';

import { OrderSearch } from '@esp/orders/types';

@Pipe({
  name: 'relatedOrderNumber',
  standalone: true,
})
export class RelatedOrderNumberPipe implements PipeTransform {
  transform(invoice: OrderSearch): string {
    return invoice.References.find((ref) => ref.Type === 'order')!.Number;
  }
}
