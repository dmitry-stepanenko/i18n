import { getEnumEntries } from '@cosmos/util-enum-helpers';

import { LanguageScope, Languages } from '../consts';

interface LanguageAndScope {
  lang: Languages;
  scope?: LanguageScope;
}
/**
 * Returns all global and scoped languages
 *
 * @param sortByLang if specified, global and scoped values for this language
 * will be pushed to the top of the returned array
 */
export function listAllTranslations(
  availableScopes?: LanguageScope[],
  sortByLang?: Languages
): LanguageAndScope[] {
  let languageScopes = getEnumEntries(LanguageScope).map((s) => s.value);
  if (availableScopes) {
    const availableScopesSet = new Set(availableScopes);
    languageScopes = languageScopes.filter((v) => availableScopesSet.has(v));
  }
  const languages = getEnumEntries(Languages).map((l) => l.value);
  if (sortByLang) {
    languages.sort((a, b) => {
      if (a === sortByLang) return -1;
      if (b === sortByLang) return 1;
      return 0;
    });
  }

  return languages.reduce((acc, lang) => {
    acc.push({ lang });
    languageScopes.forEach((scope) => {
      acc.push({ lang, scope });
    });
    return acc;
  }, [] as LanguageAndScope[]);
}

export function toLangValue({ scope, lang }: LanguageAndScope): string {
  return scope ? `${scope}/${lang}` : lang;
}
