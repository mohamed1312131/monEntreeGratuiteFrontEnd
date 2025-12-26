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
import { UserVisitService } from '../../../../services/user-visit.service';

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

// Component for tracking visits by country
@Component({
  selector: 'app-track-by-countries',
  templateUrl: './track-by-countries.component.html',
  styleUrl: './track-by-countries.component.scss'
})
export class TrackByCountriesComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: Partial<ChartOptions> | null = null;
  public selectedYear: number;
  public years: number[] = [];
  public isLoading = false;
  public errorMessage: string | null = null;
  public totalVisits = 0;

  constructor(private userVisitService: UserVisitService) {
    const currentYear = new Date().getFullYear();
    this.selectedYear = currentYear;
    // Generate years from 2020 to current year + 1
    for (let year = 2020; year <= currentYear + 1; year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.loadVisits(this.selectedYear);
  }

  onYearChange(year: number): void {
    this.selectedYear = year;
    this.loadVisits(year);
  }

  private loadVisits(year: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userVisitService.getVisitsByCountryAndYear(year).subscribe({
      next: (data) => {
        console.log('Visits by country:', data);
        
        // Transform response to chart format
        const countries = Object.keys(data);
        const visits = Object.values(data);
        
        // Calculate total visits
        this.totalVisits = visits.reduce((sum, count) => sum + count, 0);
        
        this.chartOptions = this.createChartOptions(year, countries, visits);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching visits:', error);
        this.errorMessage = 'Impossible de charger les visites. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  private createChartOptions(year: number, countries: string[], visits: number[]): Partial<ChartOptions> {
    return {
      series: [
        {
          name: 'Visiteurs',
          data: visits,
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
          columnWidth: '55%',
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
        labels: {
          rotate: -45,
          rotateAlways: countries.length > 5,
        },
      },
      yaxis: {
        title: {
          text: 'Nombre de Visiteurs',
        },
      },
      fill: {
        opacity: 1,
      },
      title: {
        text: `Visiteurs par Pays - ${year}`,
        align: 'center',
        style: {
          fontSize: '18px',
          color: '#444',
        },
      },
      colors: ['#5D87FF'],
    };
  }
}
