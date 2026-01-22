import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsService, SocialLinks } from 'src/app/services/settings.service';
import { NewsletterSubscriberService } from 'src/app/services/newsletter-subscriber.service';
import { environment } from 'src/environments/environment';

declare const grecaptcha: any;

@Component({
  selector: 'app-footer-section',
  templateUrl: './footer-section.component.html',
  styleUrls: ['./footer-section.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FooterSectionComponent implements OnInit {
  @Output() countrySelect = new EventEmitter<'france' | 'belgique' | 'suisse'>();
  @Output() sectionScroll = new EventEmitter<string>();
  @Output() openExposantForm = new EventEmitter<void>();
  
  socialLinks: SocialLinks | null = null;
  newsletterForm!: FormGroup;
  subscribeLoading = false;
  subscribeSuccess = false;
  subscribeError = '';

  constructor(
    private settingsService: SettingsService,
    private newsletterService: NewsletterSubscriberService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['Abonné Newsletter', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSocialLinks();
  }

  loadSocialLinks(): void {
    this.settingsService.getSocialLinks().subscribe({
      next: (data: SocialLinks) => {
        this.socialLinks = data;
      },
      error: (error) => {
        console.error('Error loading social links:', error);
      }
    });
  }

  selectCountry(country: 'france' | 'belgique' | 'suisse'): void {
    this.countrySelect.emit(country);
  }

  scrollToSection(section: string): void {
    this.sectionScroll.emit(section);
  }

  goToUnsubscribe(): void {
    this.router.navigate(['/unsubscribe']);
  }

  openExposant(): void {
    this.openExposantForm.emit();
  }

  subscribeToNewsletter(): void {
    if (this.newsletterForm.invalid) {
      this.subscribeError = 'Veuillez entrer une adresse email valide';
      return;
    }

    this.subscribeLoading = true;
    this.subscribeError = '';
    this.subscribeSuccess = false;

    // Execute reCAPTCHA before submitting
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.recaptchaSiteKey, { action: 'newsletter' }).then((token: string) => {
          this.processNewsletterSubscription(token);
        }).catch((error: any) => {
          console.error('reCAPTCHA error:', error);
          this.processNewsletterSubscription(''); // Submit without token if reCAPTCHA fails
        });
      });
    } else {
      this.processNewsletterSubscription(''); // Submit without token if reCAPTCHA not loaded
    }
  }

  private processNewsletterSubscription(recaptchaToken: string): void {
    const email = this.newsletterForm.get('email')?.value;
    const name = this.newsletterForm.get('name')?.value;

    this.newsletterService.subscribe(email, name, undefined, 'website', recaptchaToken).subscribe({
      next: () => {
        this.subscribeSuccess = true;
        this.subscribeLoading = false;
        this.newsletterForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.subscribeSuccess = false;
        }, 5000);
      },
      error: (error) => {
        this.subscribeLoading = false;
        
        // Check if email already exists
        if (error.error?.error && error.error.error.includes('already')) {
          this.subscribeError = 'Cette adresse email est déjà inscrite à notre newsletter';
        } else {
          this.subscribeError = 'Une erreur est survenue. Veuillez réessayer plus tard.';
        }
        
        // Hide error message after 5 seconds
        setTimeout(() => {
          this.subscribeError = '';
        }, 5000);
      }
    });
  }
}
