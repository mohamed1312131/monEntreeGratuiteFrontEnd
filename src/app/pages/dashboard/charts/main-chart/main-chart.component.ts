import { Component, OnInit } from '@angular/core';
import { DashboardStatisticsService } from '../../../../services/dashboard-statistics.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexPlotOptions,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-main-chart',
  templateUrl: './main-chart.component.html',
  styleUrl: './main-chart.component.scss'
})
export class MainChartComponent implements OnInit {
  public salesOverviewChart: Partial<ChartOptions> | null = null;
  selectedYear: number;
  years: number[] = [];
  isLoading = true;

  constructor(private dashboardStatisticsService: DashboardStatisticsService) {
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    // Generate years from 2023 to current year + 1
    for (let year = 2023; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.updateSalesOverviewChart(this.selectedYear);
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.updateSalesOverviewChart(year);
  }

  updateSalesOverviewChart(year: number): void {
    this.isLoading = true;
    
    this.dashboardStatisticsService.getMonthlyData(year).subscribe({
      next: (data) => {
        this.salesOverviewChart = {
          series: [
            {
              name: 'Entrées Utilisateurs',
              data: data.monthlyUserEntries,
              color: '#5D87FF',
            },
            {
              name: 'Réservations',
              data: data.monthlyReservations,
              color: '#49BEFF',
            },
          ],
          chart: {
            type: 'bar',
            height: 390,
            toolbar: { show: true },
          },
          plotOptions: {
            bar: { horizontal: false, columnWidth: '80%', borderRadius: 4 },
          },
          xaxis: {
            categories: [
              'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
              'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
            ],
          },
          yaxis: {
            title: { text: 'Comptes' },
          },
          stroke: {
            width: 3,
            colors: ['transparent'],
          },
          tooltip: { theme: 'light' },
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching monthly data', error);
        this.isLoading = false;
      }
    });
  }
}
