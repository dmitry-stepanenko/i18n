import { LanguageScope } from '@cosmos/util-translations';
import { assertTranslationsValid } from '@cosmos/util-translations/testing';

describe('Cosmos Translations', () => {
  assertTranslationsValid(LanguageScope.Cosmos);
});
