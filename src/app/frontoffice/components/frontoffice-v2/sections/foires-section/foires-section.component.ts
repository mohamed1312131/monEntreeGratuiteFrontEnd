import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, HostListener } from '@angular/core';
import { FoireService, Foire as FoireData, DateRange, DayTimeSlot } from 'src/app/services/foire.service';

interface Foire {
  id: number;
  name: string;
  dateRanges: DateRange[];
  dayTimeSlots?: DayTimeSlot[];
  location: string;
  image: string;
  description: string;
  countryCode?: string;
  disponible?: boolean;
}

@Component({
  selector: 'app-foires-section',
  templateUrl: './foires-section.component.html',
  styleUrls: ['./foires-section.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FoiresSectionComponent implements OnInit {
  selectedCountry: 'france' | 'belgique' | 'suisse' = 'france';
  currentFoireSlide = 0;
  itemsPerPage = 3;

  @Output() reserveClick = new EventEmitter<{ foire: Foire; country: string }>();

  foiresByCountry: { [key: string]: Foire[] } = {
    france: [],
    belgique: [],
    suisse: []
  };

  isLoading = true;
  hasError = false;
  errorMessage = '';

  private countryCodeMap: { [key: string]: string } = {
    france: 'FR',
    belgique: 'BE',
    suisse: 'CH'
  };

  constructor(private foireService: FoireService) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadAllFoires();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    // If window is defined (browser environment)
    if (typeof window !== 'undefined') {
      this.itemsPerPage = window.innerWidth <= 768 ? 1 : 3;
      // Re-validate current slide position when screen size changes
      if (this.currentFoires.length > 0) {
        const maxSlide = Math.max(0, this.currentFoires.length - this.itemsPerPage);
        if (this.currentFoireSlide > maxSlide) {
          this.currentFoireSlide = maxSlide;
        }
      }
    }
  }

  private loadAllFoires(): void {
    this.isLoading = true;
    this.hasError = false;

    const countries: ('france' | 'belgique' | 'suisse')[] = ['france', 'belgique', 'suisse'];
    let loadedCount = 0;

    countries.forEach(country => {
      const countryCode = this.countryCodeMap[country];
      this.foireService.getActiveFoiresByCountry(countryCode).subscribe({
        next: (foires: FoireData[]) => {
          this.foiresByCountry[country] = this.mapFoiresToDisplayFormat(foires);
          loadedCount++;
          if (loadedCount === countries.length) {
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error(`Error loading foires for ${country}:`, error);
          loadedCount++;
          if (loadedCount === countries.length) {
            this.isLoading = false;
            if (this.foiresByCountry['france'].length === 0 && 
                this.foiresByCountry['belgique'].length === 0 && 
                this.foiresByCountry['suisse'].length === 0) {
              this.hasError = true;
              this.errorMessage = 'Impossible de charger les foires';
              this.loadFallbackFoires();
            }
          }
        }
      });
    });
  }

  private mapFoiresToDisplayFormat(foires: FoireData[]): Foire[] {
    return foires.map(foire => ({
      id: foire.id,
      name: foire.name,
      dateRanges: foire.dateRanges || [],
      dayTimeSlots: foire.dayTimeSlots || [],
      location: foire.location || this.formatLocation(foire),
      image: foire.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      description: foire.description || '',
      countryCode: foire.countryCode,
      disponible: foire.disponible
    }));
  }

  formatDateRangeDisplay(range: DateRange): string {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    
    if (range.startDate === range.endDate) {
      return start.toLocaleDateString('fr-FR', options);
    }
    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('fr-FR', options)}`;
  }

  private formatLocation(foire: FoireData): string {
    const parts: string[] = [];
    if (foire.venue) parts.push(foire.venue);
    if (foire.city) parts.push(foire.city);
    return parts.length > 0 ? parts.join(', ') : 'À définir';
  }

  private loadFallbackFoires(): void {
    this.foiresByCountry = {
      france: [
        {
          id: 1,
          name: "Foire de Paris 2024",
          dateRanges: [{ startDate: "2024-03-15", endDate: "2024-03-20" }],
          location: "Paris Expo",
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
          description: "La plus grande foire de France"
        },
        {
          id: 2,
          name: "Salon de Lyon",
          dateRanges: [{ startDate: "2024-04-05", endDate: "2024-04-10" }],
          location: "Eurexpo Lyon",
          image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
          description: "Gastronomie et vins"
        },
        {
          id: 3,
          name: "Foire de Marseille",
          dateRanges: [{ startDate: "2024-05-01", endDate: "2024-05-07" }],
          location: "Parc Chanot",
          image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
          description: "Événement méditerranéen"
        }
      ],
      belgique: [
        {
          id: 4,
          name: "Foire de Bruxelles",
          dateRanges: [{ startDate: "2024-03-10", endDate: "2024-03-15" }],
          location: "Brussels Expo",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
          description: "L'événement de Belgique"
        },
        {
          id: 5,
          name: "Salon d'Anvers",
          dateRanges: [{ startDate: "2024-04-20", endDate: "2024-04-25" }],
          location: "Antwerp Expo",
          image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
          description: "Innovation et design"
        }
      ],
      suisse: [
        {
          id: 6,
          name: "Foire de Genève",
          dateRanges: [{ startDate: "2024-06-05", endDate: "2024-06-10" }],
          location: "Palexpo",
          image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
          description: "Excellence suisse"
        },
        {
          id: 7,
          name: "Salon de Zurich",
          dateRanges: [{ startDate: "2024-06-15", endDate: "2024-06-20" }],
          location: "Messe Zürich",
          image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
          description: "Innovation et technologie"
        }
      ]
    };
  }

  get currentFoires(): Foire[] {
    return this.foiresByCountry[this.selectedCountry];
  }

  selectCountry(country: 'france' | 'belgique' | 'suisse'): void {
    this.selectedCountry = country;
    this.currentFoireSlide = 0;
  }

  nextFoireSlide(): void {
    const maxSlide = Math.max(0, this.currentFoires.length - this.itemsPerPage);
    this.currentFoireSlide = Math.min(this.currentFoireSlide + 1, maxSlide);
  }

  prevFoireSlide(): void {
    this.currentFoireSlide = Math.max(this.currentFoireSlide - 1, 0);
  }

  canSlidePrev(): boolean {
    return this.currentFoireSlide > 0;
  }

  canSlideNext(): boolean {
    return this.currentFoireSlide < this.currentFoires.length - this.itemsPerPage;
  }

  getTransformStyle(): string {
    const percentage = 100 / this.itemsPerPage;
    return `translateX(-${this.currentFoireSlide * percentage}%)`;
  }

  onReserve(foire: Foire, countryName: string): void {
    this.reserveClick.emit({ foire, country: countryName });
  }
}