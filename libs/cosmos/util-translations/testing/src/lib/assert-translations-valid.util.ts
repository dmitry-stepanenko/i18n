import { isEqualByKey } from '@cosmos/util-common';
import { getEnumEntries } from '@cosmos/util-enum-helpers';
import { LanguageScope, Languages } from '@cosmos/util-translations';

import { requireTranslationJson } from './utils/load-lang-by-absolute-path';

/**
 * Testing utility that does several things:
 * - checks if translations with correct filenames are available for all languages according to the `Languages` enum
 * - checks if translations can be parsed
 * - checks if all languages are identical by keys to catch any missing translations
 *
 * @param languageScope an enum value for the source of translations to test
 *
 * @usageNotes
 * ```
 * import { LanguageScope } from '@cosmos/util-translations';
 * import { assertTranslationsValid } from '@cosmos/util-translations/testing';
 *
 * describe('Esp Common Translations', () => {
 *   it('should be valid', () => {
 *     assertTranslationsValid(LanguageScope.EspCommon);
 *   });
 * });
 * ```
 */
export function assertTranslationsValid(languageScope: LanguageScope) {
  const [baseLang, ...other] = getEnumEntries(Languages);

  const baseTranslation = requireTranslationJson(languageScope, baseLang.value);
  for (const { value: lang } of other) {
    it(`translation "${lang}" should have equal keys with "${baseLang.value}"`, () => {
      const otherTranslation = requireTranslationJson(languageScope, lang);
      expect(isEqualByKey(baseTranslation, otherTranslation)).toBe(true);
    });
  }
}
