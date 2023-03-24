// THIS FILE IS BEING UPDATED USING GENERATORS. DO NOT EDIT MANUALLY.
//
// Find out more about the usage of i18n generators here libs/cosmos/util-translations/README.md
import { LanguageScope } from '@cosmos/util-translations';

/**
 * A Map with Key/Value pairs of absolute paths for all translation files according to LanguageScope enum.
 * Is needed in order to load them synchronously in spec files.
 */
export const languageScopeAbsolutePathMap: ReadonlyMap<LanguageScope, string> =
  new Map([
    [LanguageScope.EspCommon, 'libs/esp/common/util-i18n/src/lib/assets'],
    [LanguageScope.EspProducts, 'libs/esp/products/util-i18n/src/lib/assets'],
    [
      LanguageScope.EspPresentations,
      'libs/esp/presentations/util-i18n/src/lib/assets',
    ],
    [LanguageScope.EspProjects, 'libs/esp/projects/util-i18n/src/lib/assets'],
    [LanguageScope.EspSettings, 'libs/esp/settings/util-i18n/src/lib/assets'],
    [LanguageScope.EspMisc, 'libs/esp/misc/util-i18n/src/lib/assets'],
    [LanguageScope.EspWebsites, 'libs/esp/websites/util-i18n/src/lib/assets'],
    [LanguageScope.EspProofs, 'libs/esp/proofs/util-i18n/src/lib/assets'],
    [LanguageScope.Cosmos, 'libs/cosmos/util-i18n/src/lib/assets'],
    [
      LanguageScope.CustomerPortalPresentations,
      'libs/customer-portal/presentations/util-i18n/src/lib/assets',
    ],
    [
      LanguageScope.CustomerPortalCommon,
      'libs/customer-portal/common/util-i18n/src/lib/assets',
    ],
    [
      LanguageScope.CustomerPortalProofs,
      'libs/customer-portal/proofs/util-i18n/src/lib/assets',
    ],
    [
      LanguageScope.EspDecorations,
      'libs/esp/decorations/util-i18n/src/lib/assets',
    ],
    [
      LanguageScope.CustomerPortalQuotes,
      'libs/customer-portal/quotes/util-i18n/src/lib/assets',
    ],
    [
      LanguageScope.CustomerPortalOrders,
      'libs/customer-portal/orders/util-i18n/src/lib/assets',
    ],
    [
      LanguageScope.CustomerPortalInvoices,
      'libs/customer-portal/invoices/util-i18n/src/lib/assets',
    ],
    [LanguageScope.EspOrders, 'libs/esp/orders/util-i18n/src/lib/assets'],
    [LanguageScope.Storefront, 'libs/storefront/util-i18n/src/lib/assets'],
  ]);
