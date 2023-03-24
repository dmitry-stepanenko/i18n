import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { authGuard } from '@esp/auth/data-access-auth';

import { ShouldCreatePresentationGuard } from './guards';
import {
  PresentationDetailPage,
  PresentationDetailPageModule,
  PresentationSettingsPage,
  PresentationSettingsPageModule,
} from './pages';
import { LoadPresentationResolver } from './resolvers';

const routes: Route[] = [
  {
    path: 'search',
    loadChildren: () =>
      import(
        /* webpackChunkName: 'presentation-search' */ './pages/presentation-search'
      ).then((m) => m.PresentationSearchPageModule),
    data: {
      analytics: {
        page: 'PresentationSearchPage',
      },
      meta: { title: 'Search' },
    },
    canActivate: [authGuard.canActivate],
  },
  {
    path: '',
    component: PresentationDetailPage,
    data: {
      analytics: {
        page: 'PresentationDetail',
      },
    },
    canActivate: [authGuard.canActivate],
    children: [
      {
        path: '',
        loadChildren: () =>
          import(
            /* webpackChunkName: 'create-presentation' */ './pages/create-presentation'
          ).then((m) => m.CreatePresentationPageModule),
        canActivate: [ShouldCreatePresentationGuard],
      },
      {
        path: ':presentationId',
        component: PresentationSettingsPage,
        resolve: [LoadPresentationResolver],
      },
      {
        path: ':presentationId/product/:productId',
        loadChildren: async () =>
          (
            await import(
              /* webpackChunkName: 'presentation-product' */ './pages/presentation-product/presentation-product.page'
            )
          ).PresentationProductPageModule,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PresentationDetailPageModule,
    PresentationSettingsPageModule,
  ],
})
export class PresentationsRoutingModule {}
