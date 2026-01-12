import { Routes } from '@angular/router';
import { ExposantComponent } from './exposant/exposant.component';
import { FoiresComponent } from './foires/foires.component';
import { ReservationComponent } from './reservation/reservation.component';
import { SliderComponent } from './slider/slider.component';
import { SettingsComponent } from './settings/settings.component';
import { ExcelUploadComponent } from './excel-upload/excel-upload.component';
import { EmailTemplateListComponent } from '../email-templates/email-template-list/email-template-list.component';
import { EmailTemplateEditorComponent } from '../email-templates/email-template-editor/email-template-editor.component';
import { EmailTemplateEditorSimplifiedComponent } from '../email-templates/email-template-editor/email-template-editor-simplified.component';
import { NewsletterManagementComponent } from '../newsletter-management/newsletter-management.component';
import { PublicUnsubscribeComponent } from '../public-unsubscribe/public-unsubscribe.component';
import { BlockListComponent } from '../email-templates/block-list/block-list.component';

export const UiComponentsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'carousel',
        component: SliderComponent,
        data: { fullWidth: true }
      },
      {
        path: 'Foires',
        component: FoiresComponent,
        data: { fullWidth: true }
      },
      {
        path: 'Reservation',
        component: ReservationComponent,
        data: { fullWidth: true }
      },
      {
        path: 'Exposant',
        component: ExposantComponent,
        data: { fullWidth: true }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { fullWidth: true }
      },
      {
        path: 'excel-upload',
        component: ExcelUploadComponent,
        data: { fullWidth: true }
      },
      {
        path: 'email-templates',
        component: EmailTemplateListComponent,
        data: { fullWidth: true }
      },
      {
        path: 'email-templates/editor',
        component: EmailTemplateEditorSimplifiedComponent,
        data: { fullWidth: true }
      },
      {
        path: 'email-templates/editor/:id',
        component: EmailTemplateEditorComponent,
        data: { fullWidth: true }
      },
      {
        path: 'email-templates/newsletter-subscribers',
        component: NewsletterManagementComponent,
        data: { fullWidth: true }
      },
      {
        path: 'email-templates/block-list',
        component: BlockListComponent,
        data: { fullWidth: true }
      },
      {
        path: 'unsubscribe/:token',
        component: PublicUnsubscribeComponent,
        data: { fullWidth: true }
      },
      /*{
        path: 'session',
        component: SessionComponent,
      },
      {
        path: 'calendrier',
        component: CalendarComponent,
      }*/
    ],
  },
];
