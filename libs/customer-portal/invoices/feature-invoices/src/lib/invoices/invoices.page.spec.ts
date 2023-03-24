import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { RouterLink } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { Navigate } from '@ngxs/router-plugin';
import { Actions, NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';

import { NgxsActionCollector, dataCySelector } from '@cosmos/testing';
import { CUSTOMER_PORTAL_SEARCH_LOCAL_STATE } from '@customer-portal/common/ui-pagination';
import {
  CustomerPortalInvoicesApiService,
  CustomerPortalInvoicesState,
} from '@customer-portal/invoices/data-access-invoices';
import { CustomerPortalInvoicePreviewPage } from '@customer-portal/invoices/feature-invoice-details';
import { mockInvoiceSearchItem } from '@esp/presentations/mocks-presentations';

import { CustomerPortalInvoicesLocalState } from './invoices.local-state';
import {
  CustomerPortalInvoicesPage,
  CustomerPortalInvoicesPageModule,
} from './invoices.page';

const projectId = 'projectId';
const selectors = {
  viewInvoiceButton: dataCySelector('view-invoice-button'),
  viewOrderButton: dataCySelector('view-order-button'),
};

describe('PresentationInvoicesPage', () => {
  const createComponent = createComponentFactory({
    component: CustomerPortalInvoicesPage,
    imports: [
      CustomerPortalInvoicesPageModule,
      NgxsActionCollector.collectActions(),
      NgxsModule.forRoot(),
      HttpClientTestingModule,
      RouterTestingModule.withRoutes([
        {
          path: 'projects/:projectId/invoices/:invoiceId',
          component: CustomerPortalInvoicePreviewPage,
        },
      ]),
    ],
    providers: [
      CustomerPortalInvoicesLocalState,
      {
        provide: CUSTOMER_PORTAL_SEARCH_LOCAL_STATE,
        useExisting: CustomerPortalInvoicesLocalState,
      },
    ],
  });

  const testSetup = () => {
    const spectator = createComponent();
    const service = spectator.inject(CustomerPortalInvoicesApiService);
    const store = spectator.inject(Store);
    const actions$ = spectator.inject(Actions);
    const actionCollector = spectator.inject(NgxsActionCollector);
    const actionsDispatched = actionCollector.dispatched;

    function getDispatchedActionsOfType<T>(actionType: Type<T>): T[] {
      return actionsDispatched.filter((item) => item instanceof actionType);
    }

    jest
      .spyOn(
        spectator.inject(CustomerPortalInvoicesState) as any,
        '_collectProjectId'
      )
      .mockImplementation(() => projectId);

    return {
      spectator,
      component: spectator.component,
      actions$,
      service,
      store,
      getNavigationActionsDispatched: () =>
        getDispatchedActionsOfType(Navigate),
    };
  };

  it('should load first 10 invoices on page open', fakeAsync(() => {
    // arrange & act
    const order = { Number: '1234' };
    const invoices = [
      mockInvoiceSearchItem(order),
      mockInvoiceSearchItem(order),
    ];
    const { service, store } = testSetup();
    const apiSpy = jest
      .spyOn(service, 'getSentInvoices')
      .mockImplementation(() =>
        of({
          Results: invoices,
          ResultsTotal: 2,
        })
      );
    tick(1000);

    // assert
    expect(apiSpy).toHaveBeenCalledWith('projectId', { size: 10, from: 1 });
    expect(store.snapshot().customerInvoices.invoices).toEqual(invoices);
  }));

  it('should redirect to invoice details page when only one invoice is shared', fakeAsync(() => {
    // arrange & act
    const order = { Number: '1234' };
    const invoices = [mockInvoiceSearchItem(order)];
    const { service, getNavigationActionsDispatched } = testSetup();
    jest.spyOn(service, 'getSentInvoices').mockImplementation(() =>
      of({
        Results: invoices,
        ResultsTotal: 1,
      })
    );
    tick(1000);

    // assert
    expect(getNavigationActionsDispatched()).toEqual([
      new Navigate(['projects', projectId, 'invoices', invoices[0].Id]),
    ]);
  }));

  it('should have link to invoice details page at view invoice buttons', fakeAsync(() => {
    // arrange & act
    const order = { Number: '1234' };
    const invoices = [
      mockInvoiceSearchItem(order),
      mockInvoiceSearchItem(order),
    ];
    const { service, spectator } = testSetup();
    jest.spyOn(service, 'getSentInvoices').mockImplementation(() =>
      of({
        Results: invoices,
        ResultsTotal: 2,
      })
    );
    tick(1000);

    // assert
    expect(spectator.queryAll(selectors.viewInvoiceButton).length).toBe(2);
    spectator
      .queryAll(selectors.viewInvoiceButton, { read: RouterLink })
      .forEach((el, index) => {
        expect(el['commands'][0]).toBe(
          `/projects/${invoices[index].ProjectId}/invoices/${invoices[index].Id}`
        );
        expect(el).not.toBeDisabled();
      });
  }));

  it('should have link to order details at order buttons', fakeAsync(() => {
    // arrange & act
    const orders = [
      { Id: '15', Number: '16' },
      { Id: '17', Number: '18' },
    ];
    const invoices = [
      mockInvoiceSearchItem(orders[0]),
      mockInvoiceSearchItem(orders[1]),
    ];
    const { service, spectator } = testSetup();
    jest.spyOn(service, 'getSentInvoices').mockImplementation(() =>
      of({
        Results: invoices,
        ResultsTotal: 2,
      })
    );
    tick(1000);

    // assert
    spectator
      .queryAll<HTMLAnchorElement>(selectors.viewOrderButton)
      .forEach((el, index) => {
        expect(el).toContainText(orders[index].Number);
        expect(el.pathname).toBe(
          `/projects/${invoices[index].ProjectId}/orders/${orders[index].Id}`
        );
        expect(el).not.toBeDisabled();
      });
  }));
});
