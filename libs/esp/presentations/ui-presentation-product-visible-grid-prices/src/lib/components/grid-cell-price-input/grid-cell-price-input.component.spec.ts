import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { of } from 'rxjs';

import { InputMaskLoader } from '@cosmos/input-mask';

import { GridCellPriceInputComponent } from './grid-cell-price-input.component';

const selectors = {
  span: 'esp-grid-cell-price-input span',
  nativeInput: 'esp-grid-cell-price-input input',
};

describe('GridCellPriceInputComponent', () => {
  @Component({
    template: `
      <esp-grid-cell-price-input
        [formControl]="control"
      ></esp-grid-cell-price-input>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class TestComponent {
    control = new FormControl(null, {
      validators: [
        () => {
          this.validateHasBeenCalled = true;
          return null;
        },
      ],
    });

    validateHasBeenCalled = false;
  }

  const createComponent = createComponentFactory({
    component: TestComponent,
    imports: [ReactiveFormsModule, GridCellPriceInputComponent],
    providers: [
      mockProvider(InputMaskLoader, {
        getInputMask: () => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require('inputmask_built');
          return of(window.Inputmask);
        },
      }),
    ],
  });

  const testSetup = () => {
    const spectator = createComponent();
    return { spectator, component: spectator.component };
  };

  it('should reflect the number as a string with a dollar sign but the model should be still persisted as a number', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const number = 123.12;

    // Assert
    expect(component.control.value).toEqual(null);

    // Act
    spectator.typeInElement(number.toString(), selectors.nativeInput);
    spectator.blur(selectors.nativeInput);

    // Assert
    expect(component.control.value).toEqual(number);
    expect(component.validateHasBeenCalled).toEqual(true);
    expect(selectors.span).toHaveText('$');
    expect(selectors.nativeInput).toHaveValue(`${number}`);
  });
});
