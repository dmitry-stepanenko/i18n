import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { skip } from 'rxjs/operators';

import { CosmosTranslocoService } from './cosmos-transloco.service';

const STORAGE_LANGUAGE_KEY = 'i18n_selected_lang';

@Injectable({ providedIn: 'root' })
export class TranslocoPersistLangService {
  private readonly _initializedSubject$ = new BehaviorSubject(false);
  readonly initialized$ = this._initializedSubject$.asObservable();

  constructor(private service: CosmosTranslocoService) {
    if (global_isBrowser) {
      this.init();
    }
  }

  clear() {
    global_isBrowser && localStorage.removeItem(STORAGE_LANGUAGE_KEY);
  }

  private updateStorageOnLangChange(): Subscription {
    return this.service.langChanges$.pipe(skip(1)).subscribe((lang) => {
      this.save(lang);
    });
  }

  private init() {
    // We need to first set the cached lang and then listen to changes
    this.setActiveLang();
    this.updateStorageOnLangChange();
    this._initializedSubject$.next(true);
  }

  private setActiveLang() {
    const cachedLang = localStorage.getItem(STORAGE_LANGUAGE_KEY);

    if (cachedLang && this.service.isLang(cachedLang)) {
      this.service.setActiveLang(cachedLang);
    }
  }

  private save(lang: string) {
    localStorage.setItem(STORAGE_LANGUAGE_KEY, lang);
  }
}
