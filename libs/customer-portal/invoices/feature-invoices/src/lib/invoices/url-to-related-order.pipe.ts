import { Pipe, PipeTransform } from '@angular/core';

import { OrderSearch } from '@esp/orders/types';

@Pipe({
  name: 'urlToRelatedOrder',
  standalone: true,
})
export class UrlToRelatedOrderPipe implements PipeTransform {
  transform(invoice: OrderSearch): string {
    return `/projects/${invoice.ProjectId}/orders/${
      invoice.References.find((ref) => ref.Type === 'order')!.Id
    }`;
  }
}
