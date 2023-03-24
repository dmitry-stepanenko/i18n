import { fakeAsync } from '@angular/core/testing';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory, mockProvider } from '@ngneat/spectator/jest';
import { NgxsModule, Store } from '@ngxs/store';
import { MockComponents, MockProvider } from 'ng-mocks';
import { of } from 'rxjs';

import { dataCySelector } from '@cosmos/testing';
import {
  AsiDetailsCardLoaderComponent,
  AsiDetailsCardLoaderComponentModule,
} from '@esp/common/ui-details-card';
import {
  AsiCompanyAvatarComponent,
  AsiCompanyAvatarModule,
} from '@esp/companies/ui-company-avatar';
import { PresentationsActions } from '@esp/presentations/data-access-presentations';
import { PresentationSearch } from '@esp/presentations/types';
import { ProductSearchResultItem } from '@smartlink/models';
import { ProductsMockDb } from '@smartlink/products/mocks-products';

import { PresentationOrProjectSelectDialog } from './presentation-or-project-select-dialog.component';
import { PresentationOrProjectSelectDialogSearchLocalState } from './presentation-select.local-state';

const checkedProducts = ProductsMockDb.products.slice(0, 5);

const dialog = {
  header: dataCySelector('dialog-header'),
  subHeader: dataCySelector('dialog-sub-header'),
  search: dataCySelector('cards-selection-dialog-search'),
  addButton: dataCySelector('cards-selection-dialog-new-item-button'),
  clearButton: dataCySelector('cards-selection-search-clear'),
};

const detailsCard = {
  title: dataCySelector('details-card-title'),
  subtitle: dataCySelector('details-card-first-subtitle'),
  createDate: dataCySelector('details-card-first-line-details'),
  lastUpdatedDate: dataCySelector('details-card-second-line-details'),
};

const mockPresentation: Partial<PresentationSearch> = {
  Id: 1,
  Customer: {
    Id: 1,
    Name: 'Customer 1',
  },
  Project: {
    Id: 1,
    Name: 'Project 1',
  },
  CreateDate: new Date(2014, 11, 16).toString(),
  UpdateDate: new Date(2015, 11, 16).toString(),
};

const createComponent = createComponentFactory({
  component: PresentationOrProjectSelectDialog,
  imports: [NgxsModule.forRoot(), RouterTestingModule],
  providers: [
    MockProvider(MatDialogRef, {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      close: () => {},
    }),
  ],
  overrideModules: [
    [
      AsiCompanyAvatarModule,
      {
        set: {
          declarations: MockComponents(AsiCompanyAvatarComponent),
          exports: MockComponents(AsiCompanyAvatarComponent),
        },
      },
    ],
    [
      AsiDetailsCardLoaderComponentModule,
      {
        set: {
          declarations: MockComponents(AsiDetailsCardLoaderComponent),
          exports: MockComponents(AsiDetailsCardLoaderComponent),
        },
      },
    ],
  ],
});

const testSetup = (
  options: {
    presentations?: Partial<PresentationSearch>[];
    products?: Map<number, ProductSearchResultItem> | null;
    showProjects?: boolean;
  } = {}
) => {
  const spectator = createComponent({
    providers: [
      mockProvider(PresentationOrProjectSelectDialogSearchLocalState, <
        Partial<PresentationOrProjectSelectDialogSearchLocalState>
      >{
        connect() {
          return of(this);
        },
        presentations: options.presentations,
        loading: {
          success: true,
          inProgress: false,
          error: null,
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        search: jest.fn(() => of()),
        reset: jest.fn(() => of()),
      }),
      {
        provide: MAT_DIALOG_DATA,
        useValue: {
          input: {
            subheader: 'Test subheader',
            checkedProducts:
              options.products !== undefined
                ? options.products
                : checkedProducts,
          },
        },
      },
    ],
    props: {
      showProjects: options.showProjects || false,
    },
  });

  return {
    spectator,
    component: spectator.component,
    state: spectator.inject(
      PresentationOrProjectSelectDialogSearchLocalState,
      true
    ),
  };
};

describe('PresentationSelectComponent', () => {
  it('should create', () => {
    // Arrange
    const { spectator } = testSetup();

    // Assert
    expect(spectator).toBeTruthy();
  });

  it('should display title `Create a New Presentation or Select an Existing One`', () => {
    // Arrange
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query(dialog.header).textContent.trim()).toEqual(
      'Create a New Presentation or Select an Existing One'
    );
  });

  it('should display subtitle', () => {
    // Arrange
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query(dialog.subHeader).textContent.trim()).toEqual(
      'Test subheader'
    );
  });

  it('should display search with `Search for a Presentation or Customer` placeholder', () => {
    // Arrange
    const { spectator } = testSetup();
    const dialogSearch = spectator.query(dialog.search);

    // Assert
    expect(dialogSearch).toBeTruthy();
    expect(dialogSearch.getAttribute('placeholder')).toEqual(
      'Search for a Presentation or Customer'
    );
  });

  it('should display button for creating new presentation with text `Create a New Presentation`', () => {
    // Arrange
    const { spectator } = testSetup();
    const addButton = spectator.query(dialog.addButton);

    // Assert
    expect(addButton).toBeTruthy();
    expect(addButton).toHaveText('Create a New Presentation');
  });

  it('should click new presentation button and close dialog with `next` action for the flow', fakeAsync(() => {
    // Arrange
    const { spectator } = testSetup();
    const addButton = spectator.query(dialog.addButton);
    const dialogRef = spectator.inject(MatDialogRef, true);
    jest.spyOn(dialogRef, 'close');

    // Act
    spectator.click(addButton);
    spectator.tick();

    // Assert
    expect(dialogRef.close).toHaveBeenCalledWith({
      action: 'next',
      data: {},
    });
  }));

  describe('Search tests', () => {
    it("should display the 'X' button to clear search field when data is entered", fakeAsync(() => {
      // Arrange
      const { spectator } = testSetup();
      const input = spectator.query(dialog.search);

      // Act
      spectator.typeInElement('test search', input);
      spectator.tick(250);
      const clearButton = spectator.query(dialog.clearButton);
      const clearButtonIcon = clearButton.querySelector('i');

      // Assert
      expect(clearButton).toBeVisible();
      expect(clearButton).toHaveDescendant(clearButtonIcon);
      expect(clearButtonIcon).toHaveClass('fa fa-times');
    }));

    it('clicking on X button should clear search', fakeAsync(() => {
      // Arrange
      const { spectator, state } = testSetup();
      const input = spectator.query(dialog.search);
      jest.spyOn(state, 'search');

      // Act
      spectator.typeInElement('test search', input);
      spectator.tick(250);
      spectator.click(dialog.clearButton);
      spectator.tick(250);

      // Assert
      expect(state.search).toHaveBeenCalledWith({
        term: '',
        from: 1,
        editOnly: true,
      });
    }));

    it('should check if search has been called with correct term, from:1, editOnly: true', fakeAsync(() => {
      // Arrange
      const { spectator, state } = testSetup();
      const input = spectator.query(dialog.search);
      jest.spyOn(state, 'search');

      // Act
      const searchTerm = 'test term';

      // Act
      spectator.typeInElement(searchTerm, input);
      spectator.tick(250);

      // Assert
      expect(state.search).toHaveBeenCalledWith({
        term: searchTerm,
        from: 1,
        editOnly: true,
      });
    }));
  });

  it('should show presentations cards for presentations that are available', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
    });
    const presentationCards = spectator.queryAll('asi-details-card');

    // Assert
    expect(presentationCards).toBeVisible();
    expect(presentationCards).toHaveLength(
      component.state.presentations.length
    );
  });

  it('should show presentation name in presentation card', () => {
    // Arrange
    const { spectator } = testSetup({ presentations: [mockPresentation] });

    // Assert
    expect(spectator.query(detailsCard.title).textContent.trim()).toEqual(
      'Project 1'
    );
  });

  it('should show company name in presentation card', () => {
    // Arrange
    const { spectator } = testSetup({ presentations: [mockPresentation] });

    // Assert
    expect(spectator.query(detailsCard.subtitle).textContent.trim()).toEqual(
      'Customer 1'
    );
  });

  it('should show text with created date as longDate in presentation card', () => {
    // Arrange
    const { spectator } = testSetup({ presentations: [mockPresentation] });

    // Assert
    expect(spectator.query(detailsCard.createDate).textContent.trim()).toEqual(
      'Created December 16, 2014'
    );
  });

  it('should show text with last updated date as longDate in presentation card', () => {
    // Arrange
    const { spectator } = testSetup({ presentations: [mockPresentation] });

    // Assert
    expect(
      spectator.query(detailsCard.lastUpdatedDate).textContent.trim()
    ).toEqual('Last Updated December 16, 2015');
  });

  it('should not call add to presentation when user selects existing project and there was no products provided', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
      products: null,
    });
    const store = spectator.inject(Store);
    const storeSpy = jest.spyOn(store, 'dispatch');

    // Act
    component.onSelectPresentation(component.state.presentations[0]);

    // Assert
    expect(storeSpy).not.toHaveBeenCalled();
  });

  it('should close the modal when user selects existing project and there was no products provided', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
      products: null,
    });
    const dialogRef = spectator.inject(MatDialogRef, true);
    const dialogSpy = jest.spyOn(dialogRef, 'close');

    // Act
    component.onSelectPresentation(component.state.presentations[0]);

    // Assert
    expect(dialogSpy).toHaveBeenCalledWith({
      action: 'next',
      data: {
        complete: true,
        selectedPresentation: component.state.presentations[0],
      },
    });
  });

  it('should add the selected items to the presentation if the user selects an existing project', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
    });
    const store = spectator.inject(Store);
    const storeSpy = jest.spyOn(store, 'dispatch');

    // Act
    component.onSelectPresentation(component.state.presentations[0]);
    spectator.detectComponentChanges();

    // Assert
    expect(storeSpy).toHaveBeenCalledWith(
      new PresentationsActions.AddProducts(
        component.state.presentations[0].Id,
        component.state.presentations[0].Project.Name,
        Array.from(checkedProducts.keys())
      )
    );
  });

  it('should add the selected items to the presentation when the user completes the create new presentation flow from the modal', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
    });
    const store = spectator.inject(Store);
    const storeSpy = jest.spyOn(store, 'dispatch');

    // Act
    component.onSelectPresentation(component.state.presentations[0]);
    spectator.detectComponentChanges();

    // Assert
    expect(storeSpy).toHaveBeenCalledWith(
      new PresentationsActions.AddProducts(
        component.state.presentations[0].Id,
        component.state.presentations[0].Project.Name,
        Array.from(checkedProducts.keys())
      )
    );
  });

  it('should add the selected items to the presentation when the user completes the create customer / project flow from the modal', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
    });
    const store = spectator.inject(Store);
    const storeSpy = jest.spyOn(store, 'dispatch');

    // Act
    component.onSelectPresentation(component.state.presentations[0]);
    spectator.detectComponentChanges();

    // Assert
    expect(storeSpy).toHaveBeenCalledWith(
      new PresentationsActions.AddProducts(
        component.state.presentations[0].Id,
        component.state.presentations[0].Project.Name,
        Array.from(checkedProducts.keys())
      )
    );
  });

  it('should close the modal and leave the user on the page they initiated the flow from', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
    });
    const store = spectator.inject(Store);
    jest.spyOn(store, 'dispatch');
    const dialogRef = spectator.inject(MatDialogRef, true);
    const dialogSpy = jest.spyOn(dialogRef, 'close');

    // Act
    component.onSelectPresentation(component.state.presentations[0]);

    // Assert
    expect(dialogSpy).toHaveBeenCalledWith({
      action: 'next',
      data: {
        complete: true,
        selectedPresentation: component.state.presentations[0],
      },
    });
  });

  it('should close the modal and leave the user on the page they initiated the flow from when they complete the workflow from create new prestation modal', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
    });
    const store = spectator.inject(Store);
    jest.spyOn(store, 'dispatch');
    const dialogRef = spectator.inject(MatDialogRef, true);
    const dialogSpy = jest.spyOn(dialogRef, 'close');

    // Act
    component.onSelectPresentation(component.state.presentations[0]);

    // Assert
    expect(dialogSpy).toHaveBeenCalledWith({
      action: 'next',
      data: {
        complete: true,
        selectedPresentation: component.state.presentations[0],
      },
    });
  });

  it('should close the modal and leave the user on the page they initiated the flow from when they complete the flow from create customer / project modal', () => {
    // Arrange
    const { component, spectator } = testSetup({
      presentations: [mockPresentation],
    });
    const store = spectator.inject(Store);
    jest.spyOn(store, 'dispatch');
    const dialogRef = spectator.inject(MatDialogRef, true);
    const dialogSpy = jest.spyOn(dialogRef, 'close');

    // Act
    component.onSelectPresentation(component.state.presentations[0]);

    // Assert
    expect(dialogSpy).toHaveBeenCalledWith({
      action: 'next',
      data: {
        complete: true,
        selectedPresentation: component.state.presentations[0],
      },
    });
  });
});

describe('Select project', () => {
  it("should show 'Create a New Project' tile", () => {
    const { spectator } = testSetup({ showProjects: true });

    expect(spectator.query(dialog.addButton).textContent.trim()).toEqual(
      'Create a New Project'
    );
  });

  it("ENCORE-19317 : should show 'Create a New Project or Select an Existing One' header", () => {
    //Arrange
    const { spectator } = testSetup({ showProjects: true });
    //Assert
    expect(spectator.query(dialog.header).textContent.trim()).toEqual(
      'Create a New Project or Select an Existing One'
    );
  });

  it("should show 'Search for a Project or Customer.' watermark on search", () => {
    const { spectator } = testSetup({ showProjects: true });

    const dialogSearch = spectator.query(dialog.search);

    expect(dialogSearch).toBeTruthy();
    expect(dialogSearch.getAttribute('placeholder')).toEqual(
      'Search for a Project or Customer'
    );
  });
});
