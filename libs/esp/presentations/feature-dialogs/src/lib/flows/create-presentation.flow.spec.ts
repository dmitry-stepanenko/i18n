import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';
import { Actions } from '@ngxs/store';
import { of } from 'rxjs';

import { CompanySearch } from '@esp/parties/types';

import { CreatePresentationFlow } from './create-presentation.flow';
import { PresentationFlowService } from './presentation-flow.service';

describe('CreatePresentationFlow', () => {
  const createService = createServiceFactory({
    service: CreatePresentationFlow,
    providers: [mockProvider(MatDialog)],
  });

  const testSetup = (
    options: {
      customersAvailable?: boolean;
    } = {}
  ) => {
    const spectator = createService({
      providers: [
        mockProvider(PresentationFlowService, {
          getDataAvailabilityInfo: jest.fn(() =>
            of({
              areAnyCustomersAvailable: options?.customersAvailable ?? true,
            })
          ),
          areThereAnyCustomersAvailable: () =>
            of(options.customersAvailable ?? true),
        }),
        mockProvider(Actions),
      ],
    });
    const service = spectator.service;
    service['_dataAvailability'] = {
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

  describe('no customers', () => {
    it('should start the flow with 2 stage forms modal', () => {
      // Arrange
      const { service } = testSetup({
        customersAvailable: false,
      });

      // Act
      service.start();

      // Assert
      expect(service['flow'].start).toHaveBeenCalledWith(
        service['_projectCreateWithNewCustomer']
      );
    });

    it('should continue the flow with project and customer creation after 2 stage form interaction', () => {
      // arrange
      const { service } = testSetup({
        customersAvailable: false,
      });

      // act
      service['_projectCreateWithNewCustomer'].stepDefinition.step.onNext(
        {} as any
      );

      // assert
      expect(service['flow'].openStep).toBeCalledWith(
        service['_projectCreateWithNewCustomerInProgress']
      );
    });
  });

  describe('existing customers', () => {
    it('should start the flow with customer selection', () => {
      const { service } = testSetup();

      service.start();

      expect(service['flow'].start).toHaveBeenCalledWith(
        service['_customerSelection']
      );
    });

    it('should continue the flow with only project creation when customer selected', () => {
      // arrange
      const { service } = testSetup();

      // act
      service['_customerSelection'].stepDefinition.step.onNext({
        selectedCustomer: {} as CompanySearch,
        searchTerm: '',
      });

      // assert
      expect(service['flow'].openStep).toBeCalledWith(
        service['_projectDetailsCreate']
      );
    });

    it('should continue the flow with project and customer creation when customer was not selected', () => {
      // arrange
      const { service } = testSetup();

      // act
      service['_customerSelection'].stepDefinition.step.onNext({
        searchTerm: '',
      });

      // assert
      expect(service['flow'].openStep).toBeCalledWith(
        service['_projectCreateWithNewCustomer']
      );
    });
  });

  describe('customer preselected', () => {
    it('should start the flow with project creation', () => {
      // arrange
      const { service } = testSetup();

      // act
      service.start({ customer: { Name: 'name', Id: 1234 } });

      // assert
      expect(service['flow'].start).toHaveBeenCalledWith(
        service['_projectDetailsCreate']
      );
    });

    it('should close the flow when go previous from project creation', () => {
      // arrange
      const { service } = testSetup({});
      service.start({ customer: { Name: 'name', Id: 1234 } });
      const flowFinishedSpy = jest.spyOn(service.flowFinished$, 'next');

      // act
      service['_projectDetailsCreate'].stepDefinition.step.onPrevious({});

      // assert
      expect(flowFinishedSpy).toBeCalledWith(false);
    });
  });
});
