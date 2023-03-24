import { Injectable } from '@angular/core';

import {
  BaseFlow,
  DialogFlowFactoryService,
  DialogFlowStepContext,
} from '@cosmos/dialog-flow';
import { selectCustomerDialogConfig } from '@esp/companies/feature-select-customer-dialog';
import { defaultProjectDetailsFormValue } from '@esp/projects/data-access/store';
import {
  SelectedCustomer,
  projectCreateInProgressDialogDef,
  projectCreateWithNewCustomerAdditionalInfoDialogConfig,
  projectCreateWithNewCustomerConfig,
  projectCreateWithNewCustomerInProgressDialogDef,
  projectDetailsCreateDialogDef,
} from '@esp/projects/feature-dialogs';
import { Project } from '@esp/projects/types';

import { PresentationFlowService } from './presentation-flow.service';

export interface CreatePresentationDataAvailability {
  areAnyCustomersAvailable: boolean;
}

@Injectable()
export class CreatePresentationFlow extends BaseFlow {
  private get _selectedCustomer(): SelectedCustomer {
    return this._customer || this._customerSelection.result!.selectedCustomer!;
  }
  private _customerCreationWithAdditionalInfo?: boolean;
  private _productIds: number[] = [];
  private _redirectAfterCreation = true;
  private _customer?: SelectedCustomer;
  private _dataAvailability: CreatePresentationDataAvailability = {
    areAnyCustomersAvailable: false,
  };
  private _customerSelection = this.flow.createStep({
    dialog: selectCustomerDialogConfig,
    getInputData: (previousResult) => ({
      searchTerm: previousResult?.searchTerm || '',
      selectedCustomerId: previousResult?.selectedCustomer?.Id || undefined,
    }),
    canGoPrevious: () => true,
    onNext: (result) => {
      if (!result.selectedCustomer) {
        this.flow.openStep(this._projectCreateWithNewCustomer);
      } else {
        this.flow.openStep(this._projectDetailsCreate);
      }
    },
    onPrevious: () => {
      this.flow.reset();
    },
  });

  private _projectDetailsCreate = this.flow.createStep({
    dialog: projectDetailsCreateDialogDef,
    getInputData: (previousResult) => ({
      project: {
        ...defaultProjectDetailsFormValue,
        ...(previousResult || {}),
      },
      title: 'Create a New Presentation',
      submitButton: {
        icon: 'fa-images',
        text: 'Create Presentation',
      },
      subHeader: `Create a new presentation for,
    ${this._selectedCustomer.Name}.`,
      selectedCustomer: this._selectedCustomer,
    }),
    onNext: () => {
      this.flow.openStep(this._projectCreateInProgress);
    },
    onPrevious: () => {
      this._customer
        ? this.flow.reset()
        : this.flow.openStep(this._customerSelection);
    },
  });

  private _projectCreateWithNewCustomer = this.flow.createStep({
    dialog: projectCreateWithNewCustomerConfig,
    getInputData: (previousResult) => {
      return {
        project: {
          ...defaultProjectDetailsFormValue,
          ...previousResult.project,
        },
        customer: previousResult.customer,
      };
    },
    onNext: (result) => {
      if (result.openAddCustomerInfoStep) {
        this.flow.openStep(this._projectCreateWithNewCustomerAdditionalInfo);
      } else {
        this._customerCreationWithAdditionalInfo = false;
        this.flow.openStep(this._projectCreateWithNewCustomerInProgress);
      }
    },
    onPrevious: () => {
      if (this._dataAvailability.areAnyCustomersAvailable) {
        this.flow.openStep(this._customerSelection);
      } else {
        this.flow.reset();
      }
    },
  });

  private _projectCreateWithNewCustomerAdditionalInfo = this.flow.createStep({
    dialog: projectCreateWithNewCustomerAdditionalInfoDialogConfig,
    getInputData: (previousResult) => ({
      contact: {
        ...previousResult.contact,
        Name: this._projectCreateWithNewCustomer.result!.customer
          .CompanyInformation.Name,
      },
    }),
    onNext: () => {
      this._customerCreationWithAdditionalInfo = true;
      this.flow.openStep(this._projectCreateWithNewCustomerInProgress);
    },
    onPrevious: () => {
      this.flow.openStep(this._projectCreateWithNewCustomer);
    },
  });

  private _projectCreateWithNewCustomerInProgress = this.flow.createStep({
    dialog: projectCreateWithNewCustomerInProgressDialogDef,
    getInputData: () => ({
      customer: {
        ...this._projectCreateWithNewCustomer.result!.customer,
        CompanyInformation: {
          ...(this._projectCreateWithNewCustomerAdditionalInfo.result &&
            this._projectCreateWithNewCustomerAdditionalInfo.result.contact),
          ...this._projectCreateWithNewCustomer.result!.customer
            .CompanyInformation,
        },
      },
      project: this._projectCreateWithNewCustomer.result!.project,
      productIds: this._productIds,
      redirectAfterCreation: this._redirectAfterCreation,
    }),
    onNext: () => {
      this.flow.complete();
    },
    onPrevious: () => {
      if (this._customerCreationWithAdditionalInfo) {
        this.flow.openStep(this._projectCreateWithNewCustomerAdditionalInfo);
      } else {
        this.flow.openStep(this._projectCreateWithNewCustomer);
      }
    },
  });

  private _projectCreateInProgress = this.flow.createStep({
    dialog: projectCreateInProgressDialogDef,
    getInputData: () => ({
      project: {
        ...this._projectDetailsCreate.result,
        Customer: {
          Id: this._selectedCustomer!.Id,
        },
        Budget: Number(
          this._projectDetailsCreate.result!.Budget.replace(/,/g, '')
        ),
        NumberOfAssignees: Number(
          this._projectDetailsCreate.result!.NumberOfAssignees.replace(/,/g, '')
        ),
      } as Project,
      productIds: this._productIds,
      redirectAfterCreation: this._redirectAfterCreation,
    }),
    onNext: () => {
      this.flow.complete();
    },
    onPrevious: () => {
      this.flow.openStep(this._projectDetailsCreate);
    },
  });

  constructor(
    dialogFlowService: DialogFlowFactoryService,
    private readonly _presentationFlowService: PresentationFlowService
  ) {
    super(dialogFlowService);
  }

  start(options?: {
    productIds?: number[];
    redirectAfterCreation?: boolean;
    customer?: SelectedCustomer;
  }): void {
    this._productIds = options?.productIds ?? this._productIds;
    this._redirectAfterCreation =
      options?.redirectAfterCreation ?? this._redirectAfterCreation;
    this._customer = options?.customer;
    this._presentationFlowService
      .areThereAnyCustomersAvailable()
      .subscribe((result) => {
        this._dataAvailability.areAnyCustomersAvailable = result;

        this.flow.start(this.resolveNextStep());
      });
  }

  private resolveNextStep(): DialogFlowStepContext {
    if (this._customer) {
      return this._projectDetailsCreate;
    }

    if (this._dataAvailability.areAnyCustomersAvailable) {
      return this._customerSelection;
    }

    return this._projectCreateWithNewCustomer;
  }
}
