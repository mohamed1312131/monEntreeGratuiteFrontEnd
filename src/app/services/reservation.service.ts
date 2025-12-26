import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ReservationData {
  id: number;
  foireId: number;
  foireDateRanges: DateRange[];
  foireName: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  reservationDate: string;
  ageCategory: string;
  status: string;
  country: string;
}

export interface ReservationCreateDTO {
  foireId: number;
  name: string;
  city: string;
  email: string;
  phone: string;
  ageCategory: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/api/reservations`;

  constructor(private http: HttpClient) {}

  getAllReservations(): Observable<ReservationData[]> {
    return this.http.get<ReservationData[]>(`${this.apiUrl}/GetAll`);
  }

  getReservationById(id: number): Observable<ReservationData> {
    return this.http.get<ReservationData>(`${this.apiUrl}/${id}`);
  }

  createReservation(reservation: ReservationCreateDTO): Observable<ReservationData> {
    return this.http.post<ReservationData>(this.apiUrl, reservation);
  }

  updateReservation(id: number, reservation: any): Observable<ReservationData> {
    return this.http.put<ReservationData>(`${this.apiUrl}/${id}`, reservation);
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateReservationStatus(id: number, status: string): Observable<ReservationData> {
    const params = new HttpParams().set('status', status);
    return this.http.put<ReservationData>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  updateReservationsStatus(ids: number[], status: string): Observable<ReservationData[]> {
    const params = new HttpParams().set('status', status);
    return this.http.put<ReservationData[]>(`${this.apiUrl}/status`, ids, { params });
  }

  sendConfirmationEmail(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/sendConfirmationEmail`, null);
  }

  sendConfirmationEmails(ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/sendConfirmationEmails`, ids);
  }

  getReservationsByCountry(year: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stats/${year}`);
  }

  getReservationsByAgeCategory(year: number, country: string): Observable<any> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('country', country);
    return this.http.get<any>(`${this.apiUrl}/statsByAge`, { params });
  }

  countReservationsByFoireId(foireId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${foireId}`);
  }

  getMonthlyData(year: number): Observable<any> {
    const params = new HttpParams().set('year', year.toString());
    return this.http.get<any>(`${this.apiUrl}/monthly-data`, { params });
  }
}
