import { LanguageScope, Languages } from '@cosmos/util-translations';
import { assertTranslationsValid } from '@cosmos/util-translations/testing';

describe('EspCommon Translations', () => {
  assertTranslationsValid(LanguageScope.EspCommon);

  it('should contain language translations', () => {
    // language translations are expected to be found in this library
    // changing this will break the "i18n-language" generator and "language-label" pipe
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const enUsTranslations = require('./assets/en-us.json');
    const localizationValues = enUsTranslations.localization;
    expect(localizationValues).toBeTruthy();
    expect(Object.keys(localizationValues).sort()).toEqual(
      Object.values(Languages).sort()
    );
  });
});
