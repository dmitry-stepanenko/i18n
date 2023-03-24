import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgModule,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as moment from 'moment';
import { Moment } from 'moment/moment';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { defer, distinctUntilChanged, filter, firstValueFrom, map } from 'rxjs';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosFormFieldModule } from '@cosmos/components/form-field';
import { CosInputModule } from '@cosmos/components/input';
import { CosTableModule } from '@cosmos/components/table';
import { CosSlideToggleModule } from '@cosmos/components/toggle';
import { MatTooltipModule } from '@cosmos/components/tooltip';
import { FeatureFlagsModule } from '@cosmos/feature-flags';
import { CosIntersectionRendererModule } from '@cosmos/intersection-renderer';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { DialogService } from '@cosmos/ui-dialog';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { changeConversionRateConfig } from '@esp/common/feature-change-conversion-rate-dialog';
import { ProductRecommendationsCardComponent } from '@esp/common/ui-cards';
import {
  IsTotalUnitsRowPipeModule,
  VariantsGridDataSourcePipeModule,
} from '@esp/orders/util-order-pipes';
import { AsiOrderPricePipe } from '@esp/orders/util-order-price-pipe';
import { PresentationsActions } from '@esp/presentations/data-access-presentations';
import { AsiPresentationQuoteProductCardModule } from '@esp/presentations/feature-quote';
import { PresentationStatus } from '@esp/presentations/types';

import {
  PresentationInfoCardComponentModule,
  PresentationSettingsComponentModule,
} from '../../components';
import { PresentationLocalState } from '../../local-states';

// Page state sub-components
import { PresentationActionBarComponent } from './components/action-bar/presentation-action-bar.component';
import { PresentationProductsModule } from './components/presentation-products';
import { PresentationQuotesComponent } from './components/presentation-quotes/presentation-quotes.component';
import { PresentationSettingsLoaderModule } from './presentation-settings.loader';

export interface SettingsForm {
  Note: string;
  ExpirationDate: Date | string | null;
}

@UntilDestroy()
@Component({
  selector: 'esp-presentation-settings-page',
  templateUrl: './presentation-settings.page.html',
  styleUrls: ['./presentation-settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PresentationLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
})
export class PresentationSettingsPage implements AfterContentInit {
  state$ = this.state.connect(this, {
    renderStrategy: LocalStateRenderStrategy.Local,
  });

  isInEditMode = false;
  maxExpirationDate = moment().add(90, 'days').toDate();

  disabledToggles: Record<'AllowProductVariants' | 'ShowSignature', boolean> = {
    AllowProductVariants: false,
    ShowSignature: false,
  };

  PresentationStatus = PresentationStatus;

  form = new FormGroup({
    Note: new FormControl<string>(''),
    ExpirationDate: new FormControl<string | Date | null>(null),
  });

  presentationPreview = defer(() =>
    import(
      /* webpackChunkName: 'presentation-preview' */ '../../components/presentation-preview'
    ).then((m) => m.PresentationPreviewComponent)
  );

  constructor(
    readonly state: PresentationLocalState,
    private readonly _ref: ChangeDetectorRef,
    private readonly _dialogService: DialogService
  ) {}

  ngAfterContentInit(): void {
    this.state$
      .pipe(
        map((state) => state.presentation),
        filter(Boolean),
        distinctUntilChanged(
          (a, b) => a.ExpirationDate === b.ExpirationDate && a.Note === b.Note
        ),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this.resetNote();
        this.resetExpirationDate();
      });
  }

  resetNote(): void {
    this.form.controls.Note.setValue(this.state.presentation!.Note);
  }

  saveNote(): void {
    this.state.save({
      ...this.state.presentation!,
      Note: this.form.controls.Note.value,
    });
  }

  resetExpirationDate() {
    this.form.controls.ExpirationDate.setValue(
      this.state.presentation!.ExpirationDate
    );
  }

  updateExpirationDate(event: MatDatepickerInputEvent<Moment>): void {
    this.form.controls.ExpirationDate?.setValue(event.value?.format() ?? null);

    this.state.save({
      ...this.state.presentation!,
      ExpirationDate: this.form.controls.ExpirationDate.value,
    });
  }

  updateSharingOption(option: 'AllowProductVariants' | 'ShowSignature'): void {
    this.disabledToggles[option] = true;

    this.state
      .save({
        ...this.state.presentation!,
        [option]: !this.state.presentation![option],
      })
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.disabledToggles[option] = false;
        this._ref.detectChanges();
      });
  }

  async changeConversionRate(): Promise<void> {
    await firstValueFrom(
      this._dialogService.open(changeConversionRateConfig, {
        currencies: this.state.presentation!.Currencies || [],
        currencyCode: this.state.presentation!.CurrencyCode || 'USD',
        ChangeConversionRateAction: PresentationsActions.ChangeConversionRate,
      })
    );
  }
}

@NgModule({
  declarations: [PresentationSettingsPage],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatMenuModule,
    MatDatepickerModule,
    MatTooltipModule,

    NgxSkeletonLoaderModule,

    CosButtonModule,
    CosCardModule,
    CosFormFieldModule,
    CosInputModule,
    CosSlideToggleModule,
    FeatureFlagsModule,
    CosIntersectionRendererModule,
    CosTableModule,
    IsTotalUnitsRowPipeModule,

    PresentationProductsModule,
    ProductRecommendationsCardComponent,
    PresentationInfoCardComponentModule,
    PresentationSettingsLoaderModule,
    PresentationSettingsComponentModule,
    PresentationQuotesComponent,

    PresentationActionBarComponent,
    AsiPresentationQuoteProductCardModule,
    VariantsGridDataSourcePipeModule,
    AsiOrderPricePipe,
    CosmosUtilTranslationsModule,
  ],
  exports: [PresentationSettingsPage],
})
export class PresentationSettingsPageModule {}
