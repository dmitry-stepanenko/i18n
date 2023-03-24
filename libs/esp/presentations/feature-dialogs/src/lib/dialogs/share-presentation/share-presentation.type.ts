import { Presentation } from '@esp/presentations/types';
import { BaseProject } from '@esp/projects/types';
import { OrderEmailTemplate } from '@esp/settings/types';

export interface BaseSharePresentationDialogData {
  project: BaseProject;
  presentation: Presentation;
}

export interface SharePresentationDialogData
  extends BaseSharePresentationDialogData {
  emailTemplate: OrderEmailTemplate;
  fields: string[];
}

export interface ShareOptions {
  name: string;
  value: SelectedView;
}

export enum SelectedView {
  Email = 'email',
  Link = 'link',
}
