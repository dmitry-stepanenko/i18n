import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

import { CosButtonModule } from '@cosmos/components/button';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';

@Component({
  selector: 'esp-no-products-message',
  templateUrl: './no-products-message.component.html',
  styleUrls: ['./no-products-message.component.scss'],
  host: {
    class: 'esp-no-products-message',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CosButtonModule, CosmosUtilTranslationsModule],
  providers: [provideLanguageScopes(LanguageScope.EspPresentations)],
})
export class NoProductsMessageComponent {}
