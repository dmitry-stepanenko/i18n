import { RouterTestingModule } from '@angular/router/testing';
import { createComponentFactory } from '@ngneat/spectator/jest';

import {
  PresentationDetailPage,
  PresentationDetailPageModule,
} from './presentation-detail.page';

describe('PresentationDetailPage', () => {
  const createComponent = createComponentFactory({
    component: PresentationDetailPage,
    imports: [PresentationDetailPageModule, RouterTestingModule.withRoutes([])],
  });

  const testSetup = () => {
    const spectator = createComponent();
    return { spectator, component: spectator.component };
  };

  it('should create', () => {
    // Arrange
    const { component } = testSetup();

    // Assert
    expect(component).toBeTruthy();
  });
});
