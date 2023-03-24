import { LanguageScope } from '@cosmos/util-translations';
import { assertTranslationsValid } from '@cosmos/util-translations/testing';

describe('Storefront Translations', () => {
  assertTranslationsValid(LanguageScope.Storefront);
});
