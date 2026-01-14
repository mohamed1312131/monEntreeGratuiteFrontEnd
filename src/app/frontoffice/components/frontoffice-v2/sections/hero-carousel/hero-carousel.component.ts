import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { SliderService, SliderData } from 'src/app/services/slider.service';

interface HeroSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  foireId?: number;
}

@Component({
  selector: 'app-hero-carousel',
  templateUrl: './hero-carousel.component.html',
  styleUrls: ['./hero-carousel.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  // Current slide index
  currentSlide = 0;

  // Auto-slide timer reference
  private autoSlideTimer?: ReturnType<typeof setInterval>;

  // Output event when user clicks reservation button
  @Output() reservationClick = new EventEmitter<HeroSlide>();

  // Input to allow parent to provide custom slides (optional)
  @Input() slides?: HeroSlide[];

  // Input to control auto-slide (default: true)
  @Input() autoSlide = true;

  // Input to control auto-slide interval in ms (default: 6000)
  @Input() autoSlideIntervalMs = 6000;

  // Hero slides loaded from backend
  heroSlides: HeroSlide[] = [];
  
  // Loading state
  isLoading = true;
  hasError = false;

  constructor(private sliderService: SliderService) {}

  ngOnInit(): void {
    // Use custom slides if provided
    if (this.slides && this.slides.length > 0) {
      this.heroSlides = this.slides;
      this.isLoading = false;
      if (this.autoSlide) {
        this.startAutoSlide();
      }
    } else {
      // Fetch slides from backend
      this.loadSliders();
    }
  }

  /**
   * Load sliders from backend API
   */
  private loadSliders(): void {
    this.isLoading = true;
    this.hasError = false;

    this.sliderService.getActiveSliders().subscribe({
      next: (sliders: SliderData[]) => {
        this.heroSlides = this.mapSlidersToHeroSlides(sliders);
        this.isLoading = false;

        // Start auto-slide if enabled and we have slides
        if (this.autoSlide && this.heroSlides.length > 0) {
          this.startAutoSlide();
        }
      },
      error: (error) => {
        console.error('Error loading sliders:', error);
        this.hasError = true;
        this.isLoading = false;
        // Use fallback slides on error
        this.heroSlides = this.getFallbackSlides();
        if (this.autoSlide && this.heroSlides.length > 0) {
          this.startAutoSlide();
        }
      }
    });
  }

  /**
   * Map backend SliderData to HeroSlide format
   */
  private mapSlidersToHeroSlides(sliders: SliderData[]): HeroSlide[] {
    return sliders.map((slider, index) => ({
      id: slider.id,
      title: slider.foireName || `Événement ${index + 1}`,
      description: 'Découvrez nos foires et salons exceptionnels',
      image: slider.imageUrl,
      location: 'France & Europe',
      foireId: slider.foireId
    }));
  }

  /**
   * Fallback slides in case of API error
   */
  private getFallbackSlides(): HeroSlide[] {
    return [
      {
        id: 1,
        title: "Grande Foire Gastronomique 2024",
        description: "Découvrez les saveurs exceptionnelles et participez à des ateliers culinaires",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&q=80",
        location: "Paris, France"
      },
      {
        id: 2,
        title: "Salon du Vin et de la Gastronomie",
        description: "Une expérience unique pour les amateurs de vins fins",
        image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&q=80",
        location: "Lyon, France"
      },
      {
        id: 3,
        title: "Festival des Saveurs du Monde",
        description: "Voyagez à travers les cuisines du monde entier",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80",
        location: "Marseille, France"
      }
    ];
  }

  ngOnDestroy(): void {
    // Clean up interval on component destroy
    this.stopAutoSlide();
  }

  /**
   * Navigate to next slide
   */
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    this.resetAutoSlide();
  }

  /**
   * Navigate to previous slide
   */
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.resetAutoSlide();
  }

  /**
   * Set slide to specific index
   * @param index - The index of the slide to navigate to
   */
  setSlide(index: number): void {
    if (index >= 0 && index < this.heroSlides.length) {
      this.currentSlide = index;
      this.resetAutoSlide();
    }
  }

  /**
   * Handle reservation button click
   * Emits the current slide data to parent component
   */
  openHeroReservation(): void {
    const currentSlide = this.heroSlides[this.currentSlide];
    // Only emit if the slide has an associated foire
    if (currentSlide.foireId) {
      this.reservationClick.emit(currentSlide);
    } else {
      // If no foire is associated, scroll to foires section
      this.scrollToFoires();
    }
  }

  /**
   * Start auto-slide functionality
   */
  private startAutoSlide(): void {
    this.autoSlideTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoSlideIntervalMs);
  }

  /**
   * Stop auto-slide functionality
   */
  private stopAutoSlide(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = undefined;
    }
  }

  /**
   * Reset auto-slide timer (called when user manually navigates)
   */
  private resetAutoSlide(): void {
    if (this.autoSlide) {
      this.stopAutoSlide();
      this.startAutoSlide();
    }
  }

  /**
   * Scroll to foires section
   */
  scrollToFoires(): void {
    const foiresSection = document.getElementById('foires');
    if (foiresSection) {
      foiresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}