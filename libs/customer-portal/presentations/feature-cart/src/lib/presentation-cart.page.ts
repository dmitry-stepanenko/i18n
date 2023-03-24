import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatNativeDateModule, NativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCheckboxModule } from '@cosmos/components/checkbox';
import { CosProductCardModule } from '@cosmos/components/product-card';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { ConfirmDialogService, DialogService } from '@cosmos/ui-dialog';
import { CustomerPortalPresentationProductsActions } from '@customer-portal/presentations/data-access-presentations';
import { customizeProductDialogDef } from '@customer-portal/presentations/feature-customize-product-dialog';
import {
  EmptyTemplate,
  LineItemCardViewModel,
  PresentationCartProduct,
} from '@esp/presentations/types';
import { CosPresentationProductCardComponent } from '@esp/presentations/ui-presentation-product-card';

import { PresentationCartLoaderComponent } from './components/presentation-cart-loader';
import { PresentationEmptyTemplateComponent } from './components/presentation-empty-template';
import { PresentationCartLocalState } from './presentation-cart.local-state';

@UntilDestroy()
@Component({
  selector: 'customer-portal-presentation-cart',
  templateUrl: './presentation-cart.page.html',
  styleUrls: ['./presentation-cart.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PresentationCartLocalState],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CosProductCardModule,
    CosButtonModule,
    CosCheckboxModule,
    MatDialogModule,
    MatNativeDateModule,
    NativeDateModule,
    MatDividerModule,
    CosPresentationProductCardComponent,
    PresentationCartLoaderComponent,
    PresentationEmptyTemplateComponent,
  ],
})
export class PresentationCartPage {
  readonly emptyTemplate: EmptyTemplate = {
    title: 'Your Cart is Empty',
    body: `There are no products in your cart. Go back to your presentation and add
    products to your cart that you'd like to request a quote for. Then click
    "Request a quote" to let Kraftwerk know which items you'd like to order so
    that they can prepare your quote for approval.`,
    actionText: 'Back to Presentation',
    actionIcon: 'fa fa-arrow-left',
  };

  constructor(
    readonly state: PresentationCartLocalState,
    private readonly store: Store,
    private readonly dialogService: DialogService,
    private readonly confirmDialogService: ConfirmDialogService
  ) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });
  }

  editProduct(product: LineItemCardViewModel) {
    const cartProduct: PresentationCartProduct = this.state.cart.find(
      ({ Id }) => Id === product.Id
    )!;

    this.store
      .dispatch(
        new CustomerPortalPresentationProductsActions.GetProduct(
          this.state.presentationId!,
          cartProduct.PresentationProductId
        )
      )
      .pipe(untilDestroyed(this))
      .subscribe(() =>
        firstValueFrom(
          this.dialogService.open(customizeProductDialogDef, {
            Product: this.state.selectedProduct!,
            ProductImageUrl: this.state.selectedProduct!.DefaultMedia?.Url,
            EditData: {
              CartProductId: cartProduct.Id,
              Comment: cartProduct.Comment!,
              Media: cartProduct.Media,
              Quantity: cartProduct.Quantity,
              ProductDetails: cartProduct.ProductDetails,
              ImprintMethod: cartProduct.ImprintMethod,
            },
          })
        )
      );
  }

  async removeProduct(cartProduct: LineItemCardViewModel): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirmDialogService.confirm(
        {
          title: 'Remove Item',
          message: 'Are you sure you want to remove this item from your cart?',
          confirm: 'Remove',
          cancel: 'Cancel',
        },
        {
          disableClose: false,
        }
      )
    );

    if (confirmed) {
      this.store.dispatch(
        this.state._removeCartProduct(
          this.state.presentationId!,
          cartProduct.Id,
          cartProduct.ProductId
        )
      );
    }
  }
}
