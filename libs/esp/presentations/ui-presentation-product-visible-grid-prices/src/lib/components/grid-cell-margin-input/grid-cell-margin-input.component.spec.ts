import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { createComponentFactory } from '@ngneat/spectator/jest';

import { GridCellMarginInputComponent } from './grid-cell-margin-input.component';

const selectors = {
  nativeInput: 'esp-grid-cell-margin-input input',
};

describe('GridCellMarginInputComponent', () => {
  @Component({
    template: `
      <esp-grid-cell-margin-input
        [formControl]="control"
      ></esp-grid-cell-margin-input>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class TestComponent {
    control = new FormControl();
  }

  const createComponent = createComponentFactory({
    component: TestComponent,
    imports: [ReactiveFormsModule, GridCellMarginInputComponent],
  });

  const testSetup = () => {
    const spectator = createComponent();
    return { spectator, component: spectator.component };
  };

  it('should reflect the number as integer but keep the model as decimal (integer / 100)', () => {
    // Arrange
    const { spectator, component } = testSetup();

    // Assert
    expect(component.control.value).toEqual(null);

    // Act
    spectator.typeInElement('40', selectors.nativeInput);
    spectator.blur(selectors.nativeInput);

    // Assert
    expect(component.control.value).toEqual(0.4);
    expect(spectator.query(selectors.nativeInput)).toHaveValue('40');
  });
});
