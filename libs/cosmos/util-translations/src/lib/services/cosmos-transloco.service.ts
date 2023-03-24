import { Injectable } from '@angular/core';
import {
  HashMap,
  TranslateParams,
  // eslint-disable-next-line no-restricted-imports
  TranslocoService,
} from '@ngneat/transloco';
import { Observable, forkJoin, map, switchMap } from 'rxjs';

import { LanguageScope, Languages } from '../consts';
import { toLangValue } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class CosmosTranslocoService extends TranslocoService {
  override translate<T = string>(
    key: TranslateParams,
    params?: HashMap,
    lang?: string
  ): T {
    if (typeof key === 'string') {
      const showTranslations = window.localStorage.getItem('showTranslations');

      if (showTranslations === 'true') {
        return ('$$$' + super.translate(key, params, lang)) as T;
      }
    }

    return super.translate(key, params, lang);
  }

  /**
   * Method that returns the same Observable as `langChanges$`.
   * It accepts the list of scopes and makes sure they're preloaded before emitting.
   */
  getLangChanges$(
    translocoScopes: LanguageScope[] | null
  ): Observable<Languages> {
    const langChanges$ = this.langChanges$ as Observable<Languages>;

    if (!translocoScopes) {
      return langChanges$;
    }

    return langChanges$.pipe(
      switchMap((lang) => {
        const paths = translocoScopes.map((scope) =>
          toLangValue({ lang, scope })
        );

        return forkJoin(paths.map((p) => super._loadDependencies(p))).pipe(
          map(() => lang)
        );
      })
    );
  }

  override getActiveLang(): Languages {
    return super.getActiveLang() as Languages;
  }
}
