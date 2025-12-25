import { Component, OnInit } from '@angular/core';
import { FoireService } from '../../../services/foire.service';
import { ReservationService } from '../../../services/reservation.service';

interface ReservationForm {
  pays: string;
  entreeType: string;
  ville: string;
  smsNumber: string;
  nom: string;
  prenom: string;
  email: string;
  trancheAge: string;
  telephone: string;
  acceptConditions: boolean;
  acceptMarketing: boolean;
}

interface FoireDetails {
  id: number;
  name: string;
  date: string;
  image: string;
  pays: string;
  countryCode: string;
}

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  isFormOpen = false;
  selectedFoire: FoireDetails | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  
  foiresFrance: any[] = [];
  foiresBelgium: any[] = [];
  foiresSwitzerland: any[] = [];
  isLoading = true;
  
  reservationForm: ReservationForm = {
    pays: '',
    entreeType: '',
    ville: '',
    smsNumber: '',
    nom: '',
    prenom: '',
    email: '',
    trancheAge: '',
    telephone: '',
    acceptConditions: false,
    acceptMarketing: false
  };
  
  constructor(
    private foireService: FoireService,
    private reservationService: ReservationService
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
  
  onReserve(foire: any, countryName: string, countryCode: string): void {
    this.selectedFoire = {
      id: foire.id,
      name: foire.name,
      date: this.formatDate(foire.date),
      image: foire.image,
      pays: countryName,
      countryCode: countryCode
    };
    
    // Pre-fill country in form
    this.reservationForm.pays = countryName;
    
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    
    // Open the form
    this.isFormOpen = true;
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.reservationForm = {
      pays: '',
      entreeType: '',
      ville: '',
      smsNumber: '',
      nom: '',
      prenom: '',
      email: '',
      trancheAge: '',
      telephone: '',
      acceptConditions: false,
      acceptMarketing: false
    };
  }

  submitReservation(): void {
    if (!this.reservationForm.acceptConditions) {
      this.errorMessage = 'Vous devez accepter les conditions générales pour continuer.';
      return;
    }
    
    if (!this.selectedFoire) {
      this.errorMessage = 'Aucune foire sélectionnée';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Map age category to backend enum
    let ageCategory = 'ENTRE';
    if (this.reservationForm.trancheAge === 'moins-35') ageCategory = 'MOINS';
    else if (this.reservationForm.trancheAge === 'plus-70') ageCategory = 'PLUS';
    
    const reservationData = {
      foireId: this.selectedFoire.id,
      name: `${this.reservationForm.nom} ${this.reservationForm.prenom}`,
      city: this.reservationForm.ville,
      email: this.reservationForm.email,
      phone: this.reservationForm.telephone,
      ageCategory: ageCategory
    };
    
    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        this.successMessage = 'Votre réservation a été enregistrée avec succès! Vous recevrez votre invitation par email.';
        this.isSubmitting = false;
        
        // Close form after 2 seconds
        setTimeout(() => {
          this.closeForm();
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        
        // Check for duplicate error
        if (error.error && typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 400) {
          this.errorMessage = 'Une réservation existe déjà avec cet email ou ce numéro de téléphone pour cette foire.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de la réservation. Veuillez réessayer.';
        }
        
        this.isSubmitting = false;
      }
    });
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
