import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgApexchartsModule, ChartComponent, ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexXAxis, ApexPlotOptions, ApexStroke, ApexTitleSubtitle, ApexYAxis, ApexTooltip, ApexFill, ApexLegend } from 'ng-apexcharts';
import { DashboardStatisticsService, SeriesData } from '../../../../services/dashboard-statistics.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
};

@Component({
  selector: 'app-expo-chart',
  templateUrl: './expo-chart.component.html',
  styleUrl: './expo-chart.component.scss'
})
export class ExpoChartComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: Partial<ChartOptions>;

  // All available series
  public allSeries: ApexAxisChartSeries = [];

  // Selected series (default: all selected)
  public selectedSeries: ApexAxisChartSeries = [];

  // Loading state
  public isLoading = true;

  // Countries for x-axis
  private countries: string[] = [];

  constructor(private dashboardStatisticsService: DashboardStatisticsService) {
    this.chartOptions = {};
  }

  ngOnInit(): void {
    this.loadExpoChartData();
  }

  // Load expo chart data from backend
  private loadExpoChartData(): void {
    this.isLoading = true;
    
    this.dashboardStatisticsService.getExpoChartData().subscribe({
      next: (data) => {
        this.countries = data.countries;
        
        // Convert backend series to ApexCharts format
        this.allSeries = data.series.map(s => ({
          name: s.name,
          data: s.data
        }));
        
        // Select all series by default
        this.selectedSeries = [...this.allSeries];
        
        // Initialize chart with data
        this.initializeChartOptions();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading expo chart data:', error);
        // Use fallback data if backend fails
        this.useFallbackData();
        this.isLoading = false;
      }
    });
  }

  // Fallback data in case backend is unavailable
  private useFallbackData(): void {
    this.countries = ['France', 'Belgique', 'Suisse'];
    this.allSeries = [
      { name: 'Male - Moniteur', data: [40, 50, 30] },
      { name: 'Female - Moniteur', data: [20, 30, 25] },
      { name: 'Male - Coach', data: [15, 25, 35] },
      { name: 'Female - Coach', data: [10, 15, 20] }
    ];
    this.selectedSeries = [...this.allSeries];
    this.initializeChartOptions();
  }

  // Initialize chart options
  private initializeChartOptions(): void {
    this.chartOptions = {
      series: this.selectedSeries,
      chart: {
        type: 'bar',
        height: 350,
        stacked: true,
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      stroke: {
        width: 1,
        colors: ['#fff'],
      },
      title: {
        text: "Nombre d'exposants par pays, sexe et secteur",
      },
      xaxis: {
        categories: this.countries,
        labels: {
          formatter: function (val) {
            return val + '';
          },
        },
      },
      yaxis: {
        title: {
          text: undefined,
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + ' Exposants';
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: 40,
      },
    };
  }

  // Update chart series based on user selection
  public updateSeries(): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: this.selectedSeries
    };
  }
}
