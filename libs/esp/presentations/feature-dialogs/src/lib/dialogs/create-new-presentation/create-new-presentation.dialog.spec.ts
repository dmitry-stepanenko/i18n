import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { createComponentFactory } from '@ngneat/spectator/jest';

import { CreateNewPresentationDialog } from './create-new-presentation.dialog';

describe('CreateNewPresentationDialog', () => {
  const createComponent = createComponentFactory({
    component: CreateNewPresentationDialog,
    imports: [],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: MatDialogRef, useValue: {} },
    ],
  });

  const testSetup = () => {
    const spectator = createComponent();
    return { component: spectator.component, spectator };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  it('should display the dialog close button correctly', () => {
    // Arrange
    const { spectator } = testSetup();
    const dialogCloseBtn = spectator.query('.cos-modal-close');
    const dialogCloseBtnIcon = spectator.query('.cos-modal-close > i');

    // Assert
    expect(dialogCloseBtn).toBeVisible();
    expect(dialogCloseBtn).toHaveDescendant(dialogCloseBtnIcon);
    expect(dialogCloseBtnIcon).toHaveClass('fas fa-times');
  });

  it("should display the modal title as 'Use products in a Presentation'", () => {
    // Arrange
    const { spectator } = testSetup();
    const dialogTitle = spectator.query('h2.mat-dialog-title');

    // Assert
    expect(dialogTitle).toBeVisible();
    expect(dialogTitle).toHaveText('Use products in a Presentation');
  });

  it("should display the modal description text as 'Create a new Presentation or add products to an existing one.'", () => {
    // Arrange
    const { spectator } = testSetup();
    const dialogDescription = spectator.query('.body-style-14-shark');

    // Assert
    expect(dialogDescription).toBeVisible();
    expect(dialogDescription).toHaveText(
      'Create a new Presentation or add products to an existing one.'
    );
  });

  describe('Search Field', () => {
    it('should display the search field', () => {
      // Arrange
      const { spectator } = testSetup();
      const searchField = spectator.query('.cos-search-field');

      // Assert
      expect(searchField).toBeVisible();
    });

    it("should display the search field's label correctly as a magnifier icon", () => {
      // Arrange
      const { spectator } = testSetup();
      const searchFieldLabel = spectator.query(
        '.cos-search-field > .form-field-prefix'
      );

      // Assert
      expect(searchFieldLabel).toBeVisible();
      expect(searchFieldLabel.querySelector('i')).toHaveClass('fa fa-search');
    });

    it('should display the search field input correctly', () => {
      // Arrange
      const { spectator } = testSetup();
      const searchFieldInput = spectator.query(
        '.cos-search-field > input.cos-input'
      );

      // Assert
      expect(searchFieldInput).toBeVisible();
      expect(searchFieldInput.getAttribute('placeholder')).toEqual(
        'Search for a Collection'
      );
    });

    it('should display the button to clear the input', () => {
      // Arrange
      const { spectator } = testSetup();
      const clearInputBtn = spectator.query(
        '.cos-search-field > button.form-field-suffix'
      );

      // Assert
      expect(clearInputBtn).toBeVisible();
      expect(clearInputBtn.querySelector('i')).toHaveClass('fa fa-times');
    });
  });

  it('should display the create section correctly', () => {
    // Arrange
    const { spectator } = testSetup();
    const createSection = spectator.query('.create-box');
    const createSectionIcon = createSection.querySelector('div > i');

    // Assert
    expect(createSection).toBeVisible();
    expect(createSection.querySelectorAll('div')[0]).toHaveDescendant(
      createSectionIcon
    );
    expect(createSection.querySelectorAll('div')[1]).toHaveText(
      'Create a new Collection'
    );
    expect(createSectionIcon).toHaveClass('fa fa-plus-circle');
  });

  it("should display the text 'No collections found. Create a new collection now!', when collections are not present", () => {
    // Arrange
    const { component, spectator } = testSetup();
    const infoText = spectator.query('.empty-results-msg > p');

    // Assert
    expect(component.state.presentations.length).toEqual(0);
    expect(infoText).toBeVisible();
    expect(infoText).toHaveText(
      'No collections found. Create a new collection now!'
    );
  });

  it("should display 'Show more' button, when no of collections is greater than the limit of the page", () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.state.presentations.length = 15;
    spectator.detectComponentChanges();
    const showMoreButton = spectator.query('div.mt-12.text-center > button');

    // Assert
    expect(showMoreButton).toBeVisible();
    expect(showMoreButton).toHaveText('Show more');
  });
});
