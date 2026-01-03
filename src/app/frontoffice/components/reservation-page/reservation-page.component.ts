import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReservationService } from 'src/app/services/reservation.service';
import { FoireService } from 'src/app/services/foire.service';
import { UserVisitService } from 'src/app/services/user-visit.service';
import { environment } from 'src/environments/environment';

declare const grecaptcha: any;

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
  disponible?: boolean;
}

@Component({
  selector: 'app-reservation-page',
  templateUrl: './reservation-page.component.html',
  styleUrls: ['./reservation-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReservationPageComponent implements OnInit {
  
  foireName: string = '';
  selectedFoire: FoireDetails | null = null;
  isSubmitting = false;
  errorMessage = '';
  showSuccessPopup = false;
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
    private route: ActivatedRoute,
    private reservationService: ReservationService,
    private foireService: FoireService,
    private userVisitService: UserVisitService
  ) {}

  ngOnInit(): void {
    this.userVisitService.trackVisit().subscribe({
      next: () => console.log('User visit tracked'),
      error: (err) => console.error('Error tracking visit:', err)
    });

    this.route.params.subscribe(params => {
      this.foireName = params['foirename'];
      this.loadFoireByName(this.foireName);
    });
  }
  

  loadFoireByName(name: string): void {
    this.isLoading = true;
    this.foireService.getAllFoires().subscribe({
      next: (foires) => {
        // Normalize the URL parameter: replace hyphens with spaces for matching
        const normalizedSearchName = name.replace(/-/g, ' ').toLowerCase();
        
        const foire = foires.find(f => 
          f.name.toLowerCase() === normalizedSearchName ||
          f.name.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase()
        );
        
        if (foire) {
          let dateRangesArray: string[] = [];
          let ranges: any[] = [];
          
          // Handle dateRanges whether it's a JSON string (from Entity) or Array (from DTO)
          if (foire.dateRanges) {
            if (typeof foire.dateRanges === 'string') {
              try {
                ranges = JSON.parse(foire.dateRanges);
              } catch (e) {
                console.error('Error parsing dateRanges', e);
              }
            } else if (Array.isArray(foire.dateRanges)) {
              ranges = foire.dateRanges;
            }
          }

          if (ranges.length > 0) {
            dateRangesArray = ranges.map((dr: any) => {
              if (typeof dr === 'string') return dr;
              const start = this.formatDate(dr.startDate);
              const end = this.formatDate(dr.endDate);
              return `Du ${start} au ${end}`;
            });
          } else if (foire.date) {
            // Fallback for legacy date format
            dateRangesArray = [this.formatDate(foire.date.toString())];
          }
          
          this.selectedFoire = {
            id: foire.id,
            name: foire.name,
            date: dateRangesArray.length > 0 ? dateRangesArray.join(' • ') : 'Dates à confirmer',
            image: foire.image || '',
            location: foire.location || foire.city || '',
            pays: foire.countryCode === 'FR' ? 'France' : foire.countryCode === 'BE' ? 'Belgique' : foire.countryCode === 'CH' ? 'Suisse' : 'France',
            description: foire.description || '',
            disponible: foire.disponible === true
          };
          this.reservationForm.pays = this.selectedFoire.pays;
        } else {
          this.errorMessage = 'Foire introuvable';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading foire:', error);
        this.errorMessage = 'Erreur lors du chargement de la foire';
        this.isLoading = false;
      }
    });
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    // Handle ISO string or YYYY-MM-DD
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
  }

  resetForm(): void {
    const currentPays = this.reservationForm.pays;
    this.reservationForm = {
      pays: currentPays,
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
      telephone: this.reservationForm.telephone,
      smsNumber: this.reservationForm.smsNumber,
      pays: this.reservationForm.pays,
      trancheAge: this.reservationForm.trancheAge,
      ageCategory: ageCategoryMap[this.reservationForm.trancheAge] || this.reservationForm.trancheAge,
      recaptchaToken: recaptchaToken
    };
    
    this.reservationService.createReservation(reservationData).subscribe({
      next: (response) => {
        console.log('Reservation created successfully:', response);
        this.isSubmitting = false;
        
        this.resetForm();
        
        setTimeout(() => {
          this.showSuccessPopup = true;
        }, 300);
        
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
}
