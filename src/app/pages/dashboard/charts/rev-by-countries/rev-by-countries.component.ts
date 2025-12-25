import { Component, ViewChild, OnInit } from '@angular/core';
import { 
  ApexAxisChartSeries, 
  ApexChart, 
  ChartComponent, 
  ApexDataLabels, 
  ApexPlotOptions, 
  ApexYAxis, 
  ApexTitleSubtitle, 
  ApexXAxis, 
  ApexFill 
} from 'ng-apexcharts';
import { DashboardStatisticsService } from '../../../../services/dashboard-statistics.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
  colors?: string[];
};

@Component({
  selector: 'app-rev-by-countries',
  templateUrl: './rev-by-countries.component.html',
  styleUrl: './rev-by-countries.component.scss'
})
export class RevByCountriesComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: Partial<ChartOptions> | null = null;
  public selectedYear: number;
  public years: number[] = [];
  public isLoading = false;
  public errorMessage: string | null = null;

  constructor(private dashboardStatisticsService: DashboardStatisticsService) {
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    // Generate years from 2020 to current year + 1
    for (let year = 2020; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.loadReservations(this.selectedYear);
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.loadReservations(year);
  }

  private loadReservations(year: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.dashboardStatisticsService.getReservationsByCountry(year).subscribe({
      next: (data) => {
        console.log('Reservations by country:', data);
        
        // Transform backend response to chart format
        const countries = data.map((item: any) => item.country);
        const reservations = data.map((item: any) => item.count);
        
        this.chartOptions = this.createChartOptions(year, countries, reservations);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching reservations:', error);
        this.errorMessage = 'Impossible de charger les réservations. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  private createChartOptions(year: number, countries: string[], reservations: number[]): Partial<ChartOptions> {
    return {
      series: [
        {
          name: 'Réservations',
          data: reservations,
        },
      ],
      chart: {
        height: 400,
        type: 'bar',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val.toString(),
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
      },
      xaxis: {
        categories: countries,
        title: {
          text: 'Pays',
        },
      },
      yaxis: {
        title: {
          text: 'Nombre de Réservations',
        },
      },
      fill: {
        opacity: 1,
      },
      title: {
        text: `Réservations pour ${year}`,
        align: 'center',
        style: {
          fontSize: '18px',
          color: '#444',
        },
      },
    };
  }
}
