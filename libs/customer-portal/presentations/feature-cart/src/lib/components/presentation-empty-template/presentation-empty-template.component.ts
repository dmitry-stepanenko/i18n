import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CosButtonModule } from '@cosmos/components/button';
import { EmptyTemplate } from '@esp/presentations/types';

@Component({
  selector: 'customer-portal-presentation-empty-template',
  templateUrl: './presentation-empty-template.component.html',
  styleUrls: ['./presentation-empty-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CosButtonModule, RouterModule],
})
export class PresentationEmptyTemplateComponent {
  @Input()
  template!: EmptyTemplate;
}
