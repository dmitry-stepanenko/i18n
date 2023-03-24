import { Pipe, PipeTransform } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';

import { Languages } from '../consts';

// eslint-disable-next-line @angular-eslint/no-pipe-impure
@Pipe({ name: 'languageLabel', standalone: true, pure: false })
export class LanguageLabelPipe extends TranslocoPipe implements PipeTransform {
  override transform(value: Languages): string {
    const langKey = `espCommon.localization.${value}`;
    return super.transform(langKey);
  }
}
