import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import {
  TRANSLOCO_CONFIG,
  TRANSLOCO_LOADER,
  // eslint-disable-next-line no-restricted-imports
  TranslocoModule,
  // eslint-disable-next-line no-restricted-imports
  TranslocoService,
  translocoConfig,
} from '@ngneat/transloco';

import { getEnumEntries } from '@cosmos/util-enum-helpers';

import { LanguageScope, Languages, SCOPES_PER_APP } from './consts';
import { CosmosTranslocoConfig } from './interfaces/config.interface';
import {
  CosmosTranslocoService,
  PRELOAD_LANGS_PARAMS,
  TranslationsHttpLoader,
  TranslocoPersistLangService,
  TranslocoPreloadLangsService,
} from './services';
import { provideLanguageScopes } from './utils';

function noop() {}

@NgModule({
  exports: [TranslocoModule],
})
export class CosmosUtilTranslationsModule {
  static forRoot(
    prodMode: boolean,
    appName: keyof typeof SCOPES_PER_APP,
    supportedLanguages?: Languages[]
  ): ModuleWithProviders<CosmosUtilTranslationsModule> {
    /** Specifying the preload service as a dependency allows to initialize it eagerly */
    const initPreloadService = {
      provide: APP_INITIALIZER,
      useFactory: () => noop,
      multi: true,
      deps: [TranslocoPreloadLangsService, TranslocoPersistLangService],
    };

    const availableLangs: Languages[] = supportedLanguages
      ? supportedLanguages
      : getEnumEntries(Languages).map((l) => l.value);

    const defaultLang =
      availableLangs.find(
        (language) => language === navigator.language.toLowerCase()
      ) ?? Languages.EnUs;

    const config: CosmosTranslocoConfig = {
      availableScopes: SCOPES_PER_APP[appName] as LanguageScope[],
      availableLangs,
      defaultLang,
      fallbackLang: [Languages.EnUs],
      reRenderOnLangChange: true,
      prodMode,
    };

    return {
      ngModule: CosmosUtilTranslationsModule,
      providers: [
        initPreloadService,
        {
          provide: PRELOAD_LANGS_PARAMS,
          useValue: {},
        },
        {
          provide: TRANSLOCO_CONFIG,
          useValue: translocoConfig(config),
        },
        {
          provide: TRANSLOCO_LOADER,
          useClass: TranslationsHttpLoader,
        },
        {
          provide: TranslocoService,
          useExisting: CosmosTranslocoService,
        },
      ],
    };
  }

  /**
   * This method helps to import translation module with the list of translation scopes to be provided.
   * Relies on `provideLanguageScopes` utility function, which can be used apart.
   *
   * ```typescript
   * @Module({
   *   ...
   *   imports: [CosmosUtilTranslationsModule.withScopes(LanguageScope.EspCommon, LanguageScope.EspProducts)]
   * })
   * ```
   *
   * Note that providing `LANGUAGE_SCOPE` on the level of module might not always work with components,
   * that are used within dialogs due to the injection scope of material dialog.
   * In this case it will be needed to use `provideLanguageScopes` function in the component's providers directly.
   *
   * ```typescript
   * @Component({
   *   ...
   *   providers: [provideLanguageScopes(LanguageScope.EspCommon, LanguageScope.EspProducts)]
   * })
   * ```
   *
   */
  static withScopes(
    scope: LanguageScope,
    ...otherScopes: LanguageScope[]
  ): ModuleWithProviders<CosmosUtilTranslationsModule> {
    return {
      ngModule: CosmosUtilTranslationsModule,
      providers: provideLanguageScopes(scope, ...otherScopes),
    };
  }
}
