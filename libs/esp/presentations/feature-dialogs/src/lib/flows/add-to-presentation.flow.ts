import { ChangeDetectorRef, Inject, Injectable, NgZone } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ActionCompletion, Actions, ofActionCompleted } from '@ngxs/store';
import { Observable, filter, merge, switchMap, tap } from 'rxjs';

import {
  BaseFlow,
  DialogFlowFactoryService,
  DialogFlowStepContext,
} from '@cosmos/dialog-flow';
import { RAF$ } from '@cosmos/tick-scheduler';
import { Nullable } from '@cosmos/types-common';
import { selectCustomerDialogConfig } from '@esp/companies/feature-select-customer-dialog';
import { PresentationsActions } from '@esp/presentations/data-access-presentations';
import { defaultProjectDetailsFormValue } from '@esp/projects/data-access/store';
import {
  projectCreateInProgressDialogDef,
  projectCreateWithNewCustomerAdditionalInfoDialogConfig,
  projectCreateWithNewCustomerConfig,
  projectCreateWithNewCustomerInProgressDialogDef,
  projectDetailsCreateDialogDef,
} from '@esp/projects/feature-dialogs';
import { Project } from '@esp/projects/types';
import { ProductSearchResultItem } from '@smartlink/models';

import { presentationOrProjectSelectDialogDef } from '../dialogs';

import {
  AddToPresentationDataAvailability,
  PresentationFlowService,
} from './presentation-flow.service';

export enum StepType {
  Start,
  CustomerSelection,
  PresentationSelection,
  ProjectCreation,
  ProjectCreationInProgress,
  ProjectAndCustomerCreation,
  ProjectAndCustomerCreationInProgress,
}

@UntilDestroy()
@Injectable()
export class AddToPresentationFlow extends BaseFlow {
  private _checkedProducts = new Map<number, ProductSearchResultItem>();
  private _customerCreationWithAdditionalInfo?: boolean;

  private _dataAvailability: AddToPresentationDataAvailability = {
    areAnyPresentationsAvailable: false,
    areAnyCustomersAvailable: false,
  };

  // Caretaker note: this is the default subheader so we don't duplicate it between different modules,
  // it might be overridden when calling `start()`.
  private _subheader =
    'Create a new project and add these products to a new presentation or select an existing project and add these products to the existing presentation.';

  private get _productIds(): number[] {
    return Array.from(this._checkedProducts.keys());
  }

  private _presentationSelection = this.flow.createStep({
    dialog: presentationOrProjectSelectDialogDef,
    getInputData: () => ({
      subheader: this._subheader,
      checkedProducts: this._checkedProducts,
    }),
    onNext: (result) => {
      if (result.complete) {
        this.flow.complete();
        return;
      }
      this.flow.openStep(this.resolveNextStep(StepType.PresentationSelection));
    },
    onPrevious: () => {
      this.flow.reset();
    },
  });

  private _customerSelection = this.flow.createStep({
    dialog: selectCustomerDialogConfig,
    getInputData: (previousResult) => ({
      searchTerm: previousResult?.searchTerm || '',
      selectedCustomerId: previousResult?.selectedCustomer?.Id || undefined,
    }),
    canGoPrevious: () => true,
    onNext: () => {
      this.flow.openStep(this.resolveNextStep(StepType.CustomerSelection));
    },
    onPrevious: () => {
      const previousStep = this.resolvePreviousStep(StepType.CustomerSelection);
      previousStep ? this.flow.openStep(previousStep) : this.flow.reset();
    },
  });

  private _projectDetailsCreate = this.flow.createStep({
    dialog: projectDetailsCreateDialogDef,
    getInputData: (previousResult) => ({
      project: {
        ...defaultProjectDetailsFormValue,
        ...(previousResult || {}),
      },
      submitButton: {
        icon: 'fa-images',
        text: 'Create Presentation',
      },
      title: 'Create a New Presentation',
      subHeader: `Create a new presentation for
    ${this._customerSelection.result!.selectedCustomer!.Name}.`,
      selectedCustomer: this._customerSelection.result!.selectedCustomer!,
    }),
    onNext: () => {
      this.flow.openStep(this.resolveNextStep(StepType.ProjectCreation));
    },
    onPrevious: () => {
      this.flow.openStep(this.resolvePreviousStep(StepType.ProjectCreation));
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
      const previousStep = this.resolvePreviousStep(
        StepType.ProjectAndCustomerCreation
      );
      previousStep ? this.flow.openStep(previousStep) : this.flow.reset();
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
    }),
    onNext: () => {
      this.flow.complete();
    },
    onPrevious: () => {
      this.flow.openStep(
        this.resolvePreviousStep(StepType.ProjectAndCustomerCreationInProgress)
      );
    },
  });

  private _projectCreateInProgress = this.flow.createStep({
    dialog: projectCreateInProgressDialogDef,
    getInputData: () => ({
      project: {
        ...this._projectDetailsCreate.result,
        Customer: this._customerSelection.result!.selectedCustomer!,
        Budget: Number(
          this._projectDetailsCreate.result!.Budget.replace(/,/g, '')
        ),
        NumberOfAssignees: Number(
          this._projectDetailsCreate.result!.NumberOfAssignees.replace(/,/g, '')
        ),
      } as Project,
      productIds: this._productIds,
    }),
    onNext: () => {
      this.flow.complete();
    },
    onPrevious: () => {
      this.flow.openStep(
        this.resolvePreviousStep(StepType.ProjectCreationInProgress)
      );
    },
  });

  protected resolveNextStep(currentStep: StepType): DialogFlowStepContext {
    switch (currentStep) {
      case StepType.Start:
        if (this._dataAvailability.areAnyPresentationsAvailable) {
          return this._presentationSelection;
        }
        if (this._dataAvailability.areAnyCustomersAvailable) {
          return this._customerSelection;
        }
        return this._projectCreateWithNewCustomer;
      case StepType.PresentationSelection:
        if (this._dataAvailability.areAnyCustomersAvailable) {
          return this._customerSelection;
        }
        return this._projectCreateWithNewCustomer;
      case StepType.CustomerSelection:
        if (this._customerSelection.result!.selectedCustomer) {
          return this._projectDetailsCreate;
        } else {
          return this._projectCreateWithNewCustomer;
        }
      case StepType.ProjectCreation:
        return this._projectCreateInProgress;
      case StepType.ProjectAndCustomerCreation:
        return this._projectCreateWithNewCustomerInProgress;
    }

    return this._projectCreateWithNewCustomer;
  }

  private resolvePreviousStep(
    currentStep: StepType
  ): DialogFlowStepContext | null {
    switch (currentStep) {
      case StepType.CustomerSelection:
        if (this._dataAvailability.areAnyPresentationsAvailable) {
          return this._presentationSelection;
        }
        break;
      case StepType.ProjectCreation:
        return this._customerSelection;
      case StepType.ProjectCreationInProgress:
        return this._projectDetailsCreate;
      case StepType.ProjectAndCustomerCreation:
        if (this._dataAvailability.areAnyCustomersAvailable) {
          return this._customerSelection;
        }
        if (this._dataAvailability.areAnyPresentationsAvailable) {
          return this._presentationSelection;
        }
        break;
      case StepType.ProjectAndCustomerCreationInProgress:
        return this._customerCreationWithAdditionalInfo
          ? this._projectCreateWithNewCustomerAdditionalInfo
          : this._projectCreateWithNewCustomer;
    }

    return null;
  }

  constructor(
    private readonly _ngZone: NgZone,
    dialogFlowService: DialogFlowFactoryService,
    private readonly _presentationFlowService: PresentationFlowService,
    private readonly _actions$: Actions,
    @Inject(RAF$) private readonly _raf$: Observable<void>
  ) {
    super(dialogFlowService);
  }

  start(options?: {
    subheader?: string;
    checkedProducts: Map<number, ProductSearchResultItem>;
  }) {
    this._subheader = options?.subheader || this._subheader;
    this._checkedProducts = options?.checkedProducts
      ? new Map(options.checkedProducts)
      : this._checkedProducts;
    this._presentationFlowService
      .getDataAvailabilityInfo()
      .subscribe((result) => {
        this._dataAvailability = result;

        this.flow.start(this.resolveNextStep(StepType.Start));
      });
  }

  setupCleanUpCheckedProductsListener(
    ref: ChangeDetectorRef,
    checkedProducts: Nullable<Map<number, ProductSearchResultItem>>,
    callback?: {
      (presentationId?: number): void;
    }
  ): void {
    const createPresentation$ = this._actions$.pipe(
      ofActionCompleted(PresentationsActions.Create),
      filter(
        // If presentation is being created with products.
        (ctx: ActionCompletion<PresentationsActions.Create>) =>
          ctx.action.productIds.length > 0
      ),
      tap(() => callback?.())
    );

    const addProducts$ = this._actions$.pipe(
      ofActionCompleted(PresentationsActions.AddProducts),
      tap((result) => callback?.(result.action.presentationId))
    );

    // Products can be added to presentations when the presentation is created or to some existing presentation,
    // so we have to listen for those actions separately.
    merge(createPresentation$, addProducts$)
      .pipe(
        switchMap(() => this._raf$),
        untilDestroyed(this)
      )
      .subscribe(() => {
        this._ngZone.run(() => {
          checkedProducts && checkedProducts.clear();
          ref.detectChanges();
        });
      });
  }
}
