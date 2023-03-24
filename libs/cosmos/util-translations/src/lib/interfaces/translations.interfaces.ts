import { HashMap } from '@ngneat/transloco';

export interface TranslationsData {
  key: string;
  params?: HashMap;
  translated?: boolean;
}
