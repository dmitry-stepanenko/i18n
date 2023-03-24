import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import {
  CosCheckboxChange,
  CosCheckboxModule,
} from '@cosmos/components/checkbox';
import { CosFormFieldModule } from '@cosmos/components/form-field';
import { CosInputModule } from '@cosmos/components/input';
import { CosSlideToggleModule } from '@cosmos/components/toggle';
import { FormControl } from '@cosmos/forms';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { AttributeValue, PriceGrid } from '@cosmos/types-common';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { Decoration } from '@esp/lookup/types-lookup';
import { PresentationProductAttribute } from '@esp/presentations/types';

import { PPImprintLocalState } from './pp-imprint.local-state';

const DEFAULT_LIMIT = 5;

@UntilDestroy()
@Component({
  selector: 'esp-pp-imprint',
  templateUrl: './pp-imprint.component.html',
  styleUrls: ['./pp-imprint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PPImprintLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CosButtonModule,
    CosCardModule,
    CosmosUtilTranslationsModule,
    CosCheckboxModule,
    CosFormFieldModule,
    CosInputModule,
    CosSlideToggleModule,

    // PresentationProductImprintChargesModule,
  ],
})
export class PPImprintComponent {
  limit = DEFAULT_LIMIT;

  showMore = false;
  otherImprintMethods: Decoration[] = [];

  readonly form = this._createForm();

  constructor(readonly state: PPImprintLocalState) {
    const state$ = state.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });

    state$
      .pipe(untilDestroyed(this))
      .subscribe(({ decorations, imprintMethod }) => {
        if (!decorations) {
          return;
        }

        const attributes = (imprintMethod?.Values || []).filter(
          (attribute) => attribute.Id !== 0
        );

        this.otherImprintMethods = decorations.filter(
          (decoration) =>
            attributes.findIndex(
              (attribute) => attribute.ValueGroup === decoration.Name
            ) === -1
        );
      });
  }

  private _createForm() {
    return new FormGroup({
      ImprintSizes: new FormControl(this.state.product?.ImprintSizes),
      ImprintLocations: new FormControl(this.state.product?.ImprintLocations),
      ImprintColors: new FormControl(this.state.product?.ImprintColors),
    });
  }

  onExpandedChange(expanded: boolean, priceGrid: PriceGrid): void {
    if (expanded) {
      this.state.getOriginalPriceGrid(
        this.state.presentation!.Id,
        this.state.product!.Id,
        priceGrid.Id
      );
    }
  }

  updateImprintSizes(event: Event): void {
    this.state.patchProduct({
      ImprintSizes: (event.target as HTMLInputElement).value,
    });
  }

  updateImprintLocations(event: Event): void {
    this.state.patchProduct({
      ImprintLocations: (event.target as HTMLInputElement).value,
    });
  }

  updateImprintColors(event: Event): void {
    this.state.patchProduct({
      ImprintColors: (event.target as HTMLInputElement).value,
    });
  }

  toggleImprint(): void {
    this.state.patchProduct({
      Settings: {
        ...this.state.product!.Settings,
        ShowProductImprintMethods:
          !this.state.product!.Settings.ShowProductImprintMethods,
      },
    });
  }

  toggleImprintMethod(attribute: PresentationProductAttribute, method: any) {
    const index = attribute.Values!.findIndex((m) => m.Id === method.Id);
    const _attribute = { ...attribute, Values: [...attribute.Values!] };

    _attribute.Values[index] = {
      ...method,
      IsVisible: !method.IsVisible,
    };

    this.state.patchAttribute(attribute, _attribute);
  }

  toggleOtherImprintMethod(
    event: CosCheckboxChange,
    method: Decoration | AttributeValue
  ): void {
    let imprintMethod: PresentationProductAttribute;

    if (event.checked) {
      const attributeValue = {
        Id: 0,
        Name: method.Name,
        Value: method.Name,
        Type: 'IMMD',
        ValueGroup: method.Name,
        Description: method.Description,
        IsVisible: true,
      } as AttributeValue;
      imprintMethod = {
        ...this.state.imprintMethod,
        Values: [...this.state.imprintMethod!.Values!, attributeValue],
      } as PresentationProductAttribute;
    } else {
      imprintMethod = {
        ...this.state.imprintMethod,
        Values: [...this.state.imprintMethod!.Values!],
      };
      const index = imprintMethod.Values!.findIndex(
        (_) => _.Value === method.Name
      );
      imprintMethod.Values!.splice(index, 1);
    }

    this.state.patchAttribute(this.state.imprintMethod!, imprintMethod);
  }

  isOtherImprintMethodSelected(method: Decoration) {
    return (
      this.state.imprintMethod?.Values?.filter((_) => _.Id === 0)?.findIndex(
        (_) => _.ValueGroup === method.Name
      ) !== -1
    );
  }

  isShowMoreEnabled() {
    return this.state?.decorations?.length > DEFAULT_LIMIT;
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
    this.limit = this.showMore
      ? this.state?.decorations?.length || this.limit
      : DEFAULT_LIMIT;
  }
}
