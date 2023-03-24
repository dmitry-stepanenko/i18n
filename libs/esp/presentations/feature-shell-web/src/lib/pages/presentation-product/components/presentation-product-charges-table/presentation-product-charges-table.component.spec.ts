import { createComponentFactory } from '@ngneat/spectator/jest';

import { MOCK_PRESENTATION_CHARGES } from '@esp/presentations/mocks-presentations';
import { FormatPricePipe } from '@smartlink/products/util-format-price-pipe';

import { ChargeUsageLevelPipe } from '../../pipes/charge-usage-level/charge-usage-level.pipe';

import {
  PresentationProductChargesTableComponent,
  PresentationProductChargesTableModule,
} from './presentation-product-charges-table.component';

describe('Presentation Product Charges Component', () => {
  const createComponent = createComponentFactory({
    component: PresentationProductChargesTableComponent,
    imports: [PresentationProductChargesTableModule],
    providers: [ChargeUsageLevelPipe, FormatPricePipe],
  });

  const testSetup = () => {
    const spectator = createComponent({
      props: {
        dataSource: MOCK_PRESENTATION_CHARGES,
      },
    });
    return { spectator, component: spectator.component };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });

  it("should display the option value's name associated with the vendor charge", () => {
    // Arrange
    const { spectator, component } = testSetup();
    const rows = spectator.queryAll('tr.cos-row');

    // Assert
    rows.forEach((row, i) => {
      const name = row.querySelector('.cos-column-charge > div');

      expect(name).toHaveText(component.dataSource[i].Name);
    });
  });

  it('should display the vendor charge grid name', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const rows = spectator.queryAll('tr.cos-row');

    // Assert
    rows.forEach((row, i) => {
      const name = row.querySelector('.cos-column-charge > div');

      expect(name).toHaveText(component.dataSource[i].Description);
    });
  });

  it('should display the vendor charge QTY type', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const chargeUsageLevelPipe = spectator.inject(ChargeUsageLevelPipe);
    const rows = spectator.queryAll('tr.cos-row');

    // Assert
    rows.forEach((row, i) => {
      const qtyType = row.querySelector('.cos-column-quantity');

      expect(qtyType.innerHTML.trim()).toEqual(
        chargeUsageLevelPipe.transform(component.dataSource[i].UsageLevel)
      );
    });
  });

  it("should display the vendor charge's lowest price", () => {
    // Arrange
    const { spectator, component } = testSetup();
    const pricePipe = spectator.inject(FormatPricePipe);
    const rows = spectator.queryAll('tr.cos-row');

    // Assert
    rows.forEach((row, i) => {
      const price = row.querySelector('.cos-column-price');

      expect(price.innerHTML.trim()).toEqual(
        pricePipe.transform(
          component.dataSource[i].Prices[
            component.dataSource[i].Prices.length - 1
          ],
          'Price'
        )
      );
    });
  });

  it('should allow the user to add  vendor imprint charges to the Imprint charges section', () => {
    // Arrange
    const { spectator, component } = testSetup();
    const rows = spectator.queryAll('tr.cos-row');
    const addChargeSpy = jest
      .spyOn(component, 'addCharge')
      .mockImplementation();

    rows.forEach((row, i) => {
      const addBtn = row.querySelector('button');

      // Act
      spectator.click(addBtn);

      // Assert
      expect(addChargeSpy).toHaveBeenCalledWith(component.dataSource[i]);
    });
  });
});
