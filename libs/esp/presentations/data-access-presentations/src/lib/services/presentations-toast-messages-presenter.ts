import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Injectable,
  NgModule,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';

import { CosButtonModule } from '@cosmos/components/button';
import {
  TOAST_COMPONENT_DATA,
  ToastActions,
} from '@cosmos/components/types-toast';
import { Presentation } from '@esp/presentations/types';

import { AddProductsResponse } from '../api';

interface ProductsAddedData {
  projectId: string;
  presentationId: string;
}

@Component({
  template: `<a
    cos-button
    class="pl-0"
    routerLink="/projects/{{ data.projectId }}/presentations/{{
      data.presentationId
    }}"
    >Configure Products</a
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigureProductsButtonComponent {
  constructor(@Inject(TOAST_COMPONENT_DATA) public data: ProductsAddedData) {}
}

interface ProjectAddedData {
  projectId: string;
}

@Component({
  template: `<a
    cos-button
    class="pl-0"
    routerLink="/projects/{{ data.projectId }}"
    >View Project Overview</a
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewProjectOverviewButtonComponent {
  constructor(@Inject(TOAST_COMPONENT_DATA) public data: ProjectAddedData) {}
}

@NgModule({
  imports: [RouterModule, CosButtonModule],
  declarations: [
    ConfigureProductsButtonComponent,
    ViewProjectOverviewButtonComponent,
  ],
})
export class ConfigureProductsButtonModule {}

@Injectable({ providedIn: 'root' })
export class PresentationsToastMessagesPresenter {
  private readonly maxProductsPerPresentation = 250;

  private readonly duration = 8e3; // 8 seconds.

  constructor(private readonly store: Store) {}

  projectCreated(
    projectId: number,
    projectName: string,
    customerName: string
  ): void {
    this.store.dispatch(
      new ToastActions.Show(
        {
          title: 'Project Created Successfully',
          body: `${projectName}  project has been created for ${customerName}`,
          type: 'confirm',
          component: ViewProjectOverviewButtonComponent,
          componentData: {
            projectId: projectId,
          },
        },
        { duration: this.duration }
      )
    );
  }

  productsAdded(
    productsNumber: number,
    projectName: string,
    presentationId: number,
    projectId: number
  ): void {
    this.store.dispatch(
      new ToastActions.Show(
        {
          title: 'Success',
          body: `${productsNumber} product(s) added to ${projectName}`,
          type: 'confirm',
          component: ConfigureProductsButtonComponent,
          componentData: {
            presentationId,
            projectId,
          },
        },
        { duration: this.duration, dismissible: true }
      )
    );
  }

  presentationCreated(presentation: Presentation, projectName: string): void {
    this.store.dispatch(
      new ToastActions.Show(
        {
          title: 'Success',
          body: `${projectName} was created successfully.`,
          type: 'confirm',
        },
        { duration: this.duration, dismissible: true }
      )
    );
  }

  addProductsSucceeded(
    response: AddProductsResponse,
    projectName: string
  ): void {
    if (response.ProductsAdded.length > 0) {
      this.productsAdded(
        response.ProductsAdded.length,
        projectName,
        response.Presentation.Id,
        response.Presentation.ProjectId
      );
    }

    if (response.ProductsDuplicated.length > 0) {
      this.store.dispatch(
        new ToastActions.Show(
          {
            title: 'Error: Products not added!',
            body: `${response.ProductsDuplicated.length} product(s) already exist in ${projectName}!`,
            type: 'error',
          },
          { duration: this.duration }
        )
      );
    }

    if (response.ProductsTruncated.length > 0) {
      this.store.dispatch(
        new ToastActions.Show(
          {
            title: 'Error: Too many products',
            body: `${response.ProductsTruncated.length} product(s) were unable to be added. ${this.maxProductsPerPresentation} product per presentation limit reached.`,
            type: 'error',
          },
          { duration: this.duration }
        )
      );
    }
  }

  addProductsFailed(productIds: number[]): void {
    this.store.dispatch(
      new ToastActions.Show({
        title: 'Error!',
        body: `${productIds.length} product(s) failed to add, please try again.`,
        type: 'error',
      })
    );
  }

  productsNotDeleted(): void {
    this.store.dispatch(
      new ToastActions.Show({
        title: 'Error!',
        body: 'Product failed to delete.',
        type: 'error',
      })
    );
  }

  productsNotSorted(): void {
    this.store.dispatch(
      new ToastActions.Show({
        title: 'Error!',
        body: 'Product failed to reorder.',
        type: 'error',
      })
    );
  }

  productsNotVisible(isVisible: boolean): void {
    this.store.dispatch(
      new ToastActions.Show({
        title: 'Error!',
        body: `Product failed to ${isVisible ? 'show' : 'hide'}.`,
        type: 'error',
      })
    );
  }
}
