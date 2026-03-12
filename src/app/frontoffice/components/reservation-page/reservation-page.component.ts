import { Component, OnInit, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { UserVisitService } from 'src/app/services/user-visit.service';
import { FoireService } from 'src/app/services/foire.service';
import { ReservationService } from 'src/app/services/reservation.service';
import { environment } from 'src/environments/environment';

declare const grecaptcha: any;

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

interface FoireDetails {
  id: number;
  name: string;
  date: string;
  image?: string;  // Make optional
  location?: string;  // Make optional
  pays: string;
  description?: string;  // Make optional
  disponible?: boolean;
  dateRanges: DateRange[];
  dayTimeSlots?: DayTimeSlot[];
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
  interests: string[];
  selectedDate: string;
  selectedTime: string;
  acceptConditions: boolean;
  acceptMarketing: boolean;
}

@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class ReservationPageComponent implements OnInit {
  selectedFoire: FoireDetails | null = null;
  isSubmitting = false;
  errorMessage = '';
  showSuccessPopup = false;
  availableDates: string[] = [];
  availableTimeSlots: TimeSlot[] = [];
  isLoading = true;

  availableInterests = [
    { value: 'habitat_construction', label: 'Habitat & Construction', icon: '🏠' },
    { value: 'amenagement_interieur', label: 'Aménagement Intérieur', icon: '🛁' },
    { value: 'exterieurs_jardin', label: 'Extérieurs & Jardin', icon: '🌱' },
    { value: 'energies_confort', label: 'Énergies & Confort', icon: '🔥' },
    { value: 'gastronomie_terroir', label: 'Gastronomie & Terroir', icon: '🍷' },
    { value: 'loisirs_bien_etre', label: 'Loisirs & Bien-être', icon: '🚲' }
  ];

  isInterestsDropdownOpen = false;

  reservationForm: ReservationForm = {
    pays: '',
    entreeType: '',
    ville: '',
    smsNumber: '',
    nom: '',
    prenom: '',
    email: '',
    trancheAge: '',
    interests: [],
    selectedDate: '',
    selectedTime: '',
    acceptConditions: false,
    acceptMarketing: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userVisitService: UserVisitService,
    private foireService: FoireService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
  // Track user visit
  this.userVisitService.trackVisit().subscribe({
    next: () => console.log('User visit tracked'),
    error: (err) => console.error('Error tracking visit:', err)
  });

  // Get foire name from route parameter
  this.route.params.subscribe(params => {
    const urlFoireName = params['foirename']; // e.g., "SALON-BATIBOUW"
    if (urlFoireName) {
      // Convert dashes back to spaces for backend query
      const foireName = urlFoireName.replace(/-/g, ' '); // "SALON BATIBOUW"
      this.loadFoireByName(foireName);
    } else {
      // No foire name, redirect to home
      this.router.navigate(['/']);
    }
  });
}

  loadFoireByName(foireName: string): void {
    this.isLoading = true;
    
    // Fetch foire by name from backend
    this.foireService.getFoireByName(foireName).subscribe({
      next: (foire) => {
        // Parse dateRanges and dayTimeSlots if they are strings
        let parsedDateRanges: DateRange[] = [];
        let parsedDayTimeSlots: DayTimeSlot[] = [];
        
        try {
          if (typeof foire.dateRanges === 'string') {
            parsedDateRanges = JSON.parse(foire.dateRanges);
          } else if (Array.isArray(foire.dateRanges)) {
            parsedDateRanges = foire.dateRanges;
          }
        } catch (e) {
          console.error('Error parsing dateRanges:', e);
          parsedDateRanges = [];
        }
        
        try {
          if (typeof foire.dayTimeSlots === 'string') {
            parsedDayTimeSlots = JSON.parse(foire.dayTimeSlots);
          } else if (Array.isArray(foire.dayTimeSlots)) {
            parsedDayTimeSlots = foire.dayTimeSlots;
          }
        } catch (e) {
          console.error('Error parsing dayTimeSlots:', e);
          parsedDayTimeSlots = [];
        }

        const dateRangesStr = parsedDateRanges.map(r => `${r.startDate} - ${r.endDate}`).join(' • ');
        
        // Determine country based on countryCode
        let countryName = 'France';
        if (foire.countryCode === 'BE') {
          countryName = 'Belgique';
        } else if (foire.countryCode === 'CH') {
          countryName = 'Suisse';
        }

        this.selectedFoire = {
          id: foire.id,
          name: foire.name,
          date: dateRangesStr,
          image: foire.image,
          location: foire.location || foire.city,
          pays: countryName,
          description: foire.description,
          disponible: foire.disponible === true,
          dateRanges: parsedDateRanges,
          dayTimeSlots: parsedDayTimeSlots
        };
        
        this.reservationForm.pays = countryName;
        this.loadAvailableDates();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading foire:', error);
        this.isLoading = false;
        // Redirect to home if foire not found
        this.router.navigate(['/']);
      }
    });
  }

  loadAvailableDates(): void {
    if (!this.selectedFoire || !this.selectedFoire.dayTimeSlots) {
      this.availableDates = [];
      return;
    }
    
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
    
    const daySlot = this.selectedFoire.dayTimeSlots.find(
      slot => slot.date === this.reservationForm.selectedDate
    );
    
    this.availableTimeSlots = daySlot?.times.filter(time => time.isEnabled) || [];
    this.reservationForm.selectedTime = '';
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
    // Redirect to home after closing success popup
    this.router.navigate(['/']);
  }

  submitReservation(): void {
    // Validation
    if (!this.reservationForm.acceptConditions) {
      this.errorMessage = 'Vous devez accepter les conditions générales pour continuer.';
      return;
    }
    
    if (!this.selectedFoire) {
      this.errorMessage = 'Aucune foire sélectionnée';
      return;
    }

    if (!this.reservationForm.nom || !this.reservationForm.prenom) {
      this.errorMessage = 'Veuillez renseigner votre nom et prénom.';
      return;
    }

    if (!this.reservationForm.email) {
      this.errorMessage = 'Veuillez renseigner votre adresse email.';
      return;
    }

    if (!this.reservationForm.interests || this.reservationForm.interests.length === 0) {
      this.errorMessage = 'Veuillez sélectionner au moins un univers qui vous intéresse.';
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

    // Execute reCAPTCHA before submitting
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.recaptchaSiteKey, { action: 'reservation' }).then((token: string) => {
          this.processReservation(token);
        }).catch((error: any) => {
          console.error('reCAPTCHA error:', error);
          this.processReservation('');
        });
      });
    } else {
      this.processReservation('');
    }
  }

  private processReservation(recaptchaToken: string): void {
    const ageCategoryMap: { [key: string]: string } = {
      'moins-35': 'MOINS',
      '35-70': 'ENTRE',
      'plus-70': 'PLUS'
    };

    const reservationData: any = {
      foireId: this.selectedFoire!.id,
      nom: this.reservationForm.nom,
      prenom: this.reservationForm.prenom,
      ville: this.reservationForm.ville,
      email: this.reservationForm.email,
      interests: this.reservationForm.interests,
      smsNumber: this.reservationForm.smsNumber,
      telephone: this.reservationForm.smsNumber,
      pays: this.reservationForm.pays,
      trancheAge: this.reservationForm.trancheAge,
      ageCategory: ageCategoryMap[this.reservationForm.trancheAge] || this.reservationForm.trancheAge,
      selectedDate: this.reservationForm.selectedDate,
      selectedTime: this.reservationForm.selectedTime,
      recaptchaToken: recaptchaToken
    };
    
    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        console.log('Reservation created successfully:', response);
        this.isSubmitting = false;
        this.showSuccessPopup = true;
        
        // Auto-close popup after 5 seconds
        setTimeout(() => {
          this.closeSuccessPopup();
        }, 5000);
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
        this.isSubmitting = false;
        
        if (error.status === 400) {
          this.errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
        } else if (error.status === 404) {
          this.errorMessage = 'Foire introuvable. Veuillez réessayer.';
        } else if (error.status === 409) {
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

  toggleInterest(interestValue: string): void {
    if (!this.selectedFoire?.disponible) {
      return;
    }
    
    const index = this.reservationForm.interests.indexOf(interestValue);
    if (index > -1) {
      this.reservationForm.interests.splice(index, 1);
    } else {
      this.reservationForm.interests.push(interestValue);
    }
  }

  isInterestSelected(interestValue: string): boolean {
    return this.reservationForm.interests.includes(interestValue);
  }

  toggleInterestsDropdown(): void {
    if (!this.selectedFoire?.disponible) {
      return;
    }
    this.isInterestsDropdownOpen = !this.isInterestsDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.interests-select-wrapper');
    
    if (!clickedInside && this.isInterestsDropdownOpen) {
      this.isInterestsDropdownOpen = false;
    }
  }
}