import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ReservationService, ReservationCreateDTO } from 'src/app/services/reservation.service';
import { ExposantRequestService, ExposantRequestCreateDTO } from 'src/app/services/exposant-request.service';
import { UserVisitService } from 'src/app/services/user-visit.service';
import { environment } from 'src/environments/environment';

declare const grecaptcha: any;

interface HeroSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  isEnabled: boolean;
}

interface DayTimeSlot {
  date: string;
  times: TimeSlot[];
}

interface Foire {
  id: number;
  name: string;
  dateRanges: DateRange[];
  dayTimeSlots?: DayTimeSlot[];
  location: string;
  image: string;
  description: string;
  disponible?: boolean;
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
  selectedDate: string;
  selectedTime: string;
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
  disponible?: boolean;
  dateRanges: DateRange[];
  dayTimeSlots?: DayTimeSlot[];
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
  
  availableDates: string[] = [];
  availableTimeSlots: TimeSlot[] = [];
  
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
    selectedDate: '',
    selectedTime: '',
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
    const dateRangesStr = foire.dateRanges.map(r => `${r.startDate} - ${r.endDate}`).join(' • ');
    
    this.selectedFoire = {
      id: foire.id,
      name: foire.name,
      date: dateRangesStr,
      image: foire.image,
      location: foire.location,
      pays: countryName,
      description: foire.description,
      disponible: foire.disponible === true,
      dateRanges: foire.dateRanges,
      dayTimeSlots: foire.dayTimeSlots || []
    };
    
    this.reservationForm.pays = countryName;
    this.errorMessage = '';
    this.successMessage = '';
    this.loadAvailableDates();
    this.isFormOpen = true;
  }

  loadAvailableDates(): void {
    if (!this.selectedFoire || !this.selectedFoire.dayTimeSlots) {
      this.availableDates = [];
      return;
    }
    
    // Get all dates that have at least one enabled time slot
    this.availableDates = this.selectedFoire.dayTimeSlots
      .filter(daySlot => daySlot.times.some(time => time.isEnabled))
      .map(daySlot => daySlot.date);
  }

  onDateSelected(): void {
    if (!this.reservationForm.selectedDate || !this.selectedFoire?.dayTimeSlots) {
      this.availableTimeSlots = [];
      this.reservationForm.selectedTime = '';
      return;
    }
    
    // Find the day time slot for selected date
    const daySlot = this.selectedFoire.dayTimeSlots.find(
      slot => slot.date === this.reservationForm.selectedDate
    );
    
    // Filter only enabled time slots
    this.availableTimeSlots = daySlot?.times.filter(time => time.isEnabled) || [];
    this.reservationForm.selectedTime = '';
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
      selectedDate: '',
      selectedTime: '',
      acceptConditions: false,
      acceptMarketing: false
    };
    this.availableDates = [];
    this.availableTimeSlots = [];
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

    if (!this.reservationForm.selectedDate) {
      this.errorMessage = 'Veuillez sélectionner une date.';
      return;
    }

    if (!this.reservationForm.selectedTime) {
      this.errorMessage = 'Veuillez sélectionner un créneau horaire.';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Execute reCAPTCHA before submitting
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.recaptchaSiteKey, { action: 'reservation' }).then((token: string) => {
          this.processReservation(token);
        }).catch((error: any) => {
          console.error('reCAPTCHA error:', error);
          this.processReservation(''); // Submit without token if reCAPTCHA fails
        });
      });
    } else {
      this.processReservation(''); // Submit without token if reCAPTCHA not loaded
    }
  }

  private processReservation(recaptchaToken: string): void {
    
    // Map age category to backend enum values
    const ageCategoryMap: { [key: string]: string } = {
      'moins-35': 'MOINS',
      '35-70': 'ENTRE',
      'plus-70': 'PLUS'
    };

    // Prepare reservation data for backend
    const reservationData: any = {
      foireId: this.selectedFoire!.id,
      nom: this.reservationForm.nom,
      prenom: this.reservationForm.prenom,
      ville: this.reservationForm.ville,
      email: this.reservationForm.email,
      telephone: this.reservationForm.telephone,
      smsNumber: this.reservationForm.smsNumber,
      pays: this.reservationForm.pays,
      trancheAge: this.reservationForm.trancheAge,
      ageCategory: ageCategoryMap[this.reservationForm.trancheAge] || this.reservationForm.trancheAge,
      selectedDate: this.reservationForm.selectedDate,
      selectedTime: this.reservationForm.selectedTime,
      recaptchaToken: recaptchaToken
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

    // Execute reCAPTCHA before submitting
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.recaptchaSiteKey, { action: 'exposant_request' }).then((token: string) => {
          this.processExhibitorRequest(token);
        }).catch((error: any) => {
          console.error('reCAPTCHA error:', error);
          this.processExhibitorRequest(''); // Submit without token if reCAPTCHA fails
        });
      });
    } else {
      this.processExhibitorRequest(''); // Submit without token if reCAPTCHA not loaded
    }
  }

  private processExhibitorRequest(recaptchaToken: string): void {
    const requestData: any = {
      nomEtablissement: this.exhibitorForm.nomEtablissement,
      secteurActivite: this.exhibitorForm.secteurActivite,
      description: this.exhibitorForm.description,
      civilite: this.exhibitorForm.civilite,
      nomPrenom: this.exhibitorForm.nomPrenom,
      email: this.exhibitorForm.email,
      telephone: this.exhibitorForm.telephone,
      acceptContact: this.exhibitorForm.acceptContact,
      recaptchaToken: recaptchaToken
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
      dateRanges: [{ startDate: 'À venir', endDate: 'À venir' }],
      dayTimeSlots: [],
      image: heroSlide.image,
      location: heroSlide.location,
      description: heroSlide.description
    };
    this.onReserve(heroFoire, 'France');
  }
}
