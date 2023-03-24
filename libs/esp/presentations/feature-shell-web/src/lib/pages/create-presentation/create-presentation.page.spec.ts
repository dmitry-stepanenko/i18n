import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { PresentationsActions } from '@esp/presentations/data-access-presentations';
import { MOCK_PROJECT } from '@esp/presentations/mocks-presentations';

import {
  CreatePresentationPage,
  CreatePresentationPageModule,
} from './create-presentation.page';

const injectProject = MOCK_PROJECT;

describe('CreatePresentationPage', () => {
  const createComponent = createComponentFactory({
    component: CreatePresentationPage,
    imports: [
      CreatePresentationPageModule,
      RouterTestingModule.withRoutes([
        {
          path: '',
          component: CreatePresentationPage,
        },
      ]),
    ],
    providers: [
      mockProvider(Store, {
        selectSnapshot: () => injectProject,
      }),
    ],
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const testSetup = () => {
    const spectator = createComponent();
    const store = spectator.inject(Store);
    const router = spectator.inject(Router);
    return { component: spectator.component, router, spectator, store };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  it("should display the header as 'Presentation'", () => {
    // Arrange
    const { spectator } = testSetup();
    const header = spectator.query('h1');

    // Assert
    expect(header).toBeVisible();
    expect(header).toHaveText('Presentation');
  });

  it("should display the presentation content as 'No Presentation'", () => {
    // Arrange
    const { spectator } = testSetup();
    const noPresentationDesc = spectator.query(
      '.create-presentation-content > h1'
    );

    // Assert
    expect(noPresentationDesc).toBeVisible();
    expect(noPresentationDesc).toHaveText('No Presentation');
  });

  it("should display the presentation content as 'There is no presentation yet.'", () => {
    // Arrange
    const { spectator } = testSetup();
    const noPresentationDesc = spectator.query(
      '.create-presentation-content > .body-style-14-shark.mb-0'
    );

    // Assert
    expect(noPresentationDesc).toBeVisible();
    expect(noPresentationDesc).toHaveText('There is no presentation yet.');
  });

  it("should display the presentation content as 'Create a presentation to begin.'", () => {
    // Arrange
    const { spectator } = testSetup();
    const noPresentationDesc = spectator.queryAll(
      '.create-presentation-content > .body-style-14-shark'
    )[1];

    // Assert
    expect(noPresentationDesc).toBeVisible();
    expect(noPresentationDesc).toHaveText('Create a presentation to begin.');
  });

  it("should display the 'Create a Presentation' button", () => {
    // Arrange
    const { spectator } = testSetup();
    const createBtn = spectator.query(
      '.create-presentation-content > button.cos-stroked-button'
    );

    // Assert
    expect(createBtn).toBeVisible();
    expect(createBtn).toHaveText('Create a Presentation');
  });

  it('should create a new presentation, when Create button is clicked', () => {
    // Arrange
    const { component, spectator, router, store } = testSetup();
    const createBtn = spectator.query(
      '.create-presentation-content > button.cos-stroked-button'
    );
    const storeSpy = jest
      .spyOn(store, 'dispatch')
      .mockImplementation()
      .mockReturnValue(of(injectProject));
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    jest.spyOn(component, 'createPresentation');

    // Act
    spectator.click(createBtn);

    // Assert
    expect(component.createPresentation).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledWith(
      new PresentationsActions.Create(injectProject.Id)
    );
  });

  it('should navigate to the newly created presentation after a new presentation has been created', () => {
    // Arrange
    const { component, router, spectator, store } = testSetup();
    const createBtn = spectator.query(
      '.create-presentation-content > button.cos-stroked-button'
    );
    const storeSpy = jest
      .spyOn(store, 'dispatch')
      .mockImplementation()
      .mockReturnValue(of(injectProject));

    const routerSpy = jest
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true);
    jest.spyOn(component, 'createPresentation');

    // Act
    spectator.click(createBtn);

    // Assert
    expect(component.createPresentation).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledWith(
      new PresentationsActions.Create(injectProject.Id)
    );
    expect(routerSpy).toHaveBeenCalled();
  });
});
