import { LanguageScope } from '@cosmos/util-translations';
import { assertTranslationsValid } from '@cosmos/util-translations/testing';

describe('Esp Common Translations', () => {
  assertTranslationsValid(LanguageScope.EspProducts);
});
