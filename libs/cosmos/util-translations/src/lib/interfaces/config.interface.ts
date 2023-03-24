import { TranslocoConfig } from '@ngneat/transloco';

import { LanguageScope } from '../consts';

export type CosmosTranslocoConfig = TranslocoConfig & {
  availableScopes: LanguageScope[];
};
