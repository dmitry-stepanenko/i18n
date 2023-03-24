# cosmos-util-translations

This library provides utilities to work with translations for all apps within the workspace.

## Translations architecture overview

Translations are split by domain, each domain (esp, customer-portal, cosmos, etc) should have it's own `util-i18n` library with the following structure

```
util-i18n/src/lib
├── assets
│   ├── en-ca.json
│   └── en-us.json
└── translations.spec.ts

```

Although translation files are placed within libs, they will be placed in dist/assets at build time. Here's how assets are configured in the app's project.json:

```json
{
  "input": "libs/esp/common/util-i18n/src/lib/assets",
  "glob": "**/*",
  "output": "assets/esp/i18n"
}
```

Translations are placed within libs to be loaded lazily on demand as scopes ([more about scopes here](https://ngneat.github.io/transloco/docs/lazy-load/scope-configuration)).

In order to use a certain scope within component/module, it should be explicitly specified either within `providers` array of this component/module using `provideLanguageScopes` function or using `withScopes` method of the `CosmosUtilTranslationsModule` (that simply wraps `provideLanguageScopes` under the hood).

```typescript
@Module({
  imports: [
    ...
    CosmosUtilTranslationsModule.withScopes(LanguageScopes.EspCommon, LanguageScopes.EspProducts),
  ]
})
```

```typescript
@Component({
  providers: [
    ...
    provideLanguageScopes(LanguageScopes.EspCommon, LanguageScopes.EspProducts)
  ]
})
```

In the examples above translations for both EspCommon and EspProducts will be lazy loaded.

### Few notes about scopes

1. Transloco also provides an ability to set the `scope` input in the transloco structural directive (e.g. ~~`<ng-container *transloco="let t; scope: 'todos';">`~~), but this approach **SHOULD NOT BE USED**, because it is not type safe.

2. It might seem inconsistent that scopes are referred everywhere with camelCase while all other parts of translations are kebab-cased. This is a consequence of how transloco processes scopes internally. It is possible to overcome it up to a certain point, but to have safer and more straightforward logic it is better to stick to the case of scope names that they're sticking to.

## Adding a new translation scope

To add a new translation scope, you should use the `i18n-scope-lib` workspace generator:

```
  npx nx workspace-generator i18n-scope-lib esp --apps=customer-portal,encore --nestedPath=companies
```

The above command will generate `esp-companies-util-i18n` lib and setup configurations for the "customer-portal" and "encore" apps. In detail, it does the following:

1. generates the new util-i18n library in the given scope with:
   - the structure described in the `Translations architecture overview` section above
   - spec file that includes the `assertTranslationsValid` test (see `Testing` section below for details)
2. adds configuration to the project.json files for specified apps, that require it (see the `project.json` example in the `Translations architecture overview` section above).
3. In cosmos-util-translations:
   - updates the `LanguageScope` enum to include the new scope
   - updates the `languageScopeAbsolutePathMap` to include the absolute path to the folder containing translation files

After running the generator you can go ahead and provide all the needed `LanguageScope` enum values in the module you need using the `provideLanguageScopes` or `CosmosUtilTranslationsModule.withScopes` methods.

## Adding an existing scope to the app

In case you need to link an existing scope to another app in the monorepo, you can run the `i18n-add-language-scope-for-app` generator:

```
  npx nx workspace-generator i18n-add-language-scope-for-app encore --scopeLibName=esp-products-util-i18n
```

This will update the configuration of the specified application to work with the specified scope.

## Adding a new language

To add a new language you should use the `i18n-language` generator:

```
  npx nx workspace-generator i18n-language fr --languageFullName=French
```

This will add empty `fr.json` language files to all `util-i18n` libs within the repository and update the `Languages` enum to include the new language.

Please note that all translation files within a `util-i18n` lib should be equal by their keys, otherwise the unit tests will fail. This means you have to manually go through all these new files and add all the translations for them in the given language.

## Translating in templates

We follow the recommendations of the Transloco team and adhere to the use of the structural directive
https://ngneat.github.io/transloco/docs/translation-in-the-template

```html
<ng-container *transloco="let t">
  <p>{{ t('title') }}</p>

  <comp [title]="t('title')"></comp>
</ng-container>
```

To make the templates cleaner, it is desirable to specify a prefix for the translations that are used in a particular component

```html
<ng-container
  *transloco="let t; read: 'espCommon.companies.company-form.company-brand-information-form'"
>
  <p>{{ t('title') }}</p>
</ng-container>
```

Please note that "espCommon" prefix comes from the value of `LanguageScope` and thus has camelCase format unlike the remaining part of the translation key.

For the given example corresponding translation json will look as follows:

```json
{
  "companies": {
    "company-form": {
      "company-brand-information-form": {
        "title": "Translated Title"
      }
    }
  }
}
```

### Structure of translation files

We follow a top-bottom approach, meaning that we will have the translation library (util-i18n) in the top level of the respective feature.
Say that you have the feature esp/orders, which has already lots of libs. The translations library should be on the esp/orders/util-i18n.

The question now is, how can we structure the JSON files (es-us.json, etc).
Well, since the esp/orders has several libs and each lib has its own name(project.json), we will based on that name to create nested scopes. In other words, first level keys (`esp-orders-feature-invoices`, `esp-orders-feature-order-add-product` etc) represent the full names of corresponding nx libraries (which obviously comes from path). You can see the name of the library in its project.json. Further nesting should be based on the names of the components (see how translations for the `order-add-line-item-card` component end up at `esp-orders-feature-invoices.order-add-line-item-card` nested object)

**Having the below structure**

```
 esp/
    orders 
      feature-order-add-product
      feature-order-currency-conversion
      feature-invoices              
        src                  
          lib                      
            components                          
              order-add-line-item-card
```

**The JSON translation file in esp/orders/util-i18n library will look like this**

```json
{
  "esp-orders-feature-invoices": {
    "order-add-line-item-card": {
      "key": "value",
      "additional-nesting": {
        "if-it": "fits"
      }
    }
  },
  "esp-orders-feature-order-add-product": {
    "key": "value"
  },
  "esp-orders-feature-order-currency-conversion": {
    "key": "value"
  }
}
```

## Recommendations

While working with translations, there're a few things that should be kept in mind.

### Translations are dynamic

Although most of the translations are located in templates, there're certain scenarios when there's a need to translate values from the TS logic: fetched results, dynamic validation errors, enum values and so on. Translating them is a bit different, because you don't have a static key to work with. There's a common mistake to attempt to inject the `translateService` and process translations in the code. Keep in mind that running `translocoService.translate('hello')` will give you 1 final value, that will not be updated once language is changed. There're 2 recommended ways how to overcome this:

- your methods should return an unprocessed key, that will be translated further in a template. The main problem with this approach is that it can be difficult to supply interpolation args that are needed for the translations. Possible workaround is to store an object of `{ key, args }` instead of a key itself: `t('translatable.key', translatable.args)`
- use `translocoService.selectTranslate('hello', args)`, which returns an Observable, that emits each time language is changed. You can subscribe to its value in the template with `| async` pipe.

```ts
// original untranslated code
getValidationError(fileSizeBytes: number): string | undefined {
  if (fileSizeBytes > 1024*100) {
    return 'File size should not exceed 100kb'
  }
}
// WRONG: won't be updated when language is changed
getValidationError(fileSizeBytes: number): string | undefined {
  if (fileSizeBytes > 1024*100) {
    return this.translocoService.translate('myScope.my-component.validation-error');
  }
}
// CORRECT: value will be translated further in the template using "t(validationError)"
getValidationError(fileSizeBytes: number): string | undefined {
  if (fileSizeBytes > 1024*100) {
    return 'myScope.my-component.validation-error'
  }
}
// CORRECT: value will be translated further in the template using "validationError | async"
getValidationError(fileSizeBytes: number): Observable<string> | undefined {
  if (fileSizeBytes > 1024*100) {
    return this.translocoService.selectTranslate('myScope.my-component.validation-error')
  }
}
```

`translocoService.translate` may find application in scenarios, when you need to show something once, e.g. toast messages

```ts

getValidationError(fileSizeBytes: number): string | undefined {
  if (fileSizeBytes > 1024*100) {
    const message = this.translocoService.translate('myScope.my-component.validation-error');
    this.toastService.showError(message);
  }
}
```

**An important note about using "translocoService"**
Since the `translocoService` is provided in the root of the application and our scopes are provided on component level, the service is not able to determine in advance which scopes are required, when it is injected in a certain component.

Because of this it does not run any logic of preloading missing scopes unlike transloco pipe or directive.

This can result in a situation, where calling `this.translocoService.translate('myScope.my-component.validation-error');` will not be able to be resolved to a value of "myScope", because "myScope" wasn't preloaded. Such behavior can be observed mostly in development mode, because on production there're additional optimizations to preload all scopes and languages in advance and cache them.

To overcome this issue, it is possible to use `this.translocoService.getLangChanges$` function with the list of scopes that are expected to be available:

```ts
export class MyComponentOrPipeOrWhatever {
  private scopes = getLanguageScopes();

  getTranslations() {
    // get scopes from injection context or specify them manually
    return this.translocoService
      .getLangChanges$(this.scopes /* or [LanguageScopes.MyScope] */)
      .pipe(
        map(() =>
          this.translocoService.translate(
            'myScope.my-component.validation-error'
          )
        )
      );
  }
}
```

**Translation of pipes, objects and other custom entities**

To translate objects, it is recommended to rely on `translocoService.getLangChanges$(this.scopes)` function in order to get a stream of values that can react on the changed language on the page.

For example, function that returns an array of NavigationItems, should be changed to return an observable of that array.

```ts
// before
export function getMenuItems(): NavigationItem[] {
  return [
    {
      id: MenuItemId.ProductsMenuItem,
      title: 'My Title',
      type: 'item',
    },
    ...
  ]
}
// after
export function getMenuItems(): NavigationItem[] {
  return this._translocoService.getLangChanges$([LanguageScopes.MyScope]).pipe(map(() => ([
    {
      id: MenuItemId.ProductsMenuItem,
      title: this._translocoService.translate('myScope.my-key'),
      type: 'item',
    },
    ...
  ])));
};
```

Pipes usually contain logic that is expected to be memoized in order to avoid extra invocations. In order to have translations in them, the best approach would be to rely on the same principle as described above with the combination of async pipe.

```ts
export class MyPipe implements PipeTransform {
  private scopes = getLanguageScopes();

  transform(value: Record<string, any>): Observable<{ smth: number }> {
    // get scopes from injection context or specify them manually
    return this.translocoService
      .getLangChanges$(this.scopes /* or [LanguageScopes.MyScope] */)
      .pipe(map(() => ({ smth: this._translocoService.translate('my-key') })));
  }
}
```

All such pipes should then be used with additional async pipe, e.g. `{{ obj | myPipe | async }}`

**Translation of enums**

To translate existing enums the best approach is to create a typed object. This will provide type safety if enum is expanded with new values

```ts
enum MyEnum {
  First = 1,
  Second,
}

const enumValues: Record<MyEnum, string> = {
  [MyEnum.First]: 'myScope.my-enum.first',
  [MyEnum.Second]: 'myScope.my-enum.second',
};
```

```html
<div>{{ t( enumValues[MyEnum.First] )}}</div>
```

If at some point we decide to add `MyEnum.Third` value, we will get a compilation error in `enumValues`. This will prevent a scenario when translations are forgotten.

### Different languages may have completely different structure of the sentence

Original and main language translations are based on in the application is English. It is important to keep in mind that existing structure of sentences are specific to English. Other languages (especially radically different like Slavic language group) can construct sentences in a different way. Because of this it is important to not translate part of the sentences apart and use interpolation params

```html
<!-- Original string -->
<div>{{ count + ' symbols remaining' }}</div>

<!-- WRONG -->
<div>{{ count + t('symbols-remaining') }}</div>

<!-- CORRECT -->
<div>{{ t('symbols-remaining', { count: count }) }}</div>
```

Possible values in different languages:

- English/French: 10 symbols remaining / 10 symboles restants
- Ukrainian/Polish: Залишилось 10 символів / Pozostało 10 symboli

As you see, in Slavic languages the "count" value is in the middle of the sentence.

## Translation optimizations

### Build time optimizations

For production builds it is required to use `build-with-deps` target instead of the plain `build`. This target is actually the place where all optimizations are done. It will do the following:

- remove all keys with `.comment` suffix (that are meant to be used to provide meaningful description for the particular key)
- sort jsons alphabetically by keys and minify them

### Runtime optimizations

At the runtime translation files will receive the following optimizations:

- translations are lazy loaded by scopes, so until the given scope is required in the view, it won't be loaded
- if user has good connection (4g or wifi), system will attempt to preload all language files using `requestIdleCallback`

## Testing

### Testing of translation files

Each library that contains translations for a given scope should include `assertTranslationsValid` tests

This is a testing utility that does several things:

- checks if translations with correct filenames are available for all languages according to the `Languages` enum
- checks if translations can be parsed
- checks if all languages are identical by keys to catch any missing translations

```typescript
import { LanguageScope } from '@cosmos/util-translations';
import { assertTranslationsValid } from '@cosmos/util-translations/testing';

describe('EspCommon Translations', () => {
  assertTranslationsValid(LanguageScope.EspCommon);
});
```

### Mocking translations

`cosmos-util-translations` library exposes testing module, that wraps all required APIs to work with translations in unit tests. By default importing `CosUtilTranslationsTestingModule.forRoot()` will load **ALL** scopes for you, so no additional configuration is required

Usage example

```typescript
import { CosUtilTranslationsTestingModule } from '@cosmos/util-translations';

// loading ALL real translations from the LanguageScope enum
CosUtilTranslationsTestingModule.forRoot();
...
this.translocoService.getTranslation() // { esp: { decorations: {...}, company: {...}, ... } }

// using a combination of real/mock translations and customizable transloco config.

CosUtilTranslationsTestingModule.forRoot({
  mockTranslation: { esp: { decorations: { keyToOverride: "overriddenValue" } } },
  translocoConfig: { defaultLang: Languages.EnCa }
});

this.translocoService.getTranslation()
// {
//  esp: {
//   decorations: {
//     keyToOverride: "overriddenValue",
//     realKey: "value from actual translation",
//     "anotherRealKey": "value from actual translation"
//   },
//   company: {...},
//   ...
//  }
// }
```
