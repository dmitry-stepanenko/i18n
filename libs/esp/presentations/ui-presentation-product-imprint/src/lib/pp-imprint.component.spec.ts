import { HttpClientTestingModule } from '@angular/common/http/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { NgxsModule, Store } from '@ngxs/store';
import { InitialState } from '@ngxs/store/internals';

import { ConfigModule } from '@cosmos/config';
import { dataCySelector } from '@cosmos/testing';
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations/testing';
// This shouldn't be `feature-products`.
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { EspPresentationsFeatureProductsModule } from '@esp/presentations/feature-products';
import { mockPresentationProduct } from '@esp/presentations/mocks-presentations';
import {
  PresentationProduct,
  PresentationProductAttribute,
} from '@esp/presentations/types';

import { PPImprintComponent } from './pp-imprint.component';
import { IMPRINT_METHOD_TYPE } from './pp-imprint.local-state';

const selectors = {
  cosToggleContent: dataCySelector('cos-toggle-content'),
  cosToggleNativeCheckbox: dataCySelector('cos-toggle-native-input'),
  productImprintMainCard: dataCySelector('product-imprint-main-card'),
  vendorImprintMethodsLegend: dataCySelector('vendor-imprint-methods-legend'),
  imprintMethodCheckbox: dataCySelector('imprint-method-checkbox'),
  productImprintForm: dataCySelector('product-imprint-form'),
};

const otherImprintMethods = [
  { Code: 'Applique', Description: 'Applique', Name: 'Applique', Sequence: 0 },
  {
    Code: 'Chenille',
    Description: 'Chenille',
    Name: 'Chenille',
    Sequence: 0,
  },
  {
    Code: 'Decals',
    Description: 'Heat Transfers/ Decals',
    Name: 'Heat Transfers/ Decals',
    Sequence: 0,
  },
];

describe('PresentationProductImprintComponent', () => {
  const createComponent = createComponentFactory({
    component: PPImprintComponent,
    imports: [
      HttpClientTestingModule,
      NgxsModule.forRoot(),
      EspPresentationsFeatureProductsModule.forChild(),
      CosUtilTranslationsTestingModule.forRoot(),
      ConfigModule.forRoot({ venusApiUrl: 'venusApiUrl' }),
    ],
  });

  const testSetup = function (options?: {
    productRecipe?: (product: PresentationProduct) => PresentationProduct;
  }) {
    const product = options?.productRecipe
      ? mockPresentationProduct(options?.productRecipe)
      : mockPresentationProduct();

    InitialState.set({
      presentationProduct: {
        items: {
          [product.Id]: {
            product,
            originalPriceGrids: product.PriceGrids,
            isDirty: false,
          },
        },
        itemIds: [product.Id],
        currentId: product.Id,
      },
    });

    const spectator = createComponent({
      props: {
        otherImprintMethods: [
          {
            Code: '$0TK',
            Name: 'Debossed',
            Description: 'Debossed',
            Sequence: 0,
          },
        ],
      },
    });
    const store = spectator.inject(Store);

    return { spectator, store, component: spectator.component };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  it("should display the toggle component with correct label as label as 'Imprint Options'", () => {
    // Arrange & act
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query(selectors.cosToggleContent)).toHaveText(
      'Imprint Options'
    );
  });

  it('should display cos-card component imprint options by default', () => {
    // Arrange & act
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query(selectors.productImprintMainCard)).toBeVisible();
  });

  it('should still have the previously selected Imprint Methods, Other Imprint Methods and Charges selected when you show the section again', () => {
    // Arrange & Act
    const { spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Attributes: [
          {
            Type: IMPRINT_METHOD_TYPE,
            Name: 'name1',
            IsRequired: true,
            Values: [
              { Id: 1, Value: 'Deep Etch', IsVisible: false },
              { Id: 2, Value: 'Blank', IsVisible: false },
            ],
          },
        ] as PresentationProductAttribute[],
      }),
    });
    const imprintOptionsToggle = spectator
      .query('cos-toggle')!
      .querySelector('input');

    // Assert
    expect(imprintOptionsToggle).toHaveAttribute('aria-checked', 'true');
    let imprintMethodsCheckboxes = spectator
      .queryAll('cos-checkbox')
      .slice(0, 2);
    imprintMethodsCheckboxes.forEach((checkbox) => {
      expect(checkbox.querySelector('input')).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    // Act
    spectator.click(imprintMethodsCheckboxes[0].querySelector('input')!);
    spectator.click(imprintMethodsCheckboxes[1].querySelector('input')!);
    spectator.detectComponentChanges();
    imprintMethodsCheckboxes = spectator.queryAll('cos-checkbox').slice(0, 2);

    // Assert
    imprintMethodsCheckboxes.forEach((checkbox) => {
      expect(checkbox.querySelector('input')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
    let otherImprintMethodsCheckboxes = spectator
      .queryAll('cos-checkbox')
      .splice(2);
    otherImprintMethodsCheckboxes.forEach((otherImprintCheckbox) => {
      expect(otherImprintCheckbox.querySelector('input')).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    // Act
    spectator.click(otherImprintMethodsCheckboxes[0].querySelector('input')!);
    spectator.detectComponentChanges();
    otherImprintMethodsCheckboxes = spectator
      .queryAll('cos-checkbox')
      .splice(2);

    // Assert
    otherImprintMethodsCheckboxes.forEach((otherImprintCheckbox) => {
      expect(otherImprintCheckbox.querySelector('input')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    // Act
    spectator.click(imprintOptionsToggle!);
    spectator.detectComponentChanges();

    // Assert
    expect(
      spectator.query('cos-toggle')!.querySelector('input')
    ).toHaveAttribute('aria-checked', 'false');

    // Act
    spectator.click(imprintOptionsToggle!);
    spectator.detectComponentChanges();

    // Assert
    expect(
      spectator.query('cos-toggle')!.querySelector('input')
    ).toHaveAttribute('aria-checked', 'true');
    imprintMethodsCheckboxes = spectator.queryAll('cos-checkbox').slice(0, 2);
    otherImprintMethodsCheckboxes = spectator
      .queryAll('cos-checkbox')
      .splice(2);
    imprintMethodsCheckboxes.forEach((checkbox) => {
      expect(checkbox.querySelector('input')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
    otherImprintMethodsCheckboxes.forEach((otherImprintCheckbox) => {
      expect(otherImprintCheckbox.querySelector('input')).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });
  });

  it('should toggle the card when the user clicks on toggle button', () => {
    // Arrange
    const { spectator, component } = testSetup();

    // Act
    spectator.click(selectors.cosToggleNativeCheckbox);

    // Assert
    expect(spectator.query(selectors.productImprintMainCard)).not.toBeVisible();
    expect(component.state.product!.Settings.ShowProductImprintMethods).toEqual(
      false
    );
  });

  it('should show the legend with correct label as `Vendor Imprint Methods`', () => {
    // Arrange
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query(selectors.vendorImprintMethodsLegend)).toHaveText(
      'Vendor Imprint Methods'
    );
  });

  it('Imprint Method - Select / Deselect: should have the option to select / deselect imprint method value', () => {
    // Arrange & Act
    const { spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Attributes: [
          {
            Type: IMPRINT_METHOD_TYPE,
            Name: 'name1',
            IsRequired: true,
            Values: [{ Id: 1, Value: 'Deep Etch', IsVisible: false }],
          },
        ] as PresentationProductAttribute[],
      }),
    });
    let imprintMethodsCheckbox = spectator
      .queryAll('cos-checkbox')[0]
      .querySelector('input');

    // Assert
    expect(imprintMethodsCheckbox).toHaveAttribute('aria-checked', 'false');

    // Act
    spectator.click(imprintMethodsCheckbox!);
    spectator.detectComponentChanges();
    imprintMethodsCheckbox = spectator
      .queryAll('cos-checkbox')[0]
      .querySelector('input');

    // Assert
    expect(imprintMethodsCheckbox).toHaveAttribute('aria-checked', 'true');
  });

  it('should show fields with names `Other Imprint Methods, Imprint Sizes, Imprint Locations, Imprint Colors`', () => {
    // Arrange & act
    const { spectator } = testSetup();
    const form = spectator.query(selectors.productImprintForm);

    // Assert
    expect(form).toHaveText('Other Imprint Methods');
    expect(form).toHaveText('Imprint Sizes');
    expect(form).toHaveText('Imprint Locations');
    expect(form).toHaveText('Imprint Colors');
  });

  it('Imprint Method - Select / Deselect - Should have the option to select other imprint options', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.otherImprintMethods = otherImprintMethods;
    spectator.detectComponentChanges();
    const otherImprintMethodsCheckboxes = spectator.queryAll('cos-checkbox');

    // Assert
    expect(otherImprintMethodsCheckboxes).toHaveLength(
      component.otherImprintMethods.length
    );
    expect(otherImprintMethodsCheckboxes.length).toBeGreaterThan(1);
    expect(otherImprintMethodsCheckboxes.length).toEqual(
      otherImprintMethods.length
    );
  });

  it('Imprint Method - Select / Deselect - Should have the option to select multiple other imprint options', () => {
    // Arrange
    const { component, spectator } = testSetup();

    // Act
    component.otherImprintMethods = otherImprintMethods;
    spectator.detectComponentChanges();
    const otherImprintMethodsCheckboxes = spectator.queryAll('cos-checkbox');

    // Assert
    expect(otherImprintMethodsCheckboxes.length).toBeGreaterThan(1);
    otherImprintMethodsCheckboxes.forEach((checkbox) => {
      expect(checkbox.querySelector('input')).toHaveAttribute(
        'type',
        'checkbox'
      );
    });
  });

  it('Imprint Method - Select / Deselect - Should allow a user to apply the other imprint options', () => {
    // Arrange & Act
    const { component, spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Attributes: [
          {
            Type: IMPRINT_METHOD_TYPE,
            Name: 'name1',
            IsRequired: true,
            Values: [],
          },
        ] as PresentationProductAttribute[],
      }),
    });
    component.otherImprintMethods = otherImprintMethods;
    spectator.detectComponentChanges();
    let otherImprintMethodsCheckboxes = spectator.queryAll('cos-checkbox');

    // Assert
    expect(otherImprintMethodsCheckboxes.length).toBeGreaterThan(1);

    // Act
    spectator.click(otherImprintMethodsCheckboxes[0].querySelector('input')!);
    spectator.click(otherImprintMethodsCheckboxes[2].querySelector('input')!);
    spectator.detectComponentChanges();
    otherImprintMethodsCheckboxes = spectator.queryAll('cos-checkbox');

    // Assert
    expect(
      otherImprintMethodsCheckboxes[0].querySelector('input')
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      otherImprintMethodsCheckboxes[2].querySelector('input')
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      otherImprintMethodsCheckboxes[1].querySelector('input')
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('should show `Imprint Sizes` field with correct placeholder', () => {
    // Arrange & act
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query('input[Name="imprintSizes"]')).toHaveAttribute(
      'placeholder',
      'Enter sizes'
    );
  });

  it('should show `Imprint Locations` field with correct placeholder', () => {
    // Arrange & act
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query('input[Name="imprintLocations"]')).toHaveAttribute(
      'placeholder',
      'Enter locations'
    );
  });

  it('should show `Imprint Colors` field with correct placeholder', () => {
    // Arrange & act
    const { spectator } = testSetup();

    // Assert
    expect(spectator.query('input[Name="imprintColors"]')).toHaveAttribute(
      'placeholder',
      'Enter colors'
    );
  });

  it('Imprint Colors - Should have the supplier provided values in the text field by default', () => {
    // Arrange & Act
    const { spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        ImprintColors: 'test color',
      }),
    });
    const imprintColorsInput = spectator.query('input[Name="imprintColors"]');

    // Assert
    expect(imprintColorsInput).toHaveValue('test color');
  });

  it('Imprint Colors - Should be an editable field', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const imprintColorsInput = spectator.query('input[Name="imprintColors"]');

    // Act
    spectator.typeInElement('test color', imprintColorsInput!);
    spectator.detectComponentChanges();

    // Assert
    expect(imprintColorsInput).toHaveValue('test color');
    expect(imprintColorsInput).toHaveValue(
      component.form.get('ImprintColors')!.value
    );
  });

  it('Imprint Colors - Should allow up to 1500 characters', () => {
    // Arrange
    const { spectator } = testSetup();
    const imprintColorsInput = spectator.query('input[Name="imprintColors"]');

    // Assert
    expect(imprintColorsInput).toHaveAttribute('maxlength', '1500');
  });

  it('Imprint Size field should have a character limit of 1500 characters', () => {
    // Arrange
    const { spectator } = testSetup();
    const imprintColorsInput = spectator
      .queryAll('cos-form-field')[1]
      .querySelector('input');

    // Assert
    expect(imprintColorsInput!.getAttribute('maxlength')).toEqual('1500');
  });

  it('Imprint Location field should have a character limit of 1500 characters', () => {
    // Arrange
    const { spectator } = testSetup();
    const imprintLocationInput = spectator
      .queryAll('cos-form-field')[2]
      .querySelector('input');

    // Assert
    expect(imprintLocationInput!.getAttribute('maxlength')).toEqual('1500');
  });

  it('Imprint Location - Should have the supplier provided values in the text field by default', () => {
    // Arrange & Act
    const { spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        ImprintLocations: 'test location',
      }),
    });
    const imprintLocationInput = spectator.query(
      'input[Name="imprintLocations"]'
    );

    // Assert
    expect(imprintLocationInput).toHaveValue('test location');
  });

  it('Imprint Location - Should be an editable field', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const imprintLocationInput = spectator.query(
      'input[Name="imprintLocations"]'
    );

    // Act
    spectator.typeInElement('test location', imprintLocationInput!);
    spectator.detectComponentChanges();

    // Assert
    expect(imprintLocationInput).toHaveValue('test location');
    expect(imprintLocationInput).toHaveValue(
      component.form.get('ImprintLocations')!.value
    );
  });

  it('Imprint Size - Should have the supplier provided values in in the text field by default', () => {
    // Arrange & Act
    const { spectator } = testSetup({
      productRecipe: (product) => ({
        ...product,
        ImprintSizes: 'test imprint size',
      }),
    });
    const imprintColorsInput = spectator.query('input[Name="imprintSizes"]');

    // Assert
    expect(imprintColorsInput).toHaveValue('test imprint size');
  });

  it('Imprint Size - Should be an editable field', () => {
    // Arrange
    const { component, spectator } = testSetup();
    const imprintSizesInput = spectator.query('input[Name="imprintSizes"]');

    // Act
    spectator.typeInElement('test', imprintSizesInput!);
    spectator.detectComponentChanges();

    // Assert
    expect(imprintSizesInput).toHaveValue('test');
    expect(imprintSizesInput).toHaveValue(
      component.form.get('ImprintSizes')!.value
    );
  });

  it('Imprint methods - should have the supplier provided values in the text field by default', () => {
    // Arrange
    const { spectator, component } = testSetup({
      productRecipe: (product) => ({
        ...product,
        Attributes: [
          {
            Type: IMPRINT_METHOD_TYPE,
            Name: 'name1',
            IsRequired: true,
            Values: [{ Value: 'Deep Etch' }, { Value: 'Blank' }],
          },
        ] as PresentationProductAttribute[],
      }),
    });

    const vendorImprintMethods = spectator.queryAll(
      'cos-checkbox.imprint-method-checkbox > label > span'
    );
    const productAttributeForImprintMethod =
      component.state.product!.Attributes.find(
        (c) => c.Type === IMPRINT_METHOD_TYPE
      );
    expect(vendorImprintMethods[0]).toHaveText(
      productAttributeForImprintMethod!.Values![0].Value!
    );
    expect(vendorImprintMethods[1]).toHaveText(
      productAttributeForImprintMethod!.Values![1]!.Value!
    );
  });
});
