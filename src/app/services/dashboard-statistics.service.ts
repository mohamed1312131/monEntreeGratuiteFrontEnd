import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SeriesData {
  name: string;
  data: number[];
}

export interface ExpoChartData {
  countries: string[];
  series: SeriesData[];
}

export interface DashboardCounts {
  totalExposants: number;
  pendingExposants: number;
  acceptedExposants: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
}

export interface LatestReservation {
  id: number;
  name: string;
  city: string;
  email: string;
  phone: string;
  reservationDate: string;
  status: string;
}

export interface MonthlyData {
  year: number;
  monthlyUserEntries: number[];
  monthlyReservations: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStatisticsService {
  private apiUrl = `${environment.apiUrl}/api/dashboard`;
  private reservationsApiUrl = `${environment.apiUrl}/api/reservations`;

  constructor(private http: HttpClient) { }

  /**
   * Get expo chart data from backend
   */
  getExpoChartData(): Observable<ExpoChartData> {
    return this.http.get<ExpoChartData>(`${this.apiUrl}/expo-chart`);
  }

  /**
   * Get dashboard counts
   */
  getDashboardCounts(): Observable<DashboardCounts> {
    return this.http.get<DashboardCounts>(`${this.apiUrl}/counts`);
  }

  /**
   * Get latest reservations (top 10)
   */
  getLatestReservations(limit: number = 10): Observable<LatestReservation[]> {
    return this.http.get<LatestReservation[]>(`${this.reservationsApiUrl}/latest?limit=${limit}`);
  }

  /**
   * Get monthly data for user entries and reservations
   */
  getMonthlyData(year: number): Observable<MonthlyData> {
    return this.http.get<MonthlyData>(`${this.reservationsApiUrl}/monthly-data?year=${year}`);
  }

  /**
   * Get reservations by age category for a specific year and country
   */
  getReservationsByAge(year: number, country: string): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.reservationsApiUrl}/statsByAge?year=${year}&country=${country}`);
  }

  /**
   * Get reservations by country for a specific year
   */
  getReservationsByCountry(year: number): Observable<any> {
    return this.http.get<any>(`${this.reservationsApiUrl}/stats/${year}`);
  }
}
