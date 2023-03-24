import { createServiceFactory, mockProvider } from '@ngneat/spectator/jest';

import { asyncOf } from '@cosmos/testing';
import { CompaniesService } from '@esp/companies/data-access-companies';
import { PresentationsApiService } from '@esp/presentations/data-access-presentations';

import { PresentationFlowService } from './presentation-flow.service';

describe('AddToPresentationFlowService', () => {
  const createService = createServiceFactory({
    service: PresentationFlowService,
  });

  const testSetup = (
    options: {
      customersTotal?: number;
      presentationsTotal?: number;
    } = {}
  ) => {
    const spectator = createService({
      providers: [
        mockProvider(CompaniesService, {
          query: jest.fn(() =>
            asyncOf({ ResultsTotal: options.customersTotal ?? 3 })
          ),
        }),
        mockProvider(PresentationsApiService, {
          query: jest.fn(() =>
            asyncOf({ ResultsTotal: options.presentationsTotal ?? 1 })
          ),
        }),
      ],
    });
    const service = spectator.service;
    const companiesService = spectator.inject(CompaniesService);
    const presentationsService = spectator.inject(PresentationsApiService);

    return {
      spectator,
      service,
      companiesService,
      presentationsService,
    };
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDataAvailabilityInfo method', () => {
    it('should call companies service query method with correct search criteria', (done) => {
      const { service, companiesService } = testSetup();

      service.getDataAvailabilityInfo().subscribe(() => {
        try {
          expect(companiesService.query).toHaveBeenCalledWith({
            from: 1,
            size: 1,
            filters: {
              CompanyType: {
                terms: ['customer'],
              },
            },
            status: 'Active',
          });
          done();
        } catch (e) {
          done(e);
        }
      });

      expect(service).toBeTruthy();
    });

    it('should call orders service query method with correct search criteria', (done) => {
      const { service, presentationsService } = testSetup();

      service.getDataAvailabilityInfo().subscribe(() => {
        try {
          expect(presentationsService.query).toHaveBeenCalledWith({
            from: 1,
            size: 1,
            status: 'Active',
            editOnly: true,
          });
          done();
        } catch (e) {
          done(e);
        }
      });

      expect(service).toBeTruthy();
    });

    it('should return correct data availability info if presentations and customers are available', (done) => {
      const { service } = testSetup();

      service.getDataAvailabilityInfo().subscribe((result) => {
        try {
          expect(result).toStrictEqual({
            areAnyCustomersAvailable: true,
            areAnyPresentationsAvailable: true,
          });
          done();
        } catch (e) {
          done(e);
        }
      });

      expect(service).toBeTruthy();
    });

    it('should return correct data availability info if no data is available', (done) => {
      const { service } = testSetup({
        customersTotal: 0,
        presentationsTotal: 0,
      });

      service.getDataAvailabilityInfo().subscribe((result) => {
        try {
          expect(result).toStrictEqual({
            areAnyCustomersAvailable: false,
            areAnyPresentationsAvailable: false,
          });
          done();
        } catch (e) {
          done(e);
        }
      });

      expect(service).toBeTruthy();
    });
  });
});
