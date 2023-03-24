import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { isNumber } from 'lodash-es';
import { Observable } from 'rxjs';

import { CosInputModule } from '@cosmos/components/input';
import { InputMaskDirective, createMask } from '@cosmos/input-mask';
import { asNumber, toFixedNumber } from '@cosmos/util-math';

import { toNumberOrNull } from '../../utils';
import { GridCellInputDirective } from '../grid-cell-input';

@Component({
  selector: 'esp-grid-cell-margin-input',
  templateUrl: './grid-cell-margin-input.component.html',
  styleUrls: ['./grid-cell-margin-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GridCellMarginInputComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [ReactiveFormsModule, InputMaskDirective, CosInputModule],
})
export class GridCellMarginInputComponent extends GridCellInputDirective {
  override mask = createMask({
    alias: 'integer',
    digits: 2,
    max: 100,
    allowMinus: true,
    rightAlign: false,
    showMaskOnHover: false,
    showMaskOnFocus: false,
  });

  override writeValue(value: number | null | undefined): void {
    // The `DiscountPercent` is a number between 0 and 1 and always decimal, for instance 0.4.
    // We have to multiply it by 100 to show it as 40% on the UI.
    // We basically decouple the actual model from the UI, the `beforeOnChange` method is used
    // to transform strings like `100%` into the discount percent.
    isNumber(value) && super.writeValue(value * 100);
  }

  beforeOnChange(source: Observable<string>): Observable<number | null> {
    return source.pipe(
      // The value is masked through `inputmask` thus it'll be a string, e.g. `20.33 %`.
      // We need to remove the percentage sign, so we'll get `20.33` as a string and convert it
      // to a number. Then we parse `20.33` to a number and divide it by 100, so we get 0.20329999999999998.
      // toFixed(0.20329999999999998) = 0.2033
      toNumberOrNull((value: string) => toFixedNumber(asNumber(value) / 100))
    );
  }
}
