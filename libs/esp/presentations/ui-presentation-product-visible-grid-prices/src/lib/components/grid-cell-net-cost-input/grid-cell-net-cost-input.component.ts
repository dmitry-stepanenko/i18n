import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { CosInputModule } from '@cosmos/components/input';
import { InputMaskDirective, createMask } from '@cosmos/input-mask';
import { CurrencyCode } from '@cosmos/types-common';
import { CurrencySymbolPipe } from '@cosmos/util-currency-pipes';

import { toNumberOrNull } from '../../utils';
import { GridCellInputDirective } from '../grid-cell-input';

@Component({
  selector: 'esp-grid-cell-net-cost-input',
  templateUrl: './grid-cell-net-cost-input.component.html',
  styleUrls: ['./grid-cell-net-cost-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GridCellNetCostInputComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputMaskDirective,
    CosInputModule,
    CurrencySymbolPipe,
  ],
})
export class GridCellNetCostInputComponent extends GridCellInputDirective {
  @Input() currencyCode: CurrencyCode = 'USD';

  // TODO-ARTUR: look at formatting two decimal places and three decimals places with strings from the pipe on the view?
  override mask = createMask({
    digits: 3,
    alias: 'numeric',
    allowMinus: false,
    showMaskOnHover: false,
    showMaskOnFocus: false,
  });

  beforeOnChange(source: Observable<string>): Observable<number | null> {
    return source.pipe(toNumberOrNull((value: string) => parseFloat(value)));
  }
}
