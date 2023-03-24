import { RouterLink, RouterModule } from '@angular/router';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { MockComponents, MockDirectives } from 'ng-mocks';
import {
  NgxSkeletonLoaderComponent,
  NgxSkeletonLoaderModule,
} from 'ngx-skeleton-loader';
import { of } from 'rxjs';

import {
  CosAttributeTagDirective,
  CosAttributeTagModule,
} from '@cosmos/components/attribute-tag';
import { CosAvatarComponent, CosAvatarModule } from '@cosmos/components/avatar';
import { CosButtonComponent, CosButtonModule } from '@cosmos/components/button';
import { CosCardComponent, CosCardModule } from '@cosmos/components/card';
import { dataCySelector } from '@cosmos/testing';
import { OrdersMockDb } from '@esp/orders/mocks-orders';
import { PresentationMockDb } from '@esp/presentations/mocks-presentations';

import {
  PresentationLocalState,
  PresentationQuoteLocalState,
} from '../../../../local-states';

import { PresentationQuotesComponent } from './presentation-quotes.component';

const presentation = PresentationMockDb.presentation;

const selectors = {
  variantsTableItemHeader: dataCySelector(
    'presentation-settings__variant-table-item-header'
  ),
  variantsTableQuantityHeader: dataCySelector(
    'presentation-settings__variant-table-quantity-header'
  ),
  variantsTableItemRows: dataCySelector(
    'presentation-settings__variant-table-item-rows'
  ),
  variantsTableQuantityRows: dataCySelector(
    'presentation-settings__variant-table-quantity-rows'
  ),
};

// @TODO change tests when html uses esp-presentation-product-card
xdescribe('PresentationQuotesComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationQuotesComponent,
    overrideModules: [
      [
        RouterModule,
        {
          set: {
            declarations: MockDirectives(RouterLink),
            exports: MockDirectives(RouterLink),
          },
        },
      ],
      [
        NgxSkeletonLoaderModule,
        {
          set: {
            declarations: MockComponents(NgxSkeletonLoaderComponent),
            exports: MockComponents(NgxSkeletonLoaderComponent),
          },
        },
      ],
      [
        CosButtonModule,
        {
          set: {
            declarations: MockComponents(CosButtonComponent),
            exports: MockComponents(CosButtonComponent),
          },
        },
      ],
      [
        CosCardModule,
        {
          set: {
            declarations: MockComponents(CosCardComponent),
            exports: MockComponents(CosCardComponent),
          },
        },
      ],
      [
        CosAvatarModule,
        {
          set: {
            declarations: MockComponents(CosAvatarComponent),
            exports: MockComponents(CosAvatarComponent),
          },
        },
      ],
      [
        CosAttributeTagModule,
        {
          set: {
            declarations: MockDirectives(CosAttributeTagDirective),
            exports: MockDirectives(CosAttributeTagDirective),
          },
        },
      ],
    ],
  });

  const testSetup = (options?: Partial<PresentationLocalState>) => {
    const spectator = createComponent({
      providers: [
        mockProvider(PresentationLocalState, {
          presentation: presentation,
          quote: OrdersMockDb.order,
          connect() {
            return of(this);
          },
        }),
        mockProvider(PresentationQuoteLocalState, {} as any),
      ],
    });

    return {
      spectator,
      component: spectator.component,
      state: spectator.component.state,
    };
  };

  it('should display variant table item header', () => {
    const { spectator } = testSetup();
    expect(
      spectator.query(selectors.variantsTableItemHeader)
    ).toHaveExactTrimmedText('Item');
  });

  it('should display variant table quantity header', () => {
    const { spectator } = testSetup();

    expect(
      spectator.query(selectors.variantsTableQuantityHeader)
    ).toHaveExactTrimmedText('Quantity');
  });

  it('should display variant table item rows', () => {
    const { spectator, component } = testSetup();

    const itemRows = spectator.queryAll(selectors.variantsTableItemRows);
    expect(itemRows[0]).toHaveExactTrimmedText(
      (component.state.quote.LineItems[0] as any).Variants[0].Description
    );
    expect(itemRows[1]).toHaveExactTrimmedText(
      (component.state.quote.LineItems[0] as any).Variants[1].Description
    );
  });

  it('should display variant table quantity rows', () => {
    const { spectator, component } = testSetup();

    const quantityRows = spectator.queryAll(
      selectors.variantsTableQuantityRows
    );
    expect(quantityRows[0]).toHaveExactTrimmedText(
      `${(component.state.quote.LineItems[0] as any).Variants[0]?.Quantity}`
    );
    expect(quantityRows[1]).toHaveExactTrimmedText(
      `${(component.state.quote.LineItems[0] as any).Variants[1]?.Quantity}`
    );
  });
});
