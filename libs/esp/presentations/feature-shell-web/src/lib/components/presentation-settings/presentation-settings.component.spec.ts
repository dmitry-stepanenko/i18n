import { fakeAsync } from '@angular/core/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { timer } from 'rxjs';

import { CosSlideToggleComponent } from '@cosmos/components/toggle';
import { dataCySelector } from '@cosmos/testing';
import { PresentationMockDb } from '@esp/presentations/mocks-presentations';
import { PresentationSettings } from '@esp/presentations/types';

import { PresentationLocalState } from '../../local-states';

import {
  PresentationSettingsComponent,
  PresentationSettingsComponentModule,
} from './presentation-settings.component';

const selectors = {
  toggleClientDiscount: `${dataCySelector('ShowProductDiscount')}`,
};

const presentation = PresentationMockDb.presentation;

describe('PresentationSettingsComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationSettingsComponent,
    imports: [PresentationSettingsComponentModule],
  });

  const testSetup = (options?: Partial<PresentationLocalState>) => {
    const spectator = createComponent({
      providers: [
        mockProvider(PresentationLocalState, {
          presentation: {
            ...(options?.presentation ? options.presentation : presentation),
          },
          save: () => timer(1000),
        }),
      ],
    });
    const state = spectator.inject(PresentationLocalState, true);
    return { state, spectator, component: spectator.component };
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  const getToggleBySettingName = (
    spectator: ReturnType<typeof createComponent>,
    settingName: keyof PresentationSettings
  ) => {
    return {
      element: spectator.query(dataCySelector(settingName)),
      toggle: spectator.component.toggles.find(
        (toggle) => toggle.settingName === settingName
      ),
    };
  };

  it('should create', () => {
    expect(() => testSetup()).not.toThrow();
  });

  describe('Toggles', () => {
    it('should render all toggles', () => {
      // Arrange & act
      const { spectator, component } = testSetup();
      // Assert
      expect(spectator.queryAll('cos-toggle').length).toEqual(
        component.toggles.length
      );
    });

    it('should have all toggles defaulted to the enabled state', () => {
      // Arrange
      const { spectator } = testSetup();
      const toggles = spectator.queryAll('cos-toggle');

      // Act
      toggles.forEach((toggle) => toggle.dispatchEvent(new Event('click')));
      spectator.detectComponentChanges();

      // Assert
      toggles.forEach((toggle) => {
        expect(toggle).not.toHaveClass('cos-checked');
        expect(toggle).toHaveClass('cos-disabled');
      });
    });

    it('client discount toggle should be disabled by default', () => {
      // Arrange
      const { spectator } = testSetup({
        presentation: {
          ...presentation,
          Settings: { ...presentation.Settings, ShowProductDiscount: true },
        },
      });
      const clientDiscountToggle = spectator.query(
        selectors.toggleClientDiscount
      );

      // Assert
      expect(clientDiscountToggle).toHaveClass('cos-checked');
      expect(clientDiscountToggle).not.toHaveClass('cos-disabled');
    });

    (<Array<keyof PresentationSettings>>[
      'ShowProductCPN',
      'ShowProductColors',
      'ShowProductSizes',
      'ShowProductShape',
      'ShowProductMaterial',
      'ShowProductImprintMethods',
      'ShowProductPricing',
      'ShowProductDiscount',
      'ShowProductPriceRanges',
      // Disabled for MMP
      // 'ShowProductAdditionalCharges',
    ]).forEach((settingName) => {
      it(`should allow a user to hide/show "${settingName}" from showing on the customer facing presentation`, () => {
        // Arrange
        const { component, spectator, state } = testSetup();
        const { toggle, element } = getToggleBySettingName(
          spectator,
          settingName
        );
        const toggleLabel = element.querySelector('.cos-slide-toggle-content');
        const stateSpy = jest.spyOn(state, 'save');
        jest.spyOn(component, 'updateSetting');

        // Act
        spectator.click(element);

        // Assert
        expect(component.updateSetting).toHaveBeenCalledWith(toggle);
        expect(toggleLabel).toHaveText(toggle.label);
        expect(stateSpy).toHaveBeenCalledWith({
          ...state.presentation,
          Settings: {
            ...state.presentation.Settings,
            [toggle.settingName]: !toggle.value,
          },
        });
      });
    });
  });

  it('should disable setting before it gets updated and then enable it', fakeAsync(() => {
    // Arrange & act
    const { spectator } = testSetup();
    spectator.detectComponentChanges();
    const toggle = spectator.query(CosSlideToggleComponent);

    // Assert
    expect(toggle.disabled).toEqual(false);
    expect(toggle.checked).toEqual(false);

    spectator.click(spectator.query('cos-toggle:first-child'));
    expect(toggle.disabled).toEqual(true);

    spectator.tick(1000);

    expect(toggle.disabled).toEqual(false);
    expect(toggle.checked).toEqual(true);
  }));
});
