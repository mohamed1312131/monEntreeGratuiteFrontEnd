import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  // Admin area under /admin
  {
    path: 'admin',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'authentication/login' },
      {
        path: '',
        component: BlankComponent,
        children: [
          {
            path: 'authentication',
            loadChildren: () =>
              import('./pages/authentication/authentication.module').then(
                (m) => m.AuthenticationModule
              ),
          },
        ],
      },
      {
        path: '',
        component: FullComponent,
        canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadChildren: () =>
              import('./pages/pages.module').then((m) => m.PagesModule),
          },
          {
            path: 'ui-components',
            loadChildren: () =>
              import('./pages/ui-components/ui-components.module').then(
                (m) => m.UicomponentsModule
              ),
          },
          {
            path: 'extra',
            loadChildren: () =>
              import('./pages/extra/extra.module').then((m) => m.ExtraModule),
          },
        ],
      },
    ],
  },
  // Frontoffice (user-facing) at site root - must be last before wildcard
  {
    path: '',
    loadChildren: () =>
      import('./frontoffice/frontoffice.module').then((m) => m.FrontofficeModule),
  },
  // Fallback to frontoffice
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
