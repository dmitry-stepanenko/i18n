import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { CosCardModule } from '@cosmos/components/card';

@Component({
  selector: 'customer-portal-presentation-cart-loader',
  templateUrl: './presentation-cart-loader.component.html',
  styleUrls: ['./presentation-cart-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule, CosCardModule],
})
export class PresentationCartLoaderComponent {}
