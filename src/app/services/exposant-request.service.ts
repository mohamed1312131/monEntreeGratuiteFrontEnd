import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExposantRequest {
  id?: number;
  nomEtablissement: string;
  secteurActivite: string;
  description?: string;
  civilite: string;
  nomPrenom: string;
  email: string;
  telephone: string;
  acceptContact: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExposantRequestCreateDTO {
  nomEtablissement: string;
  secteurActivite: string;
  description?: string;
  civilite: string;
  nomPrenom: string;
  email: string;
  telephone: string;
  acceptContact: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExposantRequestService {
  private apiUrl = `${environment.apiUrl}/api/exposant-requests`;

  constructor(private http: HttpClient) {}

  getAllExposantRequests(): Observable<ExposantRequest[]> {
    return this.http.get<ExposantRequest[]>(this.apiUrl);
  }

  getExposantRequestsByStatus(status: string): Observable<ExposantRequest[]> {
    return this.http.get<ExposantRequest[]>(`${this.apiUrl}/status/${status}`);
  }

  getExposantRequestById(id: number): Observable<ExposantRequest> {
    return this.http.get<ExposantRequest>(`${this.apiUrl}/${id}`);
  }

  createExposantRequest(request: ExposantRequestCreateDTO): Observable<ExposantRequest> {
    return this.http.post<ExposantRequest>(this.apiUrl, request);
  }

  updateExposantRequestStatus(id: number, status: string): Observable<ExposantRequest> {
    return this.http.put<ExposantRequest>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteExposantRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
