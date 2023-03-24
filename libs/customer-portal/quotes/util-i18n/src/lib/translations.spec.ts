import { LanguageScope } from '@cosmos/util-translations';
import { assertTranslationsValid } from '@cosmos/util-translations/testing';

describe('CustomerPortalQuotes Translations', () => {
  assertTranslationsValid(LanguageScope.CustomerPortalQuotes);
});
