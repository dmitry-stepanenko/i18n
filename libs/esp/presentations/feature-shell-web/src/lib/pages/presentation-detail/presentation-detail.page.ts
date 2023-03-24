import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'esp-presentation-detail',
  templateUrl: './presentation-detail.page.html',
  styleUrls: ['./presentation-detail.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentationDetailPage {}

@NgModule({
  declarations: [PresentationDetailPage],
  imports: [RouterModule],
  exports: [PresentationDetailPage],
})
export class PresentationDetailPageModule {}
