import { Component, OnInit } from '@angular/core';
import { CookieConsentService } from '../../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent implements OnInit {
  showBanner = false;
  showSettings = false;
  audienceMeasurement = false;

  constructor(private cookieConsentService: CookieConsentService) {}

  ngOnInit(): void {
    this.showBanner = !this.cookieConsentService.hasChoice();
  }

  acceptAll(): void {
    this.cookieConsentService.acceptAll();
    this.closeConsentPanel();
  }

  refuseOptional(): void {
    this.cookieConsentService.refuseOptional();
    this.closeConsentPanel();
  }

  openSettings(): void {
    this.audienceMeasurement = this.cookieConsentService.isAudienceMeasurementAllowed();
    this.showBanner = true;
    this.showSettings = true;
  }

  saveSettings(): void {
    this.cookieConsentService.savePreferences(this.audienceMeasurement);
    this.closeConsentPanel();
  }

  private closeConsentPanel(): void {
    this.showBanner = false;
    this.showSettings = false;
  }
}
