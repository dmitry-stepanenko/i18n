import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'customer-portal-not-found-page',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CustomerPortalNotFoundPage {}
