import { ToastData, ToastType } from '@cosmos/components/types-toast';
import { LanguageScope } from '@cosmos/util-translations';
import { PresentationProduct } from '@esp/presentations/types';

const getTitleKey = (key: string) =>
  `espPresentations.presentation-product.presentation-product-page.toast-messages.${key}.title`;
const getBodyKey = (key: string) =>
  `espPresentations.presentation-product.presentation-product-page.toast-messages.${key}.body`;

const getToastData = (
  key: string,
  type: ToastType,
  interpolationParams?: Record<string, unknown>
): ToastData => {
  const data = {
    title: getTitleKey(key),
    body: getBodyKey(key),
    type,
    languageScope: LanguageScope.EspPresentations,
  };

  return interpolationParams ? { ...data, interpolationParams } : data;
};

export const TOAST_MESSAGES = {
  PRODUCT_SAVE: (product: PresentationProduct) =>
    getToastData('product-save', 'confirm', {
      name: product.Name,
    }),
  PRODUCT_UPDATE: (product: PresentationProduct) =>
    getToastData('product-update', 'confirm', {
      name: product.Name,
    }),
  PRODUCT_NOT_SAVED: () => getToastData('product-not-save', 'error'),
};
