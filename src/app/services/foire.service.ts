import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Foire {
  id: number;
  name: string;
  date?: string; // Deprecated - kept for backward compatibility
  endDate?: string; // Deprecated
  dateRanges?: DateRange[]; // New field for multiple date ranges
  location?: string; // New field for location
  url?: string;
  image?: string;
  description?: string;
  city?: string;
  venue?: string;
  address?: string;
  postalCode?: string;
  countryCode?: string;
  isActive: boolean;
  isPublished?: boolean;
  disponible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FoireService {
  private apiUrl = `${environment.apiUrl}/api/foires`;

  constructor(private http: HttpClient) {}

  getAllFoires(): Observable<Foire[]> {
    return this.http.get<Foire[]>(`${this.apiUrl}/all`);
  }

  getFoiresByCountry(countryCode: string): Observable<Foire[]> {
    return this.http.get<Foire[]>(`${this.apiUrl}/${countryCode}`);
  }

  getFoireById(id: number): Observable<Foire> {
    return this.http.get<Foire>(`${this.apiUrl}/id/${id}`);
  }

  getActiveFoiresByCountry(countryCode: string): Observable<Foire[]> {
    return this.http.get<Foire[]>(`${this.apiUrl}/getAllActive/${countryCode}`);
  }

  addFoire(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, formData);
  }

  activateFoire(countryCode: string, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/activate/${countryCode}/${id}`, {});
  }

  disableFoire(countryCode: string, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/disable/${countryCode}/${id}`, {});
  }

  deleteFoire(countryCode: string, id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${countryCode}/${id}`);
  }

  sendReminders(foireId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sendReminders/${foireId}`, {});
  }

  countReservationsByAge(foireId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/countReservations/${foireId}`);
  }

  countReservationsByStatus(foireId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/countReservationsByStatus/${foireId}`);
  }

  toggleDisponible(countryCode: string, id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/toggleDisponible/${countryCode}/${id}`, {});
  }
}
