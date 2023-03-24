import { fakeAsync, tick } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Actions } from '@ngxs/store';
import { of } from 'rxjs';

import { CompanySearch } from '@esp/parties/types';
import { PresentationSearch } from '@esp/presentations/types';

import { AddToPresentationFlow } from './add-to-presentation.flow';
import { PresentationFlowService } from './presentation-flow.service';

describe('AddToPresentationFlow', () => {
  const createService = createServiceFactory({
    service: AddToPresentationFlow,
    providers: [mockProvider(MatDialog)],
  });

  const testSetup = (
    options: {
      presentationsAvailable?: boolean;
      customersAvailable?: boolean;
    } = {}
  ) => {
    const spectator = createService({
      providers: [
        mockProvider(PresentationFlowService, {
          getDataAvailabilityInfo: jest.fn(() =>
            of({
              areAnyPresentationsAvailable:
                options?.presentationsAvailable ?? true,
              areAnyCustomersAvailable: options?.customersAvailable ?? true,
            })
          ),
        }),
        mockProvider(Actions),
      ],
    });
    const service = spectator.service;
    service['_dataAvailability'] = {
      areAnyPresentationsAvailable: options?.presentationsAvailable ?? true,
      areAnyCustomersAvailable: options?.customersAvailable ?? true,
    };
    service['flow'].complete = jest.fn();
    service['flow'].openStep = jest.fn();
    service['flow'].start = jest.fn();

    return {
      spectator,
      service,
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('no presentations, no customers', () => {
    it('should start the flow with 2 stage forms modal', fakeAsync(() => {
      const { service } = testSetup({
        presentationsAvailable: false,
        customersAvailable: false,
      });

      service.start();
      tick();

      expect(service['flow'].start).toHaveBeenCalledWith(
        service['_projectCreateWithNewCustomer']
      );
    }));

    it('should continue the flow with project and customer creation after 2 stage form interaction', () => {
      const { service } = testSetup({
        presentationsAvailable: false,
        customersAvailable: false,
      });

      service['_projectCreateWithNewCustomer'].stepDefinition.step.onNext(
        {} as any
      );

      expect(service['flow'].openStep).toBeCalledWith(
        service['_projectCreateWithNewCustomerInProgress']
      );
    });
  });

  describe('no presentations, existing customers', () => {
    it('should start the flow with customer selection', fakeAsync(() => {
      const { service } = testSetup({
        presentationsAvailable: false,
      });

      service.start();
      tick();

      expect(service['flow'].start).toHaveBeenCalledWith(
        service['_customerSelection']
      );
    }));

    it('should continue the flow with 1 stage forms modal when customer selected', () => {
      const { service } = testSetup({
        presentationsAvailable: false,
      });

      service['_customerSelection'].stepDefinition.step.onNext({
        selectedCustomer: {} as CompanySearch,
        searchTerm: '',
      });

      expect(service['flow'].openStep).toBeCalledWith(
        service['_projectDetailsCreate']
      );
    });

    it('should continue the flow with 2 stage forms modal when customer not selected', () => {
      const { service } = testSetup({
        presentationsAvailable: false,
      });

      service['_customerSelection'].stepDefinition.step.onNext({
        searchTerm: '',
      });

      expect(service['flow'].openStep).toBeCalledWith(
        service['_projectCreateWithNewCustomer']
      );
    });
  });

  describe('existing presentations, existing customers', () => {
    it('should start the flow with presentation selection when there are presentations available', fakeAsync(() => {
      const { service } = testSetup();

      service.start();
      tick();

      expect(service['flow'].start).toHaveBeenCalledWith(
        service['_presentationSelection']
      );
    }));

    it('should finish the flow when presentation selected', () => {
      const { service } = testSetup({
        presentationsAvailable: false,
      });

      service['_presentationSelection'].stepDefinition.step.onNext({
        complete: true,
        selectedPresentation: {} as PresentationSearch,
        searchTerm: '',
      });

      expect(service['flow'].complete).toHaveBeenCalled();
    });

    it('should assume creating a new project when presentation not selected', () => {
      const { service } = testSetup({
        presentationsAvailable: false,
      });

      service['_presentationSelection'].stepDefinition.step.onNext({
        searchTerm: '',
      });
    });

    it('should continue the flow with customer selection when presentation not selected', () => {
      const { service } = testSetup({
        presentationsAvailable: false,
      });

      service['_presentationSelection'].stepDefinition.step.onNext({
        searchTerm: '',
      });

      expect(service['flow'].openStep).toBeCalledWith(
        service['_customerSelection']
      );
    });
  });
});
