import {
  ChangeDetectorRef,
  Directive,
  Injector,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NgControl,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, distinctUntilChanged, filter } from 'rxjs';

import { createMask } from '@cosmos/input-mask';
import { Nullable } from '@cosmos/types-common';

interface OnChangeFunction {
  (value: number | null): void;
}

@UntilDestroy()
@Directive()
export abstract class GridCellInputDirective
  implements OnInit, ControlValueAccessor
{
  @Input() required = true;

  readonly control = new FormControl('', { updateOn: 'blur' });

  mask: ReturnType<typeof createMask> | null = null;

  private readonly _ref = inject(ChangeDetectorRef);
  private readonly _injector = inject(Injector);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: OnChangeFunction = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: VoidFunction = () => {};

  ngOnInit(): void {
    this._setupValidators();
    this._setupValueChangesListener();
  }

  writeValue(value: Nullable<string | number>): void {
    if (value == null) {
      return;
    }

    if (ngDevMode && typeof value === 'string') {
      throw new Error(
        `${this.constructor.name}: expects numeric value to be provided, got: ${value}`
      );
    }

    // Cast to `string` since TS type guard fails because of the `ngDevMode`.
    this.control.setValue(value as string);
    this._ref.markForCheck();
  }

  registerOnChange(onChange: OnChangeFunction): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: VoidFunction): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }

    this._ref.markForCheck();
  }

  abstract beforeOnChange(
    source: Observable<string>
  ): Observable<number | null>;

  private _setupValidators(): void {
    const ngControl = this._injector.get(NgControl, null, {
      self: true,
      optional: true,
    });

    if (ngControl !== null) {
      this.control.addValidators(ngControl.control!.validator!);
    }

    if (this.required) {
      this.control.addValidators(Validators.required);
    }

    this.control.updateValueAndValidity();
  }

  private _setupValueChangesListener(): void {
    this.control.valueChanges
      .pipe(
        // The value coming from the user input will be a masked string.
        filter((value): value is string => typeof value === 'string'),
        distinctUntilChanged(),
        (source) => this.beforeOnChange(source),
        untilDestroyed(this)
      )
      .subscribe((value: number | null) => {
        if (value) {
          this.onChange(value);
          this._ref.markForCheck();
        }
      });
  }
}
