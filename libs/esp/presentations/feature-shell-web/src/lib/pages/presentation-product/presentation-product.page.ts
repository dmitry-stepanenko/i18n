import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  NgModule,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HashMap } from '@ngneat/transloco';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { isEqual } from 'lodash-es';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Observable, Observer, defer, firstValueFrom } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { AuthTokenService } from '@asi/auth/data-access-auth';
import { CosAnalyticsService, TrackEvent } from '@cosmos/analytics/common';
import { CosAccordionModule } from '@cosmos/components/accordion';
import { CosAttributeTagModule } from '@cosmos/components/attribute-tag';
import { CosAutocompleteModule } from '@cosmos/components/autocomplete';
import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosCheckboxModule } from '@cosmos/components/checkbox';
import { CosFormFieldModule } from '@cosmos/components/form-field';
import {
  CosImageUploadFormModule,
  CosImageUploadPreviewsListModule,
} from '@cosmos/components/image-upload-form';
import { CosInputModule } from '@cosmos/components/input';
import { CosProductNavigationModule } from '@cosmos/components/product-navigation';
import { CosSupplierModule } from '@cosmos/components/supplier';
import { CosTableModule } from '@cosmos/components/table';
import { CosSlideToggleModule } from '@cosmos/components/toggle';
import { ConfigService } from '@cosmos/config';
import { FeatureFlagsModule } from '@cosmos/feature-flags';
import { FormControl } from '@cosmos/forms';
import { CosIntersectionRendererModule } from '@cosmos/intersection-renderer';
import { Media, Nullable } from '@cosmos/types-common';
import {
  ConfirmDialogResult,
  ConfirmDialogService,
  DialogService,
} from '@cosmos/ui-dialog';
import {
  CosmosTranslocoService,
  CosmosUtilTranslationsModule,
  LanguageScope,
} from '@cosmos/util-translations';
import { AuthFacade } from '@esp/auth/data-access-auth';
import { DetailHeaderComponentModule } from '@esp/common/ui-detail-header';
import {
  ComponentCanDeactivate,
  PendingChangesGuard,
} from '@esp/common/util-pending-changes-guard';
import { createVirtualSampleDialogDef } from '@esp/presentations/feature-dialogs';
import { EspPresentationsFeatureProductsModule } from '@esp/presentations/feature-products';
import {
  PresentationProduct,
  PresentationProductAttribute,
  PresentationSettings,
  PresentationTrack,
} from '@esp/presentations/types';
import {
  ProductDetailsImageModule,
  ProductDetailsImagesSelectorModule,
} from '@esp/products/feature-product-details-image';
import { EspProductsUiProductDetailsModule } from '@esp/products/ui-product-details';
import { FormatCPNPipeModule } from '@esp/products/util-format-cpn-pipe';
import { SupplierTrackEvent } from '@esp/suppliers/types';
import { ProductImageComponentModule } from '@smartlink/products/ui-products';

import { PresentationProductVariantModule } from './components/presentation-product-variant';
import { PresentationProductLoaderModule } from './presentation-product.loader';
import { PresentationProductLocalState } from './presentation-product.local-state';
import { LoadPresentationProductResolver } from './resolvers';

@UntilDestroy()
@Component({
  selector: 'esp-presentation-product',
  templateUrl: './presentation-product.page.html',
  styleUrls: ['./presentation-product.page.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PresentationProductLocalState],
})
export class PresentationProductPage implements OnInit, ComponentCanDeactivate {
  private readonly state$ = this.state.connect(this, { cdRef: this._cdr });

  productImages: Media[] = [];
  form = this.createForm();
  primaryImage: Media | undefined;
  productAttributes: PresentationProductAttribute[] = [];
  currentProductIndex: Nullable<number> = null;
  productIsBeingSaved = false;
  imagesDirty = false;

  /**
   * https://asicentral.atlassian.net/browse/ENCORE-26467
   * The `Create Virtual Sample` button must be hidden if there's no
   * visible media on the product.
   */
  get shouldShowCreateVirtualSampleButton(): boolean {
    // The `product` is non-null asserted because the getter is called within
    // the template, which is wrapped with `ngIf="state.product"`.
    const media = this.state.product!.Media;
    return media.some(({ IsVisible }) => IsVisible);
  }

  get canSave(): boolean {
    if (!this.imagesDirty) {
      const media = this.state.product?.Media || [];
      this.imagesDirty = !isEqual(this.productImages, media);
    }

    return (
      this.state.isDirty ||
      (this.form.dirty && this.form.valid) ||
      this.imagesDirty
    );
  }

  readonly productImprint = defer(() =>
    import(
      /* webpackChunkName: 'presentation-product-imprint' */ '@esp/presentations/ui-presentation-product-imprint'
    ).then((m) => m.PPImprintComponent)
  );

  productPricing = defer(() =>
    import(
      /* webpackChunkName: 'presentation-product-pricing' */ './components/presentation-product-pricing'
    ).then((m) => m.PresentationProductPricingComponent)
  );

  priceRange = defer(() =>
    import(
      /* webpackChunkName: 'presentation-product-price-range' */ './components/presentation-product-price-range/presentation-product-price-range.component'
    ).then((m) => m.PresentationProductPriceRangeComponent)
  );

  clientDiscount = defer(() =>
    import(
      /* webpackChunkName: 'presentation-product-client-discount' */ './components/presentation-product-client-discount'
    ).then((m) => m.PresentationProductClientDiscountComponent)
  );

  private readonly _getDialogTranslationKey = (
    dialogKey: string,
    valueKey: string,
    params?: HashMap
  ) =>
    this._translocoService.translate(
      `espPresentations.presentation-product.presentation-product-page.${dialogKey}.${valueKey}`,
      { ...params }
    );

  // Removed for MMP.
  // additionalCharges = defer(() =>
  //   import(
  //     /* webpackChunkName: 'presentation-product-additional-charges' */ './components/presentation-product-additional-charges'
  //   ).then((m) => m.PresentationProductAdditionalChargesComponent)
  // );

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload($event: BeforeUnloadEvent) {
    if (this.canSave)
      $event.returnValue = this._getDialogTranslationKey(
        'confirmation-dialog-can-deactivate',
        'unload-message'
      );
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.canSave) {
      const dialogKey = 'confirmation-dialog-can-deactivate';
      return new Observable((observer: Observer<boolean>) => {
        this._confirmDialogService
          .confirm(
            {
              message: this._getDialogTranslationKey(
                dialogKey,
                'unload-message'
              ),
              cancel: this._getDialogTranslationKey(
                dialogKey,
                'discard-changes'
              ),
              confirm: this._getDialogTranslationKey(dialogKey, 'save-changes'),
            },
            {
              disableClose: false,
              minWidth: '584px',
              width: '584px',
            }
          )
          .pipe(untilDestroyed(this))
          .subscribe((confirmed) => {
            if (confirmed === undefined) return;

            if (confirmed) {
              this.save();
            }

            observer.next(true);
            observer.complete();
          });
      });
    } else {
      return true;
    }
  }

  get companyId(): number | undefined {
    return this._authFacade.user?.CompanyId;
  }

  constructor(
    public readonly state: PresentationProductLocalState,
    private readonly tokenService: AuthTokenService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly _analytics: CosAnalyticsService,
    private readonly _authFacade: AuthFacade,
    private readonly _confirmDialogService: ConfirmDialogService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _configService: ConfigService,
    private readonly _dialogService: DialogService,
    private readonly _translocoService: CosmosTranslocoService
  ) {
    const product$ = this.state$.pipe(
      map((x) => x.product),
      distinctUntilChanged((a, b) => a?.Id === b?.Id)
    );

    product$.pipe(untilDestroyed(this)).subscribe({
      next: (product) => {
        if (product) {
          this.form.reset(product);
          this.getMedia();
          this.productAttributes = product.Attributes;
        }
      },
    });
  }

  ngOnInit() {
    this.route.params.pipe(untilDestroyed(this)).subscribe((params) => {
      this.state.getPresentation(params['presentationId']);
    });
  }

  private createForm() {
    return new FormGroup({
      Name: new FormControl('', Validators.required),
      Summary: new FormControl(''),
      Note: new FormControl(''),
    });
  }

  updateAttribute(attribute: PresentationProductAttribute) {
    this.state.patchAttribute(attribute, attribute);
  }

  updateSetting(setting: keyof PresentationSettings, value: boolean): void {
    if (!this.state.product) return;

    this.state.patchProduct({
      Settings: {
        ...this.state.product.Settings,
        [setting]: value,
      },
    });
  }

  getMedia(): void {
    if (!this.state.product) return;

    this.productImages = this.state.product.Media.map((media) => ({
      ...media,
    }));
    this.primaryImage = this.productImages.find((image) => image.IsVisible);
    this.imagesDirty = false;
  }

  setPrimaryImage(image: Media) {
    this.primaryImage = image;
  }

  addMedia(image: Nullable<Media>): void {
    if (!image) return;

    const updatedImages = [
      ...this.productImages.map((x) => ({ ...x, Sequence: x.Sequence + 1 })),
    ];
    updatedImages.unshift(image);
    this.productImages = [...updatedImages];
  }

  sortProductImage(images: Media[]): void {
    this.productImages = [...images];
  }

  async removeImage(image: Nullable<Media>) {
    if (!image) return;
    const dialogKey = 'confirmation-dialog-remove-image';

    const confirmed = await firstValueFrom(
      this._confirmDialogService.confirm(
        {
          message: this._getDialogTranslationKey(dialogKey, 'message'),
          cancel: this._getDialogTranslationKey(dialogKey, 'cancel'),
          confirm: this._getDialogTranslationKey(dialogKey, 'confirm'),
        },
        {
          disableClose: false,
        }
      )
    );

    if (confirmed) {
      const index = this.productImages.findIndex((x) => x.Id === image.Id);
      this.productImages.splice(index, 1);
    }
    // To Detect changes for child component
    this.productImages = [...this.productImages];
    this._cdr.detectChanges();
  }

  goToSupplier(): void {
    if (!this.state.product) return;

    const supplierTrack: TrackEvent<SupplierTrackEvent> = {
      action: 'Supplier Clicked',
      properties: {
        id: this.state.product.Supplier?.ExternalId as number,
        productId: this.state.product.Id,
      },
    };

    this._analytics.track(supplierTrack);

    window.open(`/suppliers/${this.state.product.Supplier?.ExternalId}`);
  }

  checkPriceGridForAttribute(): boolean {
    if (!this.state.product?.Attributes) return true;

    // Getting the attribute types Price Grid is based on
    const attributeTypesList: string[] = [
      ...new Set(
        this.state.visiblePriceGrids
          .map((type) => type.AttributeTypes || [])
          .flat()
      ),
    ];
    // Checking if Price Grid is not based on Color, Material, Size, Shape and Imprint Method no further check needed
    if (
      !attributeTypesList.includes('PRCL') &&
      !attributeTypesList.includes('MTRL') &&
      !attributeTypesList.includes('SIZE') &&
      !attributeTypesList.includes('SHAP') &&
      !attributeTypesList.includes('IMMD')
    ) {
      return true;
    } else {
      // Checking if toggle is off for any attribute type on which price grid is based (Color, Material, Size, Shape and Imprint Method)
      if (
        (attributeTypesList.includes('PRCL') &&
          !this.state.product!.Settings.ShowProductColors) ||
        (attributeTypesList.includes('MTRL') &&
          !this.state.product!.Settings.ShowProductMaterial) ||
        (attributeTypesList.includes('SIZE') &&
          !this.state.product!.Settings.ShowProductSizes) ||
        (attributeTypesList.includes('SHAP') &&
          !this.state.product!.Settings.ShowProductShape) ||
        (attributeTypesList.includes('IMMD') &&
          !this.state.product!.Settings.ShowProductImprintMethods)
      ) {
        return false;
      } else {
        // Check if attribute on which Price Grid is based of is unchecked
        const attributeTypes = ['PRCL', 'MTRL', 'SIZE', 'SHAP', 'IMMD'];
        // Get all attribute id on which Price Grid is based (Color, Material, Size, Shape and Imprint Method)
        const priceGridAttributeIdList = this.state.visiblePriceGrids
          .map((grid) => grid.AttributeMap)
          .flat()
          .filter((attribute) => attributeTypes.includes(attribute!.Type!))
          .map((attribute) => attribute!.Id);

        // Get all checked attribute id in product (Color, Material, Size, Shape and Imprint Method)
        const attributeIdList: number[] = this.state
          .product!.Attributes.filter((a) => attributeTypes.includes(a.Type!))
          .map((attribute) => attribute.Values)
          .flat()
          .filter((attribute) => attribute!.IsVisible)
          .map((attribute) => attribute!.Id);

        // Check if any of the attribute id on which Price Grid is based on is unchecked (Color, Material, Size, Shape and Imprint Method)
        const attributePriceGridExist = priceGridAttributeIdList?.every(
          (element) => {
            return attributeIdList?.includes(element);
          }
        );
        return attributePriceGridExist;
      }
    }
  }

  async saveClick(): Promise<void> {
    if (this.checkPriceGridForAttribute()) {
      this.save();
    } else {
      const dialogKey = 'confirmation-dialog-save-click';

      const confirmed = await firstValueFrom(
        this._confirmDialogService.confirm(
          {
            title: this._getDialogTranslationKey(dialogKey, 'title'),
            message: this._getDialogTranslationKey(dialogKey, 'message', {
              tag: `<br /><br />`,
            }),
            confirm: this._getDialogTranslationKey(dialogKey, 'confirm'),
            cancel: this._getDialogTranslationKey(dialogKey, 'cancel'),
          },
          {
            disableClose: false,
            minWidth: '584px',
            width: '584px',
          }
        )
      );

      if (confirmed) this.save();
    }
  }

  async cancel(): Promise<void> {
    const dialogKey = 'confirmation-dialog-cancel';

    await firstValueFrom(
      this._translocoService.getLangChanges$([LanguageScope.EspPresentations])
    );
    const confirmed = await firstValueFrom(
      this._confirmDialogService.confirm(
        {
          message: this._getDialogTranslationKey(dialogKey, 'message'),
          confirm: this._getDialogTranslationKey(dialogKey, 'confirm'),
          cancel: this._getDialogTranslationKey(dialogKey, 'cancel'),
        },
        {
          disableClose: false,
        }
      )
    );

    if (confirmed) {
      this.state.get(this.state.presentation!.Id, this.state.product!.Id);

      // TODO: look into why we need to do this...
      this.form.reset(this.state.product!);
      this.getMedia();
      this.productAttributes = this.state.product!.Attributes;
    }
  }

  save(previewAfterSave = false) {
    if (this.form.invalid) {
      return;
    }

    this.productIsBeingSaved = true;
    this.state
      .save(this.state.presentation!.Id, this._getModifiedProduct())
      .pipe(
        finalize(() => {
          this.productIsBeingSaved = false;
          this.form.markAsPristine();
          this.getMedia();
          this.productAttributes = this.state.product!.Attributes;
          this._cdr.detectChanges();
          if (previewAfterSave) {
            this.openPreview();
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  async delete(): Promise<void> {
    const dialogKey = 'confirmation-dialog-delete';
    const confirmed = await firstValueFrom(
      this._confirmDialogService.confirm({
        message: this._getDialogTranslationKey(dialogKey, 'message'),
        confirm: this._getDialogTranslationKey(dialogKey, 'confirm'),
        cancel: this._getDialogTranslationKey(dialogKey, 'cancel'),
      })
    );

    if (confirmed) this.state.delete();
  }

  backToPresentation(): void {
    this.router.navigate([
      '/projects',
      this.state.presentation!.ProjectId,
      'presentations',
      this.state.presentation!.Id,
    ]);
  }

  previewPresentationProduct() {
    if (this.canSave) {
      this.openConfirmDialog()
        .pipe(
          // Filter out `undefined`. It's generated when you close with x or click outside modal.
          filter((x) => x !== undefined),
          untilDestroyed(this)
        )
        .subscribe((confirmed) => {
          if (confirmed) {
            this.save(true);
          } else {
            this.openPreview();
          }
        });
    } else {
      this.openPreview();
    }
  }

  navigateToProduct(product: any): void {
    this.router.navigate(['../../product', product.Id], {
      relativeTo: this.route,
    });
  }

  productIndex(productsArray: any, productId: number): number {
    return (this.currentProductIndex = productsArray.findIndex(
      (product: any) => product.Id === productId
    ));
  }

  async createVirtualSample() {
    // It's likely to return a new media object if the virtual sample is saved successfully.
    const newMedia = await firstValueFrom(
      this._dialogService.open(
        createVirtualSampleDialogDef,
        {
          presentation: this.state.presentation!,
          // sending in modified product to save all edits
          product: this._getModifiedProduct(),
        },
        {
          config: { width: '100vw' },
        }
      )
    );

    if (newMedia) {
      this.addMedia(newMedia);
      this.form.markAsPristine();
      this.getMedia();
      // Gotta run change detection manually since we're inside a microtask (after `await`).
      this._cdr.detectChanges();
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  private captureEvent(action: 'Presentation Preview') {
    const event: TrackEvent<PresentationTrack> = {
      action: action,
      properties: {
        id: this.state.presentation!.Id,
      },
    };

    this._analytics.track(event);
  }

  private openConfirmDialog(): Observable<ConfirmDialogResult> {
    const dialogKey = 'confirmation-dialog-open-dialog';

    return this._translocoService
      .getLangChanges$([LanguageScope.EspPresentations])
      .pipe(
        take(1),
        switchMap(() =>
          this._confirmDialogService.confirm(
            {
              message: this._getDialogTranslationKey(dialogKey, 'message'),
              confirm: this._getDialogTranslationKey(dialogKey, 'confirm'),
              cancel: this._getDialogTranslationKey(dialogKey, 'cancel'),
            },
            {
              disableClose: false,
            }
          )
        )
      );
  }

  private openPreview(): void {
    this.captureEvent('Presentation Preview');

    window.open(
      `${this._configService.get<string>('customerPortalUrl')}/presentations/${
        this.state.presentation!.Id
      }/products/${this.state.product!.Id}?token=${this.tokenService.token}`
    );
  }

  private _getModifiedProduct(): PresentationProduct {
    return {
      ...this.state.product!,
      ...this.form.value!,
      Media: this.productImages,
    };
  }
}

@NgModule({
  declarations: [PresentationProductPage],
  exports: [PresentationProductPage],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: PresentationProductPage,
        canActivate: [LoadPresentationProductResolver],
        canDeactivate: [PendingChangesGuard],
        resolve: [LoadPresentationProductResolver],
      },
    ]),
    MatMenuModule,

    NgxSkeletonLoaderModule,
    CosmosUtilTranslationsModule.withScopes(
      LanguageScope.EspCommon,
      LanguageScope.EspPresentations
    ),

    CosAttributeTagModule,
    CosAccordionModule,
    CosAutocompleteModule,
    CosButtonModule,
    CosCardModule,
    CosCheckboxModule,
    FeatureFlagsModule,
    CosFormFieldModule,
    CosImageUploadPreviewsListModule,
    CosImageUploadFormModule,
    CosInputModule,
    CosSlideToggleModule,
    CosSupplierModule,
    CosTableModule,
    CosProductNavigationModule,
    CosIntersectionRendererModule,
    FeatureFlagsModule,

    EspPresentationsFeatureProductsModule.forChild(),

    DetailHeaderComponentModule,
    PresentationProductVariantModule,
    PresentationProductLoaderModule,
    ProductImageComponentModule,

    FormatCPNPipeModule,

    EspProductsUiProductDetailsModule,
    ProductDetailsImagesSelectorModule,
    ProductDetailsImageModule,
  ],
})
export class PresentationProductPageModule {}
