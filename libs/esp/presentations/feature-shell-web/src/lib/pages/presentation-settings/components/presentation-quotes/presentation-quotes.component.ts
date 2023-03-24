import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { isNumber } from 'lodash-es';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { defer, distinctUntilChanged, filter, map } from 'rxjs';

import { CosAttributeTagModule } from '@cosmos/components/attribute-tag';
import { CosAvatarModule } from '@cosmos/components/avatar';
import { CosButtonModule } from '@cosmos/components/button';
import { CosCardModule } from '@cosmos/components/card';
import { CosTableModule } from '@cosmos/components/table';
import { CosIntersectionRendererModule } from '@cosmos/intersection-renderer';
import { LocalStateRenderStrategy } from '@cosmos/state';
import {
  CosmosUtilTranslationsModule,
  LanguageScope,
  provideLanguageScopes,
} from '@cosmos/util-translations';
import { AsiOrderDetailsComponent } from '@esp/orders/ui-order-details';
import {
  IsTotalUnitsRowPipeModule,
  VariantsGridDataSourcePipeModule,
} from '@esp/orders/util-order-pipes';
import { AsiPresentationQuoteProductCardModule } from '@esp/presentations/feature-quote';
import { CosPresentationProductCardComponent } from '@esp/presentations/ui-presentation-product-card';

import {
  PresentationLocalState,
  PresentationQuoteLocalState,
} from '../../../../local-states';

@UntilDestroy()
@Component({
  selector: 'esp-presentation-quotes',
  templateUrl: './presentation-quotes.component.html',
  styleUrls: ['./presentation-quotes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PresentationQuoteLocalState,
    provideLanguageScopes(LanguageScope.EspPresentations),
  ],
  standalone: true,
  imports: [
    CommonModule,

    MatMenuModule,
    RouterModule,

    NgxSkeletonLoaderModule,

    AsiOrderDetailsComponent,
    CosButtonModule,
    CosCardModule,
    CosAvatarModule,
    CosAttributeTagModule,
    CosIntersectionRendererModule,
    IsTotalUnitsRowPipeModule,
    VariantsGridDataSourcePipeModule,
    AsiPresentationQuoteProductCardModule,
    CosTableModule,
    CosPresentationProductCardComponent,
    CosmosUtilTranslationsModule,
  ],
})
export class PresentationQuotesComponent {
  presentationQuoteAttachments = defer(() =>
    import(
      /* webpackChunkName: 'presentation-quote-attachments' */ './components/presentation-quote-attachments/presentation-quote-attachments.component'
    ).then((m) => m.PresentationQuoteAttachmentsComponent)
  );

  isArray = Array.isArray;

  constructor(
    public readonly state: PresentationQuoteLocalState,
    public readonly presentationLocalState: PresentationLocalState
  ) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });

    presentationLocalState
      .connect(this, { refreshComponent: false })
      .pipe(
        map(({ presentation }) => presentation?.Quotes?.[0]?.QuoteId),
        filter(isNumber),
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe((quoteId) => {
        state.loadQuote(quoteId);
      });
  }
}
