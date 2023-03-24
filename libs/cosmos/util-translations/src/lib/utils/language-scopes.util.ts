import { Provider, inject } from '@angular/core';
import { TRANSLOCO_SCOPE, TranslocoScope } from '@ngneat/transloco';

import { LanguageScope } from '../consts';

/**
 * Utility method to provide language scopes that are needed to be loaded for a given component/module.
 *
 * In most cases it might be more convenient to use `CosmosUtilTranslationsModule.withScopes()` module import,
 * that wraps this method inside, although it might not work for components, that are used within dialogs.
 * In that case use this method to provide required scopes on the component directly
 *
 * ```typescript
 * @Component({
 *   ...
 *   providers: [provideLanguageScopes(LanguageScope.EspCommon, LanguageScope.EspProducts)]
 * })
 * ```
 *
 */
export function provideLanguageScopes(
  scope: LanguageScope,
  ...otherScopes: LanguageScope[]
): Provider[] {
  return [...new Set(otherScopes.concat(scope)).values()].map((s) => ({
    provide: TRANSLOCO_SCOPE,
    useValue: s,
    multi: true,
  }));
}

/** Returns an array of language scopes in the current injection context */
export function getLanguageScopes(): LanguageScope[] | null {
  const scopes = inject(TRANSLOCO_SCOPE, { optional: true }) as unknown as
    | TranslocoScope[]
    | null;

  return scopes && translocoToLanguageScopes(scopes);
}

export function translocoToLanguageScopes(
  scopes: (LanguageScope | TranslocoScope)[]
): LanguageScope[] {
  return scopes
    .map((s) => (typeof s === 'string' ? s : s?.scope))
    .filter((s): s is LanguageScope => !!s);
}
