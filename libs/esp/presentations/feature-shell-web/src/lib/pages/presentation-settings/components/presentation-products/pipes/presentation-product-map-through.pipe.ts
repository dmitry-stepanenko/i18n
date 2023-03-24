import { NgModule, Pipe, PipeTransform } from '@angular/core';

import type { PresentationProduct } from '@esp/presentations/types';

@Pipe({ name: 'presentationProductMapThrough' })
export class PresentationProductMapThroughPipe implements PipeTransform {
  transform<T>(
    product: PresentationProduct,
    mapper: (product: PresentationProduct) => T
  ) {
    return mapper(product);
  }
}

@NgModule({
  declarations: [PresentationProductMapThroughPipe],
  exports: [PresentationProductMapThroughPipe],
})
export class PresentationProductMapThroughPipeModule {}
