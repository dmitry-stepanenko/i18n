import { DatePipe, formatCurrency } from '@angular/common';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { dataCySelector } from '@cosmos/testing';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import {
  MOCK_PROJECT,
  PresentationMockDb,
} from '@esp/presentations/mocks-presentations';
import { Presentation, PresentationStatus } from '@esp/presentations/types';
import { ProjectsDialogService } from '@esp/projects/feature-dialogs';
import { Project } from '@esp/projects/types';

import { PresentationLocalState } from '../../local-states';

import {
  PresentationInfoCardComponent,
  PresentationInfoCardComponentModule,
} from './presentation-info-card.component';

const presentation = PresentationMockDb.presentation;
const project = MOCK_PROJECT;

const queries = {
  productsRequestedTitle: dataCySelector('products-requested-title'),
  customerEngagementTitle: dataCySelector('customer-engagement-title'),
  shareDetailsSection: dataCySelector('share-details-section'),
  editProjectButton: dataCySelector('edit-project-button'),
};

describe('PresentationInfoCardComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationInfoCardComponent,
    imports: [
      PresentationInfoCardComponentModule,
      CosUtilTranslationsTestingModule.forRoot(),
    ],
    providers: [
      mockProvider(Store, { select: () => of('test') }),
      mockProvider(ProjectsDialogService, {
        openProjectEditInfoDialog: () => of({}),
      }),
    ],
  });

  const testSetup = (options?: {
    presentation?: Presentation;
    project?: Project;
    isLoading?: boolean;
    hasLoaded?: boolean;
  }) => {
    const spectator = createComponent({
      providers: [
        mockProvider(PresentationLocalState, {
          presentation,
          project,
          isLoading: options?.isLoading ?? false,
          hasLoaded: options?.hasLoaded ?? true,
          connect() {
            return of(this);
          },
        }),
      ],
    });
    return {
      spectator,
      component: spectator.component,
    };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  it("should should show the page header as 'Presentation Information'", () => {
    // Arrange
    const { spectator } = testSetup();
    const pageHeader = spectator.query('.header-style-14-bold');

    // Assert
    expect(pageHeader).toExist();
    expect(pageHeader).toHaveText('Presentation Information');
  });

  it("should show Shared With info when shared with a cutomer along with the Date along with text 'Presentation has not been viewed yet.'", () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.presentation!.Status = PresentationStatus.PostShare;
    component.state.presentation!.SharedDate = new Date(
      2020,
      0,
      1,
      12,
      0,
      0,
      0
    ).toString();
    spectator.detectComponentChanges();
    const shareDetailsSection = spectator.query(queries.shareDetailsSection);
    const datePipe = new DatePipe('en-US');

    // Assert
    expect(shareDetailsSection).toExist();
    expect(shareDetailsSection).toHaveText(
      `Shared with ${
        component.state.presentation!.Customer.Name
      } on ${datePipe.transform(
        component.state.presentation!.SharedDate,
        'longDate'
      )} at ${datePipe
        .transform(component.state.presentation!.SharedDate, 'shortTime')
        ?.toLocaleLowerCase()}.`
    );
    expect(shareDetailsSection).toContainText(
      'Presentation has not been viewed yet.'
    );
  });

  it('should display the Expiration date for a customer, if present', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.presentation!.Status = PresentationStatus.PostShare;
    component.state.presentation!.ExpirationDate = new Date(
      2020,
      0,
      1,
      12,
      0,
      0,
      0
    ).toString();
    spectator.detectComponentChanges();
    const shareDetailsSection = spectator.query(queries.shareDetailsSection);
    const datePipe = new DatePipe('en-US');

    // Assert
    expect(shareDetailsSection).toExist();
    expect(shareDetailsSection).toContainText(
      `Link expires ${datePipe.transform(
        component.state.presentation!.ExpirationDate,
        'longDate'
      )}`
    );
  });

  it("should display the message 'This presentation has not been shared with the Customer yet.', when PreShare tab is selected", () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.presentation!.Status = PresentationStatus.PreShare;
    spectator.detectComponentChanges();
    const shareMsg = spectator.query('.header-style-16');

    // Assert
    expect(shareMsg).toExist();
    expect(shareMsg).toHaveText(
      'This presentation has not been shared with the Customer yet.'
    );
  });

  it("should display the header 'Customer Engagement'", () => {
    // Arrange
    const { spectator } = testSetup();
    const customerEngagementTitle = spectator.query(
      queries.customerEngagementTitle
    );

    // Assert
    expect(customerEngagementTitle).toHaveText('Customer Engagement');
  });

  it("should display the header 'Last Viewed'", () => {
    // Arrange
    const { spectator } = testSetup();
    const lastViewedHeader = spectator.queryAll('.header-style-12')[0];

    // Assert
    expect(lastViewedHeader).toExist();
    expect(lastViewedHeader).toHaveText('Last Viewed');
  });

  it('should display the Last Viewed date, if present', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.presentation!.LastViewDate = new Date(
      2020,
      0,
      1,
      12,
      0,
      0,
      0
    ).toString();
    spectator.detectComponentChanges();
    const lastViewedDate = spectator.queryAll('.header-style-14-bold')[2];

    // Assert
    expect(lastViewedDate).toExist();
    expect(lastViewedDate).toHaveText('January 1, 2020');
  });

  it("should display the text 'Not Viewed', if view date is not present", () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.presentation!.LastViewDate = null;
    spectator.detectComponentChanges();
    const lastViewedDate = spectator.queryAll('.header-style-14-bold')[2];

    // Assert
    expect(lastViewedDate).toExist();
    expect(lastViewedDate).toHaveText('Not Viewed');
  });

  it("should display the header 'Products Requested'", () => {
    // Arrange
    const { spectator } = testSetup();
    const quoteHeader = spectator.query(queries.productsRequestedTitle);

    // Assert
    expect(quoteHeader).toExist();
    expect(quoteHeader).toHaveText('Products Requested');
  });

  it('should display the number of products quoted', () => {
    // Arrange
    const { spectator, component } = testSetup();
    component.state.presentation!.NumberOfProductsQuoted = 2;
    spectator.detectComponentChanges();

    const noOfprodQuoted = spectator.queryAll('.proj-pres__metric')[0];
    // Assert
    expect(noOfprodQuoted).toExist();
    expect(noOfprodQuoted).toHaveText('2');
  });

  it("should display the header 'Products Disliked'", () => {
    // Arrange
    const { spectator } = testSetup();
    const prodsDislikedHeader = spectator.queryAll('.header-style-12')[2];

    // Assert
    expect(prodsDislikedHeader).toExist();
    expect(prodsDislikedHeader).toHaveText('Products Disliked');
  });

  it('should display the number of products Disliked', () => {
    // Arrange
    const { spectator, component } = testSetup();
    component.state.presentation!.NumberOfProductsDisliked = 3;
    spectator.detectComponentChanges();

    const noOfProdsDisliked = spectator.queryAll('.proj-pres__metric')[1];

    // Assert
    expect(noOfProdsDisliked).toExist();
    expect(noOfProdsDisliked).toHaveText('3');
  });

  it('should display the Project Details section on the right', () => {
    // Arrange
    const { spectator } = testSetup();
    const projectDetailsSection =
      spectator.query('div.cos-card-body').children[1];

    // Assert
    expect(projectDetailsSection).toExist();
  });

  it("should display the project details section header as 'Project Details'", () => {
    // Arrange
    const { spectator } = testSetup();
    const projectDetailsSectionHeader =
      spectator.query('div.cos-card-body').children[1].children[0];

    // Assert
    expect(projectDetailsSectionHeader).toExist();
    expect(projectDetailsSectionHeader).toHaveText('Project Details');
  });

  describe('Project Details content', () => {
    it('Post Share - Should allow a distributor to edit the presentation settings by clicking the Edit button', () => {
      // Arrange
      const { component, spectator } = testSetup();
      const dialogService = spectator.inject(ProjectsDialogService);
      const dialogSpy = jest.spyOn(dialogService, 'openProjectEditInfoDialog');

      // Act
      component.state.presentation!.Status = PresentationStatus.PostShare;

      // Act
      spectator.click(queries.editProjectButton);

      // Assert
      expect(dialogSpy).toHaveBeenCalledWith(component.state.project);
    });

    it("should display project Create Date detail, correctly with text 'Project Created: (create_date)'", () => {
      // Arrange
      const { component, spectator } = testSetup();
      const projectCreateDateDetail = spectator.queryAll(
        '.project-info-grid > li'
      )[0];
      const projectCreateDateDetailIcon = spectator.queryAll(
        '.project-info-grid > li > i'
      )[0];
      const datePipe = new DatePipe('en-US');

      // Assert
      expect(projectCreateDateDetail).toBeVisible();
      expect(projectCreateDateDetailIcon).toHaveClass('fa fa-pen-alt');
      expect(projectCreateDateDetail).toHaveDescendant(
        projectCreateDateDetailIcon
      );
      expect(projectCreateDateDetail).toHaveText(
        `Project Created: ${datePipe.transform(
          component.state.project!.CreateDate,
          'longDate'
        )}`
      );
    });

    it("should display project Needed in-hands detail, correctly with text 'In-Hands Date: (inHands_date)'", () => {
      // Arrange
      const { component, spectator } = testSetup();
      const projectInHandsDateDetail = spectator.queryAll(
        '.project-info-grid > li'
      )[1];
      const projectInHandsDateDetailIcon = spectator.queryAll(
        '.project-info-grid > li > i'
      )[1];
      const datePipe = new DatePipe('en-US');

      // Assert
      expect(projectInHandsDateDetail).toBeVisible();
      expect(projectInHandsDateDetailIcon).toHaveClass('fa fa-hand-paper');
      expect(projectInHandsDateDetail).toHaveDescendant(
        projectInHandsDateDetailIcon
      );
      expect(projectInHandsDateDetail).toHaveText(
        `In-Hands Date: ${datePipe.transform(
          component.state.project!.InHandsDate,
          'longDate'
        )}`
      );
    });

    it("should display project Event Scheduled detail, correctly with text 'Event Date: (event_date)'", () => {
      // Arrange
      const { component, spectator } = testSetup();
      const projectEventDateDetail = spectator.queryAll(
        '.project-info-grid > li'
      )[2];
      const projectEventDateDetailIcon = spectator.queryAll(
        '.project-info-grid > li > i'
      )[2];
      const datePipe = new DatePipe('en-US');

      // Assert
      expect(projectEventDateDetail).toBeVisible();
      expect(projectEventDateDetailIcon).toHaveClass('fa fa-calendar-alt');
      expect(projectEventDateDetail).toHaveDescendant(
        projectEventDateDetailIcon
      );
      expect(projectEventDateDetail).toHaveText(
        `Event Date: ${datePipe.transform(
          component.state.project!.EventDate,
          'longDate'
        )}`
      );
    });

    it("should display project Event Type detail, correctly with text '(event_type)'", () => {
      // Arrange
      const { component, spectator } = testSetup();
      const projectEventTypeDetail = spectator.queryAll(
        '.project-info-grid > li'
      )[3];
      const projectEventTypeDetailIcon = spectator.queryAll(
        '.project-info-grid > li > i'
      )[3];

      // Assert
      expect(projectEventTypeDetail).toBeVisible();
      expect(projectEventTypeDetailIcon).toHaveClass('fa fa-calendar-week');
      expect(projectEventTypeDetail).toHaveDescendant(
        projectEventTypeDetailIcon
      );
      expect(projectEventTypeDetail).toHaveText(
        `${component.state.project!.EventType}`
      );
    });

    it("should display project Budget detail, correctly with text 'Budget: (budget)'", () => {
      // Arrange
      const { component, spectator } = testSetup();
      const projectBudgetDetail = spectator.queryAll(
        '.project-info-grid > li'
      )[4];
      const projectBudgetDetailIcon = spectator.queryAll(
        '.project-info-grid > li > i'
      )[4];

      // Assert
      expect(projectBudgetDetail).toBeVisible();
      expect(projectBudgetDetailIcon).toHaveClass('fa fa-money-check-alt');
      expect(projectBudgetDetail).toHaveDescendant(projectBudgetDetailIcon);
      expect(projectBudgetDetail).toHaveText(
        `Budget: ${formatCurrency(
          component.state.project!.Budget!,
          'en',
          '$',
          component.state.project!.CurrencyTypeCode
        )}`
      );
    });

    it("should display project Attendees detail, correctly with text 'Attendees: (no_of_attendees)'", () => {
      // Arrange
      const { component, spectator } = testSetup();
      const projectAttendeesDetail = spectator.queryAll(
        '.project-info-grid > li'
      )[5];
      const projectAttendeesDetailIcon = spectator.queryAll(
        '.project-info-grid > li > i'
      )[5];

      // Assert
      expect(projectAttendeesDetail).toBeVisible();
      expect(projectAttendeesDetailIcon).toHaveClass('fa fa-users');
      expect(projectAttendeesDetail).toHaveDescendant(
        projectAttendeesDetailIcon
      );
      expect(projectAttendeesDetail).toHaveText(
        `Attendees: ${component.state.project!.NumberOfAssignees}`
      );
    });
    it("should show '-' for InHands Date, Event Scheduled Date, Budget Amount, Project Event Type, Project Attendees Detail", () => {
      const { component, spectator } = testSetup();

      component.state.project = {
        ...component.state.project,
        InHandsDate: undefined,
        EventDate: undefined,
        EventType: undefined,
        Budget: 0,
        NumberOfAssignees: 0,
      } as unknown as Project;
      spectator.detectComponentChanges();
      const projectDetailDivs = spectator.queryAll('.project-info-grid > li');

      projectDetailDivs.forEach((detail, i) => {
        // skipping for project created Date where i = 0
        if (i > 0) {
          expect(detail).toHaveText('-');
        }
      });
    });
  });
});
