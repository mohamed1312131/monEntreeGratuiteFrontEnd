import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PagesRoutes } from './pages.routing.module';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
// icons
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';
import { AppDashboardComponent } from './dashboard/dashboard.component';
import { ExposantRequestsComponent } from '../backoffice/components/exposant-requests/exposant-requests.component';
import { ExpoChartComponent } from './dashboard/charts/expo-chart/expo-chart.component';
import { LatestRevComponent } from './dashboard/charts/latest-rev/latest-rev.component';
import { MainChartComponent } from './dashboard/charts/main-chart/main-chart.component';
import { RevByAgeComponent } from './dashboard/charts/rev-by-age/rev-by-age.component';
import { RevByCountriesComponent } from './dashboard/charts/rev-by-countries/rev-by-countries.component';
import { TrackByCountriesComponent } from './dashboard/charts/track-by-countries/track-by-countries.component';

@NgModule({
  declarations: [AppDashboardComponent,RevByCountriesComponent, ExposantRequestsComponent,MainChartComponent,TrackByCountriesComponent,RevByAgeComponent,ExpoChartComponent,LatestRevComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    NgApexchartsModule,
    RouterModule.forChild(PagesRoutes),
    TablerIconsModule.pick(TablerIcons),
  ],
  exports: [TablerIconsModule],
})
export class PagesModule {}
