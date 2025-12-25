import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { 
  ApexChart, 
  ApexNonAxisChartSeries, 
  ApexResponsive
} from 'ng-apexcharts';
import { DashboardStatisticsService } from '../../../../services/dashboard-statistics.service';

export interface ChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
}

@Component({
  selector: 'app-rev-by-age',
  templateUrl: './rev-by-age.component.html',
  styleUrl: './rev-by-age.component.scss'
})
export class RevByAgeComponent implements OnInit {
  public chartOptions: Partial<ChartOptions> | undefined;
  public loading = true;

  public years: number[] = [];
  public countries: string[] = ["FR", "BE", "CH"];
  
  public selectedYear: number;
  public selectedCountry = "FR";

  constructor(
    private dashboardStatisticsService: DashboardStatisticsService,
    private cdr: ChangeDetectorRef
  ) {
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    // Generate years from 2023 to current year + 1
    for (let year = 2023; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.updateChart();
  }

  updateChart(): void {
    this.loading = true;
    this.dashboardStatisticsService.getReservationsByAge(this.selectedYear, this.selectedCountry)
      .subscribe({
        next: (response) => {
          console.log('API Response:', response);
  
          if (!response || typeof response !== 'object' || Object.keys(response).length === 0) {
            console.error('Invalid or empty response', response);
            this.chartOptions = undefined;
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
  
          const reservations = [
            this.safeParseNumber(response['MOINS']),
            this.safeParseNumber(response['ENTRE']),
            this.safeParseNumber(response['PLUS'])
          ];
  
          // Check if all values are zero (indicating no meaningful data)
          if (reservations.every(val => val === 0)) {
            console.warn('No meaningful data available');
            this.chartOptions = undefined;
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
  
          this.chartOptions = {
            series: reservations,
            chart: {
              type: 'pie',
              height: 350,
              width: '100%'
            },
            labels: ["moins de 35 ans", "entre 35 et 70", "plus de 70"],
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  position: "bottom"
                }
              }
            }]
          };
  
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching reservations', error);
          this.loading = false;
          this.chartOptions = undefined;
          this.cdr.detectChanges();
        }
      });
  }

  private safeParseNumber(value: any): number {
    return value !== null && value !== undefined && !isNaN(Number(value)) 
      ? Number(value) 
      : 0;
  }
}
