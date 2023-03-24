import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { TRANSLOCO_CONFIG } from '@ngneat/transloco';
import {
  EMPTY,
  Observable,
  expand,
  forkJoin,
  mergeMap,
  throwError,
  timer,
} from 'rxjs';

import { IDLE$ } from '@cosmos/tick-scheduler';
import { hasGoodConnection } from '@cosmos/util-connection-state';

import { CosmosTranslocoConfig } from '../interfaces/config.interface';
import { listAllTranslations, toLangValue } from '../utils';

import { CosmosTranslocoService } from './cosmos-transloco.service';

interface PreloadLangsParams {
  /** The concurrency limit for simultaneous requests */
  simultaneousRequestsCount: number;
  /** Amount of time to wait before initiating the preload */
  initDelay: number;
}

export const PRELOAD_LANGS_PARAMS = new InjectionToken<PreloadLangsParams>(
  'PreloadLangsParams'
);

@Injectable({ providedIn: 'root' })
export class TranslocoPreloadLangsService {
  private langsPreloadQueue: string[][];
  private params: PreloadLangsParams;

  constructor(
    @Inject(TRANSLOCO_CONFIG)
    private readonly translocoConfig: CosmosTranslocoConfig,
    @Inject(IDLE$) private readonly idle$: Observable<void>,
    private readonly translocoService: CosmosTranslocoService,
    @Optional()
    @Inject(PRELOAD_LANGS_PARAMS)
    providedParams?: Partial<PreloadLangsParams>
  ) {
    this.params = {
      simultaneousRequestsCount: 2,
      initDelay: 10000,
      ...(providedParams ?? {}),
    };
    this.langsPreloadQueue = this.getQueue();
    this.init();
  }

  private init(): void {
    if (ngDevMode || !hasGoodConnection()) {
      // disabling preloading for dev mode in order to be able to catch issues
      // with scopes not specified properly
      return;
    }

    timer(this.params.initDelay)
      .pipe(
        expand(() => {
          if (this.langsPreloadQueue.length) {
            return this.preloadPart();
          }
          return EMPTY;
        })
      )
      // eslint-disable-next-line rxjs-angular/prefer-takeuntil
      .subscribe();
  }

  private getQueue(): string[][] {
    const lang = this.translocoService.getActiveLang();

    const translations = listAllTranslations(
      this.translocoConfig.availableScopes,
      lang
    );
    const queue = [];

    const count = this.params.simultaneousRequestsCount;
    for (let index = 0; index < translations.length; index += count) {
      queue.push(
        translations.slice(index, index + count).map((el) => toLangValue(el))
      );
    }
    return queue;
  }

  private preloadPart() {
    if (!this.langsPreloadQueue.length) {
      return throwError(() => new Error('Queue is empty'));
    }
    const requests = this.langsPreloadQueue
      .shift()!
      .map((lang) => this.translocoService.load(lang));
    return this.idle$.pipe(mergeMap(() => forkJoin(requests)));
  }
}
