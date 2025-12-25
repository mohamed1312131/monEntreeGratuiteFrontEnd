import { Routes } from '@angular/router';
import { AppDashboardComponent } from './dashboard/dashboard.component';
import { ExposantRequestsComponent } from '../backoffice/components/exposant-requests/exposant-requests.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: AppDashboardComponent,
    data: {
      title: 'Starter Page',
    },
  },
  {
    path: 'exposant-requests',
    component: ExposantRequestsComponent,
    data: {
      title: 'Demandes Exposants',
    },
  },
];
