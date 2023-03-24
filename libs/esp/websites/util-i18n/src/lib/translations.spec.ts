import { LanguageScope } from '@cosmos/util-translations';
import { assertTranslationsValid } from '@cosmos/util-translations/testing';

describe('EspWebsites Translations', () => {
  assertTranslationsValid(LanguageScope.EspWebsites);
});
