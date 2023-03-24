import {
  APP_INITIALIZER,
  Inject,
  Injectable,
  InjectionToken,
  ModuleWithProviders,
  NgModule,
  Provider,
  inject,
} from '@angular/core';
import {
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  Translation,
  TranslocoConfig,
  TranslocoLoader,
  // eslint-disable-next-line no-restricted-imports
  TranslocoModule,
  // eslint-disable-next-line no-restricted-imports
  TranslocoService,
  translocoConfig,
} from '@ngneat/transloco';
import { merge } from 'lodash-es';
import { Observable, forkJoin, lastValueFrom, of } from 'rxjs';

import {
  LanguageScope,
  Languages,
  listAllTranslations,
  provideLanguageScopes,
  toLangValue,
} from '@cosmos/util-translations';

import { requireTranslationJson } from './utils/load-lang-by-absolute-path';

const MOCK_TRANSLATION = new InjectionToken<Translation | undefined>(
  'Mock Translation'
);

@Injectable()
export class TestingTranslationLoader implements TranslocoLoader {
  readonly langs = prepareTranslations(this.mockTranslations);
  constructor(
    @Inject(MOCK_TRANSLATION) private mockTranslations: Translation | undefined
  ) {}

  getTranslation(lang: Languages): Observable<Translation> {
    return of(this.langs[lang]);
  }
}

@NgModule({
  exports: [TranslocoModule],
})
export class CosUtilTranslationsTestingModule {
  /** Default setup of translation module with real translations */
  static forRoot(): ModuleWithProviders<CosUtilTranslationsTestingModule>;
  /**
   * Setup of translation module with real/mock translations and customizable transloco config.
   *
   * If `mockTranslation` are specified,
   * it will be deeply merged with real translations, `mockTranslation` will override existing values recursively
   *
   * ```typescript
   * CosUtilTranslationsTestingModule.forRoot({
   *   mockTranslation: { espCommon: { decorations: { keyToOverride: "overriddenValue" } } },
   *   translocoConfig: { defaultLang: Languages.EnCa },
   *   scopes: [LanguageScope.espCommon]
   * });
   * ...
   * this.translocoService.getTranslation()
   * // {
   * //  espCommon: {
   * //   decorations: {
   * //     keyToOverride: "overriddenValue",
   * //     realKey: "value from actual translation",
   * //     "anotherRealKey": "value from actual translation"
   * //   },
   * //   company: {...},
   * //   ...
   * //  }
   * // }
   * ```
   */
  static forRoot(
    config: Partial<TranslationsTestingConfig>
  ): ModuleWithProviders<CosUtilTranslationsTestingModule>;
  static forRoot(
    config?: Partial<TranslationsTestingConfig>
  ): ModuleWithProviders<CosUtilTranslationsTestingModule> {
    const providers: Provider[] = [
      {
        provide: TRANSLOCO_CONFIG,
        useValue: translocoConfig({
          availableLangs: [Languages.EnUs, Languages.EnCa],
          defaultLang: Languages.EnUs,
          fallbackLang: [Languages.EnUs],
          missingHandler: { logMissingKey: false },
          reRenderOnLangChange: true,
          prodMode: true,
          ...config?.translocoConfig,
        }),
      },
      { provide: TRANSLOCO_LOADER, useClass: TestingTranslationLoader },
      { provide: MOCK_TRANSLATION, useValue: config?.mockTranslation },
      {
        provide: APP_INITIALIZER,
        multi: true,
        useFactory: () => {
          const translocoService = inject(TranslocoService);
          return function (): Promise<unknown> {
            // preload all languages
            const allLangs$ = forkJoin(
              listAllTranslations().map((l) =>
                translocoService._loadDependencies(toLangValue(l))
              )
            );
            return lastValueFrom(allLangs$);
          };
        },
      },
    ];

    if (config?.scopes?.length) {
      providers.push(
        provideLanguageScopes(...(config.scopes as [LanguageScope]))
      );
    }

    return {
      ngModule: CosUtilTranslationsTestingModule,
      providers,
    };
  }
}

interface TranslationsTestingConfig {
  mockTranslation?: Translation;
  translocoConfig: Partial<TranslocoConfig>;
  scopes?: LanguageScope[];
}

/**
 * Loads translations from all scopes for all languages synchronously
 */
function prepareTranslations(overrides?: Translation): Translation {
  // e.g. [ ['espCommon', 'espCommon/en-us'], ['espCommon', 'espCommon/en-ca'] ]
  const scopeToLangPathMapping = new Array<
    [scope: string, scopePath: string]
  >();
  const allLanguages = listAllTranslations().reduce((acc, { lang, scope }) => {
    if (!scope) {
      acc[lang] = {}; // for now only using translations within scopes
    } else {
      // assigning values in the same way as transloco will attempt to load them
      const key = `${scope}/${lang}`;
      scopeToLangPathMapping.push([scope, key]);
      acc[key] = requireTranslationJson(scope, lang);
    }
    return acc;
  }, {} as Record<string, Translation>);
  if (overrides) {
    const overridesWithLangPaths = scopeToLangPathMapping.reduce(
      (acc, [scope, scopePath]) => {
        if (overrides[scope]) {
          acc[scopePath] = overrides[scope];
        }
        return acc;
      },
      {} as Translation
    );
    return merge(allLanguages, overridesWithLangPaths);
  }
  return allLanguages;
}
