import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';

// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';

import { UiComponentsRoutes } from './ui-components.routing';

// ui components

import { MatNativeDateModule } from '@angular/material/core';
import { AddFoireComponent } from './add-foire/add-foire.component';
import { EditFoireComponent } from './edit-foire/edit-foire.component';
import { ManageFoireTimesComponent } from './manage-foire-times/manage-foire-times.component';
import { AddSliderComponent } from './add-slider/add-slider.component';
import { ExposantComponent } from './exposant/exposant.component';
import { FoireDetailsComponent } from './foire-details/foire-details.component';
import { FoiresComponent } from './foires/foires.component';
import { ReservationComponent } from './reservation/reservation.component';
import { SliderComponent } from './slider/slider.component';
import { SettingsComponent } from './settings/settings.component';
import { EditAboutUsComponent } from './edit-about-us/edit-about-us.component';
import { EditVideoComponent } from './edit-video/edit-video.component';
import { ExcelUploadComponent } from './excel-upload/excel-upload.component';
import { EmailTemplateListComponent } from '../email-templates/email-template-list/email-template-list.component';
import { EmailTemplateEditorComponent } from '../email-templates/email-template-editor/email-template-editor.component';
import { EmailTemplateEditorSimplifiedComponent } from '../email-templates/email-template-editor/email-template-editor-simplified.component';
import { CampaignHistoryComponent } from './campaigns/campaign-history.component';
import { CampaignStatsComponent } from './campaigns/campaign-stats.component';
import { CampaignUsersComponent } from './campaigns/campaign-users.component';
import { BlockListComponent } from '../email-templates/block-list/block-list.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(UiComponentsRoutes),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TablerIconsModule.pick(TablerIcons),
    MatNativeDateModule,
    EmailTemplateListComponent,
    EmailTemplateEditorComponent,
    EmailTemplateEditorSimplifiedComponent,
  ],
  declarations: [
    SliderComponent,
    FoiresComponent,
    ReservationComponent,
    AddFoireComponent,
    EditFoireComponent,
    ManageFoireTimesComponent,
    ExposantComponent,
    FoireDetailsComponent,
    AddSliderComponent,
    SettingsComponent,
    EditAboutUsComponent,
    EditVideoComponent,
    ExcelUploadComponent,
    CampaignHistoryComponent,
    CampaignStatsComponent,
    BlockListComponent
  ],
})
export class UicomponentsModule {}
