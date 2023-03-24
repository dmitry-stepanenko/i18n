import { TrackByFunction } from '@angular/core';
import { createComponentFactory } from '@ngneat/spectator/jest';

import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
import { ProductsMockDb } from '@smartlink/products/mocks-products';

import {
  PresentationProductVariantComponent,
  PresentationProductVariantModule,
} from './presentation-product-variant.component';

const variant = ProductsMockDb.products[0].Attributes.Colors;

describe('PresentationProductVariantComponent', () => {
  const createComponent = createComponentFactory({
    component: PresentationProductVariantComponent,
    imports: [
      PresentationProductVariantModule,
      CosUtilTranslationsTestingModule.forRoot(),
    ],
  });

  const testSetup = () => {
    const spectator = createComponent({ detectChanges: false });
    (spectator.component as { trackById: TrackByFunction<unknown> }).trackById =
      (index: number) => index;
    spectator.detectComponentChanges();
    return { spectator, component: spectator.component };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  it('should display the label as (label)', () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    spectator.setInput('label', 'test label');
    spectator.detectComponentChanges();
    const label = spectator.query('span.toggle-label');

    // Assert
    expect(label).toBeVisible();
    expect(label).toHaveText('test label');
  });

  it('should have the option to show / hide attribute / variant section', () => {
    // Arrange
    const { spectator } = testSetup();
    const slider = spectator.query('input.cos-slide-toggle-input');

    // Assert
    expect(slider).toBeVisible();
  });

  it('should hide the variant section when toggled off', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const slider = spectator.query('input.cos-slide-toggle-input');

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    let variantSection = spectator.query('.cos-card');

    // Assert
    expect(component.showVariant).toBeTruthy();
    expect(variantSection).toBeVisible();

    // Act again
    spectator.click(slider);
    spectator.detectComponentChanges();
    variantSection = spectator.query('.cos-card');

    // Assert
    expect(component.showVariant).toBeFalsy();
    expect(variantSection).not.toBeVisible();
  });

  it('should retain selected values when hiding an attribute', () => {
    // Arrange
    const { spectator } = testSetup();
    const slider = spectator.query('input.cos-slide-toggle-input');

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    let variantCheckboxes = spectator.queryAll(
      '.product-variant-list-item > cos-checkbox > label > div > input'
    );

    variantCheckboxes.forEach((checkbox) => {
      expect(checkbox.getAttribute('aria-checked')).toEqual('false');
    });

    spectator.click(variantCheckboxes[0]);
    spectator.click(variantCheckboxes[1]);
    spectator.click(slider);
    spectator.detectComponentChanges();
    spectator.click(slider);
    variantCheckboxes = spectator.queryAll(
      '.product-variant-list-item > cos-checkbox > label > div > input'
    );

    variantCheckboxes.forEach((checkbox, i) => {
      if ([0, 1].includes(i)) {
        expect(checkbox.getAttribute('aria-checked')).toEqual('true');
      } else {
        expect(checkbox.getAttribute('aria-checked')).toEqual('false');
      }
    });
  });

  it('should have the component toggled to true, by default', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const slider = spectator.query('input.cos-slide-toggle-input');

    // Assert
    expect(slider).toBeVisible();
    expect(component.showVariant).toBeTruthy();
  });

  it('should show checkbox to Select/De-select all variants', () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    const checkbox = spectator.query('cos-checkbox');

    // Assert
    expect(checkbox).toBeVisible();
  });

  it("should show checkbox's label as 'Select/Deselect All'", () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    const checkboxLabel = spectator.query('.select-all-label');

    // Assert
    expect(checkboxLabel).toBeVisible();
    expect(checkboxLabel).toHaveText('Select/Deselect All');
  });

  it("should have the 'Select/Deselect All' checkbox to be checked by default", () => {
    // Arrange
    const { component, spectator } = testSetup();
    const newVariantValues = [];
    variant.Values.forEach((value) => {
      newVariantValues.push({ ...value, IsVisible: true });
    });
    const newVariant = {
      ...variant,
      Values: newVariantValues,
    };

    // Act
    spectator.setInput('variant', newVariant);
    spectator.detectComponentChanges();

    // Assert
    expect(component.allChecked).toBeTruthy();
  });

  it('should show the card displaying all variants', () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    const variantCard = spectator.query('cos-card');

    // Assert
    expect(variantCard).toBeVisible();
  });

  it('should display all variants in the card', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    const variantItems = spectator.queryAll('.product-variant-list > li');

    // Assert
    expect(variantItems).toBeVisible();
    expect(variantItems.length).toEqual(component.variant.Values.length);
  });

  it('should show attribute / variant section when at least one value exist for the variant', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    const variantSection = spectator.queryAll('.product-variant');

    // Assert
    expect(variantSection).toBeVisible();
  });

  it("should show the variant's name", () => {
    // Arrange
    const { component, spectator } = testSetup();
    const newVariantValues = [];
    variant.Values.forEach((value, i) => {
      newVariantValues.push({ ...value, Value: `test ${i}` });
    });
    variant.Values = newVariantValues;

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    const variantsNames = spectator.queryAll(
      '.product-variant-list-item > cos-checkbox > label > .cos-checkbox-label > div > span'
    );

    // Assert
    variantsNames.forEach((name, i) => {
      expect(name).toHaveText(component.variant.Values[i].Value);
    });
  });

  it('should display the image tagged with the variant', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const newVariantValues = [];
    variant.Values.forEach((value, i) => {
      newVariantValues.push({ ...value, Media: [{ Url: `test url ${i}` }] });
    });
    variant.Values = newVariantValues;

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    const variantsImages = spectator.queryAll(
      '.product-variant-list-item > cos-checkbox > label > .cos-checkbox-label > div > img'
    );

    // Assert
    variantsImages.forEach((image, i) => {
      expect(image).toBeVisible();
      expect(image.getAttribute('src')).toEqual(
        component.variant.Values[i].Media[0].Url
      );
    });
  });

  it('should have the option to select/deselect each attribute / variant value', () => {
    // Arrange
    const { spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    spectator.detectComponentChanges();
    const variantCheckboxes = spectator.queryAll(
      '.product-variant-list-item > cos-checkbox > label > div > input'
    );

    // Assert
    variantCheckboxes.forEach((checkbox) => {
      expect(checkbox).toBeVisible();
    });
  });

  it('should have a Show More option when 7 or more values are present for a attribute / variant section', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    component.variant.Values.length = 10;
    spectator.detectComponentChanges();
    const showMoreBtn = spectator.query('.show-more > button');

    // Assert
    expect(showMoreBtn).toBeVisible();
    expect(showMoreBtn).toHaveText('Show More');
  });

  it("should display 'Show less' button text, when 'Show more' button is clicked", () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    component.variant.Values.length = 10;
    spectator.detectComponentChanges();
    const showMoreLessBtn = spectator.query('.show-more > button');

    // Assert
    expect(showMoreLessBtn).toBeVisible();
    expect(showMoreLessBtn).toHaveText('Show More');

    // Act again
    component.toggleShowMore();

    // Re-Assert
    expect(component.showMore).toBeTruthy();
    expect(component.limit).toEqual(component.variant.Values.length);
  });

  it("should collapse the section when the user clicks 'Show Less'", () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    component.variant.Values.length = 10;
    spectator.detectComponentChanges();
    const showMoreLessBtn = spectator.query('.show-more > button');

    // Assert
    expect(showMoreLessBtn).toBeVisible();
    expect(showMoreLessBtn).toHaveText('Show More');

    // Act again
    component.toggleShowMore();

    // Re-Assert
    expect(component.showMore).toBeTruthy();
    expect(component.limit).toEqual(component.variant.Values.length);

    // Act again
    component.toggleShowMore();

    // Re-Assert
    expect(component.limit).toEqual(6);
  });

  it('should not have a Show More option when there are 6 or less values present for a attribute / variant section', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    spectator.setInput('variant', variant);
    component.variant.Values.length = 5;
    spectator.detectComponentChanges();
    const showMoreLessBtn = spectator.query('.show-more > button');

    // Assert
    expect(showMoreLessBtn).not.toBeVisible();
    expect(component.isShowMoreEnabled).toBeFalsy();
  });
});
