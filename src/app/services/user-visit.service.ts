import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface UserVisit {
  id: number;
  ipAddress: string;
  country: string;
  visitDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserVisitService {
  private baseUrl = `${environment.apiUrl}/api/visits`;

  constructor(private http: HttpClient) { }

  /**
   * Track a user visit to the site
   */
  trackVisit(): Observable<any> {
    return this.http.post(`${this.baseUrl}/track`, {});
  }

  /**
   * Get all visits (admin only)
   */
  getAllVisits(): Observable<UserVisit[]> {
    return this.http.get<UserVisit[]>(this.baseUrl);
  }

  /**
   * Get visits grouped by country (admin only)
   */
  getVisitsByCountry(): Observable<{ [country: string]: number }> {
    return this.http.get<{ [country: string]: number }>(`${this.baseUrl}/stats/by-country`);
  }

  /**
   * Get visits grouped by country for a specific year (admin only)
   */
  getVisitsByCountryAndYear(year: number): Observable<{ [country: string]: number }> {
    return this.http.get<{ [country: string]: number }>(`${this.baseUrl}/stats/by-country/${year}`);
  }

  /**
   * Get total visit count (admin only)
   */
  getTotalVisits(): Observable<{ totalVisits: number }> {
    return this.http.get<{ totalVisits: number }>(`${this.baseUrl}/stats/total`);
  }
}
