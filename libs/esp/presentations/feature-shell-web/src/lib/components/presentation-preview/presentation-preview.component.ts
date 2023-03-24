import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged, filter, map } from 'rxjs';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { CosButtonGroupModule } from '@cosmos/components/button-group';
import { CosCardModule } from '@cosmos/components/card';
import { ConfigService } from '@cosmos/config';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { assertDefined } from '@cosmos/util-common';
import {
  CosmosTranslocoService,
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';

import { PresentationPreviewLocalState } from './presentation-preview.local-state';

const enum PreviewOptionTitle {
  ProductPage = 'Product Page',
  LandingPage = 'Landing Page',
}

interface PreviewOption {
  name: PreviewOptionTitle | string;
  value: string;
}

@UntilDestroy()
@Component({
  selector: 'esp-presentation-preview',
  templateUrl: './presentation-preview.component.html',
  styleUrls: ['./presentation-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PresentationPreviewLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
  standalone: true,
  imports: [
    CommonModule,
    CosButtonGroupModule,
    CosCardModule,
    CosmosUtilTranslationsModule,
  ],
})
export class PresentationPreviewComponent implements OnInit {
  selectedOption: PreviewOption | null = null;
  previewOptions: PreviewOption[] | null = null;
  previewUrl: SafeResourceUrl | null = null;

  private readonly _state$ = this.state.connect(this, {
    renderStrategy: LocalStateRenderStrategy.Local,
  });

  constructor(
    readonly state: PresentationPreviewLocalState,
    private readonly _cdRef: ChangeDetectorRef,
    private readonly _tokenService: AuthTokenService,
    private readonly _sanitizer: DomSanitizer,
    private readonly _configService: ConfigService,
    private readonly _translocoService: CosmosTranslocoService
  ) {}

  ngOnInit(): void {
    this._state$
      .pipe(
        filter((state) => state.project != null && state.presentation != null),
        map((state) => state.presentation),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this._updatePreviewOptions();
        this._cdRef.detectChanges();
      });
  }

  updatePreview(event: MatButtonToggleChange): void {
    this.selectedOption = this.previewOptions!.find(
      (option) => option.value === event.value
    )!;
    this._updatePreviewUrl();
  }

  private _updatePreviewOptions(): void {
    const { project, presentation } = this.state;
    const customerPortalUrl =
      this._configService.get<string>('customerPortalUrl');
    const baseUrl = `${customerPortalUrl}/projects/${
      project!.Id
    }/presentations/${presentation!.Id}`;
    const tokenQuery = `?token=${this._tokenService.token}`;
    const firstVisibleProduct = presentation!.Products?.find(
      (product) => product.IsVisible
    );

    this._translocoService
      .getLangChanges$([LanguageScope.EspPresentations])
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        // We should default to product page tab if there's any visible product.
        // Otherwise, this should go back to the landing page tab.
        if (firstVisibleProduct) {
          this.previewOptions = [
            {
              name: this.previewOptionsMap(PreviewOptionTitle.ProductPage),
              value: `${baseUrl}/products/${firstVisibleProduct?.Id}${tokenQuery}`,
            },
            {
              name: this.previewOptionsMap(PreviewOptionTitle.LandingPage),
              value: `${baseUrl}${tokenQuery}`,
            },
          ];
        } else {
          // Note there's only landing page tab, because there're no products at all.
          this.previewOptions = [
            {
              name: this.previewOptionsMap(PreviewOptionTitle.LandingPage),
              value: `${baseUrl}${tokenQuery}`,
            },
          ];
        }

        // If there's no option selected previously or if there's no visible product within a presentation
        // we should default to `previewOptions[0]`, which is basically the landing page.
        if (this.selectedOption === null || !firstVisibleProduct) {
          this.selectedOption = this.previewOptions[0];
        } else {
          // Otherwise, we have to re-select the previously selected user option.
          // This is done because the product page URL may be updated.
          this.selectedOption = this.previewOptions.find(
            // Note that we're searching by `name`, which is static, and not by `value`,
            // which might've been updated.
            (option) => option.name === this.selectedOption!.name
          )!;
        }
        this._updatePreviewUrl();
      });
  }

  private _updatePreviewUrl(): void {
    global_notProduction &&
      assertDefined(
        this.selectedOption,
        'PresentationPreviewComponent: selectedOption must be defined'
      );

    this.previewUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
      // The `selectedOption` must be defined whenever the preview URL is updated.
      `${this.selectedOption!.value}&previewId=${Math.random()}`
    );
  }

  private previewOptionsMap(uploadType: PreviewOptionTitle): string {
    const wrap = (key: string) =>
      this._translocoService.translate(
        `espPresentations.presentation-settings-page.presentation-preview.${key}`
      );

    switch (uploadType) {
      case PreviewOptionTitle.ProductPage:
        return wrap('product-page');
      case PreviewOptionTitle.LandingPage:
      default:
        return wrap('landing-page');
    }
  }
}
