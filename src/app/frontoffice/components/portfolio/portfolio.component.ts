import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FoireService } from '../../../services/foire.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  foiresFrance: any[] = [];
  foiresBelgium: any[] = [];
  foiresSwitzerland: any[] = [];
  isLoading = true;
  
  constructor(
    private foireService: FoireService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadFoires();
  }
  
  loadFoires(): void {
    this.isLoading = true;
    
    // Load France foires
    this.foireService.getFoiresByCountry('FR').subscribe({
      next: (data) => {
        this.foiresFrance = data.filter(f => f.isActive);
      },
      error: (error) => console.error('Error loading France foires:', error)
    });
    
    // Load Belgium foires
    this.foireService.getFoiresByCountry('BE').subscribe({
      next: (data) => {
        this.foiresBelgium = data.filter(f => f.isActive);
      },
      error: (error) => console.error('Error loading Belgium foires:', error)
    });
    
    // Load Switzerland foires
    this.foireService.getFoiresByCountry('CH').subscribe({
      next: (data) => {
        this.foiresSwitzerland = data.filter(f => f.isActive);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading Switzerland foires:', error);
        this.isLoading = false;
      }
    });
  }
  
  onReserve(foire: any): void {
    const foireName = foire.name.toLowerCase().replace(/\s+/g, '-');
    this.router.navigate(['/reservation', foireName]);
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  scrollCarousel(country: string, direction: 'prev' | 'next'): void {
    const carouselId = `${country}-carousel`;
    const carousel = document.getElementById(carouselId);
    
    if (carousel) {
      const scrollAmount = 400;
      const currentScroll = carousel.scrollLeft;
      
      if (direction === 'next') {
        carousel.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      } else {
        carousel.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }
}
