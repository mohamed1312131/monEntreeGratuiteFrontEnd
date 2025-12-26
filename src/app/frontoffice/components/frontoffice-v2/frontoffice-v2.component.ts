import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ReservationService, ReservationCreateDTO } from 'src/app/services/reservation.service';
import { ExposantRequestService, ExposantRequestCreateDTO } from 'src/app/services/exposant-request.service';
import { UserVisitService } from 'src/app/services/user-visit.service';

interface HeroSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
}

interface Foire {
  id: number;
  name: string;
  dateRanges: string[];
  location: string;
  image: string;
  description: string;
}

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
  location: string;
  pays: string;
  description: string;
}

interface ExhibitorForm {
  nomEtablissement: string;
  secteurActivite: string;
  description: string;
  civilite: string;
  nomPrenom: string;
  email: string;
  telephone: string;
  acceptContact: boolean;
}

@Component({
  selector: 'app-frontoffice-v2',
  templateUrl: './frontoffice-v2.component.html',
  styleUrls: ['./frontoffice-v2.component.scss', './frontoffice-v2-success-popup.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FrontofficeV2Component implements OnInit {
  
  constructor(
    private reservationService: ReservationService,
    private exposantRequestService: ExposantRequestService,
    private userVisitService: UserVisitService
  ) {}

  ngOnInit(): void {
    // Track user visit when component loads
    this.userVisitService.trackVisit().subscribe({
      next: () => console.log('User visit tracked'),
      error: (err) => console.error('Error tracking visit:', err)
    });
  }
  
  isFormOpen = false;
  selectedFoire: FoireDetails | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showSuccessPopup = false;
  
  isExhibitorFormOpen = false;
  isExhibitorSubmitting = false;
  exhibitorErrorMessage = '';
  exhibitorSuccessMessage = '';
  
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

  exhibitorForm: ExhibitorForm = {
    nomEtablissement: '',
    secteurActivite: '',
    description: '',
    civilite: '',
    nomPrenom: '',
    email: '',
    telephone: '',
    acceptContact: false
  };

  // Form state management

  onReserve(foire: Foire, countryName: string): void {
    this.selectedFoire = {
      id: foire.id,
      name: foire.name,
      date: foire.dateRanges.join(' • '),
      image: foire.image,
      location: foire.location,
      pays: countryName,
      description: foire.description
    };
    
    this.reservationForm.pays = countryName;
    this.errorMessage = '';
    this.successMessage = '';
    this.isFormOpen = true;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.resetForm();
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
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
    // Validate conditions acceptance
    if (!this.reservationForm.acceptConditions) {
      this.errorMessage = 'Vous devez accepter les conditions générales pour continuer.';
      return;
    }
    
    // Validate foire selection
    if (!this.selectedFoire) {
      this.errorMessage = 'Aucune foire sélectionnée';
      return;
    }

    // Validate required fields
    if (!this.reservationForm.nom || !this.reservationForm.prenom) {
      this.errorMessage = 'Veuillez renseigner votre nom et prénom.';
      return;
    }

    if (!this.reservationForm.email) {
      this.errorMessage = 'Veuillez renseigner votre adresse email.';
      return;
    }

    if (!this.reservationForm.telephone) {
      this.errorMessage = 'Veuillez renseigner votre numéro de téléphone.';
      return;
    }

    if (!this.reservationForm.ville) {
      this.errorMessage = 'Veuillez renseigner votre ville.';
      return;
    }

    if (!this.reservationForm.trancheAge) {
      this.errorMessage = 'Veuillez sélectionner votre tranche d\'âge.';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    // Map age category to backend enum values
    const ageCategoryMap: { [key: string]: string } = {
      'moins-35': 'MOINS',
      '35-70': 'ENTRE',
      'plus-70': 'PLUS'
    };

    // Prepare reservation data for backend
    const reservationData: ReservationCreateDTO = {
      foireId: this.selectedFoire.id,
      name: `${this.reservationForm.prenom} ${this.reservationForm.nom}`,
      city: this.reservationForm.ville,
      email: this.reservationForm.email,
      phone: this.reservationForm.telephone,
      ageCategory: ageCategoryMap[this.reservationForm.trancheAge] || this.reservationForm.trancheAge
    };
    
    // Submit to backend
    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        console.log('Reservation created successfully:', response);
        this.isSubmitting = false;
        
        // Close the form immediately
        this.closeForm();
        
        // Show success popup after a brief delay
        setTimeout(() => {
          this.showSuccessPopup = true;
        }, 300);
        
        // Auto-close popup after 5 seconds
        setTimeout(() => {
          this.closeSuccessPopup();
        }, 5300);
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.isSubmitting = false;
        
        if (error.status === 400) {
          this.errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
        } else if (error.status === 404) {
          this.errorMessage = 'Foire introuvable. Veuillez réessayer.';
        } else if (error.status === 409) {
          // Parse the error message from backend
          const errorMsg = error.error?.error || error.error?.message || '';
          
          if (errorMsg.toLowerCase().includes('email')) {
            this.errorMessage = 'Une réservation existe déjà avec cette adresse email pour cette foire.';
          } else if (errorMsg.toLowerCase().includes('téléphone') || errorMsg.toLowerCase().includes('telephone') || errorMsg.toLowerCase().includes('phone')) {
            this.errorMessage = 'Une réservation existe déjà avec ce numéro de téléphone pour cette foire.';
          } else {
            this.errorMessage = 'Une réservation existe déjà pour cette foire avec ces informations.';
          }
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement de votre réservation. Veuillez réessayer.';
        }
      }
    });
  }

  openExhibitorForm(): void {
    this.isExhibitorFormOpen = true;
    this.exhibitorErrorMessage = '';
    this.exhibitorSuccessMessage = '';
  }

  closeExhibitorForm(): void {
    this.isExhibitorFormOpen = false;
    this.resetExhibitorForm();
  }

  resetExhibitorForm(): void {
    this.exhibitorForm = {
      nomEtablissement: '',
      secteurActivite: '',
      description: '',
      civilite: '',
      nomPrenom: '',
      email: '',
      telephone: '',
      acceptContact: false
    };
  }

  submitExhibitorForm(): void {
    if (!this.exhibitorForm.acceptContact) {
      this.exhibitorErrorMessage = 'Vous devez accepter d\'être recontacté pour continuer.';
      return;
    }

    if (!this.exhibitorForm.nomEtablissement || !this.exhibitorForm.secteurActivite || 
        !this.exhibitorForm.civilite || !this.exhibitorForm.nomPrenom || 
        !this.exhibitorForm.email || !this.exhibitorForm.telephone) {
      this.exhibitorErrorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isExhibitorSubmitting = true;
    this.exhibitorErrorMessage = '';
    this.exhibitorSuccessMessage = '';

    const requestData: ExposantRequestCreateDTO = {
      nomEtablissement: this.exhibitorForm.nomEtablissement,
      secteurActivite: this.exhibitorForm.secteurActivite,
      description: this.exhibitorForm.description,
      civilite: this.exhibitorForm.civilite,
      nomPrenom: this.exhibitorForm.nomPrenom,
      email: this.exhibitorForm.email,
      telephone: this.exhibitorForm.telephone,
      acceptContact: this.exhibitorForm.acceptContact
    };

    this.exposantRequestService.createExposantRequest(requestData).subscribe({
      next: (response) => {
        console.log('Exposant request created successfully:', response);
        this.isExhibitorSubmitting = false;
        this.exhibitorSuccessMessage = 'Votre demande a été envoyée avec succès! Nous vous recontacterons très prochainement.';

        setTimeout(() => {
          this.closeExhibitorForm();
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating exposant request:', error);
        this.isExhibitorSubmitting = false;

        if (error.status === 409) {
          const errorMsg = error.error?.error || error.error?.message || '';
          
          if (errorMsg.toLowerCase().includes('email')) {
            this.exhibitorErrorMessage = 'Une demande existe déjà avec cette adresse email.';
          } else if (errorMsg.toLowerCase().includes('téléphone') || errorMsg.toLowerCase().includes('telephone')) {
            this.exhibitorErrorMessage = 'Une demande existe déjà avec ce numéro de téléphone.';
          } else {
            this.exhibitorErrorMessage = errorMsg || 'Une demande existe déjà avec ces informations.';
          }
        } else if (error.status === 400) {
          this.exhibitorErrorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
        } else if (error.status === 500) {
          this.exhibitorErrorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else {
          this.exhibitorErrorMessage = 'Une erreur est survenue lors de l\'enregistrement de votre demande. Veuillez réessayer.';
        }
      }
    });
  }

  openHeroReservation(heroSlide: HeroSlide): void {
    // Create a generic foire object for hero carousel reservations
    const heroFoire: Foire = {
      id: heroSlide.id,
      name: heroSlide.title,
      dateRanges: ['À venir'],
      image: heroSlide.image,
      location: heroSlide.location,
      description: heroSlide.description
    };
    this.onReserve(heroFoire, 'France');
  }
}
