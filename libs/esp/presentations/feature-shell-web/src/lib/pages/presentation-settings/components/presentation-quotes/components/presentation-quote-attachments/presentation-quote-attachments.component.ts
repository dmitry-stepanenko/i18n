import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';

import { trackItem } from '@cosmos/core';
import { LocalStateRenderStrategy } from '@cosmos/state';
import { MediaLink } from '@cosmos/types-party';
import { AsiExpandedImageViewComponent } from '@esp/common/ui-expanded-image-view';
import { AsiImgExpandableComponent } from '@esp/common/ui-img-expandable';

import { PresentationQuoteLocalState } from '../../../../../../local-states';

@UntilDestroy()
@Component({
  selector: 'esp-presentation-quote-attachments',
  templateUrl: './presentation-quote-attachments.component.html',
  styleUrls: ['./presentation-quote-attachments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    AsiImgExpandableComponent,
    AsiExpandedImageViewComponent,
  ],
})
export class PresentationQuoteAttachmentsComponent {
  trackById = trackItem<MediaLink>(['MediaId']);

  constructor(
    private readonly ref: ChangeDetectorRef,
    // private readonly filesService: FilesService,
    public readonly state: PresentationQuoteLocalState
  ) {
    state.connect(this, { renderStrategy: LocalStateRenderStrategy.Local });
  }

  get title(): string {
    const MediaLinks = this.state.quote?.MediaLinks;

    return MediaLinks && MediaLinks?.length === 1
      ? 'Attachment (1)'
      : `Attachments (${MediaLinks?.length})`;
  }
}
