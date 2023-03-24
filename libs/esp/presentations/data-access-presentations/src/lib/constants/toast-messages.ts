import { ToastData } from '@cosmos/components/types-toast';

export const TOAST_MESSAGES = {
  PRESENTATION_SHARED_BY_EMAIL: (): ToastData => ({
    title: 'Success',
    body: 'Your presentation was successfully shared.',
    type: 'confirm',
  }),
  PRESENTATION_SHARED_BY_LINK: (): ToastData => ({
    title: 'Success',
    body: 'Your presentation link has been copied to your clipboard.',
    type: 'confirm',
  }),
};
