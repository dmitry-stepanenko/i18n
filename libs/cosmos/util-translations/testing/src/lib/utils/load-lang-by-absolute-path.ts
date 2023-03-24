import { join } from 'path';

import { Translation } from '@ngneat/transloco';
import { workspaceRoot } from '@nrwl/devkit';

import { LanguageScope, Languages } from '@cosmos/util-translations';

import { languageScopeAbsolutePathMap } from './language-source-absolute-paths';

export function requireTranslationJson(
  scope: LanguageScope,
  language: Languages
): Translation {
  const relativeTranslationsPath = languageScopeAbsolutePathMap.get(scope)!;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(join(
    workspaceRoot,
    relativeTranslationsPath,
    language + '.json'
  ));
}
