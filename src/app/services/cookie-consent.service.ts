import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CookiePreferences {
  necessary: true;
  audienceMeasurement: boolean;
  savedAt: string;
  policyVersion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private readonly storageKey = 'meg_cookie_preferences';
  private readonly policyVersion = '2026-08-11';
  private readonly choiceLifetimeMs = 180 * 24 * 60 * 60 * 1000;
  private readonly preferencesSubject = new BehaviorSubject<CookiePreferences | null>(this.readPreferences());

  readonly preferences$ = this.preferencesSubject.asObservable();

  hasChoice(): boolean {
    return this.preferencesSubject.value !== null;
  }

  isAudienceMeasurementAllowed(): boolean {
    return this.preferencesSubject.value?.audienceMeasurement === true;
  }

  acceptAll(): void {
    this.savePreferences(true);
  }

  refuseOptional(): void {
    this.savePreferences(false);
  }

  savePreferences(audienceMeasurement: boolean): void {
    const preferences: CookiePreferences = {
      necessary: true,
      audienceMeasurement,
      savedAt: new Date().toISOString(),
      policyVersion: this.policyVersion
    };

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    } catch (error) {
      // The site remains usable when browser storage is unavailable.
      console.warn('Unable to save cookie preferences:', error);
    }

    this.preferencesSubject.next(preferences);
  }

  private readPreferences(): CookiePreferences | null {
    try {
      const storedValue = localStorage.getItem(this.storageKey);
      if (!storedValue) {
        return null;
      }

      const parsedValue = JSON.parse(storedValue) as CookiePreferences;
      const savedAt = new Date(parsedValue.savedAt).getTime();
      const isExpired = Number.isNaN(savedAt) || Date.now() - savedAt > this.choiceLifetimeMs;
      if (parsedValue.policyVersion !== this.policyVersion || typeof parsedValue.audienceMeasurement !== 'boolean' || isExpired) {
        return null;
      }

      return parsedValue;
    } catch {
      return null;
    }
  }
}
