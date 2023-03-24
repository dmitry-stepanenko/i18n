import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgModule,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { CosSlideToggleModule } from '@cosmos/components/toggle';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
} from '@cosmos/util-translations';
import { Presentation, PresentationSettings } from '@esp/presentations/types';

import { PresentationLocalState } from '../../local-states';

interface PresentationSettingsToggle {
  label: string;
  settingName: keyof PresentationSettings;
  value: boolean;
  disabled: boolean;
}

@UntilDestroy()
@Component({
  selector: 'esp-presentation-settings',
  templateUrl: './presentation-settings.component.html',
  styleUrls: ['./presentation-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentationSettingsComponent implements OnInit {
  toggles: PresentationSettingsToggle[] = [
    {
      settingName: 'ShowProductCPN',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.product-cpn',
    },
    {
      settingName: 'ShowProductColors',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.product-color',
    },
    {
      settingName: 'ShowProductSizes',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.product-size',
    },
    {
      settingName: 'ShowProductShape',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.product-shape',
    },
    {
      settingName: 'ShowProductMaterial',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.product-material',
    },
    {
      settingName: 'ShowProductPriceRanges',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.price-range',
    },
    {
      settingName: 'ShowProductPricing',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.pricing',
    },
    {
      settingName: 'ShowProductDiscount',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.client-discount',
    },
    {
      settingName: 'ShowProductImprintMethods',
      value: false,
      disabled: false,
      label: 'presentation-settings-toggle.imprint-options',
    },
    // DISABLED FOR MMP
    // {
    //   settingName: 'ShowProductAdditionalCharges',
    //   value: false,
    //   disabled: false,
    //   label: 'Additional Charges',
    // },
  ];

  constructor(
    private readonly ref: ChangeDetectorRef,
    private readonly state: PresentationLocalState
  ) {}

  ngOnInit(): void {
    const settings = this.state.presentation?.Settings;

    this.toggles.forEach((toggle) => {
      if (settings && settings[toggle.settingName]) {
        toggle.value = settings[toggle.settingName];
      }
    });
  }

  updateSetting(toggle: PresentationSettingsToggle): void {
    toggle.disabled = true;
    const checked = !toggle.value;

    if (!this.state.presentation) return;

    const presentation: Presentation = {
      ...this.state.presentation,
      Settings: {
        ...this.state.presentation.Settings,
        [toggle.settingName]: checked,
      },
    };

    this.state
      .save(presentation)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        toggle.disabled = false;
        toggle.value = checked;
        this.ref.detectChanges();
      });
  }
}

@NgModule({
  declarations: [PresentationSettingsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CosSlideToggleModule,
    CosmosUtilTranslationsModule.withScopes(LanguageScope.EspPresentations),
  ],
  exports: [PresentationSettingsComponent],
})
export class PresentationSettingsComponentModule {}
