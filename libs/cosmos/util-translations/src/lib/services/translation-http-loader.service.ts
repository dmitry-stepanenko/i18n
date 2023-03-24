import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import { kebabCase } from 'lodash-es';
import { Observable } from 'rxjs';

import { Languages } from '../consts';

@Injectable({ providedIn: 'root' })
export class TranslationsHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: Languages): Observable<Translation> {
    const path = this.getLangPath(lang);
    return this.http.get<Translation>(`/assets/i18n/${path}.json`);
  }

  getLangPath(lang: Languages): string {
    // For scoped languages values here will look like "espCommon/en-us".
    // Since we're using kebab case for folder names, converting "lang" value into "esp-common/en-us".
    return lang
      .split('/')
      .map((s) => kebabCase(s))
      .join('/');
  }
}
