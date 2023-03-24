import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { isNumber } from 'lodash-es';

import { CosPaginationModule } from '@cosmos/components/pagination';
import { LocalStateRenderStrategy } from '@cosmos/state';

import {
  CUSTOMER_PORTAL_SEARCH_LOCAL_STATE,
  CustomerPortalSearchLocalState,
} from './search.local-state';

@Component({
  selector: 'customer-portal-pagination',
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CosPaginationModule],
})
export class CustomerPortalPaginationComponent {
  constructor(
    @Inject(CUSTOMER_PORTAL_SEARCH_LOCAL_STATE)
    readonly state: CustomerPortalSearchLocalState
  ) {
    state.connect(this, {
      renderStrategy: LocalStateRenderStrategy.Local,
    });
  }

  get maxPageNumbers(): number {
    if (!this.state.total) {
      return 0;
    }

    const totalPages = Math.ceil(
      this.state.total / (this.state.criteria?.size || 1)
    );

    return Math.min(totalPages, 6);
  }

  get pageSize(): number {
    return this.state.criteria?.size || 1;
  }

  get pageIndex(): number {
    if (isNumber(this.state.criteria?.from)) {
      return this.state.criteria!.from - 1;
    } else {
      return 0;
    }
  }

  pageChange({ pageIndex }: PageEvent): void {
    this.state.from = pageIndex + 1;
  }
}
