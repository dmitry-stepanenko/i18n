import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { CosInputModule } from '@cosmos/components/input';
import { InputMaskDirective, createMask } from '@cosmos/input-mask';

import { toNumberOrNull } from '../../utils';
import { GridCellInputDirective } from '../grid-cell-input';

@Component({
  selector: 'esp-grid-cell-quantity-input',
  template: `<input cos-input [inputMask]="mask" [formControl]="control" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GridCellQuantityInputComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [ReactiveFormsModule, InputMaskDirective, CosInputModule],
})
export class GridCellQuantityInputComponent extends GridCellInputDirective {
  override mask = createMask({
    alias: 'integer',
    allowMinus: false,
    rightAlign: false,
    showMaskOnHover: false,
    showMaskOnFocus: false,
  });

  beforeOnChange(source: Observable<string>): Observable<number | null> {
    return source.pipe(toNumberOrNull((value) => parseInt(value, 10)));
  }
}
